"use client";

import React from "react"

import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, FileSearch, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TypingIndicator } from "@/components/skeleton-loader";
import { cn } from "@/lib/utils";
import type { ChatMessage, Source } from "@/app/document-qa/page";
import { formatDistanceToNow } from "date-fns";

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onViewSources: (sources: Source[]) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function ChatInterface({
  messages,
  onSendMessage,
  onViewSources,
  isLoading,
  disabled,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || disabled) return;
    onSendMessage(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-card-foreground">Ask Questions</CardTitle>
        <CardDescription>
          Ask anything about your uploaded documents
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages Container */}
        <div className="h-[400px] overflow-y-auto rounded-lg border border-border bg-background p-4 space-y-4">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="rounded-full bg-secondary p-4 mb-4">
                <FileSearch className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">
                Start a conversation
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Ask questions about your documents and get AI-powered answers with
                source citations
              </p>
            </div>
          )}

          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onViewSources={onViewSources}
            />
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="rounded-2xl rounded-tl-none bg-secondary px-4 py-2">
                <TypingIndicator />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1 relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                disabled
                  ? "Upload documents to start asking questions..."
                  : "Ask a question about your documents..."
              }
              disabled={disabled || isLoading}
              className="min-h-[80px] resize-none pr-12 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <Button
            type="submit"
            disabled={!input.trim() || isLoading || disabled}
            className="self-end"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>

        {disabled && (
          <div className="flex items-center gap-2 text-sm text-warning">
            <AlertCircle className="h-4 w-4" />
            <span>Upload at least one document to start asking questions</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MessageBubble({
  message,
  onViewSources,
}: {
  message: ChatMessage;
  onViewSources: (sources: Source[]) => void;
}) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser ? "bg-primary" : "bg-primary/10"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-primary-foreground" />
        ) : (
          <Bot className="h-4 w-4 text-primary" />
        )}
      </div>

      <div className={cn("flex-1 space-y-2", isUser && "flex flex-col items-end")}>
        <div
          className={cn(
            "max-w-[85%] rounded-2xl px-4 py-2.5",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-none"
              : "bg-secondary text-secondary-foreground rounded-tl-none"
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(message.timestamp, { addSuffix: true })}
          </span>

          {message.sources && message.sources.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewSources(message.sources!)}
              className="h-6 text-xs text-primary hover:text-primary/80"
            >
              <FileSearch className="h-3 w-3 mr-1" />
              View {message.sources.length} source
              {message.sources.length !== 1 ? "s" : ""}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
