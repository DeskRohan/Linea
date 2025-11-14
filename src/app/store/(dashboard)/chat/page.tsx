
'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, BarChart2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type ChatHistory, chatWithStoreBot } from '@/ai/flows/store-chat-flow';
import { useUser } from '@/firebase';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


export default function ChatPage() {
  const { user } = useUser();
  const [history, setHistory] = useState<ChatHistory>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom whenever the history changes
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [history]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    const newHistory: ChatHistory = [...history, userMessage];
    
    setHistory(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const botResponse = await chatWithStoreBot(newHistory);
      setHistory((prevHistory) => [...prevHistory, botResponse]);
    } catch (error) {
      console.error("Error calling chat flow:", error);
      const errorResponse = {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting to my brain right now. Please check the API key and try again."
      };
      setHistory((prevHistory) => [...prevHistory, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };
  
  const getInitials = (email: string) => {
    const parts = email.split('@');
    return parts[0].substring(0, 2).toUpperCase();
  }

  return (
    <div className="h-full flex flex-col">
       <div className="flex items-center mb-4">
        <h1 className="text-lg font-semibold md:text-2xl">Chat with Navya</h1>
      </div>
       <CardDescription className="mb-4">
        Your personal AI business analyst. Ask questions about your sales, customers, and inventory.
      </CardDescription>

      <Alert className="mb-4 bg-blue-50 border-blue-200 text-blue-800 [&>svg]:text-blue-600">
        <BarChart2 className="h-4 w-4" />
        <AlertTitle>Example Questions</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside text-sm">
            <li>Who are my top customers?</li>
            <li>What were my sales each month?</li>
            <li>Show me the top selling products.</li>
          </ul>
        </AlertDescription>
      </Alert>

      <Card className="flex-grow flex flex-col shadow-lg">
        <CardContent className="flex-grow p-0 flex flex-col">
          <ScrollArea className="flex-grow" ref={scrollAreaRef}>
            <div className="p-6 space-y-6">
              {/* Initial welcome message */}
              {history.length === 0 && (
                <div className="flex items-start gap-4">
                  <Avatar className="border">
                    <AvatarFallback><Bot /></AvatarFallback>
                  </Avatar>
                  <div className="bg-muted p-4 rounded-lg rounded-tl-none max-w-xl shadow-sm">
                    <p className="font-semibold text-primary mb-1">Navya</p>
                    <p className="text-card-foreground">
                      Hello! I'm Navya, your AI business analyst. How can I help you analyze your store's performance today?
                    </p>
                  </div>
                </div>
              )}
              
              {/* Chat history */}
              {history.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-4',
                    message.role === 'user' && 'flex-row-reverse'
                  )}
                >
                  <Avatar className="border">
                    {message.role === 'assistant' ? (
                       <AvatarFallback><Bot /></AvatarFallback>
                    ) : (
                       <>
                        <AvatarImage src={user?.photoURL || ''} />
                        <AvatarFallback>{getInitials(user?.email || '??')}</AvatarFallback>
                       </>
                    )}
                  </Avatar>
                  <div
                    className={cn(
                      'p-4 rounded-lg max-w-xl shadow-sm',
                      message.role === 'assistant'
                        ? 'bg-muted rounded-tl-none'
                        : 'bg-primary text-primary-foreground rounded-tr-none'
                    )}
                  >
                     {message.role === 'assistant' && <p className="font-semibold text-primary mb-1">Navya</p>}
                     <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
               {isLoading && (
                 <div className="flex items-start gap-4">
                  <Avatar className="border">
                     <AvatarFallback><Bot /></AvatarFallback>
                  </Avatar>
                  <div className="bg-muted p-4 rounded-lg rounded-tl-none max-w-xl shadow-sm flex items-center">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                 </div>
               )}
            </div>
          </ScrollArea>
          <div className="p-4 border-t bg-background/80">
            <div className="relative">
              <Input
                placeholder="Ask about your sales, customers, or products..."
                className="pr-12 h-12 rounded-full shadow-inner"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <Button
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full w-9 h-9"
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
