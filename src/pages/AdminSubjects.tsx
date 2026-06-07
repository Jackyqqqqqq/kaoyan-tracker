import { useState } from "react";
import { trpc } from "@/providers/trpc";
import {
  BookOpen, ChevronLeft, Trash2, Plus, Pencil, GraduationCap,
  Layers, CheckCircle,
} from "lucide-react";
import { Link } from "react-router";

export default function AdminSubjects() {
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [subForm, setSubForm] = useState({ name: "", icon: "book", target: 0, fullScore: 150, sections: [{ group: "", label: "", score: 0, fullScore: 0, detail: "", fullDetail: "" }] });
  const [editSec, setEditSec] = useState<{ id: number; subjectId: number; group: string | null; label: string; score: number | string; fullScore: number | string; detail: string | null; fullDetail: string | null } | null>(null);
  const [editSub, setEditSub] = useState<{ id: number; name: string; target: number | string; fullScore: number | string } | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateApplied, setTemplateApplied] = useState(false);

  const utils = trpc.useUtils();
  const { data: allUsers } = trpc.request.listUsers.useQuery();
  const { data: userSubjects } = trpc.subject.listByUser.useQuery(
    { userId: editingUserId || 1 }, { enabled: !!editingUserId }
  );
  const { data: templates } = trpc.template.list.useQuery();

  const createSub = trpc.subject.adminCreateSubject.useMutation({
    onSuccess: () => { utils.subject.listByUser.invalidate(); setShowForm(false); setSubForm({ name: "", icon: "book", target: 0, fullScore: 150, sections: [{ group: "", label: "", score: 0, fullScore: 0, detail: "", fullDetail: "" }] }); },
  });
  const deleteSub = trpc.subject.adminDeleteSubject.useMutation({ onSuccess: () => utils.subject.listByUser.invalidate() });
  const updateSec = trpc.subject.adminUpdateSection.useMutation({ onSuccess: () => { utils.subject.listByUser.invalidate(); setEditSec(null); } });
  const deleteSec = trpc.subject.adminDeleteSection.useMutation({ onSuccess: () => utils.subject.listByUser.invalidate() });
  const updateSub = trpc.subject.adminUpdateSubject.useMutation({
    onSuccess: () => { utils.subject.listByUser.invalidate(); setEditSub(null); },
  });
  const applyTemplate = trpc.template.applyOne.useMutation({
    onSuccess: () => { utils.subject.listByUser.invalidate(); setTemplateApplied(true); setTimeout(() => setTemplateApplied(false), 2000); },
  });
  const applyAllTemplates = trpc.template.applyAllTemplates.useMutation({
    onSuccess: () => { utils.subject.listByUser.invalidate(); setTemplateApplied(true); setTimeout(() => setTemplateApplied(false), 2000); },
  });

  const handleApplyTemplate = (key: string) => {
    if (!editingUserId) return;
    applyTemplate.mutate({ templateKey: key, userId: editingUserId });
  };

  const handleApplyAll = () => {
    if (!editingUserId) return;
    if (!confirm("为该用户应用所有4个科目模板？已有科目不会重复创建。")) return;
    applyAllTemplates.mutate({ userId: editingUserId });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/admin" className="p-2 rounded-lg hover:bg-muted transition-colors"><ChevronLeft className="w-5 h-5" /></Link>
        <BookOpen className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-bold">科目管理</h1>
      </div>

      {/* Select user */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-3"><GraduationCap className="w-4 h-4 text-primary" /><h3 className="font-semibold">选择用户</h3></div>
        <div className="flex gap-2 flex-wrap">
          {allUsers?.map(u => (
            <button key={u.id} onClick={() => { setEditingUserId(u.id); setShowTemplates(false); }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${editingUserId === u.id ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}>
              {u.name || u.username} {u.role === "admin" ? "(管理员)" : "(用户)"}
            </button>
          ))}
        </div>
      </div>

      {editingUserId && (
        <>
          {/* Template section */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2"><Layers className="w-4 h-4 text-primary" /><h3 className="font-semibold">科目模板</h3></div>
              <button onClick={() => setShowTemplates(!showTemplates)} className="text-xs text-primary hover:underline">
                {showTemplates ? "收起" : "展开"}
              </button>
            </div>
            {templateApplied && (
              <div className="mb-3 flex items-center gap-2 text-sm text-green-500"><CheckCircle className="w-4 h-4" />模板应用成功</div>
            )}
            {showTemplates && (
              <div className="space-y-3 animate-fade-in">
                <div className="flex gap-2 mb-3">
                  <button onClick={handleApplyAll}
                    disabled={applyAllTemplates.isPending}
                    className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors disabled:opacity-50">
                    {applyAllTemplates.isPending ? "应用中..." : "一键应用全部4科"}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {templates?.map(t => (
                    <div key={t.key} className="p-3 rounded-xl bg-muted/30 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{t.name}</div>
                        <div className="text-xs text-muted-foreground">目标{t.target}/{t.fullScore} · {t.sectionCount}个分项</div>
                      </div>
                      <button onClick={() => handleApplyTemplate(t.key)}
                        disabled={applyTemplate.isPending}
                        className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs hover:bg-primary/20 transition-colors disabled:opacity-50 shrink-0">
                        应用
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Subject list */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">科目列表 ({userSubjects?.length || 0})</h3>
            <button onClick={() => setShowForm(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors"><Plus className="w-3.5 h-3.5" />添加</button>
          </div>

          {showForm && (
            <div className="glass-card p-5 animate-fade-in">
              <h4 className="font-medium mb-3">新建科目</h4>
              <form onSubmit={e => { e.preventDefault(); createSub.mutate({ userId: editingUserId, name: subForm.name, icon: subForm.icon, target: subForm.target, fullScore: subForm.fullScore, sections: subForm.sections.filter(s => s.label) }); }} className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="text-xs text-muted-foreground mb-1 block">名称 *</label><input value={subForm.name} onChange={e => setSubForm({ ...subForm, name: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm" placeholder="科目名" required /></div>
                  <div><label className="text-xs text-muted-foreground mb-1 block">目标分 *</label><input type="number" value={subForm.target} onChange={e => setSubForm({ ...subForm, target: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm" required /></div>
                  <div><label className="text-xs text-muted-foreground mb-1 block">满分 *</label><input type="number" value={subForm.fullScore} onChange={e => setSubForm({ ...subForm, fullScore: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm" required /></div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">分项</label>
                  {subForm.sections.map((sec, i) => (
                    <div key={i} className="grid grid-cols-6 gap-2 mb-2">
                      <input value={sec.group} onChange={e => { const s = [...subForm.sections]; s[i] = { ...s[i], group: e.target.value }; setSubForm({ ...subForm, sections: s }); }} className="px-2 py-1.5 rounded-lg bg-muted border border-border text-xs" placeholder="大类" />
                      <input value={sec.label} onChange={e => { const s = [...subForm.sections]; s[i] = { ...s[i], label: e.target.value }; setSubForm({ ...subForm, sections: s }); }} className="px-2 py-1.5 rounded-lg bg-muted border border-border text-xs" placeholder="标签" />
                      <input type="number" value={sec.score} onChange={e => { const s = [...subForm.sections]; s[i] = { ...s[i], score: Number(e.target.value) }; setSubForm({ ...subForm, sections: s }); }} className="px-2 py-1.5 rounded-lg bg-muted border border-border text-xs" placeholder="目标" />
                      <input type="number" value={sec.fullScore} onChange={e => { const s = [...subForm.sections]; s[i] = { ...s[i], fullScore: Number(e.target.value) }; setSubForm({ ...subForm, sections: s }); }} className="px-2 py-1.5 rounded-lg bg-muted border border-border text-xs" placeholder="满分" />
                      <input value={sec.detail} onChange={e => { const s = [...subForm.sections]; s[i] = { ...s[i], detail: e.target.value }; setSubForm({ ...subForm, sections: s }); }} className="px-2 py-1.5 rounded-lg bg-muted border border-border text-xs" placeholder="目标明细" />
                      <input value={sec.fullDetail} onChange={e => { const s = [...subForm.sections]; s[i] = { ...s[i], fullDetail: e.target.value }; setSubForm({ ...subForm, sections: s }); }} className="px-2 py-1.5 rounded-lg bg-muted border border-border text-xs" placeholder="满分明细" />
                    </div>
                  ))}
                  <button type="button" onClick={() => setSubForm({ ...subForm, sections: [...subForm.sections, { group: "", label: "", score: 0, fullScore: 0, detail: "", fullDetail: "" }] })} className="text-xs text-primary hover:underline mt-1">+ 添加分项</button>
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={createSub.isPending} className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors disabled:opacity-50">{createSub.isPending ? "创建中..." : "创建"}</button>
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted">取消</button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-3">
            {userSubjects?.map(sub => (
              <div key={sub.id} className="glass-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <div>
                      <span className="font-bold">{sub.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">目标 {sub.target} / {sub.fullScore}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditSub({ ...sub })} className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => { if (confirm("删除此科目？")) deleteSub.mutate({ id: sub.id, userId: editingUserId }); }} className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden mb-3">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min((sub.target / sub.fullScore) * 100, 100)}%` }} />
                </div>
                <div className="space-y-2">
                  {sub.sections.map(sec => (
                    <div key={sec.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 group">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {sec.group && sec.group !== sec.label && <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">{sec.group}</span>}
                            <span className="text-sm font-medium">{sec.label}</span>
                            {sec.detail && <span className="text-xs text-muted-foreground font-mono">{sec.detail}</span>}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-primary">{sec.score}</span>
                            <span className="text-xs text-muted-foreground">/ {sec.fullScore}</span>
                            {sec.fullDetail && <span className="text-xs text-muted-foreground font-mono">({sec.fullDetail})</span>}
                          </div>
                        </div>
                      </div>
                      <button onClick={() => setEditSec({ ...sec, subjectId: sub.id })} className="p-1 rounded opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => { if (confirm("删除？")) deleteSec.mutate({ id: sec.id }); }} className="p-1 rounded opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Edit Subject Modal */}
      {editSub && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setEditSub(null)}>
          <div className="glass-card p-6 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold mb-3">编辑科目</h3>
            <form onSubmit={e => { e.preventDefault(); updateSub.mutate({ id: editSub.id, userId: editingUserId!, name: editSub.name, target: Number(editSub.target) || 0, fullScore: Number(editSub.fullScore) || 0 }); }} className="space-y-3">
              <div><label className="text-xs text-muted-foreground mb-1 block">名称</label><input value={editSub.name} onChange={e => setEditSub({ ...editSub, name: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm" required /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs text-muted-foreground mb-1 block">目标分</label><input type="number" value={editSub.target} onChange={e => setEditSub({ ...editSub, target: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm" required /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">满分</label><input type="number" value={editSub.fullScore} onChange={e => setEditSub({ ...editSub, fullScore: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm" required /></div>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={updateSub.isPending} className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors disabled:opacity-50">{updateSub.isPending ? "保存中..." : "保存"}</button>
                <button type="button" onClick={() => setEditSub(null)} className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted">取消</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Section Modal */}
      {editSec && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setEditSec(null)}>
          <div className="glass-card p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold mb-3">编辑分项</h3>
            <form onSubmit={e => { e.preventDefault(); updateSec.mutate({ id: editSec.id, group: editSec.group || undefined, label: editSec.label, score: Number(editSec.score) || 0, fullScore: Number(editSec.fullScore) || 0, detail: editSec.detail || undefined, fullDetail: editSec.fullDetail || undefined }); }} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs text-muted-foreground mb-1 block">大类</label><input value={editSec.group || ""} onChange={e => setEditSec({ ...editSec, group: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm" /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">标签</label><input value={editSec.label} onChange={e => setEditSec({ ...editSec, label: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm" required /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs text-muted-foreground mb-1 block">目标分</label><input type="number" value={editSec.score} onChange={e => setEditSec({ ...editSec, score: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm" required /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">满分</label><input type="number" value={editSec.fullScore} onChange={e => setEditSec({ ...editSec, fullScore: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm" required /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs text-muted-foreground mb-1 block">目标明细</label><input value={editSec.detail || ""} onChange={e => setEditSec({ ...editSec, detail: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm" placeholder="如: 3+6+13=22" /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">满分明细</label><input value={editSec.fullDetail || ""} onChange={e => setEditSec({ ...editSec, fullDetail: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm" placeholder="如: 10+10+20=40" /></div>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={updateSec.isPending} className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors disabled:opacity-50">{updateSec.isPending ? "保存中..." : "保存"}</button>
                <button type="button" onClick={() => setEditSec(null)} className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted">取消</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
