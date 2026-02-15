/**
 * Legal Acceptance Middleware
 * Ensures users accept terms before using the platform
 */

import logger from '../core/logger.js';

// In-memory storage for demo purposes
// In production, this should be stored in a database
const userAcceptances = new Map();

// Current version of legal documents
const LEGAL_VERSIONS = {
  terms: '1.0',
  privacy: '1.0',
  disclaimer: '1.0',
  arLicense: '1.0', // For AR content creators only
};

/**
 * Check if user has accepted current legal terms
 * @param {string} userId - User identifier
 * @param {string} userType - User type (user, creator)
 * @returns {Object} Acceptance status
 */
export function checkLegalAcceptance(userId, userType = 'user') {
  const acceptance = userAcceptances.get(userId);

  if (!acceptance) {
    return {
      accepted: false,
      required: ['terms', 'privacy', 'disclaimer'],
      message: 'Legal terms acceptance required',
    };
  }

  const requiredDocs = ['terms', 'privacy', 'disclaimer'];
  if (userType === 'creator') {
    requiredDocs.push('arLicense');
  }

  // Check if all required documents are accepted with current versions
  const missingAcceptances = requiredDocs.filter(
    (doc) =>
      !acceptance[doc] || acceptance[doc].version !== LEGAL_VERSIONS[doc]
  );

  if (missingAcceptances.length > 0) {
    return {
      accepted: false,
      required: missingAcceptances,
      message: 'Updated legal terms require acceptance',
    };
  }

  return {
    accepted: true,
    acceptedAt: acceptance.acceptedAt,
    versions: acceptance,
  };
}

/**
 * Record user acceptance of legal terms
 * @param {string} userId - User identifier
 * @param {Array} documents - Array of document types accepted
 * @param {string} ipAddress - User IP address
 * @param {string} userAgent - User agent string
 * @returns {Object} Acceptance record
 */
export function recordLegalAcceptance(userId, documents, ipAddress, userAgent) {
  const timestamp = new Date().toISOString();
  const acceptance = userAcceptances.get(userId) || {};

  // Record acceptance for each document type
  documents.forEach((docType) => {
    acceptance[docType] = {
      version: LEGAL_VERSIONS[docType],
      acceptedAt: timestamp,
      ipAddress,
      userAgent,
    };
  });

  acceptance.lastUpdated = timestamp;
  userAcceptances.set(userId, acceptance);

  logger.info('Legal acceptance recorded', {
    userId,
    documents,
    versions: documents.map((doc) => `${doc}:${LEGAL_VERSIONS[doc]}`),
  });

  return {
    success: true,
    acceptedAt: timestamp,
    documents: documents.map((doc) => ({
      type: doc,
      version: LEGAL_VERSIONS[doc],
    })),
  };
}

/**
 * Get user's legal acceptance history
 * @param {string} userId - User identifier
 * @returns {Object} Acceptance history
 */
export function getLegalAcceptanceHistory(userId) {
  const acceptance = userAcceptances.get(userId);

  if (!acceptance) {
    return {
      hasAcceptance: false,
      message: 'No acceptance records found',
    };
  }

  return {
    hasAcceptance: true,
    history: acceptance,
    currentVersions: LEGAL_VERSIONS,
  };
}

/**
 * Express middleware to enforce legal acceptance
 * @param {Object} options - Middleware options
 * @returns {Function} Express middleware function
 */
export function requireLegalAcceptance(options = {}) {
  const { userType = 'user', excludePaths = [] } = options;

  return (req, res, next) => {
    // Skip for excluded paths
    if (excludePaths.some((path) => req.path.startsWith(path))) {
      return next();
    }

    // Skip for public endpoints
    const publicPaths = ['/health', '/api/payment/plans', '/legal'];
    if (publicPaths.some((path) => req.path.startsWith(path))) {
      return next();
    }

    // Get user ID from request (in production, from auth token/session)
    const userId = req.headers['x-user-id'] || req.query.userId || 'anonymous';

    // Check acceptance status
    const acceptanceStatus = checkLegalAcceptance(userId, userType);

    if (!acceptanceStatus.accepted) {
      logger.info('Legal acceptance required', {
        userId,
        path: req.path,
        required: acceptanceStatus.required,
      });

      return res.status(403).json({
        error: 'Legal terms acceptance required',
        message: acceptanceStatus.message,
        requiredDocuments: acceptanceStatus.required,
        versions: LEGAL_VERSIONS,
        redirectTo: '/legal.html',
      });
    }

    // User has accepted current terms
    req.legalAcceptance = acceptanceStatus;
    next();
  };
}

/**
 * Check if legal documents need updating
 * @param {string} userId - User identifier
 * @returns {Object} Update status
 */
export function checkForLegalUpdates(userId) {
  const acceptance = userAcceptances.get(userId);

  if (!acceptance) {
    return {
      updatesAvailable: true,
      updates: Object.keys(LEGAL_VERSIONS),
      message: 'Initial acceptance required',
    };
  }

  const updates = [];
  for (const [doc, version] of Object.entries(LEGAL_VERSIONS)) {
    if (!acceptance[doc] || acceptance[doc].version !== version) {
      updates.push({
        document: doc,
        currentVersion: version,
        acceptedVersion: acceptance[doc]?.version || null,
      });
    }
  }

  return {
    updatesAvailable: updates.length > 0,
    updates,
    message:
      updates.length > 0
        ? 'Legal documents have been updated'
        : 'All documents current',
  };
}

/**
 * Get current legal document versions
 * @returns {Object} Current versions
 */
export function getCurrentLegalVersions() {
  return {
    versions: LEGAL_VERSIONS,
    effectiveDate: '2026-02-15',
    lastUpdated: '2026-02-15',
  };
}

/**
 * Clear user acceptance (for testing or user request)
 * @param {string} userId - User identifier
 * @returns {Object} Result
 */
export function clearLegalAcceptance(userId) {
  const existed = userAcceptances.has(userId);
  userAcceptances.delete(userId);

  logger.info('Legal acceptance cleared', { userId, existed });

  return {
    success: true,
    cleared: existed,
    message: existed
      ? 'Acceptance records cleared'
      : 'No records found to clear',
  };
}

/**
 * Get acceptance statistics (admin function)
 * @returns {Object} Statistics
 */
export function getAcceptanceStatistics() {
  const totalUsers = userAcceptances.size;
  const stats = {
    totalUsers,
    byDocument: {},
    byVersion: {},
  };

  // Count acceptances by document type
  for (const [doc, version] of Object.entries(LEGAL_VERSIONS)) {
    stats.byDocument[doc] = 0;
    stats.byVersion[`${doc}_${version}`] = 0;
  }

  // Iterate through all user acceptances
  for (const acceptance of userAcceptances.values()) {
    for (const [doc, details] of Object.entries(acceptance)) {
      if (doc === 'lastUpdated') continue;

      stats.byDocument[doc] = (stats.byDocument[doc] || 0) + 1;
      const versionKey = `${doc}_${details.version}`;
      stats.byVersion[versionKey] = (stats.byVersion[versionKey] || 0) + 1;
    }
  }

  return stats;
}

export default {
  checkLegalAcceptance,
  recordLegalAcceptance,
  getLegalAcceptanceHistory,
  requireLegalAcceptance,
  checkForLegalUpdates,
  getCurrentLegalVersions,
  clearLegalAcceptance,
  getAcceptanceStatistics,
  LEGAL_VERSIONS,
};
