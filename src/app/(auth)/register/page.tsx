"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { apiClient } from "@/lib/api.client";
import { toast } from "sonner";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ShieldCheck, Lock, Sparkles, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const [features, setFeatures] = useState<string[]>([]);
  const { register, handleSubmit, trigger, getValues, formState: { errors, isSubmitting } } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema), mode: "onTouched" });

  const steps = useMemo(() => ([
    { key: "firstName", label: "Commençons simplement, quel est votre prénom ?", placeholder: "Prénom", type: "text" as const },
    { key: "lastName", label: "Et votre nom ?", placeholder: "Nom", type: "text" as const },
    { key: "company", label: "Comment s’appelle votre entreprise ?", placeholder: "Entreprise", type: "text" as const },
    { key: "email", label: "Quelle est votre adresse e‑mail ?", placeholder: "email@exemple.com", type: "email" as const },
    { key: "password", label: "Créez votre mot de passe", placeholder: "••••••••", type: "password" as const },
    { key: "confirmPassword", label: "Confirmez votre mot de passe", placeholder: "••••••••", type: "password" as const },
  ]), []);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    apiClient.get("/ai/insights").then((res) => setFeatures((res.data as any[]).map((x) => x.title).slice(0, 4))).catch(() => setFeatures(["Insights IA", "Moteur de pricing", "Alertes", "Prévisions"]));
  }, []);

  const onSubmit = async (values: RegisterInput) => {
    try {
      const payload = { company: values.company, firstName: values.firstName, lastName: values.lastName, email: values.email, password: values.password };
      const res = await apiClient.post("/auth/register", payload);
      if ((res.data as any)?.requiresEmailVerification) {
        toast.success("Inscription réussie. Vérifiez votre email.");
      } else {
        toast.success("Inscription réussie.");
      }
      window.location.href = "/login";
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Échec de l'inscription");
    }
  };

  // Avancement
  const total = steps.length + 1; // +1 pour consentement RGPD
  const progress = ((idx + 1) / total) * 100;

  const goNext = async () => {
    if (idx < steps.length) {
      const ok = await trigger(steps[idx].key as keyof RegisterInput);
      if (!ok) return;
      setIdx((v) => Math.min(v + 1, steps.length));
    } else {
      // étape RGPD -> submit
      const okAll = await trigger();
      if (!okAll) return;
      handleSubmit(onSubmit)();
    }
  };
  const goPrev = () => setIdx((v) => Math.max(0, v - 1));

  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-neutral-950 text-neutral-100">
      {/* Colonne gauche: onboarding */}
      <section className="relative flex items-center">
        <div className="w-full max-w-xl mx-auto px-8 py-16">
          <div className="text-xs tracking-widest text-neutral-400 mb-6">{idx + 1} SUR {total}
            <div className="mt-2 h-1 w-full bg-neutral-800 rounded">
              <div className="h-1 bg-white rounded" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-semibold leading-tight">{
            idx < steps.length ? steps[idx].label : "Dernière étape : consentement RGPD"
          }</h1>
          <p className="mt-3 text-sm text-neutral-400">Quelques infos pour personnaliser votre expérience AiMerchant.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-10">
            {idx < steps.length ? (
              <div>
                <label className="sr-only" htmlFor={steps[idx].key}>{steps[idx].label}</label>
                <input
                  id={steps[idx].key}
                  type={steps[idx].type}
                  placeholder={steps[idx].placeholder}
                  className="w-full bg-transparent border-0 border-b border-neutral-700 focus:border-white focus:ring-0 text-lg placeholder:text-neutral-500 py-3"
                  {...register(steps[idx].key as keyof RegisterInput)}
                  defaultValue={getValues(steps[idx].key as keyof RegisterInput) as any}
                />
                {errors[steps[idx].key as keyof RegisterInput] && (
                  <p className="mt-2 text-sm text-red-400">{(errors as any)[steps[idx].key]?.message}</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <label className="inline-flex items-center gap-3 text-sm">
                  <input type="checkbox" className="accent-white" {...register("rgpd")} />
                  J’accepte le traitement de mes données (RGPD)
                </label>
                {errors.rgpd && <p className="text-sm text-red-400">{errors.rgpd.message as string}</p>}
              </div>
            )}

            <div className="mt-8 flex items-center gap-3">
              <button type="button" onClick={goPrev} disabled={idx === 0 || isSubmitting} className="rounded-xl border border-neutral-700 px-4 py-2 text-sm text-neutral-200 disabled:opacity-40">Retour</button>
              <button type="button" onClick={goNext} disabled={isSubmitting} className="rounded-xl bg-white text-neutral-900 px-5 py-2 text-sm font-medium hover:bg-neutral-200 transition">
                {idx < steps.length ? "Suivant" : (isSubmitting ? "Création..." : "Créer mon compte")}
              </button>
            </div>

            <p className="mt-6 text-sm text-neutral-400">Déjà inscrit ? <Link href="/login" className="underline-offset-4 hover:underline">Se connecter</Link></p>
          </form>
        </div>
      </section>

      {/* Colonne droite: visuel produit + preuves sociales */}
      <aside className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A] via-neutral-900 to-neutral-950" />
        <div className="absolute inset-0 bg-[radial-gradient(800px_600px_at_70%_30%,rgba(255,106,0,0.25),transparent)]" />
        <div className="relative h-full w-full flex flex-col justify-between p-10 lg:p-14">
          <div>
            <div className="text-white/90 text-5xl md:text-6xl font-semibold leading-tight tracking-tight">
              Pilotez vos <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-amber-200">investissements retail</span>
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
