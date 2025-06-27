'use client';

import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Copy, 
  Check, 
  Download, 
  Eye, 
  EyeOff,
  Search,
  Settings,
  Maximize2,
  MoreHorizontal
} from 'lucide-react';

interface CodeFile {
  name: string;
  content: string;
  language: string;
  path: string;
}

interface CodeViewerProps {
  files: CodeFile[];
}

export function CodeViewer({ files }: CodeViewerProps) {
  const [selectedFile, setSelectedFile] = useState(files[0]?.name || '');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [fontSize, setFontSize] = useState(14);

  const selectedFileData = files.find(f => f.name === selectedFile);

  const handleCopy = async (content: string, fileName: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedFile(fileName);
      setTimeout(() => setCopiedFile(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getLanguageColor = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'tsx':
      case 'ts':
        return 'bg-blue-500';
      case 'js':
      case 'jsx':
        return 'bg-yellow-500';
      case 'css':
        return 'bg-purple-500';
      case 'json':
        return 'bg-green-500';
      default:
        return 'bg-muted';
    }
  };

  const addLineNumbers = (content: string) => {
    return content.split('\n').map((line, index) => (
      `${String(index + 1).padStart(3, ' ')} │ ${line}`
    )).join('\n');
  };

  if (files.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background text-muted-foreground">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Eye className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">لا توجد ملفات للعرض</h3>
          <p className="text-sm">ابدأ محادثة مع الذكاء الاصطناعي لإنشاء مشروع</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* File Tabs */}
      <div className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-4 py-2">
          <ScrollArea className="flex-1">
            <div className="flex gap-1">
              {files.map((file) => (
                <Button
                  key={file.name}
                  variant={selectedFile === file.name ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedFile(file.name)}
                  className={`text-xs whitespace-nowrap relative ${
                    selectedFile === file.name 
                      ? 'bg-muted text-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {file.name}
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${getLanguageColor(file.name)} ${
                    selectedFile === file.name ? 'opacity-100' : 'opacity-0'
                  }`} />
                </Button>
              ))}
            </div>
          </ScrollArea>
          
          <div className="flex items-center gap-1 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLineNumbers(!showLineNumbers)}
              className="text-muted-foreground hover:text-foreground"
            >
              {showLineNumbers ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFontSize(prev => prev === 14 ? 16 : prev === 16 ? 12 : 14)}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              {fontSize}px
            </Button>
            {selectedFileData && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(selectedFileData.content, selectedFile)}
                className="text-muted-foreground hover:text-foreground"
              >
                {copiedFile === selectedFile ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            )}
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Code Content */}
      {selectedFileData && (
        <>
          {/* File Info */}
          <div className="border-b border-border bg-muted/50 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{selectedFileData.path}</span>
              <Badge variant="outline" className="text-xs border-border">
                {selectedFileData.language}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{selectedFileData.content.split('\n').length} lines</span>
              <span>{new Blob([selectedFileData.content]).size} bytes</span>
            </div>
          </div>
          
          {/* Code */}
          <ScrollArea className="flex-1">
            <pre 
              className="p-4 text-sm font-mono leading-relaxed text-foreground bg-background min-h-full"
              style={{ fontSize: `${fontSize}px` }}
            >
              <code>
                {showLineNumbers 
                  ? addLineNumbers(selectedFileData.content)
                  : selectedFileData.content
                }
              </code>
            </pre>
          </ScrollArea>
        </>
      )}
    </div>
  );
}