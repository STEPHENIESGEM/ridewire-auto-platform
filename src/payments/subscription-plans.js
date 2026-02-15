/**
 * Subscription Plans Configuration
 * Defines pricing tiers for RideWire Auto Platform
 */

export const SUBSCRIPTION_PLANS = {
  BASIC: {
    id: 'basic',
    name: 'Basic',
    price: 99,
    currency: 'USD',
    interval: 'month',
    features: [
      '50 diagnostics per month',
      'AI-powered analysis',
      'Basic AR visualization',
      'Email support',
      'Access to diagnostic library',
    ],
    limits: {
      diagnosticsPerMonth: 50,
      concurrentSimulations: 1,
      arSessions: 10,
    },
    stripePriceId: process.env.STRIPE_PRICE_ID_BASIC || 'price_basic_99_monthly',
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    price: 199,
    currency: 'USD',
    interval: 'month',
    features: [
      '200 diagnostics per month',
      'Advanced AI analysis with multi-model consensus',
      'Full AR visualization suite',
      'Priority email & chat support',
      'Custom diagnostic templates',
      'API access (1000 calls/month)',
      'Advanced repair cost estimates',
    ],
    limits: {
      diagnosticsPerMonth: 200,
      concurrentSimulations: 5,
      arSessions: 100,
      apiCallsPerMonth: 1000,
    },
    stripePriceId: process.env.STRIPE_PRICE_ID_PRO || 'price_pro_199_monthly',
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 499,
    currency: 'USD',
    interval: 'month',
    features: [
      'Unlimited diagnostics',
      'Full multi-AI model consensus',
      'Complete AR toolkit with custom models',
      '24/7 priority support',
      'Custom integrations',
      'Unlimited API access',
      'White-label options',
      'Dedicated account manager',
      'Fleet management tools',
    ],
    limits: {
      diagnosticsPerMonth: -1, // Unlimited
      concurrentSimulations: 20,
      arSessions: -1, // Unlimited
      apiCallsPerMonth: -1, // Unlimited
    },
    stripePriceId: process.env.STRIPE_PRICE_ID_ENTERPRISE || 'price_enterprise_499_monthly',
  },
};

/**
 * Get plan details by ID
 * @param {string} planId - Plan identifier (basic, pro, enterprise)
 * @returns {Object|null} Plan details or null if not found
 */
export function getPlanById(planId) {
  const normalizedId = planId.toUpperCase();
  return SUBSCRIPTION_PLANS[normalizedId] || null;
}

/**
 * Get all available plans
 * @returns {Array} Array of all subscription plans
 */
export function getAllPlans() {
  return Object.values(SUBSCRIPTION_PLANS);
}

/**
 * Validate if usage is within plan limits
 * @param {Object} plan - Subscription plan
 * @param {Object} usage - Current usage stats
 * @returns {Object} Validation result with allowed status and details
 */
export function validateUsage(plan, usage) {
  const result = {
    allowed: true,
    exceeded: [],
    warnings: [],
  };

  // Check diagnostics limit
  if (plan.limits.diagnosticsPerMonth !== -1 && 
      usage.diagnosticsThisMonth >= plan.limits.diagnosticsPerMonth) {
    result.allowed = false;
    result.exceeded.push({
      limit: 'diagnosticsPerMonth',
      current: usage.diagnosticsThisMonth,
      max: plan.limits.diagnosticsPerMonth,
    });
  } else if (plan.limits.diagnosticsPerMonth !== -1 && 
             usage.diagnosticsThisMonth >= plan.limits.diagnosticsPerMonth * 0.8) {
    result.warnings.push({
      limit: 'diagnosticsPerMonth',
      current: usage.diagnosticsThisMonth,
      max: plan.limits.diagnosticsPerMonth,
      message: 'Approaching monthly diagnostic limit',
    });
  }

  // Check API calls limit (if applicable)
  if (plan.limits.apiCallsPerMonth !== undefined && 
      plan.limits.apiCallsPerMonth !== -1 && 
      usage.apiCallsThisMonth >= plan.limits.apiCallsPerMonth) {
    result.allowed = false;
    result.exceeded.push({
      limit: 'apiCallsPerMonth',
      current: usage.apiCallsThisMonth,
      max: plan.limits.apiCallsPerMonth,
    });
  }

  return result;
}

/**
 * Calculate prorated amount for plan upgrade/downgrade
 * @param {Object} currentPlan - Current subscription plan
 * @param {Object} newPlan - New subscription plan
 * @param {number} daysRemaining - Days remaining in billing period
 * @returns {number} Prorated amount
 */
export function calculateProration(currentPlan, newPlan, daysRemaining) {
  const daysInMonth = 30;
  const currentDailyRate = currentPlan.price / daysInMonth;
  const newDailyRate = newPlan.price / daysInMonth;
  
  const unusedCredit = currentDailyRate * daysRemaining;
  const newCharge = newDailyRate * daysRemaining;
  
  return Math.max(0, newCharge - unusedCredit);
}

export default {
  SUBSCRIPTION_PLANS,
  getPlanById,
  getAllPlans,
  validateUsage,
  calculateProration,
};
