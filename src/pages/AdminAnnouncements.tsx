import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Megaphone, Send, CheckCircle, Trash2, ChevronLeft } from "lucide-react";
import { Link } from "react-router";

export default function AdminAnnouncements() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [scope, setScope] = useState<"all" | "personal">("all");
  const [targetUserId, setTargetUserId] = useState<number | undefined>();
  const [ok, setOk] = useState(false);

  const utils = trpc.useUtils();
  const { data: announcements } = trpc.announcement.listAll.useQuery();
  const { data: allUsers } = trpc.request.listUsers.useQuery();
  const createAnnc = trpc.announcement.create.useMutation({
    onSuccess: () => { utils.announcement.listAll.invalidate(); setOk(true); setTimeout(() => { setOk(false); setTitle(""); setContent(""); }, 2000); },
  });
  const deleteAnnc = trpc.announcement.remove.useMutation({
    onSuccess: () => utils.announcement.listAll.invalidate(),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    createAnnc.mutate({ title: title.trim(), content: content.trim(), scope, targetUserId: scope === "personal" ? targetUserId : undefined });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/admin" className="p-2 rounded-lg hover:bg-muted transition-colors"><ChevronLeft className="w-5 h-5" /></Link>
        <Megaphone className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-bold">公告管理</h1>
      </div>

      {/* Create */}
      <div className="glass-card p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Send className="w-4 h-4 text-primary" />发布公告</h3>
        {ok ? (
          <div className="text-center py-8"><CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" /><p className="font-medium">发布成功</p></div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3">
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm" placeholder="公告标题" required />
            <textarea value={content} onChange={e => setContent(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm resize-none" rows={5} placeholder="公告内容..." required />
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <button type="button" onClick={() => setScope("all")} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${scope === "all" ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted/50 text-muted-foreground"}`}>所有人</button>
                <button type="button" onClick={() => setScope("personal")} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${scope === "personal" ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted/50 text-muted-foreground"}`}>指定用户</button>
              </div>
              {scope === "personal" && (
                <select value={targetUserId || ""} onChange={e => setTargetUserId(Number(e.target.value))} className="px-3 py-1.5 rounded-lg bg-muted border border-border text-xs" required>
                  <option value="">选择用户</option>
                  {allUsers?.filter(u => u.role === "user").map(u => <option key={u.id} value={u.id}>{u.name || u.username}</option>)}
                </select>
              )}
            </div>
            <button type="submit" disabled={createAnnc.isPending} className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors disabled:opacity-50">
              {createAnnc.isPending ? "发布中..." : "发布公告"}
            </button>
          </form>
        )}
      </div>

      {/* List */}
      <div className="glass-card p-5">
        <h3 className="font-semibold mb-4">已发布公告</h3>
        <div className="space-y-2">
          {announcements?.map(a => (
            <div key={a.id} className="p-3 rounded-lg bg-muted/30 flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{a.title}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${a.scope === "all" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{a.scope === "all" ? "全局" : `@${a.targetUser?.name || "个人"}`}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{a.content}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(a.createdAt).toLocaleDateString("zh-CN")}</p>
              </div>
              <button onClick={() => { if (confirm("删除此公告？")) deleteAnnc.mutate({ id: a.id }); }} className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {(!announcements || announcements.length === 0) && <p className="text-sm text-muted-foreground text-center py-6">暂无公告</p>}
        </div>
      </div>
    </div>
  );
}
