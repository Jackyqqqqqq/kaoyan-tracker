import { useState, useMemo } from "react";
import { trpc } from "@/providers/trpc";
import { useCountdown } from "@/hooks/useCountdown";
import AnnouncementBar from "@/components/AnnouncementBar";
import { Clock, BookOpen, Target, X } from "lucide-react";

interface SectionItem {
  id: number;
  group: string;
  label: string;
  score: number;
  fullScore: number;
  detail: string | null;
  fullDetail: string | null;
}

interface GroupedItem {
  name: string;
  count: number;
  score: number;
  fullScore: number;
  detail: string;
  fullDetail: string;
}

function groupSections(sections: SectionItem[]): GroupedItem[] {
  const map = new Map<string, { items: SectionItem[]; totalScore: number; totalFull: number }>();
  sections.forEach((sec) => {
    const key = sec.group || sec.label;
    if (!map.has(key)) map.set(key, { items: [], totalScore: 0, totalFull: 0 });
    const g = map.get(key)!;
    g.items.push(sec);
    g.totalScore += sec.score;
    g.totalFull += sec.fullScore;
  });
  return Array.from(map.entries()).map(([name, data]) => ({
    name,
    count: data.items.length,
    score: data.totalScore,
    fullScore: data.totalFull,
    detail: data.items.length > 1
      ? data.items.map(i => i.score).join("+") + `=${data.totalScore}`
      : data.items[0]?.detail || String(data.totalScore),
    fullDetail: data.items.length > 1
      ? data.items.map(i => i.fullScore).join("+") + `=${data.totalFull}`
      : data.items[0]?.fullDetail || String(data.totalFull),
  }));
}

