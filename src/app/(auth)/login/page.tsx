"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { apiClient } from "@/lib/api.client";
import { useAuthStore } from "@/lib/auth-store";
import { me } from "@/lib/fetchers";
import { toast } from "sonner";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ShieldCheck, Lock, Sparkles, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { remember: false } });

  const [features, setFeatures] = useState<string[]>([]);
  useEffect(() => {
    apiClient
      .get("/ai/insights")
      .then((res) => setFeatures((res.data as any[]).map((x) => x.title).slice(0, 4)))
      .catch(() => setFeatures(["Insights IA", "Moteur de pricing", "Alertes", "Prévisions"]));
  }, []);

  const onSubmit = async (values: LoginInput) => {
    try {
      const res = await apiClient.post("/auth/login", values);
      const { user, accessToken } = res.data as any;
      setToken(accessToken ?? null);
      setUser(user ?? null);
      try {
        const fresh = await me();
        if ((fresh as any)?.id) setUser(fresh as any);
      } catch {}
      toast.success("Connexion réussie");
      window.location.href = "/app/dashboard";
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Échec de connexion");
    }
  };

  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-neutral-950 text-neutral-100">
      {/* Colonne gauche: formulaire de connexion (charte sombre + champs underline) */}
      <section className="relative flex items-center">
        <div className="w-full max-w-xl mx-auto px-8 py-16">
          <div className="text-xs tracking-widest text-neutral-400 mb-6">CONNEXION</div>
          <h1 className="text-3xl md:text-4xl font-semibold leading-tight">Ravi de vous revoir</h1>
          <p className="mt-3 text-sm text-neutral-400">Accédez à vos tableaux de bord et recommandations IA.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-6">
            <div>
              <label className="sr-only" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="email@exemple.com"
                className="w-full bg-transparent border-0 border-b border-neutral-700 focus:border-white focus:ring-0 text-lg placeholder:text-neutral-500 py-3"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              {errors.email && <p role="alert" className="mt-2 text-sm text-red-400">{errors.email.message}</p>}
            </div>
            <div>
              <label className="sr-only" htmlFor="password">Mot de passe</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="w-full bg-transparent border-0 border-b border-neutral-700 focus:border-white focus:ring-0 text-lg placeholder:text-neutral-500 py-3"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              {errors.password && <p role="alert" className="mt-2 text-sm text-red-400">{errors.password.message}</p>}
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" className="accent-white" {...register("remember")} /> Se souvenir de moi
              </label>
              <Link href="/forgot-password" className="underline-offset-4 hover:underline">Mot de passe oublié ?</Link>
            </div>

            <button disabled={isSubmitting} className="rounded-xl bg-white text-neutral-900 px-5 py-2 text-sm font-medium hover:bg-neutral-200 transition w-full" type="submit">
              {isSubmitting ? "Connexion..." : "Se connecter"}
            </button>

            <p className="text-sm text-neutral-400">Pas de compte ? <Link href="/register" className="underline-offset-4 hover:underline">Créer un compte</Link></p>
          </form>
        </div>
      </section>

      {/* Colonne droite: visuel produit + preuves sociales (identique à /register) */}
      <aside className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A] via-neutral-900 to-neutral-950" />
        <div className="absolute inset-0 bg-[radial-gradient(800px_600px_at_70%_30%,rgba(255,106,0,0.25),transparent)]" />
        <div className="relative h-full w-full flex flex-col justify-between p-10 lg:p-14">
          <div>
            <div className="text-white/90 text-5xl md:text-6xl font-semibold leading-tight tracking-tight">
              Accélérez vos <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-amber-2 00">décisions pricing</span>
            </div>
            <p className="mt-4 text-neutral-300 max-w-xl">Gagnez du temps, suivez vos performances et optimisez votre catalogue avec une plateforme sécurisée.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-neutral-300">
            <div className="flex items-center gap-2"><Lock className="w-4 h-4" /> Données chiffrées</div>
            <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Hébergement UE</div>
            <div className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> 14 jours d’essai</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Shopify • Amazon • Woo</div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {features.map((f) => (
              <div key={f} className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm text-white/90 px-4 py-3">{f}</div>
            ))}
          </div>
        </div>
      </aside>
    </main>
  );
}
