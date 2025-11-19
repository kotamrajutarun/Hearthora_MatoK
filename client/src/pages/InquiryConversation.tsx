import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

type Inquiry = {
  id: string;
  customerId: string;
  providerId: string;
  serviceId: string;
  message: string;
  status: 'new' | 'replied' | 'closed';
  createdAt: string;
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    photoUrl: string | null;
  };
  provider?: {
    id: string;
    firstName: string;
    lastName: string;
    photoUrl: string | null;
  };
  service?: {
    title: string;
  };
};

type Message = {
  id: string;
  inquiryId: string;
  senderId: string;
  text: string;
  createdAt: string;
  sender?: {
    firstName: string;
    lastName: string;
    photoUrl: string | null;
  };
};

export default function InquiryConversation() {
  const [, params] = useRoute('/inquiries/:id');
  const { user } = useAuth();
  const { toast } = useToast();
  const [messageText, setMessageText] = useState('');

  const inquiryId = params?.id;

  const { data: inquiry, isLoading: inquiryLoading } = useQuery<Inquiry>({
    queryKey: [`/api/inquiries/${inquiryId}`],
    enabled: !!inquiryId,
  });

  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: [`/api/messages/${inquiryId}`],
    enabled: !!inquiryId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await apiRequest('POST', '/api/messages', {
        inquiryId,
        text,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${inquiryId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/inquiries/${inquiryId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/inquiries'] });
      setMessageText('');
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    sendMessageMutation.mutate(messageText);
  };

  if (inquiryLoading || !inquiry) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const otherUser = user?.id === inquiry.customerId ? inquiry.provider : inquiry.customer;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <Card>
          <CardHeader className="border-b">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <CardTitle className="text-2xl">{inquiry.service?.title}</CardTitle>
                <p className="text-muted-foreground mt-1">
                  Conversation with {otherUser?.firstName} {otherUser?.lastName}
                </p>
              </div>
              <Badge 
                variant={inquiry.status === 'new' ? 'default' : inquiry.status === 'replied' ? 'secondary' : 'outline'}
              >
                {inquiry.status}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="max-h-[500px] overflow-y-auto p-6 space-y-4">
              {/* Initial inquiry message */}
              <div className="flex gap-3" data-testid="message-initial">
                <Avatar>
                  <AvatarImage src={inquiry.customer?.photoUrl || undefined} alt={`${inquiry.customer?.firstName}`} />
                  <AvatarFallback>
                    {inquiry.customer?.firstName[0]}{inquiry.customer?.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold">
                      {inquiry.customer?.firstName} {inquiry.customer?.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(inquiry.createdAt), 'PPp')}
                    </span>
                  </div>
                  <div className="bg-card p-3 rounded-lg border">
                    <p className="text-sm">{inquiry.message}</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              {messagesLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : messages && messages.length > 0 ? (
                messages.map((message) => {
                  const isCurrentUser = message.senderId === user?.id;
                  return (
                    <div key={message.id} className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`} data-testid={`message-${message.id}`}>
                      <Avatar>
                        <AvatarImage src={message.sender?.photoUrl || undefined} alt={message.sender?.firstName} />
                        <AvatarFallback>
                          {message.sender?.firstName[0]}{message.sender?.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`flex-1 space-y-1 ${isCurrentUser ? 'flex flex-col items-end' : ''}`}>
                        <div className="flex items-baseline gap-2">
                          <span className="font-semibold">
                            {message.sender?.firstName} {message.sender?.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(message.createdAt), 'PPp')}
                          </span>
                        </div>
                        <div className={`max-w-[80%] p-3 rounded-lg ${
                          isCurrentUser 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-card border'
                        }`}>
                          <p className="text-sm">{message.text}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No messages yet
                </div>
              )}
            </div>

            {/* Message input */}
            <div className="border-t p-4">
              <div className="flex gap-3">
                <Textarea
                  placeholder="Type your message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1"
                  rows={3}
                  data-testid="input-message"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || sendMessageMutation.isPending}
                  size="icon"
                  data-testid="button-send"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
