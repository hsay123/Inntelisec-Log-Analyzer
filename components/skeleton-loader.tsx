import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  className?: string;
  variant?: "text" | "card" | "chart" | "chat";
}

export function SkeletonLoader({ className, variant = "text" }: SkeletonLoaderProps) {
  if (variant === "card") {
    return (
      <div className={cn("rounded-xl border border-border bg-card p-6", className)}>
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="skeleton h-4 w-24 rounded" />
            <div className="skeleton h-8 w-32 rounded" />
            <div className="skeleton h-4 w-40 rounded" />
          </div>
          <div className="skeleton h-12 w-12 rounded-lg" />
        </div>
      </div>
    );
  }

  if (variant === "chart") {
    return (
      <div className={cn("rounded-xl border border-border bg-card p-6", className)}>
        <div className="skeleton h-5 w-40 rounded mb-4" />
        <div className="skeleton h-64 w-full rounded" />
      </div>
    );
  }

  if (variant === "chat") {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex gap-3">
          <div className="skeleton h-8 w-8 rounded-full shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-4 w-1/2 rounded" />
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <div className="space-y-2 flex-1 flex flex-col items-end">
            <div className="skeleton h-4 w-2/3 rounded" />
            <div className="skeleton h-4 w-1/3 rounded" />
          </div>
          <div className="skeleton h-8 w-8 rounded-full shrink-0" />
        </div>
      </div>
    );
  }

  return <div className={cn("skeleton h-4 w-full rounded", className)} />;
}

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 p-3">
      <div className="typing-dot h-2 w-2 rounded-full bg-primary" />
      <div className="typing-dot h-2 w-2 rounded-full bg-primary" />
      <div className="typing-dot h-2 w-2 rounded-full bg-primary" />
    </div>
  );
}
