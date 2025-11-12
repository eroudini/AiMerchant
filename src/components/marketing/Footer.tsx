import Link from "next/link";
import { Instagram, Linkedin, Youtube, Twitter } from "lucide-react";

const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer
      className="mt-20 bg-gradient-to-b from-neutral-950 via-neutral-900 to-black"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">Pied de page</h2>

      {/* haut: colonnes + newsletter */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Colonnes navigation */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10 text-sm">
            {/* Company */}
            <div>
              <h3 className="text-neutral-200 tracking-widest text-xs font-semibold uppercase">Company</h3>
              <ul className="mt-4 space-y-3 text-neutral-400">
                <li><Link href="#" className="hover:text-white transition-colors">À propos</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Carrières</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Presse</Link></li>
                <li><Link href="/confidentialite" className="hover:text-white transition-colors">Politique de confidentialité</Link></li>
                <li><Link href="/conditions" className="hover:text-white transition-colors">Conditions d’utilisation</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-neutral-200 tracking-widest text-xs font-semibold uppercase">Support</h3>
              <ul className="mt-4 space-y-3 text-neutral-400">
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Tarifs</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Préférences cookies</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Remboursements & retours</a></li>
              </ul>
            </div>          
          </div>

          {/* Newsletter */}
          <div className="lg:pl-12 lg:border-l lg:border-white/15 text-neutral-100">
            <h3 className="tracking-widest text-base md:text-lg font-medium uppercase">Abonnez‑vous à notre newsletter</h3>
            <form className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-1 w-full">
              <label htmlFor="newsletter" className="sr-only">Email</label>
              <input
                id="newsletter"
                type="email"
                placeholder="votre@email.com"
                className="w-full flex-1 bg-transparent border-b border-neutral-500/60 focus:border-white outline-none px-0 py-2 placeholder:text-neutral-500 text-neutral-100"
              />
              <button
                type="button"
                className="shrink-0 rounded-xl border border-neutral-400/30 px-1 py-2 text-sm text-neutral-100 hover:bg-white hover:text-neutral-900 transition-colors"
              >
                S’inscrire
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* bas: logo + mention europe + copyright */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 text-center">
          <div className="text-neutral-300 text-2xl font-semibold tracking-[0.3em]">AIMERCHANT</div>
          <div className="mt-3 text-xs text-neutral-400">Développé en Europe 🇪🇺 — Hébergement UE • RGPD conforme</div>
          <div className="mt-2 text-xs text-neutral-500">&copy; {currentYear} AIMerchant</div>
        </div>
      </div>
    </footer>
  );
}
