import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, isStripeConfigured } from "@/lib/stripe";

const PLANS = {
  monthly: { amount: 999, interval: "month" as const, label: "Premium mensuel" },
  yearly: { amount: 7900, interval: "year" as const, label: "Premium annuel" },
};

// Temporary: Premium is free while the catalog/reading experience is being tested — no Stripe
// checkout, the subscription activates immediately. Flip back to false to require real payment.
const SUBSCRIPTIONS_ARE_FREE = true;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "customer" || !session.user.email) {
    return NextResponse.json(
      { error: "Connecte-toi pour t'abonner à Premium." },
      { status: 401 }
    );
  }

  const { plan } = await req.json();
  const planConfig = PLANS[plan as keyof typeof PLANS];
  if (!planConfig) {
    return NextResponse.json({ error: "Offre invalide." }, { status: 400 });
  }

  const email = session.user.email;
  const customer = await prisma.customer.findUnique({ where: { email } });
  if (!customer) {
    return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
  }

  if (SUBSCRIPTIONS_ARE_FREE) {
    await prisma.subscription.upsert({
      where: { customerId: customer.id },
      update: { plan, status: "active" },
      create: { customerId: customer.id, plan, status: "active" },
    });
    return NextResponse.json({ url: "/profiles?subscribed=1" });
  }

  if (!isStripeConfigured || !stripe) {
    return NextResponse.json(
      {
        error:
          "Le paiement n'est pas encore configuré. Ajoute tes clés Stripe de test (STRIPE_SECRET_KEY) dans le fichier .env pour activer les abonnements.",
      },
      { status: 503 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? req.nextUrl.origin;

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: planConfig.amount,
          recurring: { interval: planConfig.interval },
          product_data: { name: planConfig.label },
        },
        quantity: 1,
      },
    ],
    metadata: { customerId: customer.id, plan },
    success_url: `${baseUrl}/account?subscribed=1`,
    cancel_url: `${baseUrl}/premium`,
  });

  await prisma.subscription.upsert({
    where: { customerId: customer.id },
    update: { plan, status: "incomplete" },
    create: { customerId: customer.id, plan, status: "incomplete" },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
