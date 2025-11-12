export default function Loader({ label = "Chargement..." }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600" role="status" aria-live="polite">
      <div className="h-4 w-4 rounded-full border-2 border-gray-300 border-t-[color:var(--brand)] animate-spin" />
      {label}
    </div>
  );
}
