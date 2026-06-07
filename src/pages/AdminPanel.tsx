import { useState, useEffect } from "react";
import { trpc } from "@/providers/trpc";
import {
  Shield, UsersRound, AlertCircle, Bell, FileCheck,
  Megaphone, BookOpen, FileText, MessageSquare,
  Target,
} from "lucide-react";
import { Link } from "react-router";

export default function AdminPanel() {
  const utils = trpc.useUtils();
  const { data: stats } = trpc.request.stats.useQuery();
  const { data: allUsers } = trpc.request.listUsers.useQuery();

  // User target settings
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const { data: userSettingsData } = trpc.settings.getForUser.useQuery(
    { userId: selectedUserId || 1 },
    { enabled: !!selectedUserId }
  );
  const [examDate, setExamDate] = useState("2026-12-21");
  const [totalTarget, setTotalTarget] = useState("360");
  const [schoolName, setSchoolName] = useState("");
  const [majorCode, setMajorCode] = useState("");
  const [desc, setDesc] = useState("");

  useEffect(() => {
    if (userSettingsData) {
      setExamDate(userSettingsData.examDate);
      setTotalTarget(String(userSettingsData.totalTarget));
      setSchoolName(userSettingsData.schoolName);
      setMajorCode(userSettingsData.majorCode);
      setDesc(userSettingsData.description);
    }
  }, [userSettingsData]);

  const updateSettings = trpc.settings.updateForUser.useMutation({
    onSuccess: () => utils.settings.getForUser.invalidate(),
  });

  const onSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    updateSettings.mutate({
      userId: selectedUserId,
      examDate: examDate || undefined,
      totalTarget: parseInt(totalTarget) || undefined,
      schoolName: schoolName || undefined,
      majorCode: majorCode || undefined,
      description: desc || undefined,
    });
  };

  const cards = [
    { icon: Megaphone, label: "公告管理", desc: "发布公告", path: "/admin/announcements" },
    { icon: FileText, label: "周规划", desc: "发布规划", path: "/admin/plans" },
    { icon: BookOpen, label: "科目管理", desc: "管理用户科目分数", path: "/admin/subjects" },
    { icon: MessageSquare, label: "修改申请", desc: "处理用户申请", path: "/admin/requests", count: stats?.pendingRequests },
    { icon: Bell, label: "用户提醒", desc: "查看提醒", path: "/admin/reminders", count: stats?.newReminders },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Shield className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-bold">管理员面板</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: UsersRound, label: "用户总数", value: stats?.totalUsers || 0, color: "text-primary" },
          { icon: AlertCircle, label: "待处理申请", value: stats?.pendingRequests || 0, color: "text-yellow-500" },
          { icon: Bell, label: "新提醒", value: stats?.newReminders || 0, color: "text-blue-500" },
          { icon: FileCheck, label: "已发布规划", value: stats?.totalPlans || 0, color: "text-green-500" },
        ].map((s, i) => (
          <div key={i} className="glass-card p-4 text-center">
            <s.icon className={`w-5 h-5 mx-auto mb-1.5 ${s.color}`} />
            <div className="text-2xl font-black">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Access */}
      <div className="glass-card p-5">
        <h3 className="font-semibold mb-4">快捷管理</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {cards.map(card => (
            <Link key={card.path} to={card.path} className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors group">
              <card.icon className="w-5 h-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium">{card.label}</span>
                  {card.count !== undefined && card.count > 0 && <span className="text-[10px] px-1 py-0.5 rounded-full bg-primary/15 text-primary">{card.count}</span>}
                </div>
                <span className="text-xs text-muted-foreground">{card.desc}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Per-User Target Settings */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">用户目标设置</h3>
          <span className="text-xs text-muted-foreground">为每个用户设置不同的目标</span>
        </div>

        {/* Select user */}
        <div className="flex gap-2 flex-wrap mb-4">
          {allUsers?.map(u => (
            <button key={u.id} onClick={() => setSelectedUserId(u.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedUserId === u.id ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted/50 text-muted-foreground border border-transparent hover:bg-muted"}`}>
              {u.name || u.username} {u.role === "admin" ? "(管理员)" : "(用户)"}
            </button>
          ))}
        </div>

        {selectedUserId && (
          <form onSubmit={onSaveSettings} className="space-y-3 animate-fade-in">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground mb-1 block">学校名称</label><input type="text" value={schoolName} onChange={e => setSchoolName(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm" placeholder="如：北京邮电大学" /></div>
              <div><label className="text-xs text-muted-foreground mb-1 block">专业代码</label><input type="text" value={majorCode} onChange={e => setMajorCode(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm" placeholder="如：11408" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="text-xs text-muted-foreground mb-1 block">考试日期</label><input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm" /></div>
              <div><label className="text-xs text-muted-foreground mb-1 block">目标总分</label><input type="number" value={totalTarget} onChange={e => setTotalTarget(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm" /></div>
              <div><label className="text-xs text-muted-foreground mb-1 block">描述</label><input type="text" value={desc} onChange={e => setDesc(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm" placeholder="如：计算机考研" /></div>
            </div>
            <button type="submit" disabled={updateSettings.isPending}
              className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors disabled:opacity-50">
              {updateSettings.isPending ? "保存中..." : "保存此用户的目标设置"}
            </button>
          </form>
        )}
      </div>

      {/* Users List */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4"><UsersRound className="w-4 h-4 text-primary" /><h3 className="font-semibold">用户列表</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border/30">
              <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs">ID</th>
              <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs">用户名</th>
              <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs">昵称</th>
              <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs">角色</th>
              <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs">注册时间</th>
            </tr></thead>
            <tbody>{allUsers?.map(u => (
              <tr key={u.id} className="border-b border-border/10 hover:bg-muted/30 transition-colors">
                <td className="py-2 px-2 text-xs">{u.id}</td>
                <td className="py-2 px-2 font-medium">{u.username}</td>
                <td className="py-2 px-2 text-muted-foreground">{u.name || "-"}</td>
                <td className="py-2 px-2"><span className={`text-xs px-1.5 py-0.5 rounded-full ${u.role === "admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{u.role === "admin" ? "管理员" : "用户"}</span></td>
                <td className="py-2 px-2 text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString("zh-CN")}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
