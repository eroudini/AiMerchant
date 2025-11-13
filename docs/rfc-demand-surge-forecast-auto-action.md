# RFC — Demand Surge Forecast & Auto-Action

Dernière mise à jour: 2025‑11‑13

## objectifs

- Anticiper les pics/creux de demande (7–60 jours) par produit/canal/pays avec signaux internes (ventes/stock/prix) et externes (tendances, saisonnalité, concurrents).
- Déclencher des alertes actionnables et proposer des actions automatiques sécurisées (PO, promo, prix) avec approbation.
- Offrir un tableau de bord prévisionnel (scénarios O/N/P) et une explication IA des drivers (confiance).

## non‑objectifs (v1)

- Connexions complètes à tous canaux EU (Amazon/Shopify/MPs) pour exécuter actions en dur: v1 propose d’abord des suggestions et un mode « simulateur ». Connecteurs réels pourront suivre par canal.
- Prévision intraday à l’heure près: v1 se limite au pas journalier.

## portée v1 (MVP)

- Horizon: 30 jours (extensible 60).
- Granularité: produit × pays × canal.
- Mises à jour: quotidiennes + recalcul sur événement (choc concurrent, rupture, promo planifiée).
- Signaux exogènes: calendrier jours fériés, saisonnalité, Google Trends/mots‑clés, mouvements concurrents agrégés.
- Sorties:
  - forecast(ŷ[t]) + intervalles O/N/P
  - surge score S[t] (hausse) / creux score C[t] (baisse)
  - risque de rupture (jours avant OOS) selon stock et lead time
  - recommandations: PO (qty, date), ajustement prix, promo/ad suggestion
  - explications: top features (SHAP) par décision

## architecture

1) Ingestion & Feature Store (TimescaleDB + Prisma)
- internal_ts: ventes journalières, prix, stock par produit/canal/pays
- external_signals: {date, productId?, country, signal_type, value}
  - holiday[COUNTRY], seasonal_index, google_trends[kw], competitor_delta
- continuous aggregates Timescale pour fenêtres (7/30/90j)

2) Forecasting Service
- Implémentation: microservice Python (FastAPI) pour modélisation (Prophet/XGBoost/LightGBM) avec variables exogènes.
- Interface: HTTP interne ou queue (BullMQ/Redis) appelée par le BFF.
- Sorties persistées: forecast_run, forecast_result, metrics (MAPE, wMAPE, P50/P90 coverage)

3) Surge Scoring & Alerts
- Règles: S[t] = f(Δŷ[t:t+H], élasticité prix, tendances, épuisement stock). Seuils adaptatifs (par catégorie).
- Création d’alertes et export CSV; webhook/sonner pour UI.

4) Auto‑Action Engine (suggestions → approvals → exécution)
- Heuristiques PO (newsvendor):
  - q* = F^{-1}(C_u / (C_u + C_o)) où C_u ≈ marge unitaire, C_o ≈ coût de surstock (intérêt + stockage)
- Ajustements prix: bandes ±X% selon élasticité/stock; garde‑fou min/max.
- Promo/ad: recommandation budget/objectif sur produits en hausse faible stock.
- Approvals, audit_log, dry‑run, rollback.

5) App UI (Next.js)
- /forecast: top surges, risques OOS, scénarios O/N/P, explainability, toggles d’automations par produit.

## schéma de données (prisma/timescale)

- external_signal(id, date, productId?, country, type, key?, value, source)
- forecast_run(id, startedAt, horizon, model, status, metrics_json)
- forecast_result(id, runId, productId, country, channel, date, yhat, yhat_p10, yhat_p50, yhat_p90, features_json)
- surge_event(id, productId, country, channel, startDate, endDate, surge_score, reason_json)
- action_recommendation(id, productId, type, params_json, validUntil, confidence, createdAt)
- action_log(id, recommendationId, status, approvedBy?, executedAt?, result_json)

Timescale hypertables pour séries (internal_ts, forecast_result) + continuous aggregates pour fenêtres mobiles.

