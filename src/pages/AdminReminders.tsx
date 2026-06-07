import { trpc } from "@/providers/trpc";
import { Bell, ChevronLeft } from "lucide-react";
import { Link } from "react-router";

export default function AdminReminders() {
  const { data: allReminders } = trpc.request.listAllReminders.useQuery();

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/admin" className="p-2 rounded-lg hover:bg-muted transition-colors"><ChevronLeft className="w-5 h-5" /></Link>
        <Bell className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-bold">用户提醒</h1>
      </div>

      <div className="glass-card p-5">
        <div className="space-y-2">
          {allReminders?.map(rem => (
            <div key={rem.id} className="p-4 rounded-xl bg-muted/30 flex items-start gap-3">
              <Bell className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium">{rem.userName}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${rem.status === "new" ? "bg-yellow-500/10 text-yellow-500" : rem.status === "done" ? "bg-green-500/10 text-green-500" : "bg-blue-500/10 text-blue-500"}`}>
                    {rem.status === "new" ? "新" : rem.status === "done" ? "已完成" : "已读"}
                  </span>
                </div>
                <p className="text-sm">{rem.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(rem.createdAt).toLocaleString("zh-CN")}</p>
              </div>
            </div>
          ))}
          {(!allReminders || allReminders.length === 0) && <p className="text-sm text-muted-foreground text-center py-6">暂无提醒</p>}
        </div>
      </div>
    </div>
  );
}
