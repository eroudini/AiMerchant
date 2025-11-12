"use client";
import React, { useMemo } from "react";

export default function OrbVisual() {
  // Génère un motif de cercles pseudo‑aléatoires pour simuler l'orbe
  const circles = useMemo(() => {
    return Array.from({ length: 140 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const r = 46 + Math.random() * 42; // rayon
      const x = 50 + Math.cos(angle) * (r / 1.2);
      const y = 50 + Math.sin(angle) * (r / 1.2);
      const size = 1.2 + Math.random() * 1.8;
      return { x, y, size, id: i };
    });
  }, []);

  return (
    <div className="relative w-full aspect-square max-w-xl mx-auto">
      {/* Orbe qui tourne en continu (respecte les préférences reduced-motion) */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#1E1E1E] via-[#202020] to-[#262626] shadow-2xl overflow-hidden origin-center motion-safe:animate-[spin_60s_linear_infinite]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,106,0,0.35),transparent_65%)]" />
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
          {circles.map((c) => (
            <circle key={c.id} cx={c.x} cy={c.y} r={c.size} stroke="#FF6A00" strokeWidth={0.35} fill="none" opacity={0.8} />
          ))}
        </svg>
      </div>
      {/* Carte flottante (mock) */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-8 bg-white/90 backdrop-blur rounded-xl shadow-lg border w-[80%] p-4 text-[11px]">
        <div className="font-medium mb-2 text-xs">Analyse (mock)</div>
        <div className="grid grid-cols-4 gap-3">
          <div>
            <div className="text-gray-500">Visibilité</div>
            <div className="font-semibold flex items-center gap-1">28 <span className="text-green-600 text-[10px]">+1%</span></div>
          </div>
          <div>
            <div className="text-gray-500">Sentiment</div>
            <div className="font-semibold flex items-center gap-1">41 <span className="text-gray-600 text-[10px]">0%</span></div>
          </div>
          <div>
            <div className="text-gray-500">Position</div>
            <div className="font-semibold flex items-center gap-1">#6 <span className="text-green-600 text-[10px]">+1</span></div>
          </div>
          <div>
            <div className="text-gray-500">Mentions</div>
            <div className="flex gap-1">
              <div className="w-4 h-4 rounded-full bg-orange-200" />
              <div className="w-4 h-4 rounded-full bg-gray-300" />
              <div className="w-4 h-4 rounded-full bg-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
