🧠 AIMerchant

AIMerchant est une application SaaS propulsée par l’IA qui aide les commerçants à optimiser leurs ventes, et leurs marges.
Elle analyse vos données en temps réel et vous propose des recommandations intelligentes pour faire croître votre activité.

🚀 Fonctionnalités principales

📊 Tableau de bord intuitif avec indicateurs clés

🤖 Recommandations automatiques basées sur l’IA

🔔 Alertes intelligentes (baisse de ventes, marge faible, etc.)

💡 Suggestions de prix et stratégies marketing

🛠️ Tech Stack

Frontend : React + Tailwind + shadcn/ui
## Frontend (Next.js App Router)

Un nouveau squelette front est ajouté sous `src/` (App Router). Il coexiste avec l'ancien code dans `client/` sans interférer. L'entrée principale est `src/app`.

### Stack
Next.js, TypeScript, Tailwind, TanStack Query, axios, zod, react-hook-form, zustand, framer-motion, lucide-react, chart.js/react-chartjs-2, sonner.

### Démarrage

Installer les dépendances, puis lancer le dev server.

```powershell
npm install
npm run dev
```

Variables d'environnement minimales:

```
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
```

Si `NEXT_PUBLIC_API_BASE_URL` n'est pas défini, certains handlers `/api/**` renverront des données mock pour permettre l'affichage de base (KPIs, alertes, insights).

### Routes clés

- `/` Landing (src/app/(marketing)/page.tsx)
- `/login`, `/register`
- `/app/dashboard` (shell authentifié via middleware)

### Auth

Le middleware protège `/app/*` sur la présence du cookie `accessToken`. Côté client, l'état auth léger est stocké via Zustand (token + user) pour les intercepteurs axios.

Backend : Node.js / Express

IA : Intégration OpenAI pour les insights et recommandations
