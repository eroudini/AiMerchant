"use client";
import React, { useState, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";
import { generateAdvice, ChatMessage } from "@/lib/aiChat";

const starterPrompts = [
  "Réassort imminent ?",
  "Optimiser pricing concurrence",
  "Marge faible produits",
  "SEO fiches produit",
];

export default function AiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem("aim_chat_messages");
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as ChatMessage[];
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {}
      }
    }
    return [{ role: "assistant", content: "Bonjour 👋 Je peux vous aider sur le réassort, les prix, la marge ou le SEO produit." }];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("aim_chat_messages", JSON.stringify(messages));
    }
  }, [messages]);

  function send(userText: string) {
    if (!userText.trim()) return;
    const userMsg: ChatMessage = { role: "user", content: userText.trim() };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);
    // Mock génération
    setTimeout(() => {
      const advices = generateAdvice(userText).map((a) => `• ${a}`);
      const assistant: ChatMessage = { role: "assistant", content: advices.join("\n") };
      setMessages((m) => [...m, assistant]);
      setLoading(false);
    }, 400);
    setInput("");
  }

  function reset() {
    setMessages([{ role: "assistant", content: "Conversation réinitialisée. Posez une nouvelle question." }]);
  }

  return (
    <section className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-[color:var(--brand)]" />
        <h2 className="font-semibold">AiChat Conseiller</h2>
      </div>
      <div className="mb-2 flex flex-wrap gap-2">
        {starterPrompts.map((p) => (
          <button
            key={p}
            onClick={() => send(p)}
            className="text-xs px-2 py-1 rounded-full border hover:bg-gray-50"
            type="button"
          >
            {p}
          </button>
        ))}
        <button
          onClick={reset}
          type="button"
          className="text-xs px-2 py-1 rounded-full border border-red-300 text-red-600 hover:bg-red-50"
        >
          Reset
        </button>
      </div>
  <div className="h-56 overflow-y-auto border border-white/10 rounded-xl p-3 mb-3 text-sm space-y-3 chat-box bg-white/5">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`whitespace-pre-line ${m.role === "assistant" ? "text-gray-300" : "font-medium text-white"}`}
          >
            {m.content}
          </div>
        ))}
        {loading && <div className="text-xs text-gray-400 animate-pulse">Génération...</div>}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Demandez un conseil (ex: réassort câble USB-C)"
          className="flex-1 border rounded-xl px-3 py-2 text-sm bg-transparent placeholder:text-neutral-500 text-inherit"
        />
        <button
          type="submit"
          className="rounded-xl bg-[color:var(--brand)] text-white px-3 py-2 text-sm flex items-center gap-1 disabled:opacity-50"
          disabled={loading}
        >
          <Send className="w-4 h-4" />
          Envoyer
        </button>
      </form>
    </section>
  );
}
