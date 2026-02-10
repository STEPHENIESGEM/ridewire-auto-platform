import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../../.env') });

const config = {
  // Application
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000',

  // AI Services
  ai: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229',
    },
  },

  // NOVA Core
  nova: {
    corePath: process.env.NOVA_CORE_PATH || '../nova-ai-council-engine',
    enabled: process.env.NOVA_ENABLED === 'true',
  },

  // E-commerce
  ecommerce: {
    shopify: {
      apiKey: process.env.SHOPIFY_API_KEY,
      apiSecret: process.env.SHOPIFY_API_SECRET,
      shopDomain: process.env.SHOPIFY_SHOP_DOMAIN,
      accessToken: process.env.SHOPIFY_ACCESS_TOKEN,
    },
    woocommerce: {
      url: process.env.WOOCOMMERCE_URL,
      consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
      consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
    },
  },

  // Parts API
  parts: {
    apiKey: process.env.PARTS_API_KEY,
    baseUrl: process.env.PARTS_API_BASE_URL || 'https://api.partsvendor.com/v1',
  },

  // AR Configuration
  ar: {
    assetsPath: process.env.AR_ASSETS_PATH || './ar-assets',
    cacheEnabled: process.env.AR_CACHE_ENABLED === 'true',
    cacheTtl: parseInt(process.env.AR_CACHE_TTL || '3600', 10),
  },

  // Diagnostics
  diagnostics: {
    logLevel: process.env.DIAGNOSTIC_LOG_LEVEL || 'info',
    retentionDays: parseInt(process.env.DIAGNOSTIC_RETENTION_DAYS || '30', 10),
  },

  // Security
  security: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiration: process.env.JWT_EXPIRATION || '24h',
    corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
  },
};

export default config;
