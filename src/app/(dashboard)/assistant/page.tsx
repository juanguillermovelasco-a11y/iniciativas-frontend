"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, ArrowRight, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ChatMessage {
  id: number;
  role: "bot" | "user";
  text: string;
}

const WELCOME_MESSAGE =
  "Hello! I'm your strategic initiative assistant. I can help you with questions about your portfolio, financial data, milestones, and more. This feature is currently being trained -- check back soon!";

const DEV_RESPONSE =
  "This feature is under development. Our AI assistant is being trained on your organization's initiative data and will be available soon.";

const suggestedQuestions = [
  "What initiatives are at risk?",
  "Show me the financial summary",
  "Which milestones are overdue?",
];

const suggestedTopics = [
  "Portfolio Overview",
  "Financial Analysis",
  "Milestone Status",
  "KPI Performance",
  "Risk Assessment",
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, role: "bot", text: WELCOME_MESSAGE },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage(text: string) {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      role: "user",
      text: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setShowSuggestions(false);

    // Simulate bot response
    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: Date.now() + 1,
        role: "bot",
        text: DEV_RESPONSE,
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">AI Assistant</h1>
          <Badge className="ml-1 bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
            Beta
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Ask questions about your initiatives, data, and platform features
        </p>
      </div>

      {/* Main layout */}
      <div className="flex gap-6">
        {/* Chat area */}
        <Card className="flex min-h-[600px] flex-1 flex-col">
          {/* Messages */}
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-[480px] px-4 pt-4">
              <div className="space-y-4 pb-4">
                {messages.map((msg) =>
                  msg.role === "bot" ? (
                    <div key={msg.id} className="flex gap-3">
                      <Avatar size="sm">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          <Bot className="h-3.5 w-3.5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5 text-sm leading-relaxed">
                        {msg.text}
                      </div>
                    </div>
                  ) : (
                    <div key={msg.id} className="flex justify-end">
                      <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm leading-relaxed text-primary-foreground">
                        {msg.text}
                      </div>
                    </div>
                  )
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggested questions */}
              {showSuggestions && (
                <div className="flex flex-wrap gap-2 pb-4">
                  {suggestedQuestions.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => sendMessage(q)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-input bg-background px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted dark:border-input dark:bg-input/30 dark:hover:bg-input/50"
                    >
                      <Sparkles className="h-3 w-3 text-muted-foreground" />
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>

          {/* Input area */}
          <div className="border-t px-4 py-3">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Ask a question about your initiatives..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => sendMessage(inputValue)}
                disabled={!inputValue.trim()}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Card>

        {/* Sidebar */}
        <div className="hidden w-[280px] shrink-0 space-y-4 lg:block">
          {/* Suggested Topics */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Suggested Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {suggestedTopics.map((topic) => (
                  <li key={topic}>
                    <button
                      type="button"
                      onClick={() => sendMessage(`Tell me about ${topic}`)}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <ArrowRight className="h-3 w-3 shrink-0" />
                      {topic}
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Training Status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Training Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">35%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: "35%" }}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-xs text-muted-foreground">
                <p>Training on your organization&apos;s data...</p>
                <p className="font-medium text-foreground">
                  Expected completion: Coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
