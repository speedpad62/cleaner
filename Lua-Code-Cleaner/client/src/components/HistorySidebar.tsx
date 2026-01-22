import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Clock, Trash2, ChevronRight, FileCode } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type Snippet } from "@shared/schema";
import { cn } from "@/lib/utils";

interface HistorySidebarProps {
  snippets: Snippet[];
  onSelect: (snippet: Snippet) => void;
  selectedId: number | null;
  isLoading: boolean;
}

export function HistorySidebar({ snippets, onSelect, selectedId, isLoading }: HistorySidebarProps) {
  if (isLoading) {
    return (
      <div className="w-72 border-r border-border/40 bg-muted/10 flex flex-col p-4 gap-4">
        <div className="h-6 w-32 bg-muted/40 rounded animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 w-full bg-muted/30 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full md:w-72 border-r border-border/40 bg-muted/10 flex flex-col h-full">
      <div className="p-5 border-b border-border/40 flex items-center gap-2">
        <Clock className="w-4 h-4 text-primary" />
        <h2 className="font-semibold text-sm tracking-wide">Recent History</h2>
        <span className="ml-auto text-xs text-muted-foreground px-2 py-0.5 rounded-md bg-muted/50">
          {snippets.length}
        </span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {snippets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileCode className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No history yet</p>
              <p className="text-xs opacity-60 mt-1">Deobfuscate code to start</p>
            </div>
          ) : (
            snippets.map((snippet) => (
              <button
                key={snippet.id}
                onClick={() => onSelect(snippet)}
                className={cn(
                  "w-full text-left p-3 rounded-xl border transition-all duration-200 group relative overflow-hidden",
                  selectedId === snippet.id
                    ? "bg-primary/10 border-primary/30 shadow-sm"
                    : "bg-card/50 border-border/40 hover:bg-card hover:border-border hover:shadow-md"
                )}
              >
                {selectedId === snippet.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                )}
                
                <div className="flex items-start justify-between mb-1">
                  <span className="text-xs font-mono text-muted-foreground/80 truncate pr-2 max-w-[150px]">
                    ID: #{snippet.id}
                  </span>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(snippet.createdAt), { addSuffix: true })}
                  </span>
                </div>
                
                <div className="text-xs font-medium text-foreground/90 line-clamp-2 font-mono leading-relaxed">
                  {snippet.originalCode.slice(0, 100).replace(/\n/g, ' ')}...
                </div>

                <div className={cn(
                  "absolute right-2 top-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-200",
                  selectedId === snippet.id ? "opacity-100" : "group-hover:opacity-100"
                )}>
                  <ChevronRight className="w-4 h-4 text-primary" />
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
