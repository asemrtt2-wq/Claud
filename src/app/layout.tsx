import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lumina — Remplace les écrans par des histoires qui te transforment",
  description:
    "L'application qui t'aide à reprendre le contrôle de ton temps grâce à des eBooks immersifs, interactifs et motivants.",
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
