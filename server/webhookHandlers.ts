import { getUncachableStripeClient } from './stripeClient';
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

    const stripe = await getUncachableStripeClient();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is required for webhook processing');
    }

    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

    switch (event.type) {
      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const subscription = event.data.object as any;
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
        const priceId = subscription.items?.data?.[0]?.price?.id;
        await WebhookHandlers.handleSubscriptionUpdate(customerId, subscription.id, subscription.status, priceId);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
        await WebhookHandlers.handleSubscriptionUpdate(customerId, subscription.id, 'canceled');
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer.id;
        const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
        if (subscriptionId) {
          const priceId = invoice.lines?.data?.[0]?.price?.id;
          await WebhookHandlers.handleSubscriptionUpdate(customerId, subscriptionId, 'active', priceId);
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer.id;
        const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
        if (subscriptionId) {
          await WebhookHandlers.handleSubscriptionUpdate(customerId, subscriptionId, 'past_due');
        }
        break;
      }
      default:
        break;
    }
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
