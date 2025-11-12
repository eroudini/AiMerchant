"use client";
import React from "react";
import Image from "next/image";

export default function OrbVisual() {
  return (
    <div className="relative w-full aspect-square max-w-xl mx-auto">
      {/* Image fournie à la place du SVG, avec rotation continue */}
      <div className="absolute inset-0 rounded-full overflow-hidden shadow-2xl origin-center motion-safe:animate-[spin_60s_linear_infinite]">
        <Image
          src="/hero/banniere.png"
          alt="Orbe AIMerchant"
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 80vw, 40vw"
        />
      </div>
    </div>
  );
}
