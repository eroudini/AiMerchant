"use client";
export default function QuickActions() {
  const actions = [
    { label: "Connecter marketplace", href: "#" },
    { label: "Générer recos", href: "#" },
    { label: "Voir pricing", href: "#" },
  ];
  return (
    <section className="card p-4">
      <h2 className="font-semibold mb-3">Actions rapides</h2>
      <div className="flex flex-col gap-2">
        {actions.map((a) => (
          <a key={a.label} href={a.href} className="rounded-xl border border-white/10 px-3 py-2 text-sm hover:bg-white/10 text-white/90">
            {a.label}
          </a>
        ))}
      </div>
    </section>
  );
}
