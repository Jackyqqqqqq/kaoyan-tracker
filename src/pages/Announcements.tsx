import { trpc } from "@/providers/trpc";
import { Megaphone, ChevronLeft, Calendar } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";

export default function Announcements() {
  const { data: announcements, isLoading } = trpc.announcement.list.useQuery();
  const [expanded, setExpanded] = useState<number | null>(null);

  if (isLoading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/" className="p-2 rounded-lg hover:bg-muted transition-colors"><ChevronLeft className="w-5 h-5" /></Link>
        <Megaphone className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-bold">公告</h1>
      </div>
      {(!announcements || announcements.length === 0) ? (
        <div className="glass-card p-12 text-center"><Megaphone className="w-10 h-10 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">暂无公告</p></div>
      ) : (
        <div className="space-y-3">
          {announcements.map(a => (
            <div key={a.id} className="glass-card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm">{a.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(a.createdAt).toLocaleDateString("zh-CN")}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{a.content}</p>
              <button onClick={() => setExpanded(expanded === a.id ? null : a.id)} className="text-xs text-primary mt-2 hover:underline">
                {expanded === a.id ? "收起" : "查看详情"}
              </button>
              {expanded === a.id && (
                <div className="mt-3 p-3 rounded-lg bg-muted/50 text-sm animate-fade-in">
                  <p className="whitespace-pre-wrap">{a.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">{a.creator?.name || "管理员"} · {new Date(a.createdAt).toLocaleString("zh-CN")}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
