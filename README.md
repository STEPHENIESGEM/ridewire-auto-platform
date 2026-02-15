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

### Development Mode

```bash
npm run dev
```

## 📁 Project Structure

```
ridewire-auto-platform/
├── src/
│   ├── agents/
│   │   └── diagnosticAgent.js    # AI diagnostic engine
│   ├── core/
│   │   └── logger.js             # Winston logging system
│   ├── simulation/
│   │   └── vehicleSimulator.js   # Vehicle digital twin
│   ├── visualization/
│   │   └── arEngine.js           # AR visualization engine
│   ├── config.js                 # Configuration management
│   └── index.js                  # Express server & API
├── .env.example                  # Environment template
├── .gitignore
├── package.json
├── docs/GEMROAD_PRODUCTS.md      # GemRoad integration docs
└── README.md
```

## 🔌 API Endpoints

### Diagnostics

#### POST /api/diagnostics/analyze
Analyze vehicle diagnostic data

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

- GitHub Issues: Report bugs and request features (primary support channel)
- Documentation: Full API docs available at `/api/docs`
- Email: support@ridewireai.com

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

**RideWire Development Team**
- Platform Architecture & AI Integration
- Vehicle Simulation Systems
- AR Visualization Engine

---

**Built with ❤️ for the automotive industry**

*Making vehicle diagnostics accessible, visual, and intelligent.*
