import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="text-6xl font-black text-primary/20">404</div>
        <h1 className="text-xl font-bold">页面不存在</h1>
        <p className="text-sm text-muted-foreground">你要找的页面可能已经被移动或删除</p>
        <Link to="/" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
          <ArrowLeft className="w-4 h-4" />返回首页
        </Link>
      </div>
    </div>
  );
}
