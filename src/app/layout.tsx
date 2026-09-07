import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

/**
 * Site-wide defaults. `metadataBase` makes every relative URL a page declares (canonical,
 * Open Graph image) resolve against the real domain, and the `title.template` gives each
 * page a distinct browser/search title without repeating the brand in every file.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Lumia — des iBooks courts pour apprendre chaque jour",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Lumia réunit des iBooks courts et concrets à lire depuis ton navigateur : culture, mental, sciences, bien-être. Profils multiples, mode enfant et lecture illimitée avec Premium.",
  applicationName: SITE_NAME,
  keywords: [
    "ebook",
    "livre numérique",
    "lecture en ligne",
    "développement personnel",
    "bibliothèque numérique",
    "livre audio",
    "Lumia",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "fr_FR",
    url: SITE_URL,
    title: "Lumia — des iBooks courts pour apprendre chaque jour",
    description:
      "Des iBooks courts et concrets à lire depuis ton navigateur. Profils multiples, mode enfant, lecture illimitée avec Premium.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumia — des iBooks courts pour apprendre chaque jour",
    description: "Des iBooks courts et concrets à lire depuis ton navigateur.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

/* `viewport-fit=cover` lets the reader's safe-area padding actually reach the notch area,
   and the theme color matches the dark shell so mobile browser chrome doesn't flash white. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0918" },
    { media: "(prefers-color-scheme: light)", color: "#f7f6fb" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "fr-FR",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/bibliotheque?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="fr">
      <body
        style={{
          fontFamily:
            '-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif',
        }}
        className="antialiased"
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
