import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe, isStripeConfigured } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const { ebookId, email } = await req.json();

  if (!ebookId || !email) {
    return NextResponse.json(
      { error: "ebookId et email sont requis." },
      { status: 400 }
    );
  }

  const ebook = await prisma.eBook.findUnique({ where: { id: ebookId } });
  if (!ebook) {
    return NextResponse.json({ error: "eBook introuvable." }, { status: 404 });
  }

  if (!isStripeConfigured || !stripe) {
    return NextResponse.json(
      {
        error:
          "Le paiement n'est pas encore configuré. Ajoute tes clés Stripe de test (STRIPE_SECRET_KEY) dans le fichier .env pour activer le paiement.",
      },
      { status: 503 }
    );
  }

  const order = await prisma.order.create({
    data: {
      ebookId: ebook.id,
      customerEmail: email,
      amount: ebook.price,
      status: "pending",
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? req.nextUrl.origin;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: Math.round(ebook.price * 100),
          product_data: {
            name: ebook.title,
            description: ebook.subtitle,
          },
        },
        quantity: 1,
      },
    ],
    metadata: { orderId: order.id },
    success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/cancel`,
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { stripeSessionId: session.id },
  });

  return NextResponse.json({ url: session.url });
}
