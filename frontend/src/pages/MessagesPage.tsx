import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Search, Paperclip, Loader2, MoreVertical } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import axiosClient from '@/services/axiosClient';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/hooks/useAuth';
import HeaderMNP from '@/components/HeaderMNP';
import Footer from '@/components/Footer';
import { formatDistanceToNow, format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function MessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const location = useLocation();
  const { socket } = useSocket();
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isStartingRef = useRef(false);

  const fetchConversations = async (targetPartnerId?: any) => {
    try {
      const res = await axiosClient.get('/api/conversations');
      if (res.data.errCode === 0) {
        const data = res.data.data;
        setConversations(data);
        
        const partnerId = targetPartnerId || location.state?.partnerId;
        if (partnerId) {
          const target = data.find((c: any) => c.partner?.id == partnerId);
          if (target) {
            setSelectedConv(target);
          } else if (!isStartingRef.current) {
            // Check if it's a new conversation
            isStartingRef.current = true;
            try {
               const startRes = await axiosClient.post('/api/conversations/start', {
                candidate_id: user?.role === 'EMPLOYER' ? partnerId : user?.id,
                employer_id: user?.role === 'EMPLOYER' ? user?.id : partnerId
              });
              if (startRes.data.errCode === 0) {
                const newConv = startRes.data.data;
                setConversations(prev => {
                  const exists = prev.find(c => c.id === newConv.id);
                  if (exists) return prev;
                  return [newConv, ...prev];
                });
                setSelectedConv(newConv);
              }
            } catch (err) {
              console.error('Error starting conversation:', err);
            } finally {
              isStartingRef.current = false;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (partnerId: number) => {
    setIsMessagesLoading(true);
    try {
      const res = await axiosClient.get(`/api/messages/${partnerId}`);
      if (res.data.errCode === 0) {
        setMessages(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsMessagesLoading(false);
    }
  };

  const markAsRead = (convId: number) => {
    if (socket) {
      socket.emit('markAsRead', { conversationId: convId });
      // Update local state
      setConversations(prev => prev.map(c => c.id === convId ? { ...c, unread_count: 0 } : c));
    }
  };

  useEffect(() => {
    if (user) {
      fetchConversations(location.state?.partnerId);
    }
  }, [user, location.state?.partnerId]);

  useEffect(() => {
    if (selectedConv) {
      fetchMessages(selectedConv.partner?.id);
      if (selectedConv.unread_count > 0) {
        markAsRead(selectedConv.id);
      }
      
      // Join conversation room in socket
      if (socket) {
        socket.emit('joinConversation', selectedConv.id);
      }

      return () => {
        if (socket) {
          socket.emit('leaveConversation');
        }
      };
    }
  }, [selectedConv, socket]);

  useEffect(() => {
    if (socket) {
      const handleReceiveMessage = (message: any) => {
        const partnerId = message.sender_id === user?.id ? message.receiver_id : message.sender_id;
        
        if (selectedConv && selectedConv.partner?.id === partnerId) {
          setMessages(prev => [...prev, message]);
          markAsRead(selectedConv.id);
        }
        
        fetchConversations();
      };

      socket.on('receiveMessage', handleReceiveMessage);

      return () => {
        socket.off('receiveMessage', handleReceiveMessage);
      };
    }
  }, [socket, selectedConv, user]);

  // Smart Scroll logic
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer && messages.length > 0) {
      const isAtBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop <= scrollContainer.clientHeight + 200;
      
      if (messages.length > 0) {
        const isInitialLoad = messages.length > 0 && (!scrollContainer.scrollTop || scrollContainer.scrollTop < 100);
        
        if (isInitialLoad || isAtBottom) {
          messagesEndRef.current?.scrollIntoView({ 
            behavior: isInitialLoad ? 'auto' : 'smooth' 
          });
        }
      }
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConv || !socket) return;

    const recipientId = selectedConv.partner?.id;
    
    socket.emit('sendMessage', {
      recipientId,
      content: newMessage,
      conversationId: selectedConv.id
    });

    setNewMessage('');
  };

  const filteredConversations = conversations.filter(c => 
    c.partner?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    if (now.getTime() - date.getTime() < 24 * 60 * 60 * 1000) {
       return format(date, 'HH:mm');
    }
    return format(date, 'dd/MM');
  };

  // Group messages by date
  const groupMessages = () => {
    const groups: any[] = [];
    messages.forEach((msg) => {
      const date = format(new Date(msg.createdAt), 'yyyy-MM-dd');
      const lastGroup = groups[groups.length - 1];
      
      if (!lastGroup || lastGroup.date !== date) {
        groups.push({
          date,
          label: getRelativeDateLabel(new Date(msg.createdAt)),
          messages: [msg]
        });
      } else {
        lastGroup.messages.push(msg);
      }
    });
    return groups;
  };

  const getRelativeDateLabel = (date: Date) => {
    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');
    const yesterday = format(new Date(now.setDate(now.getDate() - 1)), 'yyyy-MM-dd');
    const target = format(date, 'yyyy-MM-dd');

    if (target === today) return 'Hôm nay';
    if (target === yesterday) return 'Hôm qua';
    
    // If different year, show full date
    if (date.getFullYear() !== now.getFullYear()) {
      return format(date, 'dd/MM/yyyy');
    }
    return format(date, 'dd MMMM', { locale: vi });
  };


  return (
    <div className="fixed inset-x-0 bottom-0 top-[64px] bg-slate-50/50 z-10 overflow-hidden">
      <div className="container mx-auto h-full py-4 max-w-7xl">
        <div className="flex h-full gap-6">
          {/* Sidebar */}
          <Card className="w-80 lg:w-96 flex flex-col shadow-sm border-slate-200 overflow-hidden bg-white shrink-0">
          <div className="p-4 border-b border-slate-100 space-y-4">
            <h1 className="text-xl font-bold text-slate-900">Tin nhắn</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Tìm kiếm hội thoại..." 
                className="pl-10 bg-slate-50 border-none h-10 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/20"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary/40" />
              </div>
            ) : filteredConversations.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConv(conv)}
                    className={cn(
                      "w-full flex items-center gap-3 p-4 transition-all text-left relative hover:bg-slate-50",
                      selectedConv?.id === conv.id ? "bg-blue-50/40" : ""
                    )}
                  >
                    {selectedConv?.id === conv.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                    )}
                    <div className="relative">
                      <Avatar className="w-12 h-12 shadow-sm">
                        <AvatarImage src={conv.partner?.profile_picture} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {conv.partner?.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {/* Status indicator (can be dynamic if you have online status) */}
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className={cn(
                          "text-sm font-semibold truncate max-w-[140px] lg:max-w-[180px]",
                          conv.unread_count > 0 ? "text-slate-900" : "text-slate-700"
                        )}>
                          {conv.partner?.name}
                        </p>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {formatTime(conv.last_message_at)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className={cn(
                          "text-xs truncate max-w-[180px]",
                          conv.unread_count > 0 ? "font-bold text-slate-900" : "text-slate-500"
                        )}>
                          {conv.last_message || 'Bắt đầu cuộc trò chuyện'}
                        </p>
                        {conv.unread_count > 0 && (
                          <span className="bg-primary text-white text-[10px] font-bold h-4 min-w-4 px-1 flex items-center justify-center rounded-full">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 opacity-20" />
                </div>
                <p className="text-sm font-medium">Không tìm thấy hội thoại</p>
              </div>
            )}
          </ScrollArea>
        </Card>

        {/* Main Chat Area */}
        <Card className="flex-1 flex flex-col shadow-sm border-slate-200 overflow-hidden bg-white">
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 shadow-sm">
                    <AvatarImage src={selectedConv.partner?.profile_picture} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {selectedConv.partner?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-slate-900 leading-tight">{selectedConv.partner?.name}</p>
                    <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      Trực tuyến
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-hidden relative">
                 {isMessagesLoading && (
                  <div className="absolute inset-0 z-10 bg-white/50 flex items-center justify-center backdrop-blur-[1px]">
                    <Loader2 className="w-6 h-6 animate-spin text-primary/40" />
                  </div>
                )}
                <ScrollArea 
                  className="h-full bg-slate-50/30"
                  viewportRef={scrollRef}
                >
                  <div className="p-6 space-y-8">
                    {messages.length > 0 ? (
                      groupMessages().map((group) => (
                        <div key={group.date} className="space-y-6">
                          <div className="flex justify-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">
                              {group.label}
                            </span>
                          </div>
                          
                          <div className="space-y-4">
                            {group.messages.map((msg: any) => {
                              const isMine = msg.sender_id === user?.id;
                              
                              return (
                                <div key={msg.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                                  <div className={cn(
                                    "max-w-[75%] px-4 py-3 shadow-sm",
                                    isMine 
                                      ? "bg-primary text-white rounded-2xl rounded-tr-none" 
                                      : "bg-white text-slate-700 rounded-2xl rounded-tl-none border border-slate-100"
                                  )}>
                                    <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                    <p className={cn(
                                      "text-[9px] mt-1.5 font-medium text-right",
                                      isMine ? "text-white/60" : "text-slate-400"
                                    )}>
                                      {format(new Date(msg.createdAt), 'HH:mm')}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    ) : !isMessagesLoading && (
                      <div className="h-full flex flex-col items-center justify-center text-slate-300 py-12">
                        <p className="text-sm">Chưa có tin nhắn nào. Hãy bắt đầu trò chuyện!</p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-slate-100 bg-white">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-xl shrink-0">
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  <div className="flex-1 relative flex items-center">
                    <textarea
                      placeholder="Viết tin nhắn..."
                      rows={1}
                      className="w-full bg-slate-50 border-none focus:ring-1 focus:ring-primary/20 rounded-xl px-4 py-2.5 text-sm resize-none min-h-[40px] max-h-[120px]"
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                  </div>
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="h-10 w-10 rounded-xl shadow-md shadow-blue-100 shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/20 p-12">
              <div className="w-24 h-24 rounded-3xl bg-white shadow-sm flex items-center justify-center mb-8 rotate-3">
                <Send className="w-10 h-10 text-primary/20 -rotate-12" />
              </div>
              <h3 className="text-slate-900 font-bold text-xl mb-3">Hộp thư của bạn</h3>
              <p className="text-sm max-w-[320px] text-center leading-relaxed text-slate-500">
                Chọn một người dùng từ danh sách bên trái để bắt đầu cuộc trò chuyện hoặc xem tin nhắn mới.
              </p>
            </div>
          )}
        </Card>
        </div>
      </div>
    </div>
  );
}

