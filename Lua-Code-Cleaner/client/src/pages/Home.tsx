import React, { useState, useEffect } from "react";
import { Wand2, Zap, Trash2, Layout } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CodePane } from "@/components/CodePane";
import { HistorySidebar } from "@/components/HistorySidebar";
import { useCleanSnippet, useSnippets } from "@/hooks/use-snippets";
import type { Snippet } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [inputCode, setInputCode] = useState("");
  const [outputCode, setOutputCode] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { data: snippets = [], isLoading: isHistoryLoading } = useSnippets();
  const cleanMutation = useCleanSnippet();
  const { toast } = useToast();

  const handleDeobfuscate = () => {
    if (!inputCode.trim()) {
      toast({
        title: "Input Required",
        description: "Please paste some obfuscated Lua code first.",
        variant: "destructive",
      });
      return;
    }

    cleanMutation.mutate(
      { code: inputCode },
      {
        onSuccess: (data) => {
          setOutputCode(data.cleanedCode);
          if (data.snippetId) setSelectedId(data.snippetId);
        },
      }
    );
  };

  const handleSelectHistory = (snippet: Snippet) => {
    setInputCode(snippet.originalCode);
    setOutputCode(snippet.cleanedCode);
    setSelectedId(snippet.id);
  };

  const handleClear = () => {
    setInputCode("");
    setOutputCode("");
    setSelectedId(null);
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans">
      {/* Sidebar - Collapsible on mobile */}
      <div 
        className={`${isSidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 ease-in-out border-r border-border/50 relative hidden md:block`}
      >
        <div className="w-80 h-full">
           <HistorySidebar 
            snippets={snippets} 
            onSelect={handleSelectHistory} 
            selectedId={selectedId}
            isLoading={isHistoryLoading}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-md flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-muted rounded-lg transition-colors hidden md:block"
            >
              <Layout className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                <Zap className="w-5 h-5 text-primary fill-primary/50" />
              </div>
              <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                Lua Deobfuscator
              </h1>
              <span className="text-[10px] font-mono bg-muted px-2 py-0.5 rounded-md text-muted-foreground border border-border/50 uppercase tracking-widest">
                v1.0
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>

            <button
              onClick={handleDeobfuscate}
              disabled={cleanMutation.isPending || !inputCode.trim()}
              className="group relative flex items-center gap-2 px-6 py-2 rounded-lg font-semibold text-primary-foreground bg-primary shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.5)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:shadow-none disabled:transform-none transition-all duration-200"
            >
              <Wand2 className={`w-4 h-4 ${cleanMutation.isPending ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'}`} />
              <span>{cleanMutation.isPending ? 'Deobfuscating...' : 'Deobfuscate'}</span>
            </button>
          </div>
        </header>

        {/* Editor Grid */}
        <main className="flex-1 p-4 md:p-6 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="h-full min-h-[300px]"
            >
              <CodePane
                title="Obfuscated Input"
                code={inputCode}
                onChange={setInputCode}
                placeholder="-- Paste your obfuscated Lua code here..."
                badge="Input"
                badgeColor="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
              className="h-full min-h-[300px]"
            >
              <CodePane
                title="Cleaned Output"
                code={outputCode}
                readOnly={true}
                isLoading={cleanMutation.isPending}
                placeholder="Result will appear here..."
                badge="Output"
                badgeColor="bg-green-500/10 text-green-400 border border-green-500/20"
              />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
