import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ebooks = [
  {
    slug: "guide-transformation-90-jours",
    title: "Le Guide de la Transformation",
    subtitle: "Perdre du gras • Construire du muscle • Garder la motivation",
    description:
      "Le programme complet de 90 jours qui a déjà aidé des milliers de personnes à perdre du poids, retrouver confiance en elles et construire un physique dont elles sont fières. Plan nutrition, exercices détaillés et suivi de motivation quotidien inclus.",
    category: "Fitness & Santé",
    coverEmoji: "🏋️",
    coverTheme: "royal",
    price: 19,
    oldPrice: 79,
    featured: true,
  },
  {
    slug: "voyage-vers-les-etoiles",
    title: "Voyage vers les Étoiles",
    subtitle: "Explore l'univers et repousse tes limites",
    description:
      "Un carnet de voyage et d'astronomie pour rêveurs curieux : cartes du ciel, itinéraires d'observation et récits d'explorateurs pour redécouvrir l'émerveillement.",
    category: "Aventure & Voyage",
    coverEmoji: "🚀",
    coverTheme: "dark",
    price: 14,
    oldPrice: 24,
    featured: true,
  },
  {
    slug: "reussite-et-motivation",
    title: "Réussite & Motivation",
    subtitle: "Les clés mentales pour atteindre tes objectifs",
    description:
      "Un guide pratique de développement personnel pour construire une discipline durable, rester motivé sur la durée et transformer tes ambitions en résultats concrets.",
    category: "Développement personnel",
    coverEmoji: "⛰️",
    coverTheme: "deep",
    price: 16,
    oldPrice: null,
    featured: true,
  },
  {
    slug: "cuisine-familiale",
    title: "Cuisine Familiale",
    subtitle: "Des recettes simples et saines pour toute la famille",
    description:
      "Plus de 60 recettes healthy et rapides à préparer, pensées pour les familles pressées qui veulent bien manger sans y passer des heures.",
    category: "Cuisine & Nutrition",
    coverEmoji: "🍽️",
    coverTheme: "steel",
    price: 12,
    oldPrice: 18,
    featured: false,
  },
  {
    slug: "bien-etre-et-meditation",
    title: "Bien-Être & Méditation",
    subtitle: "Retrouve calme et clarté d'esprit au quotidien",
    description:
      "Des exercices de respiration, méditations guidées et rituels simples pour réduire le stress et cultiver la sérénité, même dans un emploi du temps chargé.",
    category: "Bien-être",
    coverEmoji: "🧘",
    coverTheme: "royal",
    price: 13,
    oldPrice: null,
    featured: false,
  },
  {
    slug: "secrets-de-productivite",
    title: "Secrets de Productivité",
    subtitle: "Organise ton temps et atteins tes objectifs plus vite",
    description:
      "Des méthodes concrètes de gestion du temps et de concentration, inspirées des meilleures pratiques, pour reprendre le contrôle de tes journées.",
    category: "Productivité",
    coverEmoji: "⚡",
    coverTheme: "deep",
    price: 15,
    oldPrice: 22,
    featured: false,
  },
];

async function main() {
  for (const ebook of ebooks) {
    await prisma.eBook.upsert({
      where: { slug: ebook.slug },
      update: ebook,
      create: ebook,
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.admin.upsert({
      where: { email: adminEmail },
      update: { passwordHash },
      create: { email: adminEmail, passwordHash },
    });
    console.log(`Admin account ready: ${adminEmail}`);
  } else {
    console.warn(
      "ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin account creation."
    );
  }

  console.log(`Seeded ${ebooks.length} eBooks.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
