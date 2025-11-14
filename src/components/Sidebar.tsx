import { Link, useLocation } from "react-router-dom";
import { Cpu, Zap, Layers, Package, History, ListTodo, LogOut } from "lucide-react";

import { User } from "../types";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { cn } from "./ui/utils";

interface SidebarProps {
  user: User;
  onLogout: () => void;
}

const menuItems = [
  { id: "flash", label: "刷机操作", icon: Zap },
  { id: "tasks", label: "任务管理", icon: ListTodo },
  { id: "resources", label: "资源类型", icon: Layers },
  { id: "versions", label: "版本管理", icon: Package },
  { id: "records", label: "刷机记录", icon: History },
];

export function Sidebar({ user, onLogout }: SidebarProps) {
  const location = useLocation();
  const currentPath = location.pathname.split("/")[1] ?? "flash";

  return (
    <div className="w-56 bg-white border-r border-slate-200 flex flex-col shadow-lg">
      <div className="flex flex-col h-full">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                刷机管理
              </h1>
              <p className="text-xs text-slate-500">Flash System</p>
            </div>
          </div>
        </div>

        <Separator />

        <nav className="flex-1 px-2 py-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.id;
            return (
              <Link
                key={item.id}
                to={`/${item.id}`}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm",
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 transition-transform",
                    isActive && "scale-110"
                  )}
                />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <Separator />

        <div className="px-3 py-3">
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
            <Avatar className="h-8 w-8 border-2 border-blue-200">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user.username}</p>
              <p className="text-xs text-slate-600">{user.role}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="p-3">
          <Button
            variant="ghost"
            onClick={onLogout}
            className="w-full justify-start text-slate-700 hover:text-red-600 hover:bg-red-50 text-sm h-9"
          >
            <LogOut className="w-4 h-4 mr-2" />
            退出登录
          </Button>
        </div>
      </div>
    </div>
  );
}
