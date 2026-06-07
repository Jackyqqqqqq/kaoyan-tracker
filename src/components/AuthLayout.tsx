import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/ThemeContext";
import type { ThemeName } from "@/context/ThemeContext";
import { trpc } from "@/providers/trpc";
import {
  LayoutDashboard, FileText, Shield, LogOut,
  Sun, Moon, Waves, Flower2, Zap, Target,
  MessageSquare, Bell, BookOpen, Megaphone,
} from "lucide-react";
import { Link, useLocation, Outlet, Navigate } from "react-router";

const themes: { key: ThemeName; label: string; icon: React.ElementType }[] = [
  { key: "light", label: "日间", icon: Sun },
  { key: "dark", label: "夜间", icon: Moon },
  { key: "ocean", label: "深海", icon: Waves },
  { key: "sakura", label: "樱花", icon: Flower2 },
  { key: "cyber", label: "赛博", icon: Zap },
];

function SidebarNav() {
  const { user, isAdmin, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const utils = trpc.useUtils();
  const updateTheme = trpc.settings.updateTheme.useMutation({ onSuccess: () => utils.auth.me.invalidate() });

  if (!user) return null;

  const adminItems = [
    { icon: Shield, label: "概览", path: "/admin" },
    { icon: Megaphone, label: "公告", path: "/admin/announcements" },
    { icon: FileText, label: "周规划", path: "/admin/plans" },
    { icon: BookOpen, label: "科目管理", path: "/admin/subjects" },
    { icon: MessageSquare, label: "申请", path: "/admin/requests" },
    { icon: Bell, label: "提醒", path: "/admin/reminders" },
  ];
  const userItems = [
    { icon: LayoutDashboard, label: "我的目标", path: "/" },
    { icon: FileText, label: "周规划", path: "/weekly" },
    { icon: Megaphone, label: "公告", path: "/announcements" },
    { icon: MessageSquare, label: "申请修改", path: "/request" },
    { icon: Bell, label: "提醒管理员", path: "/remind" },
  ];
  const navItems = isAdmin ? adminItems : userItems;

  return (
    <aside className="fixed left-0 top-0 h-full w-[200px] bg-card/70 backdrop-blur-2xl border-r border-border/30 flex flex-col z-50">
      <div className="h-14 flex items-center gap-2.5 px-4 border-b border-border/20">
        <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
          <Target className="w-4 h-4 text-primary" />
        </div>
        <span className="font-bold text-sm">溯游</span>
      </div>
      <nav className="flex-1 py-3 px-2.5 space-y-0.5">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-2.5 border-t border-border/20">
        <div className="flex gap-1 mb-2">
          {themes.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => { setTheme(t.key); updateTheme.mutate({ theme: t.key }); }} title={t.label}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${theme === t.key ? "bg-primary/15 text-primary ring-1 ring-primary/30" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
                <Icon className="w-3.5 h-3.5" />
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-medium text-primary">
            {(user.name || user.username).charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate">{user.name || user.username}</div>
            <div className="text-[10px] text-muted-foreground">{isAdmin ? "管理员" : "用户"}</div>
          </div>
          <button onClick={logout} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="退出">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default function AuthLayout() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <main className="ml-[200px] min-h-screen p-6"><Outlet /></main>
    </div>
  );
}
