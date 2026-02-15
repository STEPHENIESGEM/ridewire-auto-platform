# 🚗 RideWire Auto Platform

**AI-Powered Vehicle Diagnostics & Repair Simulation Platform**

RideWire Auto Platform is an intelligent automotive diagnostic system that combines AI analysis, real-time vehicle simulation, and augmented reality visualization to revolutionize how we understand, diagnose, and repair vehicles.

## 🌟 Features

### AI-Powered Diagnostics
- **Intelligent Analysis**: AI agents analyze vehicle data to identify issues
- **Multi-Model Support**: Works with various vehicle makes and models
- **Predictive Maintenance**: Anticipate problems before they become critical
- **Real-time Monitoring**: Continuous vehicle health assessment

### Vehicle Simulation System
- **Digital Twin Technology**: Create virtual replicas of real vehicles
- **Component Modeling**: Detailed simulation of engine, transmission, brakes, etc.
- **Issue Reproduction**: Simulate problems to understand root causes
- **Repair Validation**: Test repairs virtually before physical implementation

### Augmented Reality Visualization
- **AR Overlays**: Display diagnostic info directly on vehicle components
- **Before/After Comparison**: Visual representation of damaged vs repaired parts
- **Repair Simulation**: Step-by-step AR-guided repair process
- **Customer Education**: Show customers exactly what's wrong and how it's fixed
- **Multi-Platform**: Web, mobile, ARKit, and ARCore support

### GemRoad Integration
- Seamless integration with GemRoad product ecosystem
- Unified diagnostic data across platforms
- Enhanced AI capabilities through GemRoad AI services

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB (for data persistence)
- API keys for AI services (OpenAI, Anthropic, etc.)
- Stripe account (for payment processing)

### Installation

```bash
# Clone the repository
git clone https://github.com/STEPHENIESGEM/ridewire-auto-platform.git
cd ridewire-auto-platform

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your API keys and configuration

# Start the server
npm start
```

## 💳 Stripe Payment Setup

RideWire Auto uses Stripe for secure payment processing and subscription management.

### 1. Create a Stripe Account

1. Sign up at [https://stripe.com](https://stripe.com)
2. Complete account verification
3. Navigate to the Developers section in your dashboard

### 2. Get Your API Keys

**Test Mode (Development):**
1. Go to Developers → API Keys
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)

**Live Mode (Production):**
1. Switch to "Live mode" in the Stripe dashboard
2. Copy your **Publishable key** (starts with `pk_live_`)
3. Copy your **Secret key** (starts with `sk_live_`)

### 3. Create Subscription Products

1. Go to Products → Add Product
2. Create three subscription products:
   - **Basic**: $99/month - 50 diagnostics per month
   - **Pro**: $199/month - 200 diagnostics per month
   - **Enterprise**: $499/month - Unlimited diagnostics

3. For each product, note the **Price ID** (starts with `price_`)

### 4. Set Up Webhooks

1. Go to Developers → Webhooks → Add endpoint
2. Endpoint URL: `https://your-domain.com/api/payment/webhook`
3. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the **Webhook signing secret** (starts with `whsec_`)

### 5. Configure Environment Variables

Add to your `.env` file:

```env
# Stripe Configuration
STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here

# Subscription Plans
STRIPE_PRICE_ID_BASIC=price_your_basic_price_id
STRIPE_PRICE_ID_PRO=price_your_pro_price_id
STRIPE_PRICE_ID_ENTERPRISE=price_your_enterprise_price_id
```

### 6. Test the Integration

```bash
# Start the server
npm start

# Visit the pricing page
# http://localhost:3000/pricing.html

# Test checkout with Stripe test cards:
# Success: 4242 4242 4242 4242
# Declined: 4000 0000 0000 0002
```

---

## 📋 Launch Checklist

Before launching RideWire Auto to production, complete this checklist:

### Legal & Compliance
- [ ] Have legal documents reviewed by an attorney
- [ ] Customize legal documents with your business information
- [ ] Verify GDPR compliance for EU customers
- [ ] Verify CCPA compliance for California customers
- [ ] Set up privacy policy monitoring and updates
- [ ] Configure cookie consent banners (if required)
- [ ] Review AR content licensing terms

### Stripe & Payments
- [ ] Switch Stripe from test mode to live mode
- [ ] Update live API keys in production environment
- [ ] Test live payment flow with real card
- [ ] Set up webhook endpoints in production
- [ ] Configure email receipts in Stripe dashboard
- [ ] Set up failed payment retry logic
- [ ] Configure subscription renewal notifications
- [ ] Test cancellation and refund processes

### Security
- [ ] Enable HTTPS/SSL on your domain
- [ ] Set strong JWT_SECRET in production
- [ ] Enable two-factor authentication for admin accounts
- [ ] Configure rate limiting on API endpoints
- [ ] Set up security headers (helmet.js)
- [ ] Enable CORS only for your domains
- [ ] Review and test webhook signature verification
- [ ] Set up logging and monitoring
- [ ] Configure backup and disaster recovery

