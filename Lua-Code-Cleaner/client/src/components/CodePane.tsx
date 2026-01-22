import React, { useState } from "react";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-lua";
import { Copy, Check, Loader2, Code2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CodePaneProps {
  title: string;
  code: string;
  onChange?: (code: string) => void;
  readOnly?: boolean;
  isLoading?: boolean;
  placeholder?: string;
  badge?: string;
  badgeColor?: string;
}

export function CodePane({
  title,
  code,
  onChange,
  readOnly = false,
  isLoading = false,
  placeholder = "Enter code here...",
  badge,
  badgeColor = "bg-blue-500/10 text-blue-400",
}: CodePaneProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlight = (code: string) => {
    return Prism.highlight(code, Prism.languages.lua, "lua");
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border/50 shadow-xl shadow-black/20 overflow-hidden group">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-muted/30 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-md bg-background border border-border shadow-sm">
            <Code2 className="w-4 h-4 text-muted-foreground" />
          </div>
          <span className="font-medium text-sm text-foreground/90 tracking-tight">
            {title}
          </span>
          {badge && (
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                badgeColor
              )}
            >
              {badge}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isLoading && (
            <div className="flex items-center gap-2 mr-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs border border-yellow-500/20">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Processing...</span>
            </div>
          )}
          
          <button
            onClick={handleCopy}
            disabled={!code || isLoading}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
              copied
                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : "bg-background border border-border hover:bg-muted hover:text-foreground text-muted-foreground"
            )}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="relative flex-1 bg-[#0d0d0d] overflow-hidden">
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/50 backdrop-blur-[2px]"
          >
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
            <p className="text-sm text-muted-foreground font-medium">Deobfuscating script...</p>
          </motion.div>
        )}
        
        <div className="absolute inset-0 overflow-auto custom-scrollbar">
          <Editor
            value={code}
            onValueChange={onChange || (() => {})}
            highlight={highlight}
            padding={24}
            placeholder={placeholder}
            readOnly={readOnly}
            textareaClassName="focus:outline-none"
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 14,
              minHeight: "100%",
              backgroundColor: "transparent",
            }}
            className="min-h-full"
          />
        </div>
        
        {/* Placeholder overlay for empty read-only states */}
        {readOnly && !code && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30 pointer-events-none select-none">
            <div className="text-center">
              <Code2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">Output will appear here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
