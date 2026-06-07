import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Target, UserPlus, LogIn } from "lucide-react";

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const loginMut = trpc.auth.login.useMutation({
    onSuccess: (d) => { localStorage.setItem("auth_token", d.token); window.location.href = "/"; },
    onError: (e) => setError(e.message),
  });
  const regMut = trpc.auth.register.useMutation({
    onSuccess: (d) => { localStorage.setItem("auth_token", d.token); window.location.href = "/"; },
    onError: (e) => setError(e.message),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (mode === "login") loginMut.mutate({ username, password });
    else regMut.mutate({ username, password, name: name || undefined });
  };
  const pending = loginMut.isPending || regMut.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm mx-4">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Target className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-xl font-bold">考研目标追踪</h1>
          <p className="text-sm text-muted-foreground mt-1">溯游 · 专注备考每一天</p>
        </div>
        <div className="glass-card p-6">
          <div className="flex rounded-lg bg-muted p-0.5 mb-5">
            <button onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${mode === "login" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
              <span className="flex items-center justify-center gap-1.5"><LogIn className="w-3.5 h-3.5" /> 登录</span>
            </button>
            <button onClick={() => { setMode("register"); setError(""); }}
              className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${mode === "register" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
              <span className="flex items-center justify-center gap-1.5"><UserPlus className="w-3.5 h-3.5" /> 注册</span>
            </button>
          </div>
          <form onSubmit={onSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">用户名</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                placeholder="请输入用户名" required minLength={3} />
            </div>
            {mode === "register" && (
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">昵称（可选）</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all" placeholder="你的昵称" />
              </div>
            )}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">密码</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                placeholder="请输入密码" required minLength={6} />
            </div>
            {error && <div className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</div>}
            <button type="submit" disabled={pending}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50">
              {pending ? "处理中..." : mode === "login" ? "登录" : "注册"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