### Features & Content
- [ ] Test all diagnostic features thoroughly
- [ ] Verify AI model integrations work correctly
- [ ] Test AR visualization on multiple devices
- [ ] Upload initial AR content library
- [ ] Test demo page with real diagnostic codes
- [ ] Verify pricing page displays correctly
- [ ] Test all three subscription tiers
- [ ] Ensure mobile responsiveness

### Technical
- [ ] Set up production database (MongoDB)
- [ ] Configure Redis for session management (optional)
- [ ] Set up CDN for static assets
- [ ] Configure auto-scaling (if needed)
- [ ] Set up monitoring (DataDog, New Relic, etc.)
- [ ] Configure error tracking (Sentry, Rollbar, etc.)
- [ ] Set up uptime monitoring
- [ ] Configure backup schedules
- [ ] Test load handling and performance

### Marketing & Support
- [ ] Set up customer support email (support@ridewire.com)
- [ ] Configure support ticket system
- [ ] Create onboarding email sequence
- [ ] Set up analytics (Google Analytics, Mixpanel, etc.)
- [ ] Create social media accounts
- [ ] Prepare launch announcement
- [ ] Set up customer feedback collection

### Post-Launch
- [ ] Monitor error logs daily for first week
- [ ] Track conversion rates and user feedback
- [ ] Test payment processing regularly
- [ ] Monitor AI model performance
- [ ] Respond to support requests promptly
- [ ] Iterate based on user feedback

---

## 📁 Project Structure

```
ridewire-auto-platform/
├── src/
│   ├── agents/
│   │   └── diagnosticAgent.js    # AI diagnostic engine
│   ├── core/
│   │   ├── config.js              # Configuration management
│   │   └── logger.js              # Winston logging system
│   ├── diagnostics/
│   │   └── sample-diagnostic.js   # Sample OBD-II diagnostic examples
│   ├── middleware/
│   │   └── legal-acceptance.js    # Legal terms acceptance middleware
│   ├── payments/
│   │   ├── stripe-service.js      # Stripe integration
│   │   └── subscription-plans.js  # Subscription plan definitions
│   ├── routes/
│   │   └── payment-routes.js      # Payment API endpoints
│   ├── simulation/
│   │   └── vehicleSimulator.js    # Vehicle digital twin
│   ├── visualization/
│   │   └── arEngine.js            # AR visualization engine
│   └── index.js                   # Express server & API
├── public/
│   ├── demo.html                  # Interactive diagnostic demo
│   ├── pricing.html               # Pricing page with Stripe checkout
│   └── legal.html                 # Legal documents and acceptance
├── docs/
│   ├── SAMPLE_DIAGNOSTICS.md      # Diagnostic examples and use cases
│   └── GEMROAD_PRODUCTS.md        # GemRoad integration docs
├── tests/
│   └── diagnosticAgent.test.js    # Test suite
├── LEGAL_DISCLAIMER.md            # Legal disclaimer and limitations
├── TERMS_OF_SERVICE.md            # Terms of Service
├── PRIVACY_POLICY.md              # Privacy Policy (GDPR/CCPA)
├── AR_CONTENT_LICENSE.md          # AR content creator license
├── .env.example                   # Environment template
├── .gitignore
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Payment & Subscription

#### GET /api/payment/plans
Get all available subscription plans

#### GET /api/payment/plans/:planId
Get specific plan details (basic, pro, enterprise)

#### POST /api/payment/checkout
Create a Stripe checkout session
```json
{
  "planId": "basic",
  "customerEmail": "user@example.com",
  "userId": "user123"
}
```

#### POST /api/payment/webhook
Handle Stripe webhook events (webhook signature required)

#### GET /api/payment/subscription/:subscriptionId
Get subscription status

#### POST /api/payment/subscription/:subscriptionId/cancel
Cancel a subscription
```json
{
  "immediate": false,
  "reason": "No longer needed"
}
```

#### POST /api/payment/subscription/:subscriptionId/update
Update subscription (upgrade/downgrade)
```json
{
  "planId": "pro"
}
```

### Legal & Compliance

#### GET /api/legal/versions
Get current legal document versions

#### GET /api/legal/status
Check user's legal acceptance status (requires X-User-Id header)

#### POST /api/legal/accept
Record user acceptance of legal terms
```json
{
  "documents": ["terms", "privacy", "disclaimer"],
  "timestamp": "2026-02-15T09:30:00Z"
}
```

### Diagnostics

#### POST /api/v1/diagnostic/sample
Get sample diagnostic analysis (demo feature)
```json
{
  "dtcCode": "P0300",
  "vehicleInfo": {
    "make": "Toyota",
    "model": "Camry",
    "year": 2020
  },
  "symptoms": ["Rough idle", "Check engine light"]
}
```

#### GET /api/v1/diagnostic/examples
Get list of diagnostic examples

#### POST /api/v1/diagnostic/analyze
Analyze vehicle diagnostic data (requires subscription)

```json
{
  "vehicleId": "VIN123456",
  "data": {
    "make": "Toyota",
    "model": "Camry",
    "year": 2020,
    "dtcCodes": ["P0420", "P0171"],
    "symptoms": ["Check engine light", "Rough idle"]
  }
}
```

#### GET /api/diagnostics/:id
Retrieve diagnostic results

### Simulation

#### POST /api/simulation/start
Start vehicle simulation

```json
{
  "vehicleId": "VIN123456",
  "scenario": "normal_operation"
}
```

#### POST /api/simulation/inject-fault
Simulate specific failures

```json
{
  "simulationId": "sim-123",
  "fault": {
    "component": "catalytic_converter",
    "severity": "high"
  }
}
```

### AR Visualization

#### POST /api/ar/session/start
Initialize AR session

```json
{
  "vehicleData": {
    "vin": "VIN123456",
    "make": "Toyota",
    "model": "Camry"
  },
  "mode": "mobile"
}
```

#### POST /api/ar/visualize
Create AR visualization

```json
{
  "sessionId": "ar-123",
  "diagnostic": {
    "code": "P0420",
    "component": "catalytic_converter",
    "severity": "high"
  }
}
```

## 💡 Usage Examples

### Basic Diagnostic Analysis

```javascript
const DiagnosticAgent = require('./src/agents/diagnosticAgent');

