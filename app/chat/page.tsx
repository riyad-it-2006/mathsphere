"use client";

import React from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { AppLayout } from "@/src/components/common/AppLayout";
import { Chat } from "@/src/views/Chat";
import { Login } from "@/src/views/Login";

export default function ChatPage() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Login />;

  return (
    <AppLayout>
      <Chat />
    </AppLayout>
  );
}
