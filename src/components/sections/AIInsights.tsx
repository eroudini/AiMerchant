"use client";
import React from "react";
import { Bot } from "lucide-react";
import { aiTips } from "@/data/mock";

export function AIInsights() {
  return (
    <section className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Bot className="w-4 h-4 text-[color:var(--brand)]" />
        <h2 className="font-semibold">Recommandations IA</h2>
      </div>
      <ul className="list-disc pl-5 space-y-2 text-sm">
        {aiTips.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
    </section>
  );
}

export default AIInsights;
