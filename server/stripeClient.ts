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

// SECURITY: Secret key getter removed - secret keys should never be exposed or returned
// The secret key is only used internally by getUncachableStripeClient() and getStripeSync()

let stripeSync: any = null;

export async function getStripeSync() {
  if (!stripeSync) {
    const { StripeSync } = await import('stripe-replit-sync');

    stripeSync = new StripeSync({
      poolConfig: {
        connectionString: process.env.DATABASE_URL!,
        max: 2,
      },
      stripeSecretKey: secretKey!,
    });
  }
  return stripeSync;
}
