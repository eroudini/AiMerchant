"use client";
import { toast } from "sonner";
import { apiClient } from "@/lib/api.client";
import { useAuthStore } from "@/lib/auth-store";

export default function DangerZonePage() {
  const logout = useAuthStore((s) => s.logout);

  const onDelete = async () => {
    const ok = window.confirm("Supprimer définitivement votre compte ? Cette action est irréversible.");
    if (!ok) return;
    try {
      await apiClient.post("/auth/logout");
      logout();
      toast.success("Compte supprimé (démo). Vous avez été déconnecté.");
      window.location.href = "/";
    } catch (e) {
      toast.error("Échec de la suppression");
    }
  };

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-2xl font-semibold">Zone de danger</h1>
      <div className="border border-red-400/40 bg-red-500/10 rounded-2xl p-4">
        <h2 className="font-medium mb-1 text-red-200">Supprimer le compte</h2>
        <p className="text-sm text-red-300 mb-3">Cette action est irréversible et supprimera vos données (démo).</p>
        <button onClick={onDelete} className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-white hover:bg-red-500">
          Supprimer mon compte
        </button>
      </div>
    </div>
  );
}
