"use client";

import React from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { AppLayout } from "@/src/components/common/AppLayout";
import { Notes } from "@/src/views/Notes";
import { Login } from "@/src/views/Login";

export default function NotesPage() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Login />;

  return (
    <AppLayout>
      <Notes />
    </AppLayout>
  );
}
