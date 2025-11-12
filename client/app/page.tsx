// import React from "react";
// import { Sparkles, BarChart3, LineChart, AlertTriangle, MessageSquare, TrendingUp } from "lucide-react";

// export default function Home() {
//   const features = [
//     { icon: BarChart3, title: "Réassort intelligent", desc: "Anticipez les ruptures et optimisez vos niveaux de stock sur 7 à 30 jours." },
//     { icon: LineChart, title: "Pricing dynamique", desc: "Ajustements guidés par la concurrence et la marge cible (15–25%)." },
//     { icon: TrendingUp, title: "Optimisation marge", desc: "Détecte produits sous-performants et propose hausses stratégiques." },
//     { icon: MessageSquare, title: "Copilot conversationnel", desc: "Posez vos questions métier et recevez des conseils exploitables immédiatement." },
//     { icon: Sparkles, title: "Insights actionnables", desc: "Actions priorisées: réassort, prix, SEO fiches produit." },
//     { icon: AlertTriangle, title: "Alertes en temps réel", desc: "Stock bas, marge faible, anomalies de vente." },
//   ];

//   const stats = [
//     { label: "Marge moyenne", value: "+12%" },
//     { label: "Ruptures évitées", value: "-30%" },
//     { label: "Temps analyse", value: "÷4" },
//   ];

//   return (
//     <main className="min-h-screen flex flex-col">
//       {/* Hero */}
//       <section className="relative overflow-hidden py-24 px-6 md:px-12 bg-gradient-to-br from-indigo-50 via-white to-white">
//         <div className="max-w-3xl mx-auto text-center space-y-6">
//           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium">
//             <Sparkles className="w-3 h-3" /> IA appliquée au retail
//           </div>
//           <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
//             Le copilote qui augmente vos ventes et votre marge
//           </h1>
//             <p className="text-lg text-gray-600">
//               AiMerchant analyse votre catalogue, la vitesse de vente et la concurrence pour prioriser
//               réassort, ajustements de prix et optimisations produit.
//             </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
//             <a href="/login" className="px-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-medium shadow hover:bg-indigo-500">
//               Démarrer ➜
//             </a>
//             <a href="#features" className="px-6 py-3 rounded-xl border border-gray-300 text-sm font-medium hover:bg-gray-50">
//               Voir les fonctionnalités
//             </a>
//           </div>
//         </div>
//       </section>

//       {/* Logos confiance placeholder */}
//       <section className="py-10 px-6">
//         <div className="max-w-5xl mx-auto text-center space-y-4">
//           <p className="text-xs uppercase tracking-wide text-gray-500">Déjà adopté par des e-commerçants exigeants</p>
//           <div className="grid grid-cols-2 md:grid-cols-5 gap-6 opacity-70">
//             {["NovaShop","Electro+","Maison&Co","Batterix","CablePro"].map(b => (
//               <div key={b} className="text-sm font-semibold text-gray-400">{b}</div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Features */}
//       <section id="features" className="py-20 px-6 bg-gray-50">
//         <div className="max-w-6xl mx-auto">
//           <h2 className="text-2xl md:text-3xl font-semibold text-center mb-12">Tout ce qu'il faut pour piloter votre catalogue</h2>
//           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//             {features.map(f => {
//               const Icon = f.icon;
//               return (
//                 <div key={f.title} className="card p-5 border rounded-xl bg-white flex flex-col gap-3">
//                   <div className="flex items-center gap-2">
//                     <Icon className="w-4 h-4 text-indigo-600" />
//                     <h3 className="font-medium">{f.title}</h3>
//                   </div>
//                   <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </section>

//       {/* Stats */}
//       <section className="py-16 px-6">
//         <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-3">
//           {stats.map(s => (
//             <div key={s.label} className="card p-6 rounded-xl border flex flex-col items-center text-center gap-2">
//               <div className="text-3xl font-bold text-indigo-600">{s.value}</div>
//               <div className="text-xs uppercase tracking-wide text-gray-500">{s.label}</div>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* Témoignage */}
//       <section className="py-20 px-6 bg-gradient-to-b from-white to-indigo-50">
//         <div className="max-w-3xl mx-auto text-center space-y-6">
//           <blockquote className="text-lg text-gray-700 leading-relaxed">
//             « Avant AiMerchant nous passions des heures à estimer nos besoins de stock. Maintenant les alertes
//             réassort et les suggestions de prix sont intégrées à notre routine quotidienne. »
//           </blockquote>
//           <div className="flex items-center justify-center gap-3">
//             <div className="w-10 h-10 rounded-full bg-indigo-200" />
//             <div className="text-sm text-gray-600 text-left">
//               <div className="font-medium">Claire D.</div>
//               <div>Responsable e-commerce</div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* CTA finale */}
//       <section className="py-24 px-6">
//         <div className="max-w-4xl mx-auto bg-indigo-600 text-white rounded-2xl p-12 flex flex-col md:flex-row gap-8 items-center justify-between">
//           <div className="space-y-3">
//             <h2 className="text-2xl font-semibold">Passez à un pilotage pro en quelques minutes</h2>
//             <p className="text-sm text-indigo-100">Importez votre catalogue et laissez l'IA prioriser vos actions à ROI rapide.</p>
//           </div>
//           <a href="/login" className="px-6 py-3 rounded-xl bg-white text-indigo-600 font-medium text-sm shadow hover:bg-indigo-50">
//             Essayer maintenant
//           </a>
//         </div>
//       </section>
//     </main>
//   );
// }