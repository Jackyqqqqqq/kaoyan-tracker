import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { FileText, Send, CheckCircle, ChevronLeft, Trash2 } from "lucide-react";
import { Link } from "react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function AdminPlans() {
  const [weekNum, setWeekNum] = useState(1);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [scope, setScope] = useState<"all" | "personal">("all");
  const [targetUserId, setTargetUserId] = useState<number | undefined>();
  const [preview, setPreview] = useState(false);
  const [ok, setOk] = useState(false);

  const utils = trpc.useUtils();
  const { data: plans } = trpc.plan.listAll.useQuery();
  const { data: allUsers } = trpc.request.listUsers.useQuery();
  const createPlan = trpc.plan.create.useMutation({
    onSuccess: () => { utils.plan.listAll.invalidate(); setOk(true); setTimeout(() => { setOk(false); setTitle(""); setContent(""); }, 2000); },
  });
  const deletePlan = trpc.plan.remove.useMutation({ onSuccess: () => utils.plan.listAll.invalidate() });

  const onPublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    createPlan.mutate({ weekNumber: weekNum, title: title.trim(), content: content.trim(), scope, targetUserId: scope === "personal" ? targetUserId : undefined });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/admin" className="p-2 rounded-lg hover:bg-muted transition-colors"><ChevronLeft className="w-5 h-5" /></Link>
        <FileText className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-bold">周规划管理</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass-card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Send className="w-4 h-4 text-primary" />发布规划</h3>
          {ok ? (
            <div className="text-center py-8"><CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" /><p className="font-medium">发布成功</p></div>
          ) : (
            <form onSubmit={onPublish} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-muted-foreground mb-1 block">周次</label><input type="number" value={weekNum} onChange={e => setWeekNum(parseInt(e.target.value) || 1)} min={1} className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm" required /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">标题</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm" placeholder="第X周学习规划" required /></div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">范围</label>
                <div className="flex gap-2 mb-2">
                  <button type="button" onClick={() => setScope("all")} className={`px-3 py-1.5 rounded-lg text-xs ${scope === "all" ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted/50 text-muted-foreground"}`}>所有人</button>
                  <button type="button" onClick={() => setScope("personal")} className={`px-3 py-1.5 rounded-lg text-xs ${scope === "personal" ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted/50 text-muted-foreground"}`}>指定用户</button>
                </div>
                {scope === "personal" && (
                  <select value={targetUserId || ""} onChange={e => setTargetUserId(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm" required>
                    <option value="">选择用户</option>
                    {allUsers?.filter(u => u.role === "user").map(u => <option key={u.id} value={u.id}>{u.name || u.username}</option>)}
                  </select>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1"><label className="text-xs text-muted-foreground">内容 (Markdown)</label><button type="button" onClick={() => setPreview(!preview)} className="text-xs text-primary hover:underline">{preview ? "编辑" : "预览"}</button></div>
                {preview ? (
                  <div className="min-h-[180px] p-3 rounded-lg bg-muted border border-border text-sm markdown-body"><ReactMarkdown remarkPlugins={[remarkGfm]}>{content || "*预览*"}</ReactMarkdown></div>
                ) : (
                  <textarea value={content} onChange={e => setContent(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm resize-none font-mono" rows={10} placeholder={`## 数学\n- 线代强化\n\n## 408\n- 计组新课`} required />
                )}
              </div>
              <button type="submit" disabled={createPlan.isPending} className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors disabled:opacity-50">{createPlan.isPending ? "发布中..." : "发布规划"}</button>
            </form>
          )}
        </div>

        <div className="glass-card p-5">
          <h3 className="font-semibold mb-4">已发布规划</h3>
          <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
            {plans?.map(p => (
              <div key={p.id} className="p-3 rounded-lg bg-muted/30 flex items-center justify-between group">
                <div>
                  <div className="flex items-center gap-2"><span className="text-sm font-medium">{p.title}</span>{p.scope === "personal" ? <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">@{p.targetUser?.name}</span> : <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">全局</span>}</div>
                  <div className="text-xs text-muted-foreground">第{p.weekNumber}周 · {new Date(p.createdAt).toLocaleDateString("zh-CN")}</div>
                </div>
                <button onClick={() => { if (confirm("删除？")) deletePlan.mutate({ id: p.id }); }} className="p-1.5 rounded text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
            {(!plans || plans.length === 0) && <p className="text-sm text-muted-foreground text-center py-6">暂无规划</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
