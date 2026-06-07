import { trpc } from "@/providers/trpc";
import { FileText, Calendar, ChevronLeft, User, Users, UserCheck } from "lucide-react";
import { Link } from "react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState } from "react";

export default function WeeklyPlan() {
  const { data: plans, isLoading } = trpc.plan.list.useQuery();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selectedPlan = plans?.[selectedIdx];

  if (isLoading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/" className="p-2 rounded-lg hover:bg-muted transition-colors"><ChevronLeft className="w-5 h-5" /></Link>
        <FileText className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-bold">每周规划</h1>
        {plans && <span className="text-xs text-muted-foreground">共 {plans.length} 周</span>}
      </div>

      {(!plans || plans.length === 0) ? (
        <div className="glass-card p-12 text-center"><FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">暂无周规划</p></div>
      ) : (
        <>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {plans.map((plan, i) => (
              <button key={plan.id} onClick={() => setSelectedIdx(i)}
                className={`flex items-center gap-1.5 flex-shrink-0 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${i === selectedIdx ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted/50 text-muted-foreground border border-transparent hover:bg-muted hover:text-foreground"}`}>
                第{plan.weekNumber}周
                {plan.scope === "personal" ? <UserCheck className="w-3 h-3" /> : <Users className="w-3 h-3" />}
              </button>
            ))}
          </div>
          {selectedPlan && (
            <div className="glass-card p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/30">
                <h2 className="text-lg font-bold">{selectedPlan.title}</h2>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />第{selectedPlan.weekNumber}周</span>
                  <span className="flex items-center gap-1"><User className="w-3 h-3" />{selectedPlan.creator?.name || "管理员"}</span>
                  {selectedPlan.scope === "personal" && selectedPlan.targetUser && (
                    <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px]">@{selectedPlan.targetUser.name}</span>
                  )}
                </div>
              </div>
              <div className="markdown-body text-sm"><ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedPlan.content}</ReactMarkdown></div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
