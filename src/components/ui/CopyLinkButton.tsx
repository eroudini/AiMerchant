"use client";
import React from "react";

export default function CopyLinkButton({ label = "Copier le lien" }: { label?: string }) {
  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = window.location.href;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  };
  return (
    <button onClick={onClick} className="rounded-lg border border-white/10 bg-white/0 px-3 py-2 text-sm">{label}</button>
  );
}
