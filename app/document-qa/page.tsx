"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { DocumentUploader } from "@/components/document-uploader";
import { DocumentList } from "@/components/document-list";
import { ChatInterface } from "@/components/chat-interface";
import { SourcePanel } from "@/components/source-panel";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  chunks: number;
  uploadedAt: Date;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  timestamp: Date;
}

export interface Source {
  docName: string;
  chunkId: number;
  text: string;
  similarity: number;
  section?: string;
}

export default function DocumentQAPage() {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      name: "Employee Handbook.pdf",
      type: "pdf",
      size: 245000,
      chunks: 42,
      uploadedAt: new Date(Date.now() - 86400000),
    },
    {
      id: "2",
      name: "Product Specification.txt",
      type: "txt",
      size: 18500,
      chunks: 15,
      uploadedAt: new Date(Date.now() - 172800000),
    },
    {
      id: "3",
      name: "HR Policy Document.pdf",
      type: "pdf",
      size: 156000,
      chunks: 28,
      uploadedAt: new Date(Date.now() - 259200000),
    },
  ]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedSources, setSelectedSources] = useState<Source[] | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = (newDocs: Document[]) => {
    setDocuments((prev) => [...newDocs, ...prev]);
    setShowUploader(false);
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  const handleSendMessage = async (question: string) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/documents/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, documentIds: documents.map((d) => d.id) }),
      });

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.answer,
        sources: data.sources,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, I encountered an error processing your question. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Document QA"
        description="Upload documents and ask questions using AI-powered retrieval"
      >
        <Button onClick={() => setShowUploader(true)} className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Document
        </Button>
      </PageHeader>

      {showUploader && (
        <DocumentUploader
          onUpload={handleUpload}
          onClose={() => setShowUploader(false)}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Document List */}
          <DocumentList
            documents={documents}
            onDelete={handleDeleteDocument}
          />

          {/* Chat Interface */}
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            onViewSources={setSelectedSources}
            isLoading={isLoading}
            disabled={documents.length === 0}
          />
        </div>

        {/* Source Panel */}
        <div className="hidden lg:block">
          <SourcePanel
            sources={selectedSources}
            onClose={() => setSelectedSources(null)}
          />
        </div>
      </div>
    </AppShell>
  );
}
