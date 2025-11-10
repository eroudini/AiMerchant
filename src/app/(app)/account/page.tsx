import { redirect } from "next/navigation";

// Route legacy: redirection vers le nouveau segment /app/account.
export default function AccountPage() {
  redirect("/app/account");
}
