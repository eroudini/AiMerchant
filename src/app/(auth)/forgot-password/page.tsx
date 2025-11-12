"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations";
import { apiClient } from "@/lib/api.client";
import { toast } from "sonner";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (values: ForgotPasswordInput) => {
    try {
      await apiClient.post("/auth/forgot-password", values);
      toast.success("Si un compte existe, un email a été envoyé.");
    } catch (e: any) {
      toast.error("Impossible d'envoyer l'email");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-3 text-center">
          <h1 className="text-3xl font-semibold">Mot de passe oublié</h1>
          <p className="text-sm text-neutral-400">Entrez votre e‑mail pour recevoir un lien de réinitialisation.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-5 bg-white/5 border-white/10">
          <div>
            <label className="block text-xs font-medium mb-1" htmlFor="email">Email</label>
            <input id="email" type="email" className="w-full rounded-xl border px-3 py-2 bg-transparent" aria-invalid={!!errors.email} {...register("email")} />
            {errors.email && <p role="alert" className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
          </div>
          <button disabled={isSubmitting} className="btn-primary w-full" type="submit">
            {isSubmitting ? "Envoi..." : "Envoyer le lien"}
          </button>
          <p className="text-xs text-neutral-400">Retour à <Link href="/login" className="underline-offset-4 hover:underline">la connexion</Link></p>
        </form>
      </div>
    </main>
  );
}
