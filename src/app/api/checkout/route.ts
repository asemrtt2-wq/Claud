import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, isStripeConfigured } from "@/lib/stripe";

// Temporary: purchases are free while the catalog/reading experience is being tested — no
// Stripe checkout, the order is marked paid immediately. Flip back to false to require payment.
const PURCHASES_ARE_FREE = true;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "customer" || !session.user.email) {
    return NextResponse.json(
      { error: "Connecte-toi pour acheter un eBook." },
      { status: 401 }
    );
  }

  const { ebookId } = await req.json();
  const email = session.user.email;

  if (!ebookId) {
    return NextResponse.json({ error: "ebookId est requis." }, { status: 400 });
  }

  const [ebook, customer] = await Promise.all([
    prisma.eBook.findUnique({ where: { id: ebookId } }),
    prisma.customer.findUnique({ where: { email } }),
  ]);

  if (!ebook || !customer) {
    return NextResponse.json({ error: "eBook introuvable." }, { status: 404 });
  }

  if (PURCHASES_ARE_FREE) {
    await prisma.order.create({
      data: {
        ebookId: ebook.id,
        customerId: customer.id,
        customerEmail: email,
        amount: ebook.price,
        status: "paid",
      },
    });
    return NextResponse.json({ url: `/ebooks/${ebook.slug}?purchased=1` });
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
      customerId: customer.id,
      customerEmail: email,
      amount: ebook.price,
      status: "pending",
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? req.nextUrl.origin;

  const checkoutSession = await stripe.checkout.sessions.create({
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
    data: { stripeSessionId: checkoutSession.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
