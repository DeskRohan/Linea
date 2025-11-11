"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User, Send, Loader2, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { chatWithStoreBot } from "@/ai/flows/store-chat-flow";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

// The message type for the UI state
type DisplayMessage = {
  role: "user" | "model";
  content: string;
};

export default function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([
    {
      role: "model",
      content:
        "Hello! I'm Navya, your personal AI business analyst. How can I help you with your store's performance today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector(
        "div[data-radix-scroll-area-viewport]"
      );
      if (viewport) {
        setTimeout(() => {
          viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
        }, 100);
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input || isLoading) return;

    setIsLoading(true);
    const userMessage: DisplayMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    scrollToBottom();

    // Prepare message history (excluding the initial greeting)
    const flowHistory = [...messages.slice(1), userMessage];

    try {
      const botResponse = await chatWithStoreBot(flowHistory);
      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("💥 Error chatting with bot:", error);
      const errorMessage: DisplayMessage = {
        role: "model",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          size="lg"
          className="rounded-full w-16 h-16 shadow-lg flex items-center justify-center bg-gradient-to-tr from-green-500 to-teal-400 hover:from-green-600 hover:to-teal-500 text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <X className="h-7 w-7" />
          ) : (
            <Sparkles className="h-7 w-7" />
          )}
        </Button>
      </div>

      {isOpen && (
        <div className="fixed bottom-24 right-4 z-50 w-[calc(100vw-2rem)] sm:w-full max-w-md animate-in slide-in-from-bottom-4 fade-in-20 duration-300 ease-out">
          <Card className="h-[70vh] max-h-[600px] flex flex-col shadow-2xl rounded-2xl border-2 border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-primary">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot size={20} />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg text-primary">Navya</CardTitle>
                  <CardDescription className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Online
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </Button>
            </CardHeader>

            <CardContent className="flex-grow flex flex-col overflow-hidden p-0">
              <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
                <div className="flex flex-col gap-4 py-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-start gap-3",
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      )}
                    >
                      {message.role === "model" && (
                        <Avatar className="h-8 w-8 bg-background border">
                          <AvatarFallback className="text-primary">
                            <Bot size={18} />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          "max-w-[80%] rounded-xl p-3 text-sm shadow-sm",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                      {message.role === "user" && (
                        <Avatar className="h-8 w-8 border">
                          <AvatarFallback>
                            <User size={18} />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-start gap-3 justify-start">
                      <Avatar className="h-8 w-8 bg-background border">
                        <AvatarFallback className="text-primary">
                          <Bot size={18} />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-xl p-3 text-sm shadow-sm">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="p-4 border-t bg-background/80">
                <form onSubmit={handleSubmit} className="flex items-center gap-3">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Navya anything..."
                    className="flex-grow rounded-full bg-muted border-0 focus-visible:ring-2 focus-visible:ring-primary/50"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="rounded-full bg-primary"
                    disabled={isLoading || !input}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
