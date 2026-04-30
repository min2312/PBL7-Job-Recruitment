import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Search, Paperclip } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Contact {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
}

interface Message {
  id: number;
  senderId: number;
  text: string;
  time: string;
  isMine: boolean;
}

const contacts: Contact[] = [
  { id: 1, name: 'Nguyễn Văn A', avatar: 'NVA', lastMessage: 'Tôi rất hứng thú với vị trí này', time: '10:30', unread: 2 },
  { id: 2, name: 'Trần Thị B', avatar: 'TTB', lastMessage: 'Khi nào tôi có thể phỏng vấn?', time: '09:15', unread: 0 },
  { id: 3, name: 'Lê Văn C', avatar: 'LVC', lastMessage: 'Cảm ơn anh/chị đã phản hồi', time: 'Hôm qua', unread: 0 },
  { id: 4, name: 'Hoàng Văn E', avatar: 'HVE', lastMessage: 'Tôi đã gửi CV cập nhật', time: 'Hôm qua', unread: 1 },
];

const mockMessages: Message[] = [
  { id: 1, senderId: 1, text: 'Xin chào! Tôi thấy tin tuyển dụng Frontend Developer và rất hứng thú.', time: '10:00', isMine: false },
  { id: 2, senderId: 10, text: 'Chào bạn! Cảm ơn bạn đã quan tâm đến vị trí này. Bạn có thể gửi CV cho mình không?', time: '10:15', isMine: true },
  { id: 3, senderId: 1, text: 'Vâng, tôi đã nộp CV trên hệ thống rồi ạ. Tôi có 3 năm kinh nghiệm với React và TypeScript.', time: '10:20', isMine: false },
  { id: 4, senderId: 10, text: 'Tuyệt vời! Mình đã xem CV của bạn. Profile rất ấn tượng. Bạn có thể phỏng vấn vào tuần sau không?', time: '10:25', isMine: true },
  { id: 5, senderId: 1, text: 'Tôi rất hứng thú với vị trí này. Tuần sau tôi available cả tuần ạ!', time: '10:30', isMine: false },
];

export default function EmployerMessages() {
  const [selectedContact, setSelectedContact] = useState(contacts[0]);
  const [newMessage, setNewMessage] = useState('');

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground tracking-tight">Tin nhắn</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{contacts.length} cuộc trò chuyện</p>
      </div>

      <Card className="h-[calc(100vh-12rem)]">
        <div className="flex h-full">
          {/* Contact List */}
          <div className="w-80 border-r border-border flex flex-col">
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Tìm kiếm..." className="pl-10 h-9" />
              </div>
            </div>
            <ScrollArea className="flex-1">
              {contacts.map(contact => (
                <button
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left ${selectedContact.id === contact.id ? 'bg-muted/50' : ''}`}
                >
                  <Avatar className="w-10 h-10 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">{contact.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm text-foreground">{contact.name}</p>
                      <span className="text-xs text-muted-foreground">{contact.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{contact.lastMessage}</p>
                  </div>
                  {contact.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0">{contact.unread}</span>
                  )}
                </button>
              ))}
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="h-14 flex items-center gap-3 px-4 border-b border-border">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">{selectedContact.avatar}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm text-foreground">{selectedContact.name}</p>
                <p className="text-xs text-success">Đang hoạt động</p>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {mockMessages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${msg.isMine ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-muted text-foreground rounded-bl-md'}`}>
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-3 border-t border-border">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Input
                  placeholder="Nhập tin nhắn..."
                  className="h-9"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && setNewMessage('')}
                />
                <Button size="icon" className="shrink-0 h-9 w-9">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
