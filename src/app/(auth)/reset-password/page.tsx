"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations";
import { apiClient } from "@/lib/api.client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { toast } from "sonner";
import Link from "next/link";

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema), defaultValues: { token } as any });

  const onSubmit = async (values: ResetPasswordInput) => {
    try {
      await apiClient.post("/auth/reset-password", values);
      toast.success("Mot de passe réinitialisé");
      window.location.href = "/login";
    } catch (e: any) {
      toast.error("Impossible de réinitialiser le mot de passe");
    }
  };

  return (
    <div className="max-w-md mx-auto card p-6 bg-white/5 border-white/10">
      <h1 className="text-2xl font-semibold mb-6">Réinitialiser le mot de passe</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register("token")} />
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="newPassword">Nouveau mot de passe</label>
          <input id="newPassword" type="password" className="w-full rounded-xl border px-3 py-2 bg-transparent" aria-invalid={!!errors.newPassword} {...register("newPassword")} />
          {errors.newPassword && <p role="alert" className="text-sm text-red-400 mt-1">{errors.newPassword.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="confirmPassword">Confirmer le mot de passe</label>
          <input id="confirmPassword" type="password" className="w-full rounded-xl border px-3 py-2 bg-transparent" aria-invalid={!!errors.confirmPassword} {...register("confirmPassword")} />
          {errors.confirmPassword && <p role="alert" className="text-sm text-red-400 mt-1">{errors.confirmPassword.message}</p>}
        </div>
        <button disabled={isSubmitting} className="btn-primary w-full" type="submit">
          {isSubmitting ? "Réinitialisation..." : "Réinitialiser"}
        </button>
      </form>
      <p className="text-sm text-neutral-400 mt-4"><Link href="/login" className="underline-offset-4 hover:underline">Retour à la connexion</Link></p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <Suspense fallback={<div>Chargement...</div>}>
        <ResetForm />
      </Suspense>
    </main>
  );
}
