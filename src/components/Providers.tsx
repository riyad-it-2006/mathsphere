"use client";

import React from "react";
import { AuthProvider } from "@/src/hooks/useAuth";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
