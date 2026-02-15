/**
 * Stripe Service
 * Complete Stripe subscription management for RideWire Auto Platform
 */

import Stripe from 'stripe';
import { getPlanById } from './subscription-plans.js';
import logger from '../core/logger.js';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

/**
 * Create a new Stripe customer
 * @param {Object} customerData - Customer information
 * @returns {Promise<Object>} Stripe customer object
 */
export async function createCustomer(customerData) {
  try {
    const { email, name, metadata = {} } = customerData;

    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        ...metadata,
        platform: 'ridewire-auto',
        createdAt: new Date().toISOString(),
      },
    });

    logger.info('Stripe customer created', { customerId: customer.id, email });
    return customer;
  } catch (error) {
    logger.error('Failed to create Stripe customer', { error: error.message });
    throw new Error(`Customer creation failed: ${error.message}`);
  }
}

/**
 * Create a checkout session for subscription
 * @param {Object} checkoutData - Checkout session configuration
 * @returns {Promise<Object>} Checkout session object
 */
export async function createCheckoutSession(checkoutData) {
  try {
    const {
      planId,
      customerId,
      customerEmail,
      successUrl,
      cancelUrl,
      metadata = {},
    } = checkoutData;

    const plan = getPlanById(planId);
    if (!plan) {
      throw new Error(`Invalid plan ID: ${planId}`);
    }

    const sessionConfig = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        ...metadata,
        planId: plan.id,
        platform: 'ridewire-auto',
      },
    };

    // Use existing customer or customer email
    if (customerId) {
      sessionConfig.customer = customerId;
    } else if (customerEmail) {
      sessionConfig.customer_email = customerEmail;
    }

    // Allow promotion codes
    sessionConfig.allow_promotion_codes = true;

    const session = await stripe.checkout.sessions.create(sessionConfig);

    logger.info('Checkout session created', {
      sessionId: session.id,
      planId: plan.id,
      customerId,
    });

    return session;
  } catch (error) {
    logger.error('Failed to create checkout session', { error: error.message });
    throw new Error(`Checkout session creation failed: ${error.message}`);
  }
}

/**
 * Create a subscription for a customer
 * @param {Object} subscriptionData - Subscription configuration
 * @returns {Promise<Object>} Subscription object
 */
export async function createSubscription(subscriptionData) {
  try {
    const { customerId, planId, paymentMethodId, metadata = {} } = subscriptionData;

    const plan = getPlanById(planId);
    if (!plan) {
      throw new Error(`Invalid plan ID: ${planId}`);
    }

    // Attach payment method to customer if provided
    if (paymentMethodId) {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Set as default payment method
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: plan.stripePriceId }],
      metadata: {
        ...metadata,
        planId: plan.id,
        platform: 'ridewire-auto',
      },
      expand: ['latest_invoice.payment_intent'],
    });

    logger.info('Subscription created', {
      subscriptionId: subscription.id,
      customerId,
      planId: plan.id,
    });

    return subscription;
  } catch (error) {
    logger.error('Failed to create subscription', { error: error.message });
    throw new Error(`Subscription creation failed: ${error.message}`);
  }
}

/**
 * Get subscription details
 * @param {string} subscriptionId - Stripe subscription ID
 * @returns {Promise<Object>} Subscription object
 */
export async function getSubscription(subscriptionId) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    logger.error('Failed to retrieve subscription', {
      subscriptionId,
      error: error.message,
    });
    throw new Error(`Subscription retrieval failed: ${error.message}`);
  }
}

/**
 * Update subscription (upgrade/downgrade)
 * @param {string} subscriptionId - Stripe subscription ID
 * @param {Object} updateData - Update configuration
 * @returns {Promise<Object>} Updated subscription object
 */
export async function updateSubscription(subscriptionId, updateData) {
  try {
    const { planId, prorationBehavior = 'create_prorations' } = updateData;

    const plan = getPlanById(planId);
    if (!plan) {
      throw new Error(`Invalid plan ID: ${planId}`);
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: plan.stripePriceId,
        },
      ],
      proration_behavior: prorationBehavior,
      metadata: {
        ...subscription.metadata,
        planId: plan.id,
        updatedAt: new Date().toISOString(),
      },
    });

    logger.info('Subscription updated', {
      subscriptionId,
      newPlanId: plan.id,
    });

    return updatedSubscription;
  } catch (error) {
    logger.error('Failed to update subscription', {
      subscriptionId,
      error: error.message,
    });
    throw new Error(`Subscription update failed: ${error.message}`);
  }
}

/**
 * Cancel subscription
 * @param {string} subscriptionId - Stripe subscription ID
 * @param {Object} options - Cancellation options
 * @returns {Promise<Object>} Cancelled subscription object
 */
