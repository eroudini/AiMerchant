# AIMerchant ETL Service

Connecteurs Amazon SP-API et Shopify. Ingestion idempotente + rejouable vers le schéma unifié (PostgreSQL + Timescale).

## Structure

- src/connectors/amazon: client + mapping (listings, products, sales)
- src/connectors/shopify: client + mapping (catalog, orders, returns)
- src/pipelines: orchestration + upserts
- src/lib: db (pg), logger (pino), metrics (prom-client), rateLimiter (bottleneck)
- __tests__/etl: tests d'intégration (mocks HTTP via nock)
- cron.yaml: jobs horaires
- airflow/dags/etl_aimerchant.py: DAG horaire (exemple)

## Démarrage

```powershell
cd services/etl-svc
copy .env.example .env  # éditez les secrets
npm ci
npm run etl.run -- shopify  # ou amazon
```

Variables d'env clés (cf. `.env.example`): DATABASE_URL, ACCOUNT_ID, COUNTRY, SHOPIFY_SHOP, SHOPIFY_ACCESS_TOKEN, AMAZON_ACCESS_TOKEN.

### Mode MOCK (dév/CI sans appels externes)

Pour exécuter les pipelines sans contacter Amazon/Shopify, activez le mode MOCK:

```powershell
$env:MOCK = '1'
npm run etl.run -- shopify  # ou amazon
Remove-Item Env:MOCK  # pour désactiver
```

En mode MOCK, les connecteurs renvoient des jeux de données synthétiques cohérents avec le schéma unifié. Utile en CI ou hors connexion.

## Métriques Prometheus

- Endpoint: `http://localhost:9464/metrics`
- Compteurs: `etl_rows_processed_total`, `etl_errors_total`
- Histogramme: `etl_run_duration_seconds`

## Idempotence & Rejouabilité

- Upserts SQL (ON CONFLICT) pour `product`, `listing`, `sales_ts`, `fees_ts`.
- Watermarks par `(source, table, account_id)` dans `etl.watermarks`.
- Rejouer un flux: supprimer le watermark ou réduire `cursor_ts`.

## Tests

```powershell
npm test
```

## Planification

- cron.yaml: exécutions horaires (shopify :05, amazon :15)
- Airflow: DAG `etl_aimerchant_hourly` (amazon -> shopify)

## Notes

- Le client Amazon est un placeholder (mock). Branchez LWA + SigV4 pour prod.
- Les endpoints Shopify utilisent l'API REST Admin (2024-10). Paginez et enrichissez selon vos besoins.
- Les pipelines écrivent au format unifié aligné avec les migrations de `db/`.
