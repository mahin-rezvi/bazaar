"use client";

import * as React from "react";
import { AuthContext, type AuthContextValue } from "@/components/providers/auth-provider";

export function useAuth(): AuthContextValue {
  const value = React.useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within <AuthProvider />");
  }
  return value;
}
