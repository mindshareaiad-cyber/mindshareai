import { getStripeSync } from './stripeClient';
import { db } from './db';
import { userProfiles } from '@shared/schema';
import { eq } from 'drizzle-orm';

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'This usually means express.json() parsed the body before reaching this handler. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    const sync = await getStripeSync();
    await sync.processWebhook(payload, signature);
  }

  static async handleSubscriptionUpdate(customerId: string, subscriptionId: string, status: string, priceId?: string) {
    try {
      const updateData: Record<string, unknown> = {
        stripeSubscriptionId: subscriptionId,
        subscriptionStatus: status === 'active' || status === 'trialing' ? 'active' : status,
        updatedAt: new Date(),
      };
      
      // Store price ID for plan tier detection
      if (priceId) {
        updateData.stripePriceId = priceId;
      }
      
      await db.update(userProfiles)
        .set(updateData)
        .where(eq(userProfiles.stripeCustomerId, customerId));
    } catch (error) {
      console.error('Error updating subscription status:', error);
    }
  }
}
