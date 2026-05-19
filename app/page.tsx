"use client";

import React from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { AppLayout } from "@/src/components/common/AppLayout";
import { Dashboard } from "@/src/views/Dashboard";
import { Login } from "@/src/views/Login";

export default function Home() {
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
      <Dashboard />
    </AppLayout>
  );
}
