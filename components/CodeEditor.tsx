'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Copy, 
  Check, 
  Search, 
  Filter,
  Code2,
  Download,
  Share2,
  Maximize2,
  Settings,
  Play,
  RefreshCw,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen
} from 'lucide-react';

interface CodeFile {
  name: string;
  content: string;
  language: string;
  path: string;
}

interface CodeEditorProps {
  files: CodeFile[];
  language: 'ar' | 'en';
}

export function CodeEditor({ files, language }: CodeEditorProps) {
  const [selectedFile, setSelectedFile] = useState(files[0]?.name || '');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [fontSize, setFontSize] = useState(14);

  const handleCopy = async (content: string, fileName: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedFile(fileName);
      setTimeout(() => setCopiedFile(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'tsx':
      case 'ts':
        return '⚛️';
      case 'js':
      case 'jsx':
        return '🟨';
      case 'css':
        return '🎨';
      case 'json':
        return '📄';
      case 'md':
        return '📝';
      case 'html':
        return '🌐';
      case 'py':
        return '🐍';
      case 'java':
        return '☕';
      case 'php':
        return '🐘';
      default:
        return '📄';
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
      case 'md':
        return 'bg-gray-500';
      case 'html':
        return 'bg-orange-500';
      default:
        return 'bg-gray-400';
    }
  };

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedFileContent = files.find(f => f.name === selectedFile);

  const addLineNumbers = (content: string) => {
    return content.split('\n').map((line, index) => (
      `${String(index + 1).padStart(3, ' ')} | ${line}`
    )).join('\n');
  };

  return (
    <Card className={`${isFullscreen ? 'fixed inset-4 z-50' : 'h-[700px]'} flex flex-col shadow-xl border-2`}>
      <CardHeader className="pb-3 border-b">
        <div className={`flex items-center justify-between ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
          <CardTitle className={`flex items-center gap-3 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Code2 className="h-5 w-5 text-white" />
            </div>
            {language === 'ar' ? 'محرر الكود المتقدم' : 'Advanced Code Editor'}
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
              {files.length} {language === 'ar' ? 'ملف' : 'files'}
            </Badge>
          </CardTitle>
          
          <div className={`flex items-center gap-2 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <Button
                variant={showLineNumbers ? "default" : "ghost"}
                size="sm"
                onClick={() => setShowLineNumbers(!showLineNumbers)}
                className="h-8 px-2"
              >
                {showLineNumbers ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFontSize(prev => prev === 14 ? 16 : prev === 16 ? 12 : 14)}
                className="h-8 px-2 text-xs"
              >
                {fontSize}px
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            
            {selectedFileContent && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(selectedFileContent.content, selectedFile)}
              >
                {copiedFile === selectedFile ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="flex items-center gap-2 mt-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={language === 'ar' ? 'البحث في الملفات...' : 'Search in files...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex flex-col h-full">
          {/* File Tabs */}
          <div className="border-b border-border bg-muted/30">
            <ScrollArea className="w-full">
              <div className="flex gap-1 p-2 min-w-max">
                {filteredFiles.map((file) => (
                  <Button
                    key={file.name}
                    variant={selectedFile === file.name ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedFile(file.name)}
                    className={`flex items-center gap-2 whitespace-nowrap relative ${
                      language === 'ar' ? 'flex-row-reverse' : 'flex-row'
                    } ${selectedFile === file.name ? 'bg-background shadow-sm' : 'hover:bg-muted/50'}`}
                  >
                    <span className="text-sm">{getFileIcon(file.name)}</span>
                    <span className="text-xs font-medium">{file.name}</span>
                    <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${getLanguageColor(file.name)} ${
                      selectedFile === file.name ? 'opacity-100' : 'opacity-0'
                    }`} />
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Code Content */}
          <div className="flex-1 relative bg-slate-50 dark:bg-slate-900">
            {selectedFileContent ? (
              <>
                {/* File Info Bar */}
                <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b text-xs">
                  <div className={`flex items-center gap-2 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="font-medium">{selectedFileContent.path}</span>
                    <Badge variant="outline" className="text-xs">
                      {selectedFileContent.language}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>{selectedFileContent.content.split('\n').length} lines</span>
                    <span>•</span>
                    <span>{new Blob([selectedFileContent.content]).size} bytes</span>
                  </div>
                </div>
                
                <ScrollArea className="h-full">
                  <pre 
                    className="p-4 text-sm font-mono leading-relaxed h-full overflow-auto"
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    <code className="language-typescript">
                      {showLineNumbers 
                        ? addLineNumbers(selectedFileContent.content)
                        : selectedFileContent.content
                      }
                    </code>
                  </pre>
                </ScrollArea>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <div className="p-4 bg-muted/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      {language === 'ar' ? 'لم يتم العثور على ملفات' : 'No Files Found'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' ? 
                        'جرب تعديل مصطلح البحث أو قم بإنشاء مشروع جديد' : 
                        'Try adjusting your search term or generate a new project'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}