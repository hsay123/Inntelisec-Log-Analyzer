"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { Document } from "@/app/document-qa/page";
import { toast } from "sonner";

interface DocumentUploaderProps {
  onUpload: (documents: Document[]) => void;
  onClose: () => void;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: "uploading" | "processing" | "complete" | "error";
}

export function DocumentUploader({ onUpload, onClose }: DocumentUploaderProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  const processFile = async (file: File): Promise<Document> => {
    // Simulate upload and processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return {
      id: crypto.randomUUID(),
      name: file.name,
      type: file.name.endsWith(".pdf") ? "pdf" : "txt",
      size: file.size,
      chunks: Math.floor(file.size / 1000) + Math.floor(Math.random() * 20) + 5,
      uploadedAt: new Date(),
    };
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map((file) => ({
        file,
        progress: 0,
        status: "uploading" as const,
      }));

      setUploadingFiles(newFiles);

      const uploadedDocs: Document[] = [];

      for (let i = 0; i < newFiles.length; i++) {
        // Simulate progress
        for (let p = 0; p <= 60; p += 10) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          setUploadingFiles((prev) =>
            prev.map((f, idx) =>
              idx === i ? { ...f, progress: p } : f
            )
          );
        }

        // Processing
        setUploadingFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: "processing", progress: 80 } : f
          )
        );

        try {
          const doc = await processFile(newFiles[i].file);
          uploadedDocs.push(doc);

          setUploadingFiles((prev) =>
            prev.map((f, idx) =>
              idx === i ? { ...f, status: "complete", progress: 100 } : f
            )
          );
        } catch {
          setUploadingFiles((prev) =>
            prev.map((f, idx) =>
              idx === i ? { ...f, status: "error" } : f
            )
          );
        }
      }

      if (uploadedDocs.length > 0) {
        toast.success(`${uploadedDocs.length} document(s) uploaded successfully`);
        onUpload(uploadedDocs);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
    },
    multiple: true,
  });

  const isUploading = uploadingFiles.some(
    (f) => f.status === "uploading" || f.status === "processing"
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">Upload Documents</DialogTitle>
          <DialogDescription>
            Upload PDF or TXT files to index and query with AI
          </DialogDescription>
        </DialogHeader>

        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-secondary/50"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-full bg-primary/10 p-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-card-foreground">
                {isDragActive
                  ? "Drop files here..."
                  : "Drag & drop files here, or click to select"}
              </p>
              <p className="text-xs text-muted-foreground">
                Supports PDF and TXT files
              </p>
            </div>
          </div>
        </div>

        {uploadingFiles.length > 0 && (
          <div className="space-y-3 mt-4">
            {uploadingFiles.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
              >
                <div className="rounded-lg bg-primary/10 p-2">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-card-foreground truncate">
                    {item.file.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={item.progress} className="h-1 flex-1" />
                    <span className="text-xs text-muted-foreground w-16">
                      {item.status === "uploading" && "Uploading..."}
                      {item.status === "processing" && "Processing..."}
                      {item.status === "complete" && "Complete"}
                      {item.status === "error" && "Error"}
                    </span>
                  </div>
                </div>
                {item.status === "processing" && (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
