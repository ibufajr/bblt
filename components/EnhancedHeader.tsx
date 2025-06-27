'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Settings, 
  Share2, 
  Download, 
  Sun, 
  Moon, 
  Globe,
  Sparkles,
  Activity,
  Wifi,
  WifiOff,
  Bell,
  User,
  ChevronDown,
  Plus,
  Search,
  Command
} from 'lucide-react';
import { useTheme } from 'next-themes';

interface EnhancedHeaderProps {
  currentProject: string | null;
  onSettingsClick: () => void;
  onNewProject: () => void;
}

export function EnhancedHeader({ currentProject, onSettingsClick, onNewProject }: EnhancedHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [isOnline, setIsOnline] = useState(true);
  const [notifications, setNotifications] = useState(3);
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  if (!mounted) return null;

  return (
    <header className="h-14 border-b border-border bg-gradient-to-r from-background via-muted/30 to-background backdrop-blur-xl flex items-center justify-between px-4 shrink-0 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 animate-pulse"></div>
      
      {/* Left Section */}
      <div className="flex items-center gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 bg-gradient-to-br from-primary via-secondary to-primary rounded-lg flex items-center justify-center shadow-lg">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse"></div>
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                SmartBuild
              </span>
              <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                Pro
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              {time.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
        
        {currentProject && (
          <>
            <div className="w-px h-6 bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-foreground font-medium">{currentProject}</span>
              <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-600 border-green-500/30">
                <Activity className="w-3 h-3 mr-1" />
                نشط
              </Badge>
            </div>
          </>
        )}
      </div>

      {/* Center Section - Quick Actions */}
      <div className="hidden md:flex items-center gap-2 relative z-10">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onNewProject}
          className="text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          مشروع جديد
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
        >
          <Search className="w-4 h-4 mr-2" />
          بحث
        </Button>
        
        <div className="flex items-center gap-1 bg-muted rounded-lg px-2 py-1">
          <Command className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Ctrl+K</span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 relative z-10">
        {/* Status Indicators */}
        <div className="hidden sm:flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={`text-xs ${isOnline ? 'border-green-500/30 text-green-600 bg-green-500/10' : 'border-red-500/30 text-red-600 bg-red-500/10'}`}
          >
            {isOnline ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
            {isOnline ? 'متصل' : 'غير متصل'}
          </Badge>
          
          <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/10">
            <Sparkles className="w-3 h-3 mr-1" />
            AI Ready
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 relative"
          >
            <Bell className="w-4 h-4" />
            {notifications > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                {notifications}
              </div>
            )}
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
          >
            <Share2 className="w-4 h-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
          >
            <Download className="w-4 h-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onSettingsClick}
            className="text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
          >
            <Settings className="w-4 h-4" />
          </Button>

          {/* User Menu */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 gap-1"
          >
            <div className="w-6 h-6 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <User className="w-3 h-3 text-primary-foreground" />
            </div>
            <ChevronDown className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </header>
  );
}