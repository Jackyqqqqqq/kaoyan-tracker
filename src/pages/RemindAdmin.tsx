import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Bell, ChevronLeft, Send, CheckCircle, MessageSquare } from "lucide-react";
import { Link } from "react-router";

export default function RemindAdmin() {
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const utils = trpc.useUtils();
  const { data: myReminders } = trpc.request.listMyReminders.useQuery();
  const createRem = trpc.request.createReminder.useMutation({
    onSuccess: () => { utils.request.listMyReminders.invalidate(); setSubmitted(true); setTimeout(() => { setSubmitted(false); setMessage(""); }, 2000); },
  });
  const markDone = trpc.request.markReminderDone.useMutation({
    onSuccess: () => utils.request.listMyReminders.invalidate(),
  });

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/" className="p-2 rounded-lg hover:bg-muted transition-colors"><ChevronLeft className="w-5 h-5" /></Link>
        <Bell className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-bold">提醒管理员</h1>
      </div>

      <div className="glass-card p-5">
        <h3 className="font-semibold mb-4">发送提醒</h3>
        {submitted ? (
          <div className="text-center py-8"><CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" /><p className="font-medium">提醒已发送</p></div>
        ) : (
          <form onSubmit={e => { e.preventDefault(); if (message.trim()) createRem.mutate({ message: message.trim() }); }} className="space-y-3">
            <textarea value={message} onChange={e => setMessage(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:border-primary/50 resize-none" rows={4} placeholder="例如：请发布下周的学习规划..." required />
            <button type="submit" disabled={createRem.isPending}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors disabled:opacity-50">
              <Send className="w-3.5 h-3.5" />{createRem.isPending ? "发送中..." : "发送提醒"}
            </button>
          </form>
        )}
      </div>

      {myReminders && myReminders.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="font-semibold mb-3">我的提醒记录</h3>
          <div className="space-y-2">
            {myReminders.map(rem => (
              <div key={rem.id} className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/30">
                <MessageSquare className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{rem.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{new Date(rem.createdAt).toLocaleDateString("zh-CN")}</p>
                </div>
                {rem.status === "new" ? (
                  <button onClick={() => markDone.mutate({ id: rem.id })} className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors shrink-0">完成</button>
                ) : <span className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-500 shrink-0">已完成</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
