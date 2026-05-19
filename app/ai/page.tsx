"use client";

import React from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { AppLayout } from "@/src/components/common/AppLayout";
import { AIAssistant } from "@/src/views/AIAssistant";
import { Login } from "@/src/views/Login";

export default function AIPage() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Login />;

  return (
    <AppLayout>
      <AIAssistant />
    </AppLayout>
  );
}
