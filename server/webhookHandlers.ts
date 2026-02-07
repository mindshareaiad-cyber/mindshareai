import { getStripeSync } from './stripeClient';
import { db } from './db';
import { userProfiles } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { getPlanByPriceId } from './plans';
import { sendPlanChangedEmail, sendCancellationEmail, sendPaymentFailedEmail } from './email-service';

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
      const [existingProfile] = await db.select().from(userProfiles)
        .where(eq(userProfiles.stripeCustomerId, customerId));

      const oldPriceId = existingProfile?.stripePriceId;
      const oldStatus = existingProfile?.subscriptionStatus;

      const updateData: Record<string, unknown> = {
        stripeSubscriptionId: subscriptionId,
        subscriptionStatus: status === 'active' || status === 'trialing' ? 'active' : status,
        updatedAt: new Date(),
      };
      
      if (priceId) {
        updateData.stripePriceId = priceId;
      }
      
      await db.update(userProfiles)
        .set(updateData)
        .where(eq(userProfiles.stripeCustomerId, customerId));

      if (existingProfile?.email) {
        const firstName = existingProfile.firstName || null;
        const email = existingProfile.email;

        if (status === 'canceled') {
          const planId = getPlanByPriceId(oldPriceId || null);
          sendCancellationEmail(email, firstName, planId).catch(() => {});
        } else if (status === 'past_due') {
          sendPaymentFailedEmail(email, firstName).catch(() => {});
        } else if ((status === 'active' || status === 'trialing') && priceId && oldPriceId && priceId !== oldPriceId && oldStatus === 'active') {
          const oldPlanId = getPlanByPriceId(oldPriceId);
          const newPlanId = getPlanByPriceId(priceId);
          if (oldPlanId !== newPlanId) {
            sendPlanChangedEmail(email, firstName, oldPlanId, newPlanId).catch(() => {});
          }
        }
      }
    } catch (error) {
      console.error('Error updating subscription status:', error);
    }
  }
}
