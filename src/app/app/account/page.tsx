"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { me, fetchKpis, fetchAlerts } from "@/lib/fetchers";
import Link from "next/link";

// Schéma d'édition du profil utilisateur (champs étendus côté SaaS).
// Note: Le backend actuel ne supporte que la mise à jour email & mot de passe.
const profileSchema = z.object({
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  company: z.string().min(2, "Entreprise requise").optional().or(z.literal("")),
  email: z.string().email("Email invalide"),
});
type ProfileInput = z.infer<typeof profileSchema>;

interface ApiKeyItem { id: string; label: string; key: string; createdAt: string; }

export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [initial, setInitial] = useState<ProfileInput | null>(null);
  const [emailVerified, setEmailVerified] = useState<boolean>(false);
  const [plan] = useState<string>("Starter");
  const [usage, setUsage] = useState<{ products: number; alerts: number; suggestions: number }>({ products: 0, alerts: 0, suggestions: 0 });
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: "", lastName: "", company: "", email: "" }
  });

  useEffect(() => {
    (async () => {
      try {
        const u: any = await me();
        const kpis = await fetchKpis().catch(() => ({ revenue30d:0, orders30d:0, marginPct:0, alertsCount:0 }));
        const alerts = await fetchAlerts().catch(() => [] as any[]);
        // Simuler usage produits & suggestions (placeholders)
        setUsage({ products: 12, alerts: alerts.length, suggestions: 34 });
        setInitial({ firstName: u.firstName ?? "", lastName: u.lastName ?? "", company: u.company ?? "", email: u.email });
        setEmailVerified(!!u.emailVerified);
        reset({ firstName: u.firstName ?? "", lastName: u.lastName ?? "", company: u.company ?? "", email: u.email });
      } catch {
        toast.error("Impossible de charger le profil");
      } finally {
        setLoading(false);
      }
    })();
  }, [reset]);

  const onSubmit = async (values: ProfileInput) => {
    try {
      // Seul l'email est réellement envoyé au backend (limitation actuelle)
      if (values.email !== initial?.email) {
        const res = await fetch("/api/user/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: values.email }) });
        if (!res.ok) throw new Error("Échec mise à jour email");
      }
      toast.success("Profil enregistré");
      setInitial(values);
    } catch (e: any) {
      toast.error(e?.message || "Erreur sauvegarde");
    }
  };

  const generateApiKey = () => {
    const id = crypto.randomUUID();
    const key = `aim_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
    const item: ApiKeyItem = { id, label: `Clé ${apiKeys.length + 1}`, key, createdAt: new Date().toISOString() };
    setApiKeys((prev) => [...prev, item]);
    toast.success("Clé API générée");
  };

  const revokeApiKey = (id: string) => {
    setApiKeys((prev) => prev.filter(k => k.id !== id));
    toast.info("Clé révoquée");
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key).then(() => toast.success("Copié dans le presse-papier"));
  };

  return (
  <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Mon compte</h1>
  <span className={`inline-flex items-center gap-2 text-xs font-medium px-2 py-1 rounded-full border ${emailVerified ? 'border-green-400/40 text-green-200 bg-green-400/10' : 'border-amber-400/40 text-amber-200 bg-amber-400/10'}`}>{emailVerified ? 'Email vérifié' : 'Email non vérifié'}</span>
      </div>

      {/* Profil */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Profil</h2>
  <p className="text-sm text-neutral-300">Mettre à jour les informations publiques de votre compte. (Prénom, Nom, Entreprise locales – Email synchronisé backend)</p>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 max-w-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1" htmlFor="firstName">Prénom</label>
              <input id="firstName" className="w-full rounded-lg border px-3 py-2" aria-invalid={!!errors.firstName} {...register("firstName")} />
              {errors.firstName && <p className="text-xs text-red-600 mt-1">{errors.firstName.message as string}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" htmlFor="lastName">Nom</label>
              <input id="lastName" className="w-full rounded-lg border px-3 py-2" aria-invalid={!!errors.lastName} {...register("lastName")} />
              {errors.lastName && <p className="text-xs text-red-600 mt-1">{errors.lastName.message as string}</p>}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" htmlFor="company">Entreprise</label>
            <input id="company" className="w-full rounded-lg border px-3 py-2" aria-invalid={!!errors.company} {...register("company")} />
            {errors.company && <p className="text-xs text-red-600 mt-1">{errors.company.message as string}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" htmlFor="email">Email</label>
            <input id="email" type="email" className="w-full rounded-lg border px-3 py-2" aria-invalid={!!errors.email} {...register("email")} />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message as string}</p>}
          </div>
          <div className="flex gap-3">
            <button disabled={isSubmitting || loading} className="btn-primary px-5 py-2 rounded-lg" type="submit">{isSubmitting ? 'Sauvegarde...' : 'Enregistrer'}</button>
            <button type="button" disabled={isSubmitting || loading} className="px-5 py-2 rounded-lg border border-white/10 text-white/90 hover:bg-white/10" onClick={() => initial && reset(initial)}>Réinitialiser</button>
          </div>
        </form>
      </section>

      {/* Sécurité */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Sécurité</h2>
        <div className="grid gap-3 max-w-xl">
          <Link href="/app/account/change-email" className="flex items-center justify-between rounded-lg border border-white/10 p-3 hover:bg-white/10">
            <span className="text-sm">Changer l'email</span><span className="text-xs text-gray-500">Modifier l'adresse de connexion</span>
          </Link>
          <Link href="/app/account/change-password" className="flex items-center justify-between rounded-lg border border-white/10 p-3 hover:bg-white/10">
            <span className="text-sm">Changer le mot de passe</span><span className="text-xs text-gray-500">Mettre à jour votre secret</span>
          </Link>
          <Link href="/app/account/danger" className="flex items-center justify-between rounded-lg border border-white/10 p-3 hover:bg-white/10">
            <span className="text-sm text-red-600">Zone dangereuse</span><span className="text-xs text-red-500">Supprimer le compte</span>
          </Link>
        </div>
      </section>

      {/* Plan & usage */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Plan & usage</h2>
        <div className="rounded-xl border border-white/10 p-4 flex flex-col gap-4 max-w-xl bg-white/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Plan actuel</p>
              <p className="text-xs text-neutral-300">{plan} – fonctionnalités de base activées</p>
            </div>
            <Link href="/pricing" className="btn-primary px-4 py-2 rounded-lg text-sm">Upgrade</Link>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-xl font-semibold">{usage.products}</p>
              <p className="text-xs text-neutral-400">Produits</p>
            </div>
            <div className="space-y-1">
              <p className="text-xl font-semibold">{usage.alerts}</p>
              <p className="text-xs text-neutral-400">Alertes</p>
            </div>
            <div className="space-y-1">
              <p className="text-xl font-semibold">{usage.suggestions}</p>
              <p className="text-xs text-neutral-400">Suggestions prix</p>
            </div>
          </div>
        </div>
      </section>

      {/* API Keys (mock local) */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Clés API</h2>
        <p className="text-sm text-neutral-300 max-w-xl">Générez des clés pour accéder aux endpoints AIMerchant (mock local, non persisté). À implémenter côté backend plus tard.</p>
        <button type="button" onClick={generateApiKey} className="btn-primary px-4 py-2 rounded-lg text-sm">Nouvelle clé</button>
        <div className="grid gap-3 max-w-xl mt-2">
          {apiKeys.length === 0 && <p className="text-xs text-neutral-400">Aucune clé pour le moment.</p>}
          {apiKeys.map(k => (
            <div key={k.id} className="rounded-lg border border-white/10 p-3 flex flex-col gap-2 bg-white/5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{k.label}</span>
                <span className="text-xs text-neutral-400">{new Date(k.createdAt).toLocaleDateString()}</span>
              </div>
              <code className="text-xs break-all bg-white/10 p-2 rounded border border-white/10 text-white">{k.key}</code>
              <div className="flex gap-2">
                <button type="button" onClick={() => copyKey(k.key)} className="px-3 py-1 text-xs rounded border border-white/10 text-white/90 hover:bg-white/10">Copier</button>
                <button type="button" onClick={() => revokeApiKey(k.id)} className="px-3 py-1 text-xs rounded border border-red-400/40 text-red-300 hover:bg-red-500/10">Révoquer</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
