import express from 'express';
import cors from 'cors';
import config from './core/config.js';
import logger from './core/logger.js';
import diagnosticAgent from './agents/diagnosticAgent.js';
import vehicleSimulator from './simulation/vehicleSimulator.js';

const app = express();

// Middleware
app.use(cors({ origin: config.security.corsOrigin }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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

// API Routes

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
