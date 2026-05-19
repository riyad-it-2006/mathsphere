"use client";

import React, { use } from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { AppLayout } from "@/src/components/common/AppLayout";
import { Profile } from "@/src/views/Profile";
import { Login } from "@/src/views/Login";

export default function UserProfilePage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = use(params);
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Login />;

  return (
    <AppLayout>
      <Profile userId={uid} />
    </AppLayout>
  );
}