## API (BFF)

- GET /bff/forecast/demand?productId=&country=&channel=&h=30
  - → { series: [{date, yhat, p10, p50, p90}], surgeScore[], oosRiskDays }
- GET /bff/forecast/surge?country=&channel=&h=30&limit=50
  - → { items: [{productId, surgeScore, startDate, reason}], updatedAt }
- POST /bff/actions/po { productId, qty, eta }
- POST /bff/actions/price { productId, deltaPct }
- GET /bff/actions/reco?productId=
- POST /bff/actions/approve { recommendationId }

DTOs class‑validator, auth middleware, rate limit per compte.

## pipeline & jobs

- cron ingestion daily: trends, holidays, competitor deltas (cache + retry)
- cron forecast daily + on‑demand (backfill possible)
- job scoring+alerts après forecast
- job suggestions/actions après alerts (priorisées par score)

## algorithmes (v1 suggéré)

- Baseline: Prophet (saisonnalité fortes, robustesse) + exogènes (regressors)
- Boosted trees (LightGBM/XGBoost) avec features windowed (lags, rolling means, promo flags, competitor indices)
- Sélection modèle par produit (champ metrics_json), fallback à baseline si données rares
- Explainability: SHAP valeurs pour top features (coût calcul limité aux top N produits)

## ux/ui

- Page /forecast
  - Carte « Top hausses 14j », « Risques de rupture 10j »
  - Table produits: score, date pic, stock J+, ETA fournisseur; boutons « Suggérer PO », « Ajuster prix »
  - Panneau Explication: top drivers (ex: trend, holiday, competitor Δ)
  - Scénarios O/N/P (p10/p50/p90)
  - Toggle Automation par produit (avec garde‑fous)

## sécurité & conformité

- Stockage clés API externes chiffrées (Key Vault/ENV) et quotas.
- Limiter Google Trends (caching, backoff). Respecter CGU/fournisseurs.
- RBAC pour actions sensibles; audit trail complet.

## métriques & KPIs

- Qualité: wMAPE, coverage p10/p90, drift
- Business: % alertes utiles, taux d’acceptation recommandations, uplift CA/marge, OOS évités
- Fiabilité: durée job, erreurs API, retry rates

## plan de livraison (4 semaines)

- S1: RFC + schéma + ingestion basique (holidays, competitors) + baseline Prophet offline
- S2: Service forecast + BFF endpoints + stockage résultats + page /forecast (liste top surges)
- S3: Scoring/alerts + reco PO/prix (simulateur) + approvals + audit
- S4: Explainability + optimisation MAPE + feature flags + bêta fermée

## risques & mitigations

- Données exogènes bruitées → lissage, winsorization, robust training
- Peu d’historique par produit → pooling par catégorie, fallback saisonnier
- Actions automatiques risquées → approvals par défaut, limites, dry‑run

## contrat minimal (extraits)

```http
GET /bff/forecast/surge?country=FR&h=30&limit=50
→ 200 { items: [ { productId, surgeScore, startDate, reason: {trends:+0.6, holiday:+0.2, competitor:-0.1} } ] }

GET /bff/forecast/demand?productId=123&country=FR&h=30
→ 200 { series: [ {date:"2025-11-14", yhat: 42, p10: 30, p90: 60} ], oosRiskDays: 11 }

POST /bff/actions/po { productId: 123, qty: 120, eta: "2025-12-01" }
→ 202 { recommendationId, status: "pending-approval" }
```

## formules

Newsvendor (ordre optimal):

- Coût de sous‑stock C_u, sur‑stock C_o
- Taux critique: ϕ = C_u / (C_u + C_o)
- Quantité optimale: q* = F^{-1}(ϕ)

Où F est la CDF de la demande prévue (p50/p90 permettent une approximation pratique en v1).

---

Annexe: extensions v2
- Connecteurs exécution Amazon/Shopify/Meta/Google Ads
- Forecast intraday pour canaux rapides
- Optimisation multi‑objectif (marge, cash, SLA)
