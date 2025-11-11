
"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User, Send, Loader2, MessageSquare, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { type ChatMessage, chatWithStoreBot } from "@/ai/flows/store-chat-flow";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export default function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "bot",
      content: "Hello! I'm Navya, your personal AI business analyst. How can I help you with your store's performance today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input || isLoading) return;

    setIsLoading(true);
    const userMessage: ChatMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const chatHistory = [...messages, userMessage];

    try {
      const botResponse = await chatWithStoreBot(chatHistory);
      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Error chatting with bot:", error);
      const errorMessage: ChatMessage = {
        role: "bot",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);


  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <Card className="w-[380px] h-[550px] flex flex-col shadow-2xl rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-primary">
                  <AvatarFallback className="bg-primary text-primary-foreground"><Bot /></AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-lg">Navya</CardTitle>
                    <CardDescription>Your AI Business Analyst</CardDescription>
                </div>
              </div>
               <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col overflow-hidden p-0">
            <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
                <div className="flex flex-col gap-4">
                {messages.map((message, index) => (
                    <div
                    key={index}
                    className={cn(
                        "flex items-start gap-3",
                        message.role === "user" ? "justify-end" : "justify-start"
                    )}
                    >
                    {message.role === "bot" && (
                        <Avatar className="h-8 w-8">
                        <AvatarFallback><Bot /></AvatarFallback>
                        </Avatar>
                    )}
                    <div
                        className={cn(
                        "max-w-[80%] rounded-lg p-3 text-sm",
                        message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                    >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.role === "user" && (
                        <Avatar className="h-8 w-8">
                        <AvatarFallback><User /></AvatarFallback>
                        </Avatar>
                    )}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3 justify-start">
                        <Avatar className="h-8 w-8">
                        <AvatarFallback><Bot /></AvatarFallback>
                        </Avatar>
                        <div className="bg-muted rounded-lg p-3 text-sm">
                            <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                    </div>
                )}
                </div>
            </ScrollArea>
            <div className="p-4 border-t">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Navya anything..."
                    className="flex-grow"
                    disabled={isLoading}
                />
                <Button type="submit" size="icon" disabled={isLoading || !input}>
                    <Send className="h-4 w-4" />
                </Button>
                </form>
            </div>
          </CardContent>
        </Card>
      )}
      <Button
        size="lg"
        className="rounded-full w-16 h-16 shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-7 w-7" /> : <MessageSquare className="h-7 w-7" />}
      </Button>
    </div>
  );
}
