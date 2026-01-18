/**
 * Seed script to create the AEO Dashboard subscription product in Stripe
 * Run with: npx tsx scripts/seed-stripe-products.ts
 */

import Stripe from 'stripe';

async function getStripeClient() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? 'depl ' + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found');
  }

  const url = new URL(`https://${hostname}/api/v2/connection`);
  url.searchParams.set('include_secrets', 'true');
  url.searchParams.set('connector_names', 'stripe');
  url.searchParams.set('environment', 'development');

  const response = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
      'X_REPLIT_TOKEN': xReplitToken
    }
  });

  const data = await response.json();
  const connectionSettings = data.items?.[0];

  if (!connectionSettings?.settings?.secret) {
    throw new Error('Stripe connection not found');
  }

  return new Stripe(connectionSettings.settings.secret);
}

async function seedProducts() {
  console.log('Connecting to Stripe...');
  const stripe = await getStripeClient();

  // Check if product already exists
  const existingProducts = await stripe.products.search({ 
    query: "name:'AEO Dashboard Pro'" 
  });

  if (existingProducts.data.length > 0) {
    console.log('Product already exists:', existingProducts.data[0].id);
    
    // Check for existing price
    const prices = await stripe.prices.list({
      product: existingProducts.data[0].id,
      active: true,
    });
    
    if (prices.data.length > 0) {
      console.log('Price already exists:', prices.data[0].id);
      console.log('Stripe products are already seeded!');
      return;
    }
  }

  console.log('Creating AEO Dashboard Pro product...');
  
  // Create the product
  const product = await stripe.products.create({
    name: 'AEO Dashboard Pro',
    description: 'Full access to AI visibility tracking, gap analysis, and AEO recommendations',
    metadata: {
      features: 'Unlimited scans, 10 competitors, Gap analysis, AEO recommendations, Priority support',
    },
  });

  console.log('Created product:', product.id);

  // Create monthly price
  const monthlyPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: 4900, // $49.00
    currency: 'usd',
    recurring: { interval: 'month' },
    lookup_key: 'aeo_monthly',
    metadata: {
      plan: 'pro',
      billing: 'monthly',
    },
  });

  console.log('Created monthly price:', monthlyPrice.id);
  console.log('\nIMPORTANT: Update the PRICE_ID in client/src/pages/payment.tsx with:', monthlyPrice.id);
  
  console.log('\nStripe products seeded successfully!');
}

seedProducts().catch(console.error);
