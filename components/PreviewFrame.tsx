'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, 
  ExternalLink, 
  Monitor, 
  Smartphone, 
  Tablet,
  Maximize2,
  Settings,
  Wifi,
  WifiOff,
  Play,
  Square,
  RotateCcw
} from 'lucide-react';

interface PreviewFrameProps {
  url: string | null;
}

export function PreviewFrame({ url }: PreviewFrameProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [viewportSize, setViewportSize] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
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

  if (!url) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background text-muted-foreground">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Monitor className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">لا توجد معاينة متاحة</h3>
          <p className="text-sm">ابدأ محادثة مع الذكاء الاصطناعي لإنشاء مشروع</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Preview Controls */}
      <div className="border-b border-border bg-card px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`text-xs ${isOnline ? 'border-green-500 text-green-600' : 'border-red-500 text-red-600'}`}>
              {isOnline ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
              {isOnline ? 'متصل' : 'غير متصل'}
            </Badge>
            <Badge variant="outline" className="text-xs border-primary text-primary">
              <div className="w-2 h-2 bg-primary rounded-full mr-1 animate-pulse"></div>
              نشط
            </Badge>
          </div>
          
          <div className="flex items-center gap-1">
            {/* Viewport Controls */}
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              {[
                { size: 'desktop', icon: Monitor, label: 'سطح المكتب' },
                { size: 'tablet', icon: Tablet, label: 'تابلت' },
                { size: 'mobile', icon: Smartphone, label: 'موبايل' }
              ].map(({ size, icon: Icon, label }) => (
                <Button
                  key={size}
                  variant={viewportSize === size ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewportSize(size as any)}
                  className={`h-7 px-2 ${
                    viewportSize === size 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title={label}
                >
                  <Icon className="w-4 h-4" />
                </Button>
              ))}
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isLoading}
              className="text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => window.open(url, '_blank')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* URL Bar */}
        <div className="flex items-center gap-2 mt-2 p-2 bg-muted rounded-lg">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="flex-1 bg-input rounded px-3 py-1 text-sm font-mono text-foreground">
            {url}
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 flex items-center justify-center p-4 bg-background">
        <div className={`${getViewportClass()} max-w-full max-h-full border border-border rounded-xl bg-card overflow-hidden shadow-2xl relative`}>
          {/* Device Frame */}
          {viewportSize !== 'desktop' && (
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-muted rounded-full z-10"></div>
          )}
          
          {isLoading && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-20">
              <div className="flex items-center gap-3 text-foreground">
                <RefreshCw className="w-6 h-6 animate-spin" />
                <span className="text-sm">جاري التحديث...</span>
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
    </div>
  );
}