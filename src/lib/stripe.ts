import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;

export const isStripeConfigured = Boolean(key && !key.includes("placeholder"));

export const stripe = isStripeConfigured
  ? new Stripe(key as string)
  : null;
