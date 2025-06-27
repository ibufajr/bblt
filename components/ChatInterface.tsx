'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Bot, 
  User, 
  Loader2,
  Sparkles,
  Code,
  FileText,
  Zap,
  Copy,
  Check,
  MoreHorizontal,
  RefreshCw,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isGenerating?: boolean;
}

interface ChatInterfaceProps {
  messages: Message[];
  isGenerating: boolean;
  onSendMessage: (message: string) => void;
}

export function ChatInterface({ messages, isGenerating, onSendMessage }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;
    
    onSendMessage(input.trim());
    setInput('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatMessage = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>');
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="h-12 border-b border-border flex items-center justify-between px-4 shrink-0 bg-muted/50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Bot className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-medium text-foreground">AI Assistant</span>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
        <div className="space-y-4 py-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Ready to help</h3>
              <p className="text-sm text-muted-foreground">Ask me anything about your project</p>
            </div>
          )}
          
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                <div className={`rounded-2xl px-4 py-3 ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white ml-auto' 
                    : 'bg-muted text-foreground'
                }`}>
                  {message.isGenerating ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  ) : (
                    <div 
                      className="text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                    />
                  )}
                </div>
                
                {!message.isGenerating && message.role === 'assistant' && (
                  <div className="flex items-center gap-1 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-muted-foreground hover:text-foreground"
                      onClick={() => copyToClipboard(message.content, message.id)}
                    >
                      {copiedId === message.id ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-muted-foreground hover:text-foreground">
                      <ThumbsUp className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-muted-foreground hover:text-foreground">
                      <ThumbsDown className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
              
              {message.role === 'user' && (
                <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border p-4 bg-background">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative bg-muted rounded-2xl border border-border focus-within:border-blue-500 transition-colors">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask a follow-up question..."
              className="w-full bg-transparent text-foreground placeholder-muted-foreground px-4 py-3 pr-12 resize-none border-0 focus:outline-none text-sm leading-relaxed min-h-[44px] max-h-[200px]"
              style={{ height: 'auto' }}
              disabled={isGenerating}
            />
            
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <Button
                type="submit"
                size="sm"
                disabled={!input.trim() || isGenerating}
                className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 disabled:bg-muted"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}