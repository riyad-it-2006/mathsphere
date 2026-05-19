"use client";

import React from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { AppLayout } from "@/src/components/common/AppLayout";
import { NoticeBoard } from "@/src/views/NoticeBoard";
import { Login } from "@/src/views/Login";

export default function NoticesPage() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Login />;

  return (
    <AppLayout>
      <NoticeBoard />
    </AppLayout>
  );
}
