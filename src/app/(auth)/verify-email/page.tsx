"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api.client";
import Loader from "@/components/common/Loader";
import Link from "next/link";

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        setStatus("loading");
        await apiClient.post("/auth/verify-email", { token });
        setStatus("success");
      } catch {
        setStatus("error");
      }
    })();
  }, [token]);

  return (
    <div className="max-w-md mx-auto card p-6 text-center bg-white/5 border-white/10">
      {status === "loading" && <Loader label="Vérification en cours..." />}
      {status === "success" && (
        <>
          <h1 className="text-2xl font-semibold mb-2">Email vérifié</h1>
          <p className="text-neutral-400 mb-4">Votre adresse e-mail a bien été vérifiée.</p>
          <Link className="btn-primary" href="/login">Se connecter</Link>
        </>
      )}
      {status === "error" && (
        <>
          <h1 className="text-2xl font-semibold mb-2">Lien invalide</h1>
          <p className="text-neutral-400 mb-4">Le lien de vérification semble invalide ou expiré.</p>
          <Link className="btn-primary" href="/login">Retour</Link>
        </>
      )}
      {status === "idle" && <p className="text-neutral-400">Token manquant.</p>}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <Suspense fallback={<div>Chargement...</div>}>
        <VerifyEmailInner />
      </Suspense>
    </main>
  );
}
