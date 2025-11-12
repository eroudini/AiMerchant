import Link from "next/link";

const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="border-t bg-white/80 backdrop-blur-sm mt-20" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Pied de page</h2>
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-sm">
          <div className="text-gray-700 flex flex-col gap-1">
            <span className="font-medium">Développé en Europe 🇪🇺</span>
            <span className="text-xs text-gray-500">Infrastructure hébergée UE • RGPD conforme</span>
          </div>
          <nav aria-label="Liens légaux" className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
            <Link href="/pricing" className="hover:text-gray-900 transition-colors">Tarifs</Link>
            <Link href="/conditions" className="hover:text-gray-900 transition-colors">Conditions</Link>
            <Link href="/confidentialite" className="hover:text-gray-900 transition-colors">Confidentialité</Link>
            <Link href="/contact" className="hover:text-gray-900 transition-colors">Contact</Link>
          </nav>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span>&copy; {currentYear} AIMerchant</span>
            <span className="hidden sm:inline">—</span>
            <span>Optimisation catalogue & pricing par IA</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center rounded-full border px-2 py-0.5 bg-gray-50">Bêta</span>
            <span className="inline-flex items-center rounded-full border px-2 py-0.5 bg-gray-50">Essai 14j</span>
            <span className="inline-flex items-center rounded-full border px-2 py-0.5 bg-gray-50">Hébergement UE</span>
            <span className="inline-flex items-center rounded-full border px-2 py-0.5 bg-gray-50">RGPD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
