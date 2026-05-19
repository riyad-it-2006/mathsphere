"use client";

import React from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { AppLayout } from "@/src/components/common/AppLayout";
import { Discussions } from "@/src/views/Discussions";
import { Login } from "@/src/views/Login";

export default function DiscussionsPage() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Login />;

  return (
    <AppLayout>
      <Discussions />
    </AppLayout>
  );
}
