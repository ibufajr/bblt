'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  X, 
  Settings, 
  Key, 
  Globe, 
  Zap, 
  Shield, 
  Server,
  Database,
  Cloud,
  Code,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  Info,
  Cpu,
  Brain,
  Sparkles,
  Download,
  Upload,
  RefreshCw,
  Save,
  TestTube,
  Activity,
  Lock,
  Unlock,
  Copy,
  ExternalLink,
  FileText,
  Monitor,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  Star,
  Crown,
  Gem,
  Rocket,
  Building,
  Users,
  Palette,
  Volume2,
  Image,
  Video,
  Archive,
  File,
  Folder,
  Trash2,
  Plus,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { APIClient } from '@/lib/api-client';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AIProvider {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'premium' | 'free' | 'enterprise' | 'open-source';
  baseUrl: string;
  models: string[];
  requiresKey: boolean;
  features: string[];
  pricing: string;
  status: 'active' | 'inactive' | 'testing' | 'connected' | 'error';
  badge?: string;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('ai-providers');
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [testingApi, setTestingApi] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [mounted, setMounted] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<Record<string, 'idle' | 'testing' | 'connected' | 'error'>>({});
  
  const [apiSettings, setApiSettings] = useState({
    selectedProvider: 'openrouter',
    openaiKey: '',
    anthropicKey: '',
    googleKey: '',
    openrouterKey: '',
    selectedModel: 'openai/gpt-4o',
    temperature: 0.7,
    maxTokens: 2000,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    systemPrompt: 'You are a helpful AI assistant specialized in software development. You provide accurate, helpful responses and assist in creating complete software projects.',
    enableStreaming: true,
    enableMemory: true,
    maxHistory: 50
  });

  const [themeSettings, setThemeSettings] = useState({
    mode: theme || 'dark',
    primaryColor: 'blue',
    accentColor: 'purple',
    borderRadius: 'medium',
    fontSize: 'medium',
    animations: true,
    glassEffect: true,
    particleEffects: true
  });

  const [serverSettings, setServerSettings] = useState({
    port: 3000,
    host: '0.0.0.0',
    ssl: false,
    cors: true,
    rateLimit: 100,
    cacheEnabled: true,
    logLevel: 'info',
    autoBackup: true,
    backupInterval: 24
  });

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = () => {
    try {
      const savedApiSettings = localStorage.getItem('smartbuild-api-settings');
      const savedThemeSettings = localStorage.getItem('smartbuild-theme-settings');
      const savedServerSettings = localStorage.getItem('smartbuild-server-settings');

      if (savedApiSettings) {
        setApiSettings({ ...apiSettings, ...JSON.parse(savedApiSettings) });
      }
      if (savedThemeSettings) {
        const parsed = JSON.parse(savedThemeSettings);
        setThemeSettings({ ...themeSettings, ...parsed });
      }
      if (savedServerSettings) {
        setServerSettings({ ...serverSettings, ...JSON.parse(savedServerSettings) });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const aiProviders: AIProvider[] = [
    {
      id: 'openrouter',
      name: 'OpenRouter',
      description: 'Access 100+ AI models from different providers',
      icon: '🌐',
      category: 'premium',
      baseUrl: 'https://openrouter.ai/api/v1',
      models: ['openai/gpt-4o', 'anthropic/claude-3-5-sonnet', 'google/gemini-pro-1.5'],
      requiresKey: true,
      features: ['100+ Models', 'Unified API', 'Competitive Pricing', 'Real-time Stats'],
      pricing: 'Variable per model',
      status: connectionStatus.openrouter === 'connected' ? 'connected' : connectionStatus.openrouter === 'error' ? 'error' : 'inactive',
      badge: 'Recommended'
    },
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'GPT-4, GPT-3.5, DALL-E, Whisper',
      icon: '🤖',
      category: 'premium',
      baseUrl: 'https://api.openai.com/v1',
      models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
      requiresKey: true,
      features: ['Latest GPT-4', 'Image Generation', 'Voice Processing', 'Advanced Tools'],
      pricing: '$0.03/1K tokens',
      status: connectionStatus.openai === 'connected' ? 'connected' : connectionStatus.openai === 'error' ? 'error' : 'inactive'
    },
    {
      id: 'anthropic',
      name: 'Anthropic',
      description: 'Claude 3 Opus, Sonnet, Haiku',
      icon: '🧠',
      category: 'premium',
      baseUrl: 'https://api.anthropic.com/v1',
      models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229'],
      requiresKey: true,
      features: ['Long Context', 'Advanced Analysis', 'High Safety', 'Excellent Accuracy'],
      pricing: '$0.015/1K tokens',
      status: connectionStatus.anthropic === 'connected' ? 'connected' : connectionStatus.anthropic === 'error' ? 'error' : 'inactive'
    },
    {
      id: 'google',
      name: 'Google AI',
      description: 'Gemini Pro, PaLM 2, Bard',
      icon: '🔍',
      category: 'free',
      baseUrl: 'https://generativelanguage.googleapis.com/v1',
      models: ['gemini-1.5-pro-latest', 'gemini-1.5-flash-latest'],
      requiresKey: true,
      features: ['Computer Vision', 'Image Analysis', 'Advanced Search', 'Google Integration'],
      pricing: 'Free tier available',
      status: connectionStatus.google === 'connected' ? 'connected' : connectionStatus.google === 'error' ? 'error' : 'inactive',
      badge: 'Free Tier'
    }
  ];

  const colorThemes = [
    { id: 'blue', name: 'Blue', colors: ['#3B82F6', '#1E40AF'] },
    { id: 'purple', name: 'Purple', colors: ['#8B5CF6', '#7C3AED'] },
    { id: 'green', name: 'Green', colors: ['#10B981', '#059669'] },
    { id: 'red', name: 'Red', colors: ['#EF4444', '#DC2626'] },
    { id: 'orange', name: 'Orange', colors: ['#F97316', '#EA580C'] },
    { id: 'pink', name: 'Pink', colors: ['#EC4899', '#DB2777'] }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'premium': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'free': return <Gem className="w-4 h-4 text-green-500" />;
      case 'enterprise': return <Building className="w-4 h-4 text-blue-500" />;
      case 'open-source': return <Users className="w-4 h-4 text-purple-500" />;
      default: return <Sparkles className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'premium': return 'Premium';
      case 'free': return 'Free';
      case 'enterprise': return 'Enterprise';
      case 'open-source': return 'Open Source';
      default: return 'Other';
    }
  };

  const testApiConnection = async (providerId: string) => {
    setConnectionStatus(prev => ({ ...prev, [providerId]: 'testing' }));
    
    try {
      const provider = aiProviders.find(p => p.id === providerId);
      if (!provider) throw new Error('Provider not found');

      let apiKey = '';
      let baseUrl = provider.baseUrl;

      switch (providerId) {
        case 'openrouter':
          apiKey = apiSettings.openrouterKey;
          break;
        case 'openai':
          apiKey = apiSettings.openaiKey;
          break;
        case 'anthropic':
          apiKey = apiSettings.anthropicKey;
          break;
        case 'google':
          apiKey = apiSettings.googleKey;
          break;
      }

      if (provider.requiresKey && !apiKey) {
        throw new Error('API key required');
      }

      // Check for test/demo keys
      if (apiKey && (apiKey.includes('test') || apiKey.includes('demo') || apiKey.includes('example'))) {
        throw new Error('Please enter a real API key. Test keys are not functional.');
      }

      const apiClient = new APIClient({
        provider: providerId,
        apiKey: apiKey,
        baseUrl: baseUrl,
        model: provider.models[0],
        temperature: 0.7,
        maxTokens: 100,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0
      });

      const isConnected = await apiClient.testConnection();
      
      if (isConnected) {
        setConnectionStatus(prev => ({ ...prev, [providerId]: 'connected' }));
      } else {
        throw new Error('Connection failed');
      }
      
    } catch (error) {
      console.error(`Test failed for ${providerId}:`, error);
      setConnectionStatus(prev => ({ ...prev, [providerId]: 'error' }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'testing':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'error':
        return 'Error';
      case 'testing':
        return 'Testing...';
      default:
        return 'Not tested';
    }
  };

  const saveSettings = async () => {
    setSaveStatus('saving');
    
    try {
      localStorage.setItem('smartbuild-api-settings', JSON.stringify(apiSettings));
      localStorage.setItem('smartbuild-theme-settings', JSON.stringify(themeSettings));
      localStorage.setItem('smartbuild-server-settings', JSON.stringify(serverSettings));
      
      // Apply theme immediately
      setTheme(themeSettings.mode);
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
      
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  if (!isOpen || !mounted) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="border-b border-border p-6 flex items-center justify-between bg-background">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Settings</h2>
              <p className="text-sm text-muted-foreground">Configure your AI development environment</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex">
            {/* Sidebar */}
            <div className="w-64 border-r border-border bg-background">
              <TabsList className="flex flex-col h-full w-full bg-transparent p-2 gap-1">
                <TabsTrigger 
                  value="ai-providers" 
                  className="w-full justify-start gap-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Brain className="w-4 h-4" />
                  AI Providers
                </TabsTrigger>
                <TabsTrigger 
                  value="theme" 
                  className="w-full justify-start gap-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Palette className="w-4 h-4" />
                  Theme & Appearance
                </TabsTrigger>
                <TabsTrigger 
                  value="advanced" 
                  className="w-full justify-start gap-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Cpu className="w-4 h-4" />
                  Advanced
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-6">
                  {/* AI Providers */}
                  <TabsContent value="ai-providers" className="mt-0 space-y-6">
                    <div className="space-y-6">
                      {/* Provider Cards */}
                      <div className="grid gap-4">
                        {aiProviders.map((provider) => (
                          <Card key={provider.id} className="border border-border">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">{provider.icon}</span>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-semibold text-foreground">{provider.name}</h3>
                                      {getCategoryIcon(provider.category)}
                                      <Badge variant="outline" className="text-xs">
                                        {getCategoryLabel(provider.category)}
                                      </Badge>
                                      {provider.badge && (
                                        <Badge variant="secondary" className="text-xs">
                                          {provider.badge}
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{provider.description}</p>
                                    <p className="text-xs text-muted-foreground">Pricing: {provider.pricing}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(connectionStatus[provider.id] || 'idle')}
                                  <span className="text-xs text-muted-foreground">
                                    {getStatusText(connectionStatus[provider.id] || 'idle')}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap gap-2 mb-4">
                                {provider.features.map((feature, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                              
                              {provider.requiresKey && (
                                <div className="space-y-2">
                                  <Label className="text-foreground">API Key</Label>
                                  <div className="relative">
                                    <Input
                                      type={showApiKeys ? 'text' : 'password'}
                                      placeholder={`Enter ${provider.name} API key`}
                                      className="pr-20"
                                      value={apiSettings[`${provider.id}Key` as keyof typeof apiSettings] as string || ''}
                                      onChange={(e) => setApiSettings(prev => ({
                                        ...prev,
                                        [`${provider.id}Key`]: e.target.value
                                      }))}
                                    />
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={() => setShowApiKeys(!showApiKeys)}
                                      >
                                        {showApiKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={() => testApiConnection(provider.id)}
                                        disabled={connectionStatus[provider.id] === 'testing'}
                                      >
                                        {connectionStatus[provider.id] === 'testing' ? (
                                          <RefreshCw className="w-4 h-4 animate-spin" />
                                        ) : (
                                          <TestTube className="w-4 h-4" />
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {/* Model Parameters */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Model Parameters</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Temperature: {apiSettings.temperature}</Label>
                              <Slider
                                value={[apiSettings.temperature]}
                                onValueChange={(value) => setApiSettings(prev => ({ ...prev, temperature: value[0] }))}
                                max={2}
                                min={0}
                                step={0.1}
                                className="w-full"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Max Tokens: {apiSettings.maxTokens}</Label>
                              <Slider
                                value={[apiSettings.maxTokens]}
                                onValueChange={(value) => setApiSettings(prev => ({ ...prev, maxTokens: value[0] }))}
                                max={4000}
                                min={100}
                                step={100}
                                className="w-full"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>System Prompt</Label>
                            <Textarea
                              value={apiSettings.systemPrompt}
                              onChange={(e) => setApiSettings(prev => ({ ...prev, systemPrompt: e.target.value }))}
                              className="min-h-[100px]"
                              placeholder="Enter system prompt..."
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Theme Settings */}
                  <TabsContent value="theme" className="mt-0 space-y-6">
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Appearance Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label>Theme Mode</Label>
                            <div className="flex items-center gap-2">
                              <Button
                                variant={themeSettings.mode === 'light' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => {
                                  setThemeSettings(prev => ({ ...prev, mode: 'light' }));
                                  setTheme('light');
                                }}
                              >
                                <Sun className="w-4 h-4 mr-2" />
                                Light
                              </Button>
                              <Button
                                variant={themeSettings.mode === 'dark' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => {
                                  setThemeSettings(prev => ({ ...prev, mode: 'dark' }));
                                  setTheme('dark');
                                }}
                              >
                                <Moon className="w-4 h-4 mr-2" />
                                Dark
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Color Scheme</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-3 gap-3">
                            {colorThemes.map((color) => (
                              <div
                                key={color.id}
                                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                  themeSettings.primaryColor === color.id 
                                    ? 'border-primary shadow-lg' 
                                    : 'border-border hover:border-muted-foreground'
                                }`}
                                onClick={() => setThemeSettings(prev => ({ ...prev, primaryColor: color.id }))}
                              >
                                <div className="flex gap-1 mb-2">
                                  <div 
                                    className="w-4 h-4 rounded-full" 
                                    style={{ backgroundColor: color.colors[0] }}
                                  />
                                  <div 
                                    className="w-4 h-4 rounded-full" 
                                    style={{ backgroundColor: color.colors[1] }}
                                  />
                                </div>
                                <span className="text-sm text-foreground">{color.name}</span>
                                {themeSettings.primaryColor === color.id && (
                                  <Check className="w-4 h-4 text-primary mt-1" />
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Visual Effects</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label>Glass Effect</Label>
                            <Switch
                              checked={themeSettings.glassEffect}
                              onCheckedChange={(checked) => setThemeSettings(prev => ({ ...prev, glassEffect: checked }))}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>Particle Effects</Label>
                            <Switch
                              checked={themeSettings.particleEffects}
                              onCheckedChange={(checked) => setThemeSettings(prev => ({ ...prev, particleEffects: checked }))}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>Animations</Label>
                            <Switch
                              checked={themeSettings.animations}
                              onCheckedChange={(checked) => setThemeSettings(prev => ({ ...prev, animations: checked }))}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Advanced Settings */}
                  <TabsContent value="advanced" className="mt-0 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Cpu className="w-5 h-5" />
                          Advanced Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>Enable Streaming</Label>
                          <Switch
                            checked={apiSettings.enableStreaming}
                            onCheckedChange={(checked) => setApiSettings(prev => ({ ...prev, enableStreaming: checked }))}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label>Enable Memory</Label>
                          <Switch
                            checked={apiSettings.enableMemory}
                            onCheckedChange={(checked) => setApiSettings(prev => ({ ...prev, enableMemory: checked }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Max History: {apiSettings.maxHistory}</Label>
                          <Slider
                            value={[apiSettings.maxHistory]}
                            onValueChange={(value) => setApiSettings(prev => ({ ...prev, maxHistory: value[0] }))}
                            max={200}
                            min={10}
                            step={10}
                            className="w-full"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
              </ScrollArea>
            </div>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 flex items-center justify-between bg-background">
          <div className="text-sm text-muted-foreground">
            Last saved: {new Date().toLocaleString()}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              onClick={saveSettings} 
              disabled={saveStatus === 'saving'}
              className="bg-primary hover:bg-primary/90"
            >
              {saveStatus === 'saving' ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : saveStatus === 'saved' ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saveStatus === 'saving' ? 'Saving...' : 
               saveStatus === 'saved' ? 'Saved' : 
               'Save Settings'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}