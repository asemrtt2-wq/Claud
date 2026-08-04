import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret || webhookSecret.includes("placeholder")) {
    return NextResponse.json(
      { error: "Stripe webhook non configuré." },
      { status: 503 }
    );
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Signature manquante." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.mode === "payment") {
      const orderId = session.metadata?.orderId;
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: "paid" },
        });
      }
    }

    if (session.mode === "subscription") {
      const customerId = session.metadata?.customerId;
      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : null;
      const stripeCustomerId =
        typeof session.customer === "string" ? session.customer : null;

      if (customerId) {
        await prisma.subscription.update({
          where: { customerId },
          data: {
            status: "active",
            stripeSubscriptionId: subscriptionId,
            stripeCustomerId,
          },
        });
      }
    }
  }

  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    const status = subscription.status === "active" ? "active" : "canceled";
    const currentPeriodEnd = (subscription as unknown as { current_period_end?: number })
      .current_period_end;

    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status,
        currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : undefined,
      },
    });
  }

  return NextResponse.json({ received: true });
}
