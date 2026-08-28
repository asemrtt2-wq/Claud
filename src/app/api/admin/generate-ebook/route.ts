import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateEbookContent, isAiConfigured } from "@/lib/ebookGenerator";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  if (!isAiConfigured) {
    return NextResponse.json(
      {
        error:
          "La génération IA n'est pas configurée. Ajoute ANTHROPIC_API_KEY dans .env pour l'activer.",
      },
      { status: 503 }
    );
  }

  const { topic, audience } = await req.json();

  if (!topic || typeof topic !== "string" || !topic.trim()) {
    return NextResponse.json({ error: "Un sujet est requis." }, { status: 400 });
  }

  try {
    const draft = await generateEbookContent({
      topic: topic.trim(),
      audience: audience === "kids" ? "kids" : "adults",
    });
    return NextResponse.json({ draft });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Échec de la génération." },
      { status: 502 }
    );
  }
}