function SectionRow({ label, score, fullScore, detail, fullDetail }: {
  label: string; score: number; fullScore: number; detail?: string | null; fullDetail?: string | null;
}) {
  const pct = Math.min((score / fullScore) * 100, 100);
  return (
    <div className="py-2">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{label}</span>
          {detail && <span className="text-xs text-muted-foreground font-mono">{detail}</span>}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-primary tabular-nums">{score}</span>
          <span className="text-xs text-muted-foreground">/ {fullScore}</span>
          {fullDetail && <span className="text-xs text-muted-foreground font-mono">({fullDetail})</span>}
        </div>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function SubjectDetail({ subject, onClose }: { subject: any; onClose: () => void }) {
  const grouped = useMemo(() => {
    const map = new Map<string, SectionItem[]>();
    (subject.sections || []).forEach((sec: SectionItem) => {
      const key = sec.group || sec.label;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(sec);
    });
    return map;
  }, [subject.sections]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card p-6 max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold">{subject.name}</h3>
            <p className="text-xs text-muted-foreground">目标 {subject.target} / {subject.fullScore} 分 · 共{(subject.sections || []).length}项</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {Array.from(grouped.entries()).map(([groupName, items]) => (
          <div key={groupName} className="mb-4">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-sm font-bold text-foreground">{groupName}</span>
              {items.length > 1 && (
                <span className="text-xs text-muted-foreground">
                  {items.reduce((s, i) => s + i.score, 0)} / {items.reduce((s, i) => s + i.fullScore, 0)}
                </span>
              )}
            </div>
            <div className="space-y-0.5">
              {items.map((sec) => (
                <SectionRow key={sec.id} label={sec.label} score={sec.score} fullScore={sec.fullScore}
                  detail={sec.detail} fullDetail={sec.fullDetail} />
              ))}
            </div>
          </div>
        ))}

        <div className="mt-5 pt-4 border-t border-border/30 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">总分</span>
          <span className="text-2xl font-black text-primary tabular-nums">{subject.target}</span>
        </div>
      </div>
    </div>
  );
}

function SubjectCard({ sub, index, onClick }: { sub: any; index: number; onClick: () => void }) {
  const grouped = useMemo(() => groupSections(sub.sections || []), [sub.sections]);

  return (
    <button
      onClick={onClick}
      className="glass-card p-5 text-left w-full cursor-pointer transition-all hover:ring-1 hover:ring-primary/20 animate-slide-up"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl font-black text-primary tabular-nums">{sub.target}</span>
          <div>
            <h3 className="text-base font-bold">{sub.name}</h3>
            <p className="text-[11px] text-muted-foreground">满分 {sub.fullScore} · 共{(sub.sections || []).length}项</p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">点击查看详情</span>
      </div>
      <div className="h-3 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all duration-700"
          style={{ width: `${Math.min((sub.target / sub.fullScore) * 100, 100)}%` }} />
      </div>
      {/* Grouped summary */}
      <div className="mt-3 pt-3 border-t border-border/30 space-y-1.5">
        {grouped.slice(0, 4).map((g) => (
          <div key={g.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{g.name}</span>
              {g.count > 1 && <span className="text-[10px] text-muted-foreground font-mono">{g.detail}</span>}
            </div>
            <span className="text-xs">
              <span className="font-bold text-primary">{g.score}</span>
              <span className="text-muted-foreground"> / {g.fullScore}</span>
            </span>
          </div>
        ))}
        {grouped.length > 4 && (
          <span className="text-xs text-muted-foreground">+{grouped.length - 4} 更多...</span>
        )}
      </div>
    </button>
  );
}

export default function Home() {
  const { data: mySettings } = trpc.settings.get.useQuery();
  const { data: subjects, isLoading } = trpc.subject.list.useQuery();
  const [selectedSub, setSelectedSub] = useState<any>(null);

  const examDate = mySettings?.examDate || "2026-12-21";
  const totalTarget = mySettings?.totalTarget || 360;
  const schoolName = mySettings?.schoolName || "";
  const majorCode = mySettings?.majorCode || "";
  const description = mySettings?.description || "";
  const cd = useCountdown(examDate);

  const titleText = schoolName
    ? `目标：${schoolName}${majorCode ? ` ${majorCode}` : ""} 总分${totalTarget}`
    : `目标总分 ${totalTarget}`;
  const subtitleText = [schoolName, description, majorCode].filter(Boolean).join(" · ");

  if (isLoading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <AnnouncementBar />

      {/* Header */}
      <div className="text-center space-y-1 animate-fade-in">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground">
          <Target className="w-3 h-3 text-primary" />
          <span>考研目标追踪</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-theme-gradient tracking-tight">
          {titleText}
        </h1>
        {subtitleText && <p className="text-sm text-muted-foreground">{subtitleText} · 考试日期：{examDate}</p>}
        {!subtitleText && <p className="text-sm text-muted-foreground">考试日期：{examDate}</p>}
      </div>

      {/* Countdown */}
      <div className="glass-card p-4 text-center animate-slide-up">
        <div className="flex items-center justify-center gap-1.5 mb-2">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">距离考研</span>
        </div>
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          {[
            { val: cd.d, label: "天" }, { val: cd.h, label: "时" },
            { val: cd.m, label: "分" }, { val: cd.s, label: "秒" },
          ].map((u, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-lg sm:text-xl font-black text-primary tabular-nums">{String(u.val).padStart(2, "0")}</span>
              </div>
              <span className="text-[10px] text-muted-foreground mt-0.5">{u.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Subject Bars - grouped summary */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold">各科目标</h2>
        </div>

        {(!subjects || subjects.length === 0) && (
          <div className="glass-card p-8 text-center">
            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-1">还没有设置科目</p>
            <p className="text-xs text-muted-foreground">请联系管理员为你设置目标科目和分数</p>
          </div>
        )}

        <div className="space-y-3">
          {subjects?.map((sub, idx) => (
            <SubjectCard
              key={sub.id}
              sub={sub}
              index={idx}
              onClick={() => setSelectedSub(sub)}
            />
          ))}
        </div>
      </div>

      {selectedSub && <SubjectDetail subject={selectedSub} onClose={() => setSelectedSub(null)} />}
    </div>
  );
}
