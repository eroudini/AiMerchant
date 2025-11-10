import { redirect } from "next/navigation";

// Route legacy: redirection vers le nouveau segment /app/dashboard.
export default function DashboardPage() {
  redirect("/app/dashboard");
}
