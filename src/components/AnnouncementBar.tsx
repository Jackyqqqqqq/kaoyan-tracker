import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Megaphone, X, ChevronRight } from "lucide-react";

export default function AnnouncementBar() {
  const { data: announcements } = trpc.announcement.list.useQuery();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  const latest = announcements?.filter(a => !dismissed.has(a.id))[0];
  if (!latest) return null;

  return (
    <>
      {/* Bar */}
      <div className="mb-4 animate-slide-up">
        <div className="glass-card p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Megaphone className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-primary font-medium">公告</span>
              <span className="text-sm font-medium truncate">{latest.title}</span>
            </div>
            <p className="text-xs text-muted-foreground truncate">{latest.content.slice(0, 60)}{latest.content.length > 60 ? "..." : ""}</p>
          </div>
          <button onClick={() => setExpandedId(latest.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary text-xs hover:bg-primary/20 transition-colors shrink-0">
            查看 <ChevronRight className="w-3 h-3" />
          </button>
          <button onClick={() => setDismissed(prev => new Set(prev).add(latest.id))} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      {expandedId === latest.id && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setExpandedId(null)}>
          <div className="glass-card p-6 max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold">{latest.title}</h3>
              </div>
              <button onClick={() => setExpandedId(null)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{latest.content}</p>
            <div className="text-xs text-muted-foreground mt-4">
              {latest.creator?.name || "管理员"} · {new Date(latest.createdAt).toLocaleString("zh-CN")}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
