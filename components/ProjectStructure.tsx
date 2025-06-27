'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Folder, 
  FolderOpen, 
  ChevronRight, 
  ChevronDown,
  File,
  Search,
  Filter,
  Download,
  Copy,
  Eye,
  Code,
  Image,
  Settings,
  Database,
  Layers,
  Package,
  GitBranch,
  Zap
} from 'lucide-react';

interface CodeFile {
  name: string;
  content: string;
  language: string;
  path: string;
}

interface ProjectStructureProps {
  files: CodeFile[];
  language: 'ar' | 'en';
}

interface TreeNode {
  name: string;
  type: 'file' | 'folder';
  children?: TreeNode[];
  file?: CodeFile;
  size?: number;
}

export function ProjectStructure({ files, language }: ProjectStructureProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root', 'src', 'components', 'app']));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const buildTree = (files: CodeFile[]): TreeNode => {
    const root: TreeNode = { name: 'root', type: 'folder', children: [] };
    
    files.forEach(file => {
      const parts = file.path.split('/').filter(Boolean);
      let current = root;
      
      parts.forEach((part, index) => {
        if (!current.children) current.children = [];
        
        let node = current.children.find(child => child.name === part);
        if (!node) {
          node = {
            name: part,
            type: index === parts.length - 1 ? 'file' : 'folder',
            children: index === parts.length - 1 ? undefined : [],
            file: index === parts.length - 1 ? file : undefined,
            size: index === parts.length - 1 ? new Blob([file.content]).size : undefined
          };
          current.children.push(node);
        }
        current = node;
      });
    });
    
    // Sort folders first, then files
    const sortNodes = (nodes: TreeNode[]) => {
      return nodes.sort((a, b) => {
        if (a.type === 'folder' && b.type === 'file') return -1;
        if (a.type === 'file' && b.type === 'folder') return 1;
        return a.name.localeCompare(b.name);
      });
    };

    const sortTree = (node: TreeNode) => {
      if (node.children) {
        node.children = sortNodes(node.children);
        node.children.forEach(sortTree);
      }
    };

    sortTree(root);
    return root;
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'tsx':
      case 'ts':
        return { icon: '⚛️', color: 'text-blue-600' };
      case 'js':
      case 'jsx':
        return { icon: '🟨', color: 'text-yellow-600' };
      case 'css':
      case 'scss':
        return { icon: '🎨', color: 'text-purple-600' };
      case 'json':
        return { icon: '📄', color: 'text-green-600' };
      case 'md':
        return { icon: '📝', color: 'text-gray-600' };
      case 'html':
        return { icon: '🌐', color: 'text-orange-600' };
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return { icon: '🖼️', color: 'text-pink-600' };
      case 'env':
        return { icon: '⚙️', color: 'text-gray-600' };
      case 'lock':
        return { icon: '🔒', color: 'text-red-600' };
      default:
        return { icon: '📄', color: 'text-gray-500' };
    }
  };

  const getFolderIcon = (folderName: string, isExpanded: boolean) => {
    const specialFolders: { [key: string]: string } = {
      'src': '📁',
      'components': '🧩',
      'pages': '📄',
      'app': '⚡',
      'public': '🌐',
      'assets': '🎨',
      'styles': '💄',
      'utils': '🔧',
      'hooks': '🪝',
      'lib': '📚',
      'api': '🔌',
      'types': '📝',
      'config': '⚙️',
      'tests': '🧪',
      'docs': '📖'
    };

    return specialFolders[folderName] || (isExpanded ? '📂' : '📁');
  };

  const getFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileTypeStats = () => {
    const stats: { [key: string]: number } = {};
    files.forEach(file => {
      const ext = file.path.split('.').pop()?.toLowerCase() || 'other';
      stats[ext] = (stats[ext] || 0) + 1;
    });
    return Object.entries(stats).sort((a, b) => b[1] - a[1]);
  };

  const filterTree = (node: TreeNode, searchTerm: string): TreeNode | null => {
    if (!searchTerm) return node;
    
    const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (node.file && node.file.content.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (node.type === 'file') {
      return matchesSearch ? node : null;
    }
    
    const filteredChildren = node.children?.map(child => filterTree(child, searchTerm)).filter(Boolean) || [];
    
    if (matchesSearch || filteredChildren.length > 0) {
      return {
        ...node,
        children: filteredChildren as TreeNode[]
      };
    }
    
    return null;
  };

  const renderTree = (node: TreeNode, path: string = '', depth: number = 0) => {
    const currentPath = path ? `${path}/${node.name}` : node.name;
    const isExpanded = expandedFolders.has(currentPath);
    const fileIconData = node.type === 'file' ? getFileIcon(node.name) : null;
    
    return (
      <div key={currentPath} className={`${depth > 0 ? 'ml-4 border-l border-border/50 pl-4' : ''}`}>
        <div 
          className={`flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-all duration-200 ${
            selectedFile === currentPath ? 'bg-primary/10 border border-primary/20' : ''
          } ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}
          onClick={() => {
            if (node.type === 'folder') {
              toggleFolder(currentPath);
            } else {
              setSelectedFile(currentPath);
            }
          }}
        >
          {node.type === 'folder' ? (
            <>
              <div className="flex items-center gap-2">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-lg">{getFolderIcon(node.name, isExpanded)}</span>
              </div>
              <span className="font-medium text-sm">{node.name}</span>
              {node.children && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  {node.children.length}
                </Badge>
              )}
            </>
          ) : (
            <>
              <div className="w-4 flex justify-center">
                <File className="h-3 w-3 text-muted-foreground" />
              </div>
              <span className="text-base">{fileIconData?.icon}</span>
              <span className={`text-sm font-medium ${fileIconData?.color}`}>{node.name}</span>
              <div className="ml-auto flex items-center gap-2">
                {node.size && (
                  <Badge variant="outline" className="text-xs">
                    {getFileSize(node.size)}
                  </Badge>
                )}
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                  <Eye className="h-3 w-3" />
                </Button>
              </div>
            </>
          )}
        </div>
        
        {node.type === 'folder' && isExpanded && node.children && (
          <div className="mt-1 space-y-1">
            {node.children.map(child => renderTree(child, currentPath, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const tree = buildTree(files);
  const filteredTree = filterTree(tree, searchTerm);
  const totalSize = files.reduce((acc, file) => acc + new Blob([file.content]).size, 0);
  const fileTypeStats = getFileTypeStats();

  return (
    <Card className="h-[700px] flex flex-col shadow-xl border-2">
      <CardHeader className="pb-4 border-b">
        <div className={`flex items-center justify-between ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
          <CardTitle className={`flex items-center gap-3 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
              <Layers className="h-5 w-5 text-white" />
            </div>
            {language === 'ar' ? 'هيكل المشروع' : 'Project Structure'}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
              {files.length} {language === 'ar' ? 'ملف' : 'files'}
            </Badge>
            <Badge variant="outline">
              {getFileSize(totalSize)}
            </Badge>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="space-y-3 mt-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={language === 'ar' ? 'البحث في الملفات...' : 'Search files...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* File Type Stats */}
          <div className="flex flex-wrap gap-2">
            {fileTypeStats.slice(0, 5).map(([type, count]) => (
              <Badge key={type} variant="secondary" className="text-xs">
                {type}: {count}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <div className="h-full flex">
          {/* File Tree */}
          <div className="flex-1 border-r">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-1">
                {filteredTree?.children && filteredTree.children.length > 0 ? (
                  filteredTree.children.map(child => renderTree(child))
                ) : (
                  <div className="text-center py-8">
                    <div className="p-4 bg-muted/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-2">
                      {language === 'ar' ? 'لم يتم العثور على ملفات' : 'No Files Found'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' ? 
                        'جرب تعديل مصطلح البحث' : 
                        'Try adjusting your search term'
                      }
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* File Details Panel */}
          {selectedFile && (
            <div className="w-80 bg-muted/20">
              <div className="p-4 border-b">
                <h4 className="font-semibold text-sm mb-2">
                  {language === 'ar' ? 'تفاصيل الملف' : 'File Details'}
                </h4>
              </div>
              <div className="p-4 space-y-4">
                <div className="text-center">
                  <div className="p-3 bg-primary/10 rounded-lg w-12 h-12 flex items-center justify-center mx-auto mb-2">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-medium text-sm">{selectedFile.split('/').pop()}</p>
                  <p className="text-xs text-muted-foreground">{selectedFile}</p>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {language === 'ar' ? 'النوع:' : 'Type:'}
                    </span>
                    <span>{selectedFile.split('.').pop()?.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {language === 'ar' ? 'الحجم:' : 'Size:'}
                    </span>
                    <span>2.4 KB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {language === 'ar' ? 'الأسطر:' : 'Lines:'}
                    </span>
                    <span>84</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-3 w-3 mr-1" />
                    {language === 'ar' ? 'عرض' : 'View'}
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Copy className="h-3 w-3 mr-1" />
                    {language === 'ar' ? 'نسخ' : 'Copy'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}