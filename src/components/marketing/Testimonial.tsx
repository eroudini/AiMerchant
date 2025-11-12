"use client";
import React, { useEffect, useRef, useState } from "react";

export default function Testimonial() {
	const ref = useRef<HTMLDivElement | null>(null);
	const [inView, setInView] = useState(false);

	useEffect(() => {
		if (!ref.current) return;
		const el = ref.current;
		const io = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (entry.isIntersecting) {
					setInView(true);
					io.disconnect();
				}
			},
			{ rootMargin: "-10% 0px -10% 0px", threshold: 0.2 }
		);
		io.observe(el);
		return () => io.disconnect();
	}, []);

	return (
		<section className="relative overflow-hidden py-24 px-6">
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-white/0 via-white/5 to-white/0"
			/>
			<div
				aria-hidden
				className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[720px] h-[720px] rounded-full bg-gradient-to-br from-orange-300/15 via-orange-200/5 to-transparent blur-3xl anim-float-slow"
			/>

			<div ref={ref} className="max-w-4xl mx-auto text-center relative">
				<div className="absolute -top-6 left-4 md:left-14 text-6xl md:text-7xl text-indigo-200/60 select-none">“</div>
				<div className="absolute -bottom-8 right-6 md:right-16 text-6xl md:text-7xl text-indigo-200/60 select-none">”</div>

				<blockquote
					className={`mx-auto text-[22px] md:text-[26px] leading-relaxed text-neutral-200 ${
						inView ? "anim-fade-up" : "opacity-0"
					}`}
				>
					« Avant AiMerchant nous passions des heures à estimer nos besoins de stock. Maintenant les alertes
					réassort et les suggestions de prix sont intégrées à notre routine quotidienne. »
				</blockquote>

				<div
					className={`mt-10 flex items-center justify-center gap-4 ${
						inView ? "anim-fade-up" : "opacity-0"
					}`}
					style={{ animationDelay: "120ms" }}
				>
					<div className="relative">
						<div className="w-12 h-12 rounded-full bg-orange-300/60 anim-pulse-ring" />
						<div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/40" />
					</div>
					<div className="text-sm text-neutral-400 text-left">
						<div className="font-medium text-white">Claire D.</div>
						<div>Responsable e‑commerce</div>
					</div>
				</div>
			</div>
		</section>
	);
}