export async function cancelSubscription(subscriptionId, options = {}) {
  try {
    const { immediate = false, reason = '' } = options;

    let subscription;
    if (immediate) {
      // Cancel immediately
      subscription = await stripe.subscriptions.cancel(subscriptionId);
    } else {
      // Cancel at period end
      subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
        metadata: {
          cancellationReason: reason,
          cancelledAt: new Date().toISOString(),
        },
      });
    }

    logger.info('Subscription cancelled', {
      subscriptionId,
      immediate,
    });

    return subscription;
  } catch (error) {
    logger.error('Failed to cancel subscription', {
      subscriptionId,
      error: error.message,
    });
    throw new Error(`Subscription cancellation failed: ${error.message}`);
  }
}

/**
 * Resume a cancelled subscription
 * @param {string} subscriptionId - Stripe subscription ID
 * @returns {Promise<Object>} Resumed subscription object
 */
export async function resumeSubscription(subscriptionId) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });

    logger.info('Subscription resumed', { subscriptionId });
    return subscription;
  } catch (error) {
    logger.error('Failed to resume subscription', {
      subscriptionId,
      error: error.message,
    });
    throw new Error(`Subscription resumption failed: ${error.message}`);
  }
}

/**
 * Get customer subscriptions
 * @param {string} customerId - Stripe customer ID
 * @returns {Promise<Array>} Array of subscription objects
 */
export async function getCustomerSubscriptions(customerId) {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      expand: ['data.default_payment_method'],
    });

    return subscriptions.data;
  } catch (error) {
    logger.error('Failed to retrieve customer subscriptions', {
      customerId,
      error: error.message,
    });
    throw new Error(`Customer subscriptions retrieval failed: ${error.message}`);
  }
}

/**
 * Handle Stripe webhook events
 * @param {Object} event - Stripe event object
 * @returns {Promise<Object>} Processing result
 */
export async function handleWebhookEvent(event) {
  try {
    const result = { processed: false, type: event.type };

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        result.processed = true;
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        result.processed = true;
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        result.processed = true;
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        result.processed = true;
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        result.processed = true;
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        result.processed = true;
        break;

      default:
        logger.info('Unhandled webhook event type', { type: event.type });
    }

    return result;
  } catch (error) {
    logger.error('Webhook event processing failed', {
      eventType: event.type,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Verify webhook signature
 * @param {string} payload - Request body
 * @param {string} signature - Stripe signature header
 * @returns {Object} Verified event object
 */
export function verifyWebhookSignature(payload, signature) {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('Webhook secret not configured');
    }

    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    return event;
  } catch (error) {
    logger.error('Webhook signature verification failed', { error: error.message });
    throw new Error(`Webhook verification failed: ${error.message}`);
  }
}

// Private helper functions for webhook event handling

async function handleCheckoutCompleted(session) {
  logger.info('Checkout completed', {
    sessionId: session.id,
    customerId: session.customer,
    subscriptionId: session.subscription,
  });
  // Add custom logic here (e.g., update database, send welcome email)
}

async function handleSubscriptionCreated(subscription) {
  logger.info('Subscription created', {
    subscriptionId: subscription.id,
    customerId: subscription.customer,
    status: subscription.status,
  });
  // Add custom logic here (e.g., provision access, update user record)
}

async function handleSubscriptionUpdated(subscription) {
  logger.info('Subscription updated', {
    subscriptionId: subscription.id,
    status: subscription.status,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });
  // Add custom logic here (e.g., update access levels, notify user)
}

async function handleSubscriptionDeleted(subscription) {
  logger.info('Subscription deleted', {
    subscriptionId: subscription.id,
    customerId: subscription.customer,
  });
  // Add custom logic here (e.g., revoke access, send cancellation email)
}

async function handlePaymentSucceeded(invoice) {
  logger.info('Payment succeeded', {
    invoiceId: invoice.id,
    customerId: invoice.customer,
    subscriptionId: invoice.subscription,
    amount: invoice.amount_paid,
  });
  // Add custom logic here (e.g., send receipt, update payment history)
}

async function handlePaymentFailed(invoice) {
  logger.error('Payment failed', {
    invoiceId: invoice.id,
    customerId: invoice.customer,
    subscriptionId: invoice.subscription,
    attemptCount: invoice.attempt_count,
  });
  // Add custom logic here (e.g., notify user, suspend access)
}

export default {
  createCustomer,
  createCheckoutSession,
  createSubscription,
  getSubscription,
  updateSubscription,
  cancelSubscription,
  resumeSubscription,
  getCustomerSubscriptions,
  handleWebhookEvent,
  verifyWebhookSignature,
};
