"use client";
import { useAuthStore } from "@/lib/auth-store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface RequireAuthProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Client-side guard pour protéger des blocs UI spécifiques.
export default function RequireAuth({ children, fallback = null }: RequireAuthProps) {
  const token = useAuthStore((s) => s.accessToken);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token, router]);

  if (!token) return <>{fallback}</>;
  return <>{children}</>;
}
