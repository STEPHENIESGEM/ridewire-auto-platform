import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import config from '../core/config.js';
import logger from '../core/logger.js';

/**
 * Diagnostic Agent - AI-powered vehicle diagnostic analysis
 * Leverages OpenAI GPT-4 and Anthropic Claude for intelligent fault diagnosis
 * Integrates with NOVA core for multi-agent consensus
 */
class DiagnosticAgent {
  constructor() {
    this.openai = new OpenAI({ apiKey: config.ai.openai.apiKey });
    this.anthropic = new Anthropic({ apiKey: config.ai.anthropic.apiKey });
    this.novaEnabled = config.nova.enabled;
  }

  /**
   * Analyze diagnostic trouble codes (DTCs) and symptoms
   * @param {Object} diagnosticData - Vehicle diagnostic information
   * @returns {Promise<Object>} Analysis results with confidence scores
   */
  async analyzeDiagnostics(diagnosticData) {
    const { dtcCodes, symptoms, vehicleInfo, sensorData } = diagnosticData;

    try {
      logger.info('Starting diagnostic analysis', { dtcCodes, vehicleInfo });

      // Primary analysis with GPT-4
      const gptAnalysis = await this.analyzeWithGPT4(dtcCodes, symptoms, vehicleInfo, sensorData);

      // Secondary validation with Claude for complex cases
      let claudeAnalysis = null;
      if (gptAnalysis.confidence < 0.85 || dtcCodes.length > 3) {
        claudeAnalysis = await this.analyzeWithClaude(dtcCodes, symptoms, vehicleInfo, sensorData);
      }

      // Consensus via NOVA if enabled
      let consensus = gptAnalysis;
      if (this.novaEnabled && claudeAnalysis) {
        consensus = await this.getNovaConsensus(gptAnalysis, claudeAnalysis);
      }

      return {
        diagnosis: consensus.diagnosis,
        rootCause: consensus.rootCause,
        confidence: consensus.confidence,
        recommendedActions: consensus.actions,
        estimatedCost: consensus.costRange,
        urgency: consensus.urgency,
        partsNeeded: consensus.parts,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Diagnostic analysis failed', error);
      throw new Error(`Diagnostic analysis failed: ${error.message}`);
    }
  }

  async analyzeWithGPT4(dtcCodes, symptoms, vehicleInfo, sensorData) {
    const prompt = this.buildDiagnosticPrompt(dtcCodes, symptoms, vehicleInfo, sensorData);

    const completion = await this.openai.chat.completions.create({
      model: config.ai.openai.model,
      messages: [
        { role: 'system', content: 'You are an expert automotive diagnostic technician with deep knowledge of vehicle systems, DTCs, and repair procedures.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    return JSON.parse(completion.choices[0].message.content);
  }

  async analyzeWithClaude(dtcCodes, symptoms, vehicleInfo, sensorData) {
    const prompt = this.buildDiagnosticPrompt(dtcCodes, symptoms, vehicleInfo, sensorData);

    const message = await this.anthropic.messages.create({
      model: config.ai.anthropic.model,
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    return JSON.parse(message.content[0].text);
  }

  async getNovaConsensus(gptAnalysis, claudeAnalysis) {
    // Placeholder for NOVA integration - would call private NOVA core
    logger.info('Using NOVA consensus mechanism');
    
    // Simple weighted average for now
    const avgConfidence = (gptAnalysis.confidence + claudeAnalysis.confidence) / 2;
    return avgConfidence > gptAnalysis.confidence ? gptAnalysis : claudeAnalysis;
  }

  buildDiagnosticPrompt(dtcCodes, symptoms, vehicleInfo, sensorData) {
    return `Analyze the following vehicle diagnostic data and provide a detailed assessment:

**Vehicle Information:**
- Make/Model: ${vehicleInfo.make} ${vehicleInfo.model}
- Year: ${vehicleInfo.year}
- Mileage: ${vehicleInfo.mileage}
- Engine: ${vehicleInfo.engine}

**Diagnostic Trouble Codes (DTCs):**
${dtcCodes.map(code => `- ${code.code}: ${code.description}`).join('\n')}

**Reported Symptoms:**
${symptoms.join('\n- ')}

**Sensor Data:**
${JSON.stringify(sensorData, null, 2)}

Provide your analysis in JSON format with the following structure:
{
  "diagnosis": "Brief diagnostic summary",
  "rootCause": "Primary root cause identified",
  "confidence": 0.0-1.0,
  "actions": ["Recommended repair actions"],
  "costRange": {"min": 0, "max": 0},
  "urgency": "low|medium|high|critical",
  "parts": ["List of parts needed"]
}`;
  }
}

export default new DiagnosticAgent();
