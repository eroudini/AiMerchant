import Link from "next/link";

export default function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="border rounded-2xl p-6 text-center">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && <p className="text-gray-600 mb-3">{description}</p>}
      {action && (
        <Link className="btn-primary inline-block" href={action.href}>
          {action.label}
        </Link>
      )}
    </div>
  );
}
