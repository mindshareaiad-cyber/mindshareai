import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY;
const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;

if (!secretKey) {
  console.warn('STRIPE_SECRET_KEY not set');
}

export async function getUncachableStripeClient() {
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is required');
  }
  return new Stripe(secretKey);
}

export async function getStripePublishableKey() {
  if (!publishableKey) {
    throw new Error('STRIPE_PUBLISHABLE_KEY is required');
  }
  return publishableKey;
}
