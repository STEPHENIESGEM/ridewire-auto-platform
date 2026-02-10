/**
 * DiagnosticAgent Test Suite
 * Tests for AI-powered vehicle diagnostic analysis
 */

const DiagnosticAgent = require('../src/agents/diagnosticAgent');

describe('DiagnosticAgent', () => {
  let agent;

  beforeEach(() => {
    agent = new DiagnosticAgent({
      aiProvider: 'openai',
      model: 'gpt-4'
    });
  });

  describe('Initialization', () => {
    test('should create agent with correct configuration', () => {
      expect(agent).toBeDefined();
      expect(agent.config.aiProvider).toBe('openai');
      expect(agent.config.model).toBe('gpt-4');
    });

    test('should use default configuration when not provided', () => {
      const defaultAgent = new DiagnosticAgent();
      expect(defaultAgent.config.aiProvider).toBe('openai');
    });
  });

  describe('Diagnostic Analysis', () => {
    test('should analyze diagnostic codes', async () => {
      const vehicleData = {
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        dtcCodes: ['P0420'],
        symptoms: ['Check engine light']
      };

      const result = await agent.analyzeDiagnostics(vehicleData);
      
      expect(result).toHaveProperty('analysis');
      expect(result).toHaveProperty('recommendations');
      expect(result.dtcCodes).toEqual(['P0420']);
    });

    test('should handle multiple DTC codes', async () => {
      const vehicleData = {
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        dtcCodes: ['P0420', 'P0171', 'P0174'],
        symptoms: ['Check engine light', 'Rough idle']
      };

      const result = await agent.analyzeDiagnostics(vehicleData);
      
      expect(result.dtcCodes.length).toBe(3);
      expect(result.analysis).toBeDefined();
    });

    test('should prioritize critical issues', async () => {
      const vehicleData = {
        make: 'Honda',
        model: 'Civic',
        year: 2019,
        dtcCodes: ['P0301', 'P0420'],
        symptoms: ['Engine misfire', 'Reduced power']
      };

      const result = await agent.analyzeDiagnostics(vehicleData);
      
      expect(result.priority).toBeDefined();
      expect(result.severity).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid vehicle data', async () => {
      const invalidData = {
        make: '',
        model: '',
        dtcCodes: []
      };

      await expect(agent.analyzeDiagnostics(invalidData))
        .rejects.toThrow('Invalid vehicle data');
    });

    test('should handle AI service errors', async () => {
      const vehicleData = {
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        dtcCodes: ['P0420']
      };

      // Simulate AI service failure
      agent.aiService = null;

      await expect(agent.analyzeDiagnostics(vehicleData))
        .rejects.toThrow();
    });
  });

  describe('DTC Code Interpretation', () => {
    test('should interpret standard OBD-II codes', () => {
      const code = 'P0420';
      const interpretation = agent.interpretDTCCode(code);
      
      expect(interpretation).toHaveProperty('code');
      expect(interpretation).toHaveProperty('description');
      expect(interpretation).toHaveProperty('category');
    });

    test('should identify manufacturer-specific codes', () => {
      const code = 'B1234';
      const interpretation = agent.interpretDTCCode(code);
      
      expect(interpretation.category).toBe('body');
    });

    test('should return unknown for invalid codes', () => {
      const code = 'INVALID';
      const interpretation = agent.interpretDTCCode(code);
      
      expect(interpretation.description).toContain('Unknown');
    });
  });

  describe('Recommendations', () => {
    test('should generate repair recommendations', async () => {
      const vehicleData = {
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        dtcCodes: ['P0420']
      };

      const result = await agent.analyzeDiagnostics(vehicleData);
      
      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations[0]).toHaveProperty('action');
      expect(result.recommendations[0]).toHaveProperty('priority');
    });

    test('should include cost estimates', async () => {
      const vehicleData = {
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        dtcCodes: ['P0420']
      };

      const result = await agent.analyzeDiagnostics(vehicleData);
      
      expect(result).toHaveProperty('estimatedCost');
      expect(typeof result.estimatedCost).toBe('object');
    });
  });

  describe('Performance', () => {
    test('should complete analysis within timeout', async () => {
      const vehicleData = {
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        dtcCodes: ['P0420']
      };

      const start = Date.now();
      await agent.analyzeDiagnostics(vehicleData);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(10000); // 10 seconds
    });
  });
});

// Export for integration tests
module.exports = {
  DiagnosticAgent
};
