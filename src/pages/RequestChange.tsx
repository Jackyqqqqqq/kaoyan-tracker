import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { MessageSquare, ChevronLeft, Send, CheckCircle, Clock, XCircle } from "lucide-react";
import { Link } from "react-router";

export default function RequestChange() {
  const [subjectName, setSubjectName] = useState("");
  const [currentTarget, setCurrentTarget] = useState("");
  const [requestedTarget, setRequestedTarget] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const utils = trpc.useUtils();
  const { data: subjects } = trpc.subject.list.useQuery();
  const { data: myRequests } = trpc.request.listMyRequests.useQuery();
  const createReq = trpc.request.createRequest.useMutation({
    onSuccess: () => { utils.request.listMyRequests.invalidate(); setSubmitted(true); setTimeout(() => { setSubmitted(false); setSubjectName(""); setCurrentTarget(""); setRequestedTarget(""); setReason(""); }, 2000); },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName || !requestedTarget) return;
    createReq.mutate({ subjectName, currentTarget: parseInt(currentTarget) || 0, requestedTarget: parseInt(requestedTarget), reason: reason || undefined });
  };

  const statusIcon = (s: string) => s === "approved" ? <CheckCircle className="w-4 h-4 text-green-500" /> : s === "rejected" ? <XCircle className="w-4 h-4 text-red-500" /> : <Clock className="w-4 h-4 text-yellow-500" />;

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/" className="p-2 rounded-lg hover:bg-muted transition-colors"><ChevronLeft className="w-5 h-5" /></Link>
        <MessageSquare className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-bold">申请修改目标</h1>
      </div>

      <div className="glass-card p-5">
        <h3 className="font-semibold mb-4">提交修改申请</h3>
        {submitted ? (
          <div className="text-center py-8"><CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" /><p className="font-medium">申请已提交</p><p className="text-xs text-muted-foreground mt-1">管理员会尽快处理</p></div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">科目</label>
              <select value={subjectName} onChange={e => { setSubjectName(e.target.value); const s = subjects?.find(x => x.name === e.target.value); if (s) setCurrentTarget(String(s.target)); }}
                className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:border-primary/50" required>
                <option value="">选择科目</option>
                {subjects?.map(s => <option key={s.id} value={s.name}>{s.name} (当前: {s.target})</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground mb-1 block">当前目标</label><input type="number" value={currentTarget} readOnly className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm text-muted-foreground" /></div>
              <div><label className="text-xs text-muted-foreground mb-1 block">期望目标 *</label><input type="number" value={requestedTarget} onChange={e => setRequestedTarget(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:border-primary/50" placeholder="目标分数" required min={0} /></div>
            </div>
            <div><label className="text-xs text-muted-foreground mb-1 block">原因（可选）</label><textarea value={reason} onChange={e => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:border-primary/50 resize-none" rows={3} placeholder="说明原因..." /></div>
            <button type="submit" disabled={createReq.isPending}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors disabled:opacity-50">
              <Send className="w-3.5 h-3.5" />{createReq.isPending ? "提交中..." : "提交申请"}
            </button>
          </form>
        )}
      </div>

      {myRequests && myRequests.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="font-semibold mb-3">申请记录</h3>
          <div className="space-y-2">
            {myRequests.map(req => (
              <div key={req.id} className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/30">
                {statusIcon(req.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><span className="text-sm font-medium">{req.subjectName}</span><span className="text-xs text-muted-foreground">{req.currentTarget} → {req.requestedTarget}</span></div>
                  {req.reason && <p className="text-xs text-muted-foreground truncate mt-0.5">{req.reason}</p>}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${req.status === "approved" ? "bg-green-500/10 text-green-500" : req.status === "rejected" ? "bg-red-500/10 text-red-500" : "bg-yellow-500/10 text-yellow-500"}`}>
                  {req.status === "approved" ? "已通过" : req.status === "rejected" ? "已拒绝" : "待处理"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
