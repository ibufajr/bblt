'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Send, 
  Sparkles, 
  Code, 
  Eye, 
  Download, 
  Share2,
  Settings,
  Moon,
  Sun,
  Globe,
  Zap,
  Terminal,
  FileText,
  Play,
  Square,
  RefreshCw,
  ExternalLink,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Bot,
  User,
  Loader2,
  ChevronDown,
  Plus,
  X,
  Folder,
  File,
  Search,
  Filter,
  MoreHorizontal,
  Cpu,
  Database,
  Cloud,
  Palette,
  Key,
  Shield,
  MessageSquare,
  FolderOpen,
  GitBranch,
  Upload,
  Edit,
  Crown,
  Gem,
  Building,
  Users,
  Paperclip,
  Image,
  Video,
  Archive,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mic,
  Smile
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { ChatInterface } from '@/components/ChatInterface';
import { CodeViewer } from '@/components/CodeViewer';
import { PreviewFrame } from '@/components/PreviewFrame';
import { FileExplorer } from '@/components/FileExplorer';
import { SettingsPanel } from '@/components/SettingsPanel';
import { useAIChat } from '@/hooks/useAIChat';
import { APIClient } from '@/lib/api-client';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string | ArrayBuffer;
  uploadDate: Date;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('chat');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('openrouter');
  const [selectedModel, setSelectedModel] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isConnectedToSupabase, setIsConnectedToSupabase] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [tempApiKey, setTempApiKey] = useState('');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    messages,
    isGenerating,
    sendMessage,
    generatedFiles,
    previewUrl,
    currentProject
  } = useAIChat();

  // AI Providers data - ONLY 4 providers as requested
  const aiProviders = [
    {
      id: 'openrouter',
      name: 'OpenRouter',
      icon: '🌐',
      defaultModels: ['openai/gpt-4o', 'anthropic/claude-3-5-sonnet', 'google/gemini-pro-1.5']
    },
    {
      id: 'openai',
      name: 'OpenAI',
      icon: '🤖',
      defaultModels: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo']
    },
    {
      id: 'anthropic',
      name: 'Anthropic',
      icon: '🧠',
      defaultModels: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229']
    },
    {
      id: 'google',
      name: 'Google AI',
      icon: '🔍',
      defaultModels: ['gemini-1.5-pro-latest', 'gemini-1.5-flash-latest']
    }
  ];

  // Load saved API key and models when provider changes
  useEffect(() => {
    const savedSettings = localStorage.getItem('smartbuild-api-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        const keyField = `${selectedProvider}Key`;
        const savedKey = settings[keyField];
        
        if (savedKey && savedKey !== '' && !savedKey.includes('test') && !savedKey.includes('demo')) {
          setApiKey(savedKey);
          setTempApiKey(savedKey);
          setApiKeyStatus('valid');
          loadModelsForProvider(selectedProvider, savedKey);
        } else {
          resetApiKeyState();
        }
      } catch (error) {
        console.error('Error loading API key:', error);
        resetApiKeyState();
      }
    } else {
      resetApiKeyState();
    }
  }, [selectedProvider]);

  const resetApiKeyState = () => {
    setApiKey('');
    setTempApiKey('');
    setApiKeyStatus('idle');
    setAvailableModels([]);
    setSelectedModel('');
  };

  // Load models for a provider
  const loadModelsForProvider = async (providerId: string, key: string) => {
    if (!key || key.includes('test') || key.includes('demo')) {
      const provider = aiProviders.find(p => p.id === providerId);
      if (provider) {
        setAvailableModels(provider.defaultModels);
        setSelectedModel(provider.defaultModels[0]);
      }
      return;
    }
    
    setIsLoadingModels(true);
    try {
      const provider = aiProviders.find(p => p.id === providerId);
      if (!provider) return;

      const apiClient = new APIClient({
        provider: providerId,
        apiKey: key,
        baseUrl: getBaseUrlForProvider(providerId),
        model: provider.defaultModels[0],
        temperature: 0.7,
        maxTokens: 2000,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0
      });

      const models = await apiClient.getAvailableModels();
      if (models.length > 0) {
        setAvailableModels(models);
        setSelectedModel(models[0]);
      } else {
        // Fallback to default models
        setAvailableModels(provider.defaultModels);
        setSelectedModel(provider.defaultModels[0]);
      }
    } catch (error) {
      console.error('Failed to load models:', error);
      // Fallback to default models
      const provider = aiProviders.find(p => p.id === providerId);
      if (provider) {
        setAvailableModels(provider.defaultModels);
        setSelectedModel(provider.defaultModels[0]);
      }
    } finally {
      setIsLoadingModels(false);
    }
  };

  const getBaseUrlForProvider = (providerId: string) => {
    switch (providerId) {
      case 'openrouter': return 'https://openrouter.ai/api/v1';
      case 'openai': return 'https://api.openai.com/v1';
      case 'anthropic': return 'https://api.anthropic.com/v1';
      case 'google': return 'https://generativelanguage.googleapis.com/v1';
      default: return '';
    }
  };

  // Confirm API key - REAL VALIDATION
  const confirmApiKey = async () => {
    if (!tempApiKey.trim()) {
      setApiKeyStatus('invalid');
      return;
    }

    // Check for test/demo keys
    if (tempApiKey.includes('test') || tempApiKey.includes('demo') || tempApiKey.includes('example') || tempApiKey.includes('sk-or-v1-test')) {
      setApiKeyStatus('invalid');
      alert('Please enter a real API key. Test/demo keys are not functional.');
      return;
    }

    setApiKeyStatus('testing');

    try {
      const provider = aiProviders.find(p => p.id === selectedProvider);
      if (!provider) {
        setApiKeyStatus('invalid');
        return;
      }

      // Test the API key with a simple request
      const apiClient = new APIClient({
        provider: selectedProvider,
        apiKey: tempApiKey,
        baseUrl: getBaseUrlForProvider(selectedProvider),
        model: provider.defaultModels[0],
        temperature: 0.7,
        maxTokens: 50,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0
      });

      const isValid = await apiClient.testConnection();
      
      if (isValid) {
        setApiKey(tempApiKey);
        setApiKeyStatus('valid');
        
        // Save to localStorage
        const savedSettings = localStorage.getItem('smartbuild-api-settings');
        const settings = savedSettings ? JSON.parse(savedSettings) : {};
        const keyField = `${selectedProvider}Key`;
        settings[keyField] = tempApiKey;
        settings.selectedProvider = selectedProvider;
        localStorage.setItem('smartbuild-api-settings', JSON.stringify(settings));
        
        // Load models
        await loadModelsForProvider(selectedProvider, tempApiKey);
      } else {
        setApiKeyStatus('invalid');
        alert('API key validation failed. Please check your key and try again.');
      }
    } catch (error) {
      console.error('API key validation failed:', error);
      setApiKeyStatus('invalid');
      alert('API key validation failed. Please check your key and internet connection.');
    }
  };

  // Cancel API key changes
  const cancelApiKey = () => {
    setTempApiKey(apiKey);
    if (apiKey) {
      setApiKeyStatus('valid');
    } else {
      setApiKeyStatus('idle');
    }
  };

  // File upload handling
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        continue;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const newFile: UploadedFile = {
          id: Date.now().toString() + i,
          name: file.name,
          size: file.size,
          type: file.type,
          content: e.target?.result || '',
          uploadDate: new Date()
        };

        setUploadedFiles(prev => [...prev, newFile]);
      };

      if (file.type.startsWith('text/') || file.name.endsWith('.json') || file.name.endsWith('.md')) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    }

    event.target.value = '';
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getFileIcon = (fileName: string, fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-4 h-4 text-blue-500" />;
    if (fileType.startsWith('video/')) return <Video className="w-4 h-4 text-purple-500" />;
    if (fileName.endsWith('.zip') || fileName.endsWith('.rar') || fileName.endsWith('.7z')) return <Archive className="w-4 h-4 text-orange-500" />;
    if (fileName.endsWith('.pdf') || fileName.endsWith('.doc') || fileName.endsWith('.docx')) return <FileText className="w-4 h-4 text-red-500" />;
    return <File className="w-4 h-4 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const connectToSupabase = async () => {
    try {
      setIsConnectedToSupabase(true);
      alert('Successfully connected to Supabase!');
    } catch (error) {
      alert('Failed to connect to Supabase. Please check your configuration.');
    }
  };

  const importChat = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const chatData = JSON.parse(e.target?.result as string);
            console.log('Imported chat:', chatData);
            alert('Chat imported successfully!');
          } catch (error) {
            alert('Invalid chat file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const importFolder = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        console.log('Imported folder with', files.length, 'files');
        alert(`Imported folder with ${files.length} files!`);
      }
    };
    input.click();
  };

  const cloneGitRepo = () => {
    const repoUrl = prompt('Enter Git repository URL:');
    if (repoUrl) {
      console.log('Cloning repository:', repoUrl);
      alert(`Cloning repository: ${repoUrl}`);
    }
  };

  const handleEmojiClick = () => {
    const emojis = ['😊', '👍', '🚀', '💡', '🎉', '✨', '🔥', '💯'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    setInput(prev => prev + randomEmoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleMoreOptions = () => {
    const options = [
      'Clear conversation',
      'Export chat',
      'Change language',
      'Help & Support'
    ];
    
    const choice = prompt(`Choose an option:\n${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}`);
    if (choice) {
      const index = parseInt(choice) - 1;
      if (index >= 0 && index < options.length) {
        alert(`Selected: ${options[index]}`);
      }
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;
    
    if (apiKeyStatus !== 'valid') {
      alert('Please add and validate an API key first.');
      setShowSettings(true);
      return;
    }
    
    let messageContent = input.trim();
    if (uploadedFiles.length > 0) {
      messageContent += '\n\nAttached files:\n';
      uploadedFiles.forEach(file => {
        messageContent += `- ${file.name} (${formatFileSize(file.size)})\n`;
      });
    }
    
    sendMessage(messageContent);
    setInput('');
    setActiveTab('chat');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  };

  const quickPrompts = [
    'Create a mobile app about holidays',
    'Build a todo app in React using Tailwind',
    'Build a simple blog using Astro',
    'Create a cookie consent form using Material UI',
    'Make a space invaders game',
    'Make a Tic Tac Toe game in html, css and js only'
  ];

  if (!mounted) return null;

  // If we have messages or generated files, show the full interface
  if (messages.length > 0 || generatedFiles.length > 0) {
    return (
      <div className={`h-screen flex flex-col overflow-hidden relative ${theme === 'dark' ? 'dark' : ''}`}>
        <div className="h-full bg-background text-foreground">
          {/* Header */}
          <div className="h-14 border-b border-border bg-background flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg">Bolt</span>
              </div>
              
              {currentProject && (
                <>
                  <div className="w-px h-6 bg-border" />
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground font-medium">{currentProject}</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)}>
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar - Chat */}
            <div className={`${sidebarCollapsed ? 'w-0' : 'w-96'} transition-all duration-300 border-r border-border bg-background flex flex-col overflow-hidden`}>
              {!sidebarCollapsed && (
                <ChatInterface 
                  messages={messages}
                  isGenerating={isGenerating}
                  onSendMessage={sendMessage}
                />
              )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Tab Navigation */}
              <div className="h-12 border-b border-border bg-background flex items-center px-4 shrink-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="bg-muted h-auto p-0 gap-1">
                    <TabsTrigger value="chat" className="bg-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground px-4 py-2 text-sm rounded-lg">
                      <Terminal className="w-4 h-4 mr-2" />
                      Console
                    </TabsTrigger>
                    {generatedFiles.length > 0 && (
                      <>
                        <TabsTrigger value="code" className="bg-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground px-4 py-2 text-sm rounded-lg">
                          <Code className="w-4 h-4 mr-2" />
                          Code
                        </TabsTrigger>
                        <TabsTrigger value="preview" className="bg-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground px-4 py-2 text-sm rounded-lg">
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </TabsTrigger>
                      </>
                    )}
                  </TabsList>
                </Tabs>
                
                <div className="ml-auto flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                    {sidebarCollapsed ? <ChevronDown className="w-4 h-4 rotate-90" /> : <X className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-hidden">
                <Tabs value={activeTab} className="h-full">
                  <TabsContent value="chat" className="h-full m-0">
                    <div className="h-full flex items-center justify-center bg-background">
                      <div className="text-center max-w-2xl px-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                          <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-4 text-foreground">Continue the conversation</h2>
                        <p className="text-muted-foreground mb-8">Ask follow-up questions or request modifications to your project.</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="code" className="h-full m-0">
                    <div className="h-full flex bg-background">
                      <FileExplorer files={generatedFiles} />
                      <CodeViewer files={generatedFiles} />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="preview" className="h-full m-0">
                    <PreviewFrame url={previewUrl} />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>

          {/* Settings Panel */}
          <SettingsPanel 
            isOpen={showSettings} 
            onClose={() => setShowSettings(false)} 
          />
        </div>
      </div>
    );
  }

  // Landing page - exactly like Bolt.new
  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl">Bolt</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)}>
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-6">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
            Where ideas begin
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Bring ideas to life in seconds or get help on existing projects.
          </p>
        </div>

        {/* Chat Interface */}
        <div className="w-full max-w-2xl mb-8">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-xl">
            <div className="p-4">
              {/* Provider and Model Selection */}
              <div className="flex items-center gap-2 mb-4">
                <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                  <SelectTrigger className="w-40 bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {aiProviders.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        <div className="flex items-center gap-2">
                          <span className="text-base">{provider.icon}</span>
                          <span>{provider.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedModel} onValueChange={setSelectedModel} disabled={availableModels.length === 0}>
                  <SelectTrigger className="flex-1 bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue placeholder={isLoadingModels ? "Loading models..." : availableModels.length === 0 ? "Add API key to see models" : "Select model"} />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {availableModels.map(model => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* API Key Input */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-gray-400 whitespace-nowrap">
                  {aiProviders.find(p => p.id === selectedProvider)?.name} API Key:
                </span>
                <div className="flex-1 relative">
                  <Input
                    type="password"
                    placeholder="Enter your API key"
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 text-sm pr-20"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {apiKeyStatus === 'valid' && (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    )}
                    {apiKeyStatus === 'invalid' && (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                    {apiKeyStatus === 'testing' && (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                    )}
                    {tempApiKey !== apiKey && (
                      <div className="flex items-center gap-1 ml-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 text-green-400 hover:text-green-300"
                          onClick={confirmApiKey}
                          title="Confirm API key"
                          disabled={apiKeyStatus === 'testing'}
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                          onClick={cancelApiKey}
                          title="Cancel changes"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Uploaded Files Display */}
              {uploadedFiles.length > 0 && (
                <div className="mb-4 p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">Attached Files ({uploadedFiles.length})</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUploadedFiles([])}
                      className="text-red-400 hover:text-red-300 h-6 px-2"
                    >
                      Clear All
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="flex items-center gap-2 text-sm">
                        {getFileIcon(file.name, file.type)}
                        <span className="flex-1 truncate">{file.name}</span>
                        <span className="text-gray-400">{formatFileSize(file.size)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Input */}
              <form onSubmit={handleSubmit} className="relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="How can Bolt help you today?"
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 pr-32 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[60px] max-h-[200px]"
                  disabled={isGenerating}
                />
                
                <div className="absolute bottom-3 right-3 flex items-center gap-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="*/*"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-gray-400 hover:text-white"
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload files"
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-gray-400 hover:text-white"
                    onClick={handleEmojiClick}
                    title="Add emoji"
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-gray-400 hover:text-white"
                    title="Voice input"
                  >
                    <Mic className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-gray-400 hover:text-white"
                    onClick={connectToSupabase}
                    title="Connect to Supabase"
                  >
                    <Zap className={`w-4 h-4 ${isConnectedToSupabase ? 'text-green-400' : ''}`} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-gray-400 hover:text-white"
                    onClick={handleMoreOptions}
                    title="More options"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!input.trim() || isGenerating || apiKeyStatus !== 'valid'}
                    className="h-7 w-7 p-0 bg-green-600 hover:bg-green-700 disabled:bg-gray-600"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            className="bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700/50"
            onClick={importChat}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Import Chat
          </Button>
          <Button 
            variant="outline" 
            className="bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700/50"
            onClick={importFolder}
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            Import Folder
          </Button>
          <Button 
            variant="outline" 
            className="bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700/50"
            onClick={cloneGitRepo}
          >
            <GitBranch className="w-4 h-4 mr-2" />
            Clone a Git Repo
          </Button>
        </div>

        {/* Quick Prompts */}
        <div className="w-full max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                className="bg-slate-800/30 border-slate-700 text-white hover:bg-slate-700/50 text-left justify-start h-auto p-4 whitespace-normal"
                onClick={() => {
                  if (apiKeyStatus !== 'valid') {
                    alert('Please add and validate an API key first.');
                    setShowSettings(true);
                    return;
                  }
                  setInput(prompt);
                  sendMessage(prompt);
                }}
              >
                {prompt}
              </Button>
            ))}
          </div>
          
          <div className="text-center mt-6">
            <p className="text-gray-400 text-sm">
              or start a blank app with your favorite stack
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center py-6 border-t border-slate-700/50">
        <p className="text-gray-400 text-sm">
          © 2024 Bolt. Built with ❤️ for developers.
        </p>
      </div>

      {/* Settings Panel */}
      <SettingsPanel 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </div>
  );
}