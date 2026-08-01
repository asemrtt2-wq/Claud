import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EBookstore — Découvrez vos eBooks préférés",
  description:
    "Débloquez votre plein potentiel grâce aux meilleurs eBooks : fitness, développement personnel, cuisine, bien-être et plus encore.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body
        style={{
          fontFamily:
            '-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif',
        }}
        className="antialiased"
      >
        {children}
      </body>
    </html>
  );
}
