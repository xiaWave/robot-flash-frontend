import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Keyboard, Search, HelpCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

interface Shortcut {
  key: string;
  description: string;
  category: string;
  global?: boolean;
}

const shortcuts: Shortcut[] = [
  // 全局快捷键
  {
    key: 'Ctrl + K',
    description: '全局搜索',
    category: '全局',
    global: true,
  },
  {
    key: 'Ctrl + /',
    description: '显示快捷键帮助',
    category: '全局',
    global: true,
  },
  // 任务管理页面
  {
    key: 'ESC',
    description: '返回任务列表',
    category: '任务管理',
  },
  {
    key: 'Ctrl + R',
    description: '刷新任务数据',
    category: '任务管理',
  },
];

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <HelpCircle className="w-4 h-4 mr-2" />
          快捷键
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            键盘快捷键
          </DialogTitle>
          <DialogDescription>
            使用以下快捷键可以提高您的工作效率
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-lg font-semibold">{category}</h3>
                {category === '全局' && (
                  <Badge variant="secondary" className="text-xs">
                    全局有效
                  </Badge>
                )}
              </div>
              
              <div className="grid gap-3">
                {categoryShortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10">
                        <Keyboard className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">{shortcut.description}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {shortcut.key.split(' + ').map((part, i) => (
                        <React.Fragment key={i}>
                          {i > 0 && <span className="text-xs text-muted-foreground mx-1">+</span>}
                          <kbd className="px-2 py-1 text-xs font-mono bg-background border border-border rounded shadow-sm">
                            {part.trim()}
                          </kbd>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Search className="w-4 h-4" />
              <span>提示：按 Ctrl + / 可以随时打开此帮助窗口</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// 浮动快捷键提示按钮（用于显示在页面角落）
export function FloatingShortcutHelp() {
  const [isVisible, setIsVisible] = useState(false);

  // 显示3秒后自动隐藏
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 10000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-in slide-in-from-bottom duration-300">
      <Card className="shadow-lg border-2 bg-background/95 backdrop-blur-sm">
        <CardContent className="p-3 pr-2">
          <div className="flex items-center gap-2 text-sm">
            <Keyboard className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              按 <kbd className="px-1 py-0.5 text-xs font-mono bg-muted border rounded">Ctrl + /</kbd> 查看快捷键
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 ml-1"
              onClick={() => setIsVisible(false)}
            >
              ×
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}