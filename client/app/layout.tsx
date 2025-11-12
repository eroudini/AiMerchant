import "@/app/globals.css";

export const metadata = {
  title: "AiMerchant",
  description: "Plateforme de gestion de commerce intelligent",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}