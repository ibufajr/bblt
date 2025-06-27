'use client';

import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Folder, 
  FolderOpen, 
  File, 
  ChevronRight, 
  ChevronDown,
  Search,
  Filter,
  MoreHorizontal
} from 'lucide-react';

interface CodeFile {
  name: string;
  content: string;
  language: string;
  path: string;
}

interface FileExplorerProps {
  files: CodeFile[];
}

interface TreeNode {
  name: string;
  type: 'file' | 'folder';
  children?: TreeNode[];
  file?: CodeFile;
}

export function FileExplorer({ files }: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));
  const [searchTerm, setSearchTerm] = useState('');

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
            file: index === parts.length - 1 ? file : undefined
          };
          current.children.push(node);
        }
        current = node;
      });
    });
    
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
      default:
        return '📄';
    }
  };

  const renderTree = (node: TreeNode, path: string = '', depth: number = 0) => {
    const currentPath = path ? `${path}/${node.name}` : node.name;
    const isExpanded = expandedFolders.has(currentPath);
    
    if (node.name === 'root') {
      return node.children?.map(child => renderTree(child, '', 0));
    }
    
    return (
      <div key={currentPath}>
        <div 
          className={`flex items-center gap-2 py-1 px-2 hover:bg-muted cursor-pointer text-sm ${
            depth > 0 ? `ml-${depth * 4}` : ''
          }`}
          onClick={() => {
            if (node.type === 'folder') {
              toggleFolder(currentPath);
            }
          }}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {node.type === 'folder' ? (
            <>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
              {isExpanded ? (
                <FolderOpen className="w-4 h-4 text-primary" />
              ) : (
                <Folder className="w-4 h-4 text-primary" />
              )}
              <span className="text-foreground">{node.name}</span>
            </>
          ) : (
            <>
              <div className="w-4" />
              <span className="text-base">{getFileIcon(node.name)}</span>
              <span className="text-foreground">{node.name}</span>
            </>
          )}
        </div>
        
        {node.type === 'folder' && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderTree(child, currentPath, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const tree = buildTree(files);

  if (files.length === 0) {
    return (
      <div className="w-64 border-r border-border bg-card flex items-center justify-center">
        <div className="text-center text-muted-foreground p-4">
          <Folder className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">لا توجد ملفات</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 border-r border-border bg-card flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">المستكشف</span>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="بحث في الملفات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-input border-border text-foreground placeholder-muted-foreground text-sm h-8 pl-8"
          />
        </div>
      </div>

      {/* File Tree */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {renderTree(tree)}
        </div>
      </ScrollArea>
    </div>
  );
}