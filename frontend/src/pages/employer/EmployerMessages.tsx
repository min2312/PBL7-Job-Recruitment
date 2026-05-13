import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Search, Paperclip, Loader2, MoreVertical, Phone, Video } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import axiosClient from '@/services/axiosClient';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow, format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function EmployerMessages() {
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
            // New conversation
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
      setConversations(prev => prev.map(c => c.id === convId ? { ...c, unread_count: 0 } : c));
    }
  };

  useEffect(() => {
    if (user) {
      fetchConversations(location.state?.partnerId);
    }
  }, [user, location.state?.partnerId]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedConv) {
      fetchMessages(selectedConv.partner?.id);
      if (selectedConv.unread_count > 0) {
        markAsRead(selectedConv.id);
      }

      // Join conversation room
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

  // Smart Scroll
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer && messages.length > 0) {
      const isAtBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop <= scrollContainer.clientHeight + 200;
      const isInitialLoad = messages.length > 0 && (!scrollContainer.scrollTop || scrollContainer.scrollTop < 100);
      
      if (isInitialLoad || isAtBottom) {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: isInitialLoad ? 'auto' : 'smooth' 
        });
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

  // Group messages
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

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-12rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
      </div>
    );
  }

  return (
    <div className="space-y-4 h-[calc(100vh-10rem)]">
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground tracking-tight">Tin nhắn</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{conversations.length} cuộc trò chuyện</p>
      </div>

      <Card className="h-full overflow-hidden border-slate-200">
        <div className="flex h-full">
          {/* Contact List */}
          <div className="w-80 border-r border-slate-100 flex flex-col bg-white">
            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Tìm kiếm..." 
                  className="pl-10 h-9 bg-slate-50 border-none rounded-lg"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <ScrollArea className="flex-1">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors text-left relative",
                    selectedConv?.id === conv.id ? "bg-blue-50/50" : ""
                  )}
                >
                  {selectedConv?.id === conv.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                  )}
                  <Avatar className="w-10 h-10 shrink-0">
                    <AvatarImage src={conv.partner?.profile_picture} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                      {conv.partner?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={cn(
                        "text-sm font-semibold truncate max-w-[140px]",
                        conv.unread_count > 0 ? "text-slate-900" : "text-slate-700"
                      )}>
                        {conv.partner?.name}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {formatTime(conv.last_message_at)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={cn(
                        "text-xs truncate",
                        conv.unread_count > 0 ? "font-bold text-slate-900" : "text-slate-500"
                      )}>
                        {conv.last_message || 'Bắt đầu cuộc trò chuyện'}
                      </p>
                      {conv.unread_count > 0 && (
                        <span className="bg-primary text-white text-[9px] font-bold h-3.5 min-w-[14px] px-1 flex items-center justify-center rounded-full">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-white">
            {selectedConv ? (
              <>
                <div className="h-14 flex items-center justify-between px-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={selectedConv.partner?.profile_picture} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {selectedConv.partner?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-sm text-slate-900 leading-tight">{selectedConv.partner?.name}</p>
                      <p className="text-[10px] text-emerald-600 font-medium">Đang hoạt động</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary">
                      <Phone className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary">
                      <Video className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden relative">
                  {isMessagesLoading && (
                    <div className="absolute inset-0 z-10 bg-white/50 flex items-center justify-center backdrop-blur-[1px]">
                      <Loader2 className="w-5 h-5 animate-spin text-primary/40" />
                    </div>
                  )}
                  <ScrollArea 
                    className="h-full bg-slate-50/20"
                    viewportRef={scrollRef}
                  >
                    <div className="p-4 space-y-6">
                      {groupMessages().map((group) => (
                        <div key={group.date} className="space-y-4">
                          <div className="flex justify-center my-4">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                              {group.label}
                            </span>
                          </div>
                          
                          <div className="space-y-3">
                            {group.messages.map((msg: any) => {
                              const isMine = msg.sender_id === user?.id;
                              
                              return (
                                <div key={msg.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                                  <div className={cn(
                                    "max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm",
                                    isMine ? "bg-primary text-white rounded-br-none" : "bg-white text-slate-700 rounded-bl-none border border-slate-100"
                                  )}>
                                    <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                    <p className={cn(
                                      "text-[8px] mt-1 text-right font-medium",
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
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </div>

                <div className="p-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9 text-slate-400 hover:text-primary">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <textarea
                      placeholder="Nhập tin nhắn..."
                      rows={1}
                      className="flex-1 bg-slate-50 border-none focus:ring-1 focus:ring-primary/20 rounded-xl px-4 py-2 text-sm resize-none min-h-[36px] max-h-[100px]"
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button 
                      size="icon" 
                      className="shrink-0 h-9 w-9 rounded-xl shadow-md shadow-blue-100" 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/10">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4">
                  <Send className="w-8 h-8 text-primary/20" />
                </div>
                <p className="text-sm">Chọn một cuộc trò chuyện để bắt đầu</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

