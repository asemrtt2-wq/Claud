const key = process.env.ANTHROPIC_API_KEY;

export const isAiConfigured = Boolean(key && !key.includes("placeholder"));

export type EbookDraft = {
  title: string;
  subtitle: string;
  description: string;
  author: string;
  publishedYear: number;
  category: string;
  coverEmoji: string;
  coverTheme: string;
  price: number;
  content: string;
};

const THEMES = ["royal", "navy", "deep", "dark", "steel"];

function stripCodeFence(text: string) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenced ? fenced[1] : trimmed;
}

export async function generateEbookContent({
  topic,
  audience,
}: {
  topic: string;
  audience: "adults" | "kids";
}): Promise<EbookDraft> {
  if (!isAiConfigured) {
    throw new Error(
      "La génération IA n'est pas configurée. Ajoute ANTHROPIC_API_KEY dans .env pour l'activer."
    );
  }

  const lengthGuidance =
    audience === "kids"
      ? "un court livre pour enfants (3 à 4 chapitres courts, ton simple et bienveillant, environ 120 à 200 mots par chapitre)"
      : "un livre pour adultes (5 à 8 chapitres, environ 250 à 400 mots par chapitre)";

  const prompt = `Tu es un générateur de contenu pour le catalogue d'une plateforme d'eBooks appelée Lumina.
Écris ${lengthGuidance} sur le sujet suivant : "${topic}".

Réponds UNIQUEMENT avec un objet JSON valide (aucun texte avant/après, aucune balise markdown), avec exactement ces clés :
{
  "title": "titre du livre",
  "subtitle": "sous-titre accrocheur en une phrase",
  "description": "résumé de 2 à 3 phrases",
  "author": "nom d'auteur plausible (invente-en un)",
  "publishedYear": 2024,
  "category": "une catégorie courte (ex: Développement personnel, Science-fiction, Cuisine...)",
  "coverEmoji": "un seul emoji représentatif de la couverture",
  "coverTheme": "un des thèmes suivants : ${THEMES.join(", ")}",
  "price": 9.99,
  "content": "le texte intégral du livre"
}

Dans le champ "content", découpe le texte en chapitres en commençant chaque chapitre par une ligne exactement au format "Chapitre N — Titre du chapitre" (avec un tiret cadratin —), suivie du texte du chapitre. Sépare les paragraphes par une ligne vide.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key as string,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Échec de la génération IA (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data?.content?.[0]?.text;
  if (typeof text !== "string") {
    throw new Error("Réponse IA vide ou inattendue.");
  }

  let parsed: Partial<EbookDraft>;
  try {
    parsed = JSON.parse(stripCodeFence(text));
  } catch {
    throw new Error("La réponse IA n'était pas un JSON valide.");
  }

  if (!parsed.title || !parsed.content) {
    throw new Error("La réponse IA est incomplète (titre ou contenu manquant).");
  }

  return {
    title: parsed.title,
    subtitle: parsed.subtitle ?? "",
    description: parsed.description ?? "",
    author: parsed.author ?? "",
    publishedYear: parsed.publishedYear ?? new Date().getFullYear(),
    category: parsed.category ?? "",
    coverEmoji: parsed.coverEmoji ?? "📘",
    coverTheme: THEMES.includes(parsed.coverTheme ?? "") ? (parsed.coverTheme as string) : "royal",
    price: audience === "kids" ? 0 : typeof parsed.price === "number" ? parsed.price : 9.99,
    content: parsed.content,
  };
}
