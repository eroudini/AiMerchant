"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Recommendation = {
  id: string;
  account_id: string;
  product_code: string | null;
  country: string | null;
  type: string;
  status: string;
  payload: any;
  note: string | null;
  created_at: string;
};

const BFF = process.env.NEXT_PUBLIC_BFF_URL || "http://localhost:4200";
const ACCOUNT_ID = process.env.NEXT_PUBLIC_ACCOUNT_ID || "acc-1";

export default function OptimizerPage() {
  const [country, setCountry] = useState("FR");
  const [horizonDays, setHorizonDays] = useState(14);
  const [minCover, setMinCover] = useState(7);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [recomputeIdsText, setRecomputeIdsText] = useState("");
  const anySelected = useMemo(() => Object.values(selected).some(Boolean), [selected]);

  async function loadRecs() {
    setListLoading(true);
    try {
      const res = await fetch(`${BFF}/api/actions/recommendations?status=draft&type=po&country=${encodeURIComponent(country)}`, {
        headers: { "x-account-id": ACCOUNT_ID },
      });
      const data = await res.json();
      setRecs(Array.isArray(data) ? data : []);
      setSelected({});
    } finally {
      setListLoading(false);
    }
  }

  useEffect(() => {
    loadRecs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  async function onGenerate() {
    setLoading(true);
    try {
      await fetch(`${BFF}/api/actions/recommendations/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-account-id": ACCOUNT_ID },
        body: JSON.stringify({ horizon_days: horizonDays, min_days_cover: minCover, country }),
      });
      await loadRecs();
    } finally {
      setLoading(false);
    }
  }

  async function onExecute() {
    const ids = Object.entries(selected).filter(([, v]) => v).map(([k]) => k);
    if (!ids.length) return;
    setLoading(true);
    try {
      await fetch(`${BFF}/api/actions/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-account-id": ACCOUNT_ID },
        body: JSON.stringify({ ids, note: "execute-from-ui" }),
      });
      await loadRecs();
    } finally {
      setLoading(false);
    }
  }

  const recomputeTargetIds = useMemo(() => {
    const typed = recomputeIdsText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => !!s);
    if (typed.length) return typed;
    const selectedIds = new Set(Object.entries(selected).filter(([, v]) => v).map(([k]) => k));
    if (!selectedIds.size) return [] as string[];
    const codes = recs
      .filter((r) => selectedIds.has(r.id))
      .map((r) => r.product_code)
      .filter((v): v is string => !!v);
    return Array.from(new Set(codes));
  }, [recomputeIdsText, selected, recs]);

  async function onRecompute() {
    if (!recomputeTargetIds.length) return;
    setLoading(true);
    try {
      await fetch(`${BFF}/api/forecast/recompute`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-account-id": ACCOUNT_ID },
        body: JSON.stringify({ product_ids: recomputeTargetIds, horizon_days: horizonDays }),
      });
      // Enchaîne automatiquement avec la génération de recommandations,
      // puis recharge la liste.
      await fetch(`${BFF}/api/actions/recommendations/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-account-id": ACCOUNT_ID },
        body: JSON.stringify({ horizon_days: horizonDays, min_days_cover: minCover, country }),
      });
      await loadRecs();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Optimiseur – Réassort</h1>

      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="text-sm text-gray-600">Pays</label>
            <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="FR" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Horizon (jours)</label>
            <Input type="number" min={1} value={horizonDays} onChange={(e) => setHorizonDays(parseInt(e.target.value || "1", 10))} />
          </div>
          <div>
            <label className="text-sm text-gray-600">Couverture min (jours)</label>
            <Input type="number" min={1} value={minCover} onChange={(e) => setMinCover(parseInt(e.target.value || "1", 10))} />
          </div>
          <div>
            <label className="text-sm text-gray-600">Produits à recalculer (CSV)</label>
            <Input value={recomputeIdsText} onChange={(e) => setRecomputeIdsText(e.target.value)} placeholder="SKU1,SKU2 (ou sélectionner dans la liste)" />
          </div>
          <div className="flex gap-2">
            <Button onClick={onGenerate} disabled={loading}>
              {loading ? "Génération…" : "Générer les recommandations"}
            </Button>
            <Button onClick={onRecompute} disabled={loading || !recomputeTargetIds.length}>
              {loading ? "Recompute…" : "Recompute Forecast"}
            </Button>
            <Button onClick={onExecute} disabled={loading || !anySelected}>
              {loading ? "Exécution…" : "Exécuter la sélection"}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-0 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2">Sel.</th>
              <th className="p-2 text-left">Produit</th>
              <th className="p-2">Pays</th>
              <th className="p-2">Statut</th>
              <th className="p-2">Demand/Avg/Stock</th>
              <th className="p-2">Quantité suggérée</th>
              <th className="p-2">Note</th>
              <th className="p-2">Créé</th>
            </tr>
          </thead>
          <tbody>
            {listLoading ? (
              <tr><td className="p-4" colSpan={8}>Chargement…</td></tr>
            ) : recs.length === 0 ? (
              <tr><td className="p-4" colSpan={8}>Aucune recommandation</td></tr>
            ) : (
              recs.map((r) => {
                const p = r.payload || {};
                return (
                  <tr key={r.id} className="border-t">
                    <td className="p-2 text-center">
                      <input type="checkbox" checked={!!selected[r.id]} onChange={(e) => setSelected((s) => ({ ...s, [r.id]: e.target.checked }))} />
                    </td>
                    <td className="p-2">{r.product_code || "—"}</td>
                    <td className="p-2 text-center">{r.country || "—"}</td>
                    <td className="p-2 text-center">{r.status}</td>
                    <td className="p-2 text-center">
                      {p.demand_horizon ?? "?"} / {p.avg_daily ?? "?"} / {p.stock ?? "?"}
                    </td>
                    <td className="p-2 text-center">{p.suggested_qty ?? "?"}</td>
                    <td className="p-2 max-w-[24rem] truncate" title={r.note || ""}>{r.note || ""}</td>
                    <td className="p-2 text-center">{new Date(r.created_at).toLocaleString()}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
