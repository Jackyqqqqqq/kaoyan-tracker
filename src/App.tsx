import { Routes, Route, Navigate } from "react-router";
import AuthLayout from "./components/AuthLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import WeeklyPlan from "./pages/WeeklyPlan";
import RequestChange from "./pages/RequestChange";
import RemindAdmin from "./pages/RemindAdmin";
import Announcements from "./pages/Announcements";
import AdminPanel from "./pages/AdminPanel";
import AdminAnnouncements from "./pages/AdminAnnouncements";
import AdminPlans from "./pages/AdminPlans";
import AdminSubjects from "./pages/AdminSubjects";
import AdminRequests from "./pages/AdminRequests";
import AdminReminders from "./pages/AdminReminders";
import NotFound from "./pages/NotFound";
import { useAuth } from "@/hooks/useAuth";

function AdminRedirect() {
  const { isAdmin, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;
  if (isAdmin) return <Navigate to="/admin" replace />;
  return <Home />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<AuthLayout />}>
        {/* User routes */}
        <Route path="/" element={<AdminRedirect />} />
        <Route path="/weekly" element={<WeeklyPlan />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/request" element={<RequestChange />} />
        <Route path="/remind" element={<RemindAdmin />} />
        {/* Admin routes */}
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin/announcements" element={<AdminAnnouncements />} />
        <Route path="/admin/plans" element={<AdminPlans />} />
        <Route path="/admin/subjects" element={<AdminSubjects />} />
        <Route path="/admin/requests" element={<AdminRequests />} />
        <Route path="/admin/reminders" element={<AdminReminders />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
