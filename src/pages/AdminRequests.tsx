import { trpc } from "@/providers/trpc";
import { MessageSquare, ChevronLeft, CheckCircle, XCircle } from "lucide-react";
import { Link } from "react-router";

export default function AdminRequests() {
  const utils = trpc.useUtils();
  const { data: allRequests } = trpc.request.listAllRequests.useQuery();
  const resolveReq = trpc.request.resolveRequest.useMutation({
    onSuccess: () => utils.request.listAllRequests.invalidate(),
  });

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/admin" className="p-2 rounded-lg hover:bg-muted transition-colors"><ChevronLeft className="w-5 h-5" /></Link>
        <MessageSquare className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-bold">修改申请</h1>
      </div>

      <div className="glass-card p-5">
        <div className="space-y-2">
          {allRequests?.map(req => (
            <div key={req.id} className="p-4 rounded-xl bg-muted/30">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{req.userName}</span>
                    <span className="text-xs text-muted-foreground">申请</span>
                    <span className="text-sm font-semibold text-primary">{req.subjectName}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">{req.currentTarget} → <span className="text-primary font-medium">{req.requestedTarget}</span></div>
                  {req.reason && <p className="text-xs text-muted-foreground mb-1">{req.reason}</p>}
                </div>
                {req.status === "pending" ? (
                  <div className="flex gap-1.5">
                    <button onClick={() => resolveReq.mutate({ id: req.id, status: "approved" })} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-500/10 text-green-500 text-xs hover:bg-green-500/20"><CheckCircle className="w-3 h-3" />通过</button>
                    <button onClick={() => resolveReq.mutate({ id: req.id, status: "rejected" })} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-xs hover:bg-red-500/20"><XCircle className="w-3 h-3" />拒绝</button>
                  </div>
                ) : <span className={`text-xs px-2 py-1 rounded-full ${req.status === "approved" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>{req.status === "approved" ? "已通过" : "已拒绝"}</span>}
              </div>
            </div>
          ))}
          {(!allRequests || allRequests.length === 0) && <p className="text-sm text-muted-foreground text-center py-6">暂无申请</p>}
        </div>
      </div>
    </div>
  );
}
