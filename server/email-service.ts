import { getUncachableResendClient } from './resend-client';
import { getPlan, type PlanId } from './plans';

const APP_NAME = 'Mindshare AI';
const SUPPORT_EMAIL = 'support@mindshare-ai.com';

function baseLayout(content: string, preheader: string = '') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${APP_NAME}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    body { margin: 0; padding: 0; background-color: #f4f4f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .wrapper { width: 100%; background-color: #f4f4f7; padding: 40px 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #6c3ce9 0%, #8b5cf6 100%); padding: 32px 40px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .body { padding: 40px; }
    .body h2 { color: #1a1a2e; font-size: 22px; font-weight: 700; margin: 0 0 16px; }
    .body p { color: #4a4a68; font-size: 15px; line-height: 1.7; margin: 0 0 16px; }
    .btn { display: inline-block; padding: 14px 32px; background-color: #6c3ce9; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; margin: 8px 0 24px; }
    .btn:hover { background-color: #5b2fd4; }
    .info-box { background-color: #f8f7ff; border: 1px solid #e8e4f8; border-radius: 6px; padding: 20px; margin: 16px 0 24px; }
    .info-box p { margin: 4px 0; color: #4a4a68; font-size: 14px; }
    .info-box strong { color: #1a1a2e; }
    .divider { border: none; border-top: 1px solid #e8e8ef; margin: 24px 0; }
    .footer { padding: 24px 40px; text-align: center; background-color: #fafafa; }
    .footer p { color: #9ca3af; font-size: 12px; line-height: 1.6; margin: 0 0 4px; }
    .footer a { color: #6c3ce9; text-decoration: none; }
    .preheader { display: none; max-width: 0; max-height: 0; overflow: hidden; mso-hide: all; }
  </style>
</head>
<body>
  <div class="preheader">${preheader}</div>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>${APP_NAME}</h1>
      </div>
      <div class="body">
        ${content}
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
        <p>Questions? <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function getAppUrl(): string {
  return process.env.APP_URL || 'http://localhost:5000';
}

// ============= Email Templates =============

function welcomeEmail(firstName: string | null): string {
  const name = firstName || 'there';
  const appUrl = getAppUrl();
  return baseLayout(`
    <h2>Welcome to ${APP_NAME}!</h2>
    <p>Hi ${name},</p>
    <p>Thanks for creating your account. You're now ready to discover how AI assistants talk about your brand and start improving your visibility.</p>
    <p>Here's what you can do next:</p>
    <div class="info-box">
      <p><strong>1. Complete onboarding</strong> &mdash; Tell us about your business and competitors</p>
      <p><strong>2. Add prompts</strong> &mdash; Set up buyer-intent questions your customers ask AI</p>
      <p><strong>3. Run your first scan</strong> &mdash; See how AI mentions your brand today</p>
    </div>
    <a href="${appUrl}/dashboard" class="btn">Go to Dashboard</a>
    <p>If you have any questions, just reply to this email or reach us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
    <p>Welcome aboard,<br/>The ${APP_NAME} Team</p>
  `, `Welcome to ${APP_NAME} - start tracking your AI visibility today`);
}

function subscriptionActivatedEmail(firstName: string | null, planId: PlanId): string {
  const name = firstName || 'there';
  const plan = getPlan(planId);
  const appUrl = getAppUrl();
  return baseLayout(`
    <h2>Subscription Activated</h2>
    <p>Hi ${name},</p>
    <p>Your <strong>${plan.name}</strong> plan is now active. Here's what's included:</p>
    <div class="info-box">
      <p><strong>Plan:</strong> ${plan.name} ($${plan.priceMonthly}/month)</p>
      <p><strong>Projects:</strong> Up to ${plan.maxProjects}</p>
      <p><strong>Prompts:</strong> Up to ${plan.maxPrompts}</p>
      <p><strong>AI Engines:</strong> ${plan.allowedEngines.map(e => e.charAt(0).toUpperCase() + e.slice(1)).join(', ')}</p>
      <p><strong>Scans:</strong> ${plan.maxScansPerMonth}/month</p>
    </div>
    <a href="${appUrl}/dashboard" class="btn">Start Using ${APP_NAME}</a>
    <p>You can manage your subscription anytime from your dashboard settings.</p>
    <p>Thanks for choosing ${APP_NAME},<br/>The ${APP_NAME} Team</p>
  `, `Your ${plan.name} plan is active - here's what's included`);
}

function planChangedEmail(firstName: string | null, oldPlanId: PlanId, newPlanId: PlanId): string {
  const name = firstName || 'there';
  const oldPlan = getPlan(oldPlanId);
  const newPlan = getPlan(newPlanId);
  const isUpgrade = newPlan.priceMonthly > oldPlan.priceMonthly;
  const appUrl = getAppUrl();
  return baseLayout(`
    <h2>Plan ${isUpgrade ? 'Upgraded' : 'Changed'}</h2>
    <p>Hi ${name},</p>
    <p>Your subscription has been ${isUpgrade ? 'upgraded' : 'changed'} from <strong>${oldPlan.name}</strong> to <strong>${newPlan.name}</strong>.</p>
    <div class="info-box">
      <p><strong>New Plan:</strong> ${newPlan.name} ($${newPlan.priceMonthly}/month)</p>
      <p><strong>Projects:</strong> Up to ${newPlan.maxProjects}</p>
      <p><strong>Prompts:</strong> Up to ${newPlan.maxPrompts}</p>
      <p><strong>AI Engines:</strong> ${newPlan.allowedEngines.map(e => e.charAt(0).toUpperCase() + e.slice(1)).join(', ')}</p>
      <p><strong>Scans:</strong> ${newPlan.maxScansPerMonth}/month</p>
    </div>
    ${isUpgrade ? '<p>You now have access to more features and higher limits. Enjoy exploring your expanded capabilities!</p>' : '<p>Your new limits are now in effect. If you need more capacity, you can upgrade anytime from your dashboard.</p>'}
    <a href="${appUrl}/dashboard" class="btn">Go to Dashboard</a>
    <p>Best,<br/>The ${APP_NAME} Team</p>
  `, `Your plan has been ${isUpgrade ? 'upgraded' : 'changed'} to ${newPlan.name}`);
}

function cancellationEmail(firstName: string | null, planId: PlanId): string {
  const name = firstName || 'there';
  const plan = getPlan(planId);
  const appUrl = getAppUrl();
  return baseLayout(`
    <h2>Subscription Cancelled</h2>
    <p>Hi ${name},</p>
    <p>We've processed the cancellation of your <strong>${plan.name}</strong> plan. We're sorry to see you go.</p>
    <p>Your access will continue until the end of your current billing period. After that, your account will revert to limited access.</p>
    <div class="info-box">
      <p><strong>What happens next:</strong></p>
      <p>Your projects and data will be preserved, so you can pick up right where you left off if you decide to resubscribe.</p>
    </div>
    <p>If you cancelled by mistake or changed your mind, you can resubscribe anytime:</p>
    <a href="${appUrl}/pricing" class="btn">View Plans</a>
    <hr class="divider" />
    <p>We'd love to know what we could improve. Reply to this email with any feedback &mdash; it genuinely helps.</p>
    <p>All the best,<br/>The ${APP_NAME} Team</p>
  `, `Your ${plan.name} subscription has been cancelled`);
}

function paymentFailedEmail(firstName: string | null): string {
  const name = firstName || 'there';
  const appUrl = getAppUrl();
  return baseLayout(`
    <h2>Payment Issue</h2>
    <p>Hi ${name},</p>
    <p>We had trouble processing your latest subscription payment. This can happen if your card expired or there were insufficient funds.</p>
    <div class="info-box">
      <p><strong>What to do:</strong></p>
      <p>Please update your payment method to keep your subscription active. You can do this from your billing settings.</p>
    </div>
    <a href="${appUrl}/dashboard" class="btn">Update Payment Method</a>
    <p>If you believe this is an error, please contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
    <p>Thanks,<br/>The ${APP_NAME} Team</p>
  `, 'Action needed: we had trouble processing your payment');
}

// ============= Send Functions =============

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const { client, fromEmail } = await getUncachableResendClient();
    const from = fromEmail || `${APP_NAME} <noreply@mindshare-ai.com>`;
    
    await client.emails.send({
      from,
      to,
      subject,
      html,
    });
    console.log(`[email] Sent "${subject}" to ${to}`);
    return true;
  } catch (error) {
    console.error(`[email] Failed to send "${subject}" to ${to}:`, error);
    return false;
  }
}

export async function sendWelcomeEmail(email: string, firstName: string | null): Promise<boolean> {
  return sendEmail(email, `Welcome to ${APP_NAME}!`, welcomeEmail(firstName));
}

export async function sendSubscriptionActivatedEmail(email: string, firstName: string | null, planId: PlanId): Promise<boolean> {
  const plan = getPlan(planId);
  return sendEmail(email, `Your ${plan.name} plan is active`, subscriptionActivatedEmail(firstName, planId));
}

export async function sendPlanChangedEmail(email: string, firstName: string | null, oldPlanId: PlanId, newPlanId: PlanId): Promise<boolean> {
  const newPlan = getPlan(newPlanId);
  const oldPlan = getPlan(oldPlanId);
  const isUpgrade = newPlan.priceMonthly > oldPlan.priceMonthly;
  return sendEmail(email, `Plan ${isUpgrade ? 'upgraded' : 'changed'} to ${newPlan.name}`, planChangedEmail(firstName, oldPlanId, newPlanId));
}

export async function sendCancellationEmail(email: string, firstName: string | null, planId: PlanId): Promise<boolean> {
  const plan = getPlan(planId);
  return sendEmail(email, `Your ${plan.name} subscription has been cancelled`, cancellationEmail(firstName, planId));
}

export async function sendPaymentFailedEmail(email: string, firstName: string | null): Promise<boolean> {
  return sendEmail(email, 'Action needed: payment issue with your subscription', paymentFailedEmail(firstName));
}
