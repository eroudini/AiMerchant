"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { apiClient } from "@/lib/api.client";
import { useAuthStore } from "@/lib/auth-store";
import { me } from "@/lib/fetchers";
import { toast } from "sonner";
import Link from "next/link";

export default function LoginPage() {
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { remember: false } });

  const onSubmit = async (values: LoginInput) => {
    try {
      // 1. Appel login pour poser les cookies (access_token + refresh_token)
      const res = await apiClient.post("/auth/login", values);
      const { user, accessToken } = res.data as any;
      // Certains backends ne renvoient pas le token en JSON (juste Set-Cookie); on le stocke seulement s’il est présent
      setToken(accessToken ?? null);
      setUser(user ?? null);
      // 2. Chargement de l’utilisateur à jour via /user/me (utilise cookies httpOnly côté proxy)
      try {
        const fresh = await me();
        // Si l’API /user/me renvoie directement l’objet user (sans wrapper)
        if ((fresh as any)?.id) setUser(fresh as any);
      } catch {}
      toast.success("Connexion réussie");
      window.location.href = "/app/dashboard";
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Échec de connexion");
    }
  };

  return (
    <main className="container-responsive py-12">
      <div className="max-w-md mx-auto card p-6">
        <h1 className="text-2xl font-semibold mb-6">Connexion</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
            <input id="email" type="email" className="w-full rounded-xl border px-3 py-2" aria-invalid={!!errors.email} {...register("email")} />
            {errors.email && <p role="alert" className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="password">Mot de passe</label>
            <input id="password" type="password" className="w-full rounded-xl border px-3 py-2" aria-invalid={!!errors.password} {...register("password")} />
            {errors.password && <p role="alert" className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" {...register("remember")} /> Se souvenir de moi
            </label>
            <Link href="/forgot-password" className="text-[color:var(--brand)]">Mot de passe oublié ?</Link>
          </div>
          <button disabled={isSubmitting} className="btn-primary w-full" type="submit">
            {isSubmitting ? "Connexion..." : "Se connecter"}
          </button>
        </form>
        <p className="text-sm text-gray-600 mt-4">Pas de compte ? <Link href="/register" className="text-[color:var(--brand)]">Créer un compte</Link></p>
      </div>
    </main>
  );
}
