"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileText, Loader2, ClipboardPaste } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface LogUploaderProps {
  onUpload: () => void;
  onClose: () => void;
}

export function LogUploader({ onUpload, onClose }: LogUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [pastedText, setPastedText] = useState("");

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      setIsUploading(true);
      
      // Simulate upload and processing
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      toast.success(`${acceptedFiles[0].name} uploaded and analyzing...`);
      setIsUploading(false);
      onUpload();
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".log", ".txt"],
      "application/json": [".json"],
    },
    multiple: false,
  });

  const handlePasteSubmit = async () => {
    if (!pastedText.trim()) return;

    setIsUploading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success("Log text analyzing...");
    setIsUploading(false);
    onUpload();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">Upload Logs</DialogTitle>
          <DialogDescription>
            Upload a log file or paste raw log text for analysis
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-secondary">
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="h-4 w-4" />
              File Upload
            </TabsTrigger>
            <TabsTrigger value="paste" className="gap-2">
              <ClipboardPaste className="h-4 w-4" />
              Paste Text
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-4">
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-secondary/50",
                isUploading && "pointer-events-none opacity-50"
              )}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-3">
                {isUploading ? (
                  <Loader2 className="h-12 w-12 text-primary animate-spin" />
                ) : (
                  <div className="rounded-full bg-primary/10 p-4">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-sm font-medium text-card-foreground">
                    {isUploading
                      ? "Processing log file..."
                      : isDragActive
                      ? "Drop file here..."
                      : "Drag & drop a log file, or click to select"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports .log, .txt, and .json files
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-secondary/50 p-4">
              <h4 className="text-sm font-medium text-card-foreground mb-2">
                Supported Formats
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>- Standard text logs (timestamp, level, message)</li>
                <li>- JSON structured logs</li>
                <li>- Apache/Nginx access logs</li>
                <li>- Application stack traces</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="paste" className="mt-4 space-y-4">
            <Textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste your log text here..."
              className="min-h-[300px] font-mono text-xs bg-secondary border-border"
              disabled={isUploading}
            />

            <Button
              onClick={handlePasteSubmit}
              disabled={!pastedText.trim() || isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Logs"
              )}
            </Button>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
