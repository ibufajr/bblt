'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  ExternalLink, 
  RefreshCw, 
  Monitor, 
  Smartphone, 
  Tablet,
  Maximize2,
  Settings,
  Share2,
  Download,
  Play,
  Pause,
  RotateCcw,
  Wifi,
  WifiOff,
  Zap
} from 'lucide-react';

interface LivePreviewProps {
  url: string | null;
  language: 'ar' | 'en';
}

export function LivePreview({ url, language }: LivePreviewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [viewportSize, setViewportSize] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setRefreshKey(prev => prev + 1);
    setTimeout(() => setIsLoading(false), 1500);
  };

  const getViewportClass = () => {
    switch (viewportSize) {
      case 'mobile':
        return 'w-[375px] h-[667px]';
      case 'tablet':
        return 'w-[768px] h-[1024px]';
      default:
        return 'w-full h-full';
    }
  };

  const getViewportIcon = (size: string) => {
    switch (size) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getViewportLabel = (size: string) => {
    switch (size) {
      case 'mobile':
        return '375px';
      case 'tablet':
        return '768px';
      default:
        return language === 'ar' ? 'كامل' : 'Full';
    }
  };

  return (
    <Card className={`${isFullscreen ? 'fixed inset-4 z-50' : 'h-[700px]'} flex flex-col shadow-xl border-2`}>
      <CardHeader className="pb-3 border-b">
        <div className={`flex items-center justify-between ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
          <CardTitle className={`flex items-center gap-3 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
              <Eye className="h-5 w-5 text-white" />
            </div>
            {language === 'ar' ? 'المعاينة المباشرة' : 'Live Preview'}
            <div className="flex items-center gap-2">
              {url && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                  {language === 'ar' ? 'نشط' : 'Live'}
                </Badge>
              )}
              <Badge variant="outline" className={`${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                {isOnline ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
                {isOnline ? (language === 'ar' ? 'متصل' : 'Online') : (language === 'ar' ? 'غير متصل' : 'Offline')}
              </Badge>
            </div>
          </CardTitle>
          
          <div className={`flex items-center gap-2 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Viewport Size Controls */}
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              {['desktop', 'tablet', 'mobile'].map((size) => (
                <Button
                  key={size}
                  variant={viewportSize === size ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewportSize(size as any)}
                  className="h-8 px-3 gap-1"
                  title={getViewportLabel(size)}
                >
                  {getViewportIcon(size)}
                  <span className="text-xs hidden sm:inline">{getViewportLabel(size)}</span>
                </Button>
              ))}
            </div>
            
            {url && (
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="h-8"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="h-8"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => window.open(url, '_blank')}
                  className="h-8"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* URL Bar */}
        {url && (
          <div className="flex items-center gap-2 mt-3 p-2 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="flex-1 bg-background rounded px-3 py-1 text-sm font-mono">
              {url}
            </div>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Share2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
          {url ? (
            <div className="w-full h-full flex items-center justify-center p-4">
              <div className={`${getViewportClass()} max-w-full max-h-full border-2 border-border rounded-xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden relative`}>
                {/* Device Frame for Mobile/Tablet */}
                {viewportSize !== 'desktop' && (
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-300 rounded-full"></div>
                )}
                
                {isLoading && (
                  <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center z-10">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                      <span className="text-sm font-medium">
                        {language === 'ar' ? 'جاري التحديث...' : 'Refreshing...'}
                      </span>
                    </div>
                  </div>
                )}
                
                <iframe
                  key={refreshKey}
                  src={url}
                  className="w-full h-full border-0"
                  title="Live Preview"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  onLoad={() => setIsLoading(false)}
                />
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6 p-8">
              <div className="relative">
                <div className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto">
                  <Eye className="h-12 w-12 text-muted-foreground" />
                </div>
                <div className="absolute -top-2 -right-2 p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full">
                  <Zap className="h-4 w-4 text-white" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-xl mb-3">
                  {language === 'ar' ? 'لا توجد معاينة متاحة' : 'No Preview Available'}
                </h3>
                <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
                  {language === 'ar' ? 
                    'قم بإنشاء مشروع أولاً لرؤية المعاينة المباشرة. ستظهر هنا النتيجة النهائية لمشروعك.' : 
                    'Generate a project first to see the live preview. The final result of your project will appear here.'
                  }
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  { icon: Monitor, label: language === 'ar' ? 'سطح المكتب' : 'Desktop' },
                  { icon: Tablet, label: language === 'ar' ? 'تابلت' : 'Tablet' },
                  { icon: Smartphone, label: language === 'ar' ? 'موبايل' : 'Mobile' }
                ].map((device, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1 gap-1">
                    <device.icon className="h-3 w-3" />
                    {device.label}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}