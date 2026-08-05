import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Nom, email et mot de passe sont requis." },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Le mot de passe doit contenir au moins 8 caractères." },
      { status: 400 }
    );
  }

  const existing = await prisma.customer.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Un compte existe déjà avec cet email." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.customer.create({
    data: {
      name,
      email,
      passwordHash,
      profiles: {
        create: {
          name,
          avatarEmoji: "🙂",
          color: "purple",
          type: "adult",
        },
      },
    },
  });

  return NextResponse.json({ ok: true });
}
