import { useEffect, useMemo, useState } from 'react';
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { Sparkles, Clock } from 'lucide-react';

import { LoginPage } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';
import { FlashDevicePage } from './pages/FlashDevicePage';
import { ResourceTypePage } from './pages/ResourceTypePage';
import { VersionManagementPage } from './pages/VersionManagementPage';
import { FlashRecordsPage } from './pages/FlashRecordsPage';
import { TaskManagementPage } from './pages/TaskManagementPage';

import { wsService } from './services/websocket';
import { useAuthStore } from './store/authStore';
import type { User } from './types';
import { GlobalProviders } from './components/common/GlobalErrorHandler';


const ROUTE_LABEL_MAP: Record<string, string> = {
  flash: '刷机操作',
  tasks: '任务管理',
  resources: '资源类型',
  versions: '版本管理',
  records: '刷机记录',
};

export default function App() {
  const { currentUser, setUser, checkAuth } = useAuthStore();
  const navigate = useNavigate();

  // 初始化时检查认证状态
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (currentUser) {
      wsService.connect();
    }
    return () => {
      wsService.disconnect();
    };
  }, [currentUser]);

  const handleLogin = (user: User) => {
    setUser(user);
    navigate('/flash', { replace: true });
  };

  const handleLogout = () => {
    setUser(null);
    navigate('/login', { replace: true });
  };

  return (
    <GlobalProviders>
      <Routes>
        {!currentUser ? (
          <>
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <>
            <Route path="/login" element={<Navigate to="/flash" replace />} />
            <Route
              element={<AppLayout authenticatedUser={currentUser} onLogout={handleLogout} />}
            >
              <Route path="/flash" element={<FlashDevicePage />} />
              <Route path="/tasks" element={<TaskManagementPage />} />
              <Route path="/resources" element={<ResourceTypePage />} />
              <Route path="/versions" element={<VersionManagementPage />} />
              <Route path="/records" element={<FlashRecordsPage />} />
              <Route path="/" element={<Navigate to="/flash" replace />} />
            </Route>
            <Route path="*" element={<Navigate to="/flash" replace />} />
          </>
        )}
      </Routes>

    </GlobalProviders>
  );
}

interface AppLayoutProps {
  authenticatedUser: User;
  onLogout: () => void;
}

function AppLayout({ authenticatedUser, onLogout }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Sidebar user={authenticatedUser} onLogout={onLogout} />
      <div className="flex-1 flex flex-col backdrop-blur-sm">
        <AppTopBar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto max-w-full px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function AppTopBar() {
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const breadcrumbSegments = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean);
    if (segments.length === 0) {
      return ['flash'];
    }
    return segments;
  }, [location.pathname]);

  const breadcrumbLabel = ROUTE_LABEL_MAP[breadcrumbSegments[breadcrumbSegments.length - 1]];

  // 动态更新时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="border-b border-slate-200 bg-white/70 backdrop-blur flex items-center">
      <div className="container mx-auto max-w-full px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span className="font-medium text-slate-900">{breadcrumbLabel ?? '控制台'}</span>
          <span className="text-slate-400">/</span>
          <span className="capitalize text-slate-500">
            {breadcrumbSegments.join(' / ')}
          </span>
        </div>
        <div className="flex items-center gap-4">

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-4 h-4 text-indigo-500 animate-pulse" />
            <span className="font-mono font-medium">{currentTime.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </header>
  );
}


