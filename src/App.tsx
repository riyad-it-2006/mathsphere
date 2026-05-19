import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/common/AppLayout";
import { Dashboard } from "./pages/Dashboard";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { AIAssistant } from "./pages/AIAssistant";
import { Chat } from "./pages/Chat";
import { Discussions } from "./pages/Discussions";
import { Notes } from "./pages/Notes";
import { NoticeBoard } from "./pages/NoticeBoard";
import { Profile } from "./pages/Profile";
import { Login } from "./pages/Login";

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="h-10 w-10 rounded-xl border-4 border-orange-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/discussions" element={<Discussions />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/notices" element={<NoticeBoard />} />
        <Route path="/ai" element={<AIAssistant />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:uid" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AppLayout>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