const agent = new DiagnosticAgent({
  aiProvider: 'openai',
  model: 'gpt-4'
});

const result = await agent.analyzeDiagnostics({
  make: 'Toyota',
  model: 'Camry',
  year: 2020,
  dtcCodes: ['P0420'],
  symptoms: ['Check engine light']
});

console.log(result);
```

### Vehicle Simulation

```javascript
const VehicleSimulator = require('./src/simulation/vehicleSimulator');

const simulator = new VehicleSimulator({
  make: 'Toyota',
  model: 'Camry',
  year: 2020
});

await simulator.start();

// Inject a fault
await simulator.injectFault({
  component: 'catalytic_converter',
  severity: 'high'
});

// Get system state
const state = simulator.getSystemState();
console.log(state);
```

### AR Visualization

```javascript
const AREngine = require('./src/visualization/arEngine');

const arEngine = new AREngine({ mode: 'web' });

await arEngine.startSession({
  vin: 'VIN123456',
  make: 'Toyota',
  model: 'Camry'
});

// Visualize diagnostic
const overlay = arEngine.visualizeDiagnostic({
  code: 'P0420',
  component: 'catalytic_converter',
  severity: 'high',
  description: 'Catalytic converter efficiency below threshold'
});

// Show before/after comparison
await arEngine.showBeforeAfter(
  'catalytic_converter',
  { description: 'Damaged converter' },
  { action: 'Replace', parts: ['New catalytic converter'] }
);
```

## 🔧 Configuration

Edit `.env` file:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# AI Provider Configuration
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Database
MONGODB_URI=mongodb://localhost:27017/ridewire

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/ridewire.log

# AR Engine
AR_MODE=web
AR_QUALITY=high

# GemRoad Integration
GEMROAD_API_KEY=your_gemroad_key
GEMROAD_ENDPOINT=https://api.gemroad.com
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm test -- --grep "DiagnosticAgent"
```

## 📊 Architecture

### System Components

1. **Diagnostic Agent**: AI-powered analysis engine
2. **Vehicle Simulator**: Digital twin for vehicle modeling
3. **AR Engine**: Visualization and overlay system
4. **API Server**: Express-based REST API
5. **Logger**: Centralized logging with Winston

### Data Flow

```
Vehicle Data → Diagnostic Agent → AI Analysis → Results
                     ↓
              Simulator Creates Digital Twin
                     ↓
              AR Engine Visualizes Issues
                     ↓
              Customer/Technician Views AR
```

## 🤝 Contributing

Contributions welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 🔗 Related Projects

- **GemRoad Products**: See [GEMROAD_PRODUCTS.md](./GEMROAD_PRODUCTS.md)
- **AI Diagnostic Models**: Custom trained models for automotive diagnostics
- **AR Mobile Apps**: iOS and Android AR viewers

## 📞 Support

- GitHub Issues: Report bugs and request features
- Documentation: Full API docs available at `/api/docs`
- Email: support@ridewire.com

## 🎯 Roadmap

- [ ] Real-time streaming diagnostics
- [ ] Multi-vehicle fleet management
- [ ] Predictive maintenance AI
- [ ] Integration with OBD-II devices
- [ ] Mobile AR apps (iOS/Android)
- [ ] WebXR support for VR headsets
- [ ] Machine learning model training interface
- [ ] Cloud-based simulation clusters

## 👥 Authors

**Stephenie's Gem Team**
- Platform Architecture & AI Integration
- Vehicle Simulation Systems
- AR Visualization Engine

---

**Built with ❤️ for the automotive industry**

*Making vehicle diagnostics accessible, visual, and intelligent.*
