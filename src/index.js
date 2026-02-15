import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './core/config.js';
import logger from './core/logger.js';
import diagnosticAgent from './agents/diagnosticAgent.js';
import vehicleSimulator from './simulation/vehicleSimulator.js';
import paymentRoutes from './routes/payment-routes.js';
import legalMiddleware from './middleware/legal-acceptance.js';
import { generateSampleAnalysis, getDiagnosticExamples } from './diagnostics/sample-diagnostic.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({ origin: config.security.corsOrigin }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Serve legal documents
app.use(express.static(path.join(__dirname, '..')));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.api(req.method, req.path, res.statusCode, duration);
  });
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'ridewire-auto',
    timestamp: new Date().toISOString(),
    nova: config.nova.enabled,
  });
});

// Home page redirect
app.get('/', (req, res) => {
  res.redirect('/pricing.html');
});

// Payment Routes
app.use('/api/payment', paymentRoutes);

// Legal acceptance routes
app.post('/api/legal/accept', (req, res) => {
  try {
    const { documents, timestamp, ipAddress, userAgent: reqUserAgent } = req.body;
    const userId = req.headers['x-user-id'] || 'anonymous';
    const userAgent = reqUserAgent || req.headers['user-agent'];
    const ip = ipAddress || req.ip;

    const result = legalMiddleware.recordLegalAcceptance(
      userId,
      documents,
      ip,
      userAgent
    );

    res.json(result);
  } catch (error) {
    logger.error('Legal acceptance recording failed', { error: error.message });
    res.status(500).json({ 
      error: 'Failed to record acceptance', 
      details: error.message 
    });
  }
});

app.get('/api/legal/status', (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId || 'anonymous';
    const userType = req.query.userType || 'user';

    const status = legalMiddleware.checkLegalAcceptance(userId, userType);
    res.json(status);
  } catch (error) {
    logger.error('Legal status check failed', { error: error.message });
    res.status(500).json({ 
      error: 'Failed to check legal status', 
      details: error.message 
    });
  }
});

app.get('/api/legal/versions', (req, res) => {
  try {
    const versions = legalMiddleware.getCurrentLegalVersions();
    res.json(versions);
  } catch (error) {
    logger.error('Legal versions fetch failed', { error: error.message });
    res.status(500).json({ 
      error: 'Failed to fetch legal versions', 
      details: error.message 
    });
  }
});

// API Routes

// Sample diagnostic endpoint
app.post('/api/v1/diagnostic/sample', async (req, res) => {
  try {
    const { dtcCode, vehicleInfo, symptoms } = req.body;

    if (!dtcCode) {
      return res.status(400).json({ error: 'DTC code is required' });
    }

    logger.diagnostic('Sample diagnostic requested', { dtcCode, vehicleInfo });

    const result = await generateSampleAnalysis({
      dtcCode,
      vehicleInfo: vehicleInfo || { make: 'Generic', model: 'Vehicle', year: 2020 },
      symptoms: symptoms || [],
    });

    res.json(result);
  } catch (error) {
    logger.error('Sample diagnostic failed', { error: error.message });
    res.status(500).json({ 
      error: 'Sample diagnostic analysis failed', 
      details: error.message 
    });
  }
});

// Get diagnostic examples
app.get('/api/v1/diagnostic/examples', (req, res) => {
  try {
    const examples = getDiagnosticExamples();
    res.json({ success: true, data: examples });
  } catch (error) {
    logger.error('Failed to fetch examples', { error: error.message });
    res.status(500).json({ 
      error: 'Failed to fetch diagnostic examples', 
      details: error.message 
    });
  }
});

// Diagnostic analysis endpoint
app.post('/api/v1/diagnostic/analyze', async (req, res) => {
  try {
    const { dtcCodes, symptoms, vehicleInfo, sensorData } = req.body;
    
    if (!dtcCodes || !vehicleInfo) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    logger.diagnostic('Starting analysis', { vehicleInfo });
    
    const result = await diagnosticAgent.analyzeDiagnostics({
      dtcCodes,
      symptoms: symptoms || [],
      vehicleInfo,
      sensorData: sensorData || {},
    });

    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Diagnostic analysis failed', { error: error.message });
    res.status(500).json({ error: 'Diagnostic analysis failed', details: error.message });
  }
});

// Simulation endpoint
app.post('/api/v1/simulation/generate', async (req, res) => {
  try {
    const { diagnosticResult, vehicleInfo } = req.body;
    
    if (!diagnosticResult || !vehicleInfo) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    logger.simulation('Generating simulation', { vehicleInfo });
    
    const simulation = await vehicleSimulator.generateSimulation(
      diagnosticResult,
      vehicleInfo
    );

    res.json({ success: true, data: simulation });
  } catch (error) {
    logger.error('Simulation generation failed', { error: error.message });
    res.status(500).json({ error: 'Simulation generation failed', details: error.message });
  }
});

// Combined analysis + simulation endpoint
app.post('/api/v1/complete-analysis', async (req, res) => {
  try {
    const { dtcCodes, symptoms, vehicleInfo, sensorData } = req.body;
    
    // Step 1: Diagnostic analysis
    const diagnosticResult = await diagnosticAgent.analyzeDiagnostics({
      dtcCodes,
      symptoms: symptoms || [],
      vehicleInfo,
      sensorData: sensorData || {},
    });

    // Step 2: Generate simulation
    const simulation = await vehicleSimulator.generateSimulation(
      diagnosticResult,
      vehicleInfo
    );

    res.json({ 
      success: true, 
      data: {
        diagnostic: diagnosticResult,
        simulation,
      }
    });
  } catch (error) {
    logger.error('Complete analysis failed', { error: error.message });
    res.status(500).json({ error: 'Complete analysis failed', details: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ 
    error: 'Internal server error',
    message: config.env === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`🚀 RideWire Auto platform running on port ${PORT}`);
  logger.info(`Environment: ${config.env}`);
  logger.info(`NOVA enabled: ${config.nova.enabled}`);
});

export default app;
