/**
 * Seed script to create the AEO Dashboard subscription product in Stripe
 * Run with: npx tsx scripts/seed-stripe-products.ts
 */

import Stripe from 'stripe';

async function seedProducts() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is required');
  }

  console.log('Connecting to Stripe...');
  const stripe = new Stripe(secretKey);

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
      console.log('\nIMPORTANT: Update the PRICE_ID in client/src/pages/payment.tsx with:', prices.data[0].id);
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
