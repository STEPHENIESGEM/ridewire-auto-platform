/**
 * Payment Routes
 * API endpoints for Stripe payment processing
 */

import express from 'express';
import stripeService from '../payments/stripe-service.js';
import { getAllPlans, getPlanById } from '../payments/subscription-plans.js';
import logger from '../core/logger.js';

const router = express.Router();

/**
 * GET /api/payment/plans
 * Get all available subscription plans
 */
router.get('/plans', (req, res) => {
  try {
    const plans = getAllPlans();
    res.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    logger.error('Failed to fetch plans', { error: error.message });
    res.status(500).json({
      error: 'Failed to fetch subscription plans',
      details: error.message,
    });
  }
});

/**
 * GET /api/payment/plans/:planId
 * Get specific plan details
 */
router.get('/plans/:planId', (req, res) => {
  try {
    const { planId } = req.params;
    const plan = getPlanById(planId);

    if (!plan) {
      return res.status(404).json({
        error: 'Plan not found',
        planId,
      });
    }

    res.json({
      success: true,
      data: plan,
    });
  } catch (error) {
    logger.error('Failed to fetch plan', { error: error.message });
    res.status(500).json({
      error: 'Failed to fetch plan details',
      details: error.message,
    });
  }
});

/**
 * POST /api/payment/checkout
 * Create a Stripe checkout session
 */
router.post('/checkout', async (req, res) => {
  try {
    const { planId, customerEmail, customerId, metadata } = req.body;

    if (!planId) {
      return res.status(400).json({
        error: 'Missing required field: planId',
      });
    }

    if (!customerEmail && !customerId) {
      return res.status(400).json({
        error: 'Either customerEmail or customerId is required',
      });
    }

    // Validate plan exists
    const plan = getPlanById(planId);
    if (!plan) {
      return res.status(400).json({
        error: 'Invalid plan ID',
        planId,
      });
    }

    // Create checkout session
    const session = await stripeService.createCheckoutSession({
      planId,
      customerEmail,
      customerId,
      successUrl: `${req.protocol}://${req.get('host')}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${req.protocol}://${req.get('host')}/payment/cancel`,
      metadata: {
        ...metadata,
        userId: req.body.userId, // If you have user authentication
      },
    });

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
      },
    });
  } catch (error) {
    logger.error('Checkout session creation failed', { error: error.message });
    res.status(500).json({
      error: 'Failed to create checkout session',
      details: error.message,
    });
  }
});

/**
 * POST /api/payment/webhook
 * Handle Stripe webhook events
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      return res.status(400).json({
        error: 'Missing stripe-signature header',
      });
    }

    // Verify webhook signature
    const event = stripeService.verifyWebhookSignature(req.body, signature);

    logger.info('Webhook received', { type: event.type, id: event.id });

    // Process the event
    const result = await stripeService.handleWebhookEvent(event);

    res.json({
      success: true,
      received: true,
      eventType: event.type,
      processed: result.processed,
    });
  } catch (error) {
    logger.error('Webhook processing failed', { error: error.message });
    res.status(400).json({
      error: 'Webhook processing failed',
      details: error.message,
    });
  }
});

/**
 * GET /api/payment/subscription/:subscriptionId
 * Get subscription status
 */
router.get('/subscription/:subscriptionId', async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const subscription = await stripeService.getSubscription(subscriptionId);

    res.json({
      success: true,
      data: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        planId: subscription.metadata.planId,
        customerId: subscription.customer,
      },
    });
  } catch (error) {
    logger.error('Failed to fetch subscription', { error: error.message });
    res.status(500).json({
      error: 'Failed to fetch subscription',
      details: error.message,
    });
  }
});

/**
 * GET /api/payment/customer/:customerId/subscriptions
 * Get all subscriptions for a customer
 */
router.get('/customer/:customerId/subscriptions', async (req, res) => {
  try {
    const { customerId } = req.params;

    const subscriptions = await stripeService.getCustomerSubscriptions(customerId);

    res.json({
      success: true,
      data: subscriptions.map((sub) => ({
        id: sub.id,
        status: sub.status,
        currentPeriodEnd: sub.current_period_end,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        planId: sub.metadata.planId,
      })),
    });
  } catch (error) {
    logger.error('Failed to fetch customer subscriptions', { error: error.message });
    res.status(500).json({
      error: 'Failed to fetch customer subscriptions',
      details: error.message,
    });
  }
});

/**
 * POST /api/payment/subscription/:subscriptionId/cancel
 * Cancel a subscription
 */
router.post('/subscription/:subscriptionId/cancel', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { immediate = false, reason = '' } = req.body;

    const subscription = await stripeService.cancelSubscription(subscriptionId, {
      immediate,
      reason,
    });

    res.json({
      success: true,
      data: {
        id: subscription.id,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceledAt: subscription.canceled_at,
      },
      message: immediate
        ? 'Subscription cancelled immediately'
        : 'Subscription will cancel at period end',
    });
  } catch (error) {
    logger.error('Failed to cancel subscription', { error: error.message });
    res.status(500).json({
      error: 'Failed to cancel subscription',
      details: error.message,
    });
  }
});

/**
 * POST /api/payment/subscription/:subscriptionId/resume
 * Resume a cancelled subscription
 */
router.post('/subscription/:subscriptionId/resume', async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const subscription = await stripeService.resumeSubscription(subscriptionId);

    res.json({
      success: true,
      data: {
        id: subscription.id,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
      message: 'Subscription resumed successfully',
    });
  } catch (error) {
    logger.error('Failed to resume subscription', { error: error.message });
    res.status(500).json({
      error: 'Failed to resume subscription',
      details: error.message,
    });
  }
});

/**
 * POST /api/payment/subscription/:subscriptionId/update
 * Update subscription (upgrade/downgrade)
 */
router.post('/subscription/:subscriptionId/update', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { planId, prorationBehavior } = req.body;

    if (!planId) {
      return res.status(400).json({
        error: 'Missing required field: planId',
      });
    }

    const subscription = await stripeService.updateSubscription(subscriptionId, {
      planId,
      prorationBehavior,
    });

    res.json({
      success: true,
      data: {
        id: subscription.id,
        status: subscription.status,
        planId: subscription.metadata.planId,
      },
      message: 'Subscription updated successfully',
    });
  } catch (error) {
    logger.error('Failed to update subscription', { error: error.message });
    res.status(500).json({
      error: 'Failed to update subscription',
      details: error.message,
    });
  }
});

/**
 * POST /api/payment/customer
 * Create a new Stripe customer
 */
router.post('/customer', async (req, res) => {
  try {
    const { email, name, metadata } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        error: 'Missing required fields: email and name',
      });
    }

    const customer = await stripeService.createCustomer({
      email,
      name,
      metadata,
    });

    res.json({
      success: true,
      data: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
      },
    });
  } catch (error) {
    logger.error('Failed to create customer', { error: error.message });
    res.status(500).json({
      error: 'Failed to create customer',
      details: error.message,
    });
  }
});

export default router;
