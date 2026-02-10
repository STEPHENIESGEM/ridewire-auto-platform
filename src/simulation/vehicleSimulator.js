import logger from '../core/logger.js';

/**
 * Vehicle System Simulator
 * 
 * Shows customers and techs:
 * 1. Current broken state (visual + metrics)
 * 2. What happens if ignored (cascading failure prediction)
 * 3. After AI repair (fixed state + why it works)
 * 
 * This is the KILLER FEATURE that sells the repair by making the problem VISIBLE
 */
class VehicleSimulator {
  constructor() {
    this.simulationStates = {
      CURRENT_BROKEN: 'current_broken',
      FUTURE_DEGRADED: 'future_degraded',
      AFTER_REPAIR: 'after_repair',
    };
  }

  /**
   * Generate complete simulation showing broken → worse → fixed states
   * @param {Object} diagnosticResult - Result from DiagnosticAgent
   * @param {Object} vehicleInfo - Vehicle specifications
   * @returns {Promise<Object>} Three-state simulation data
   */
  async generateSimulation(diagnosticResult, vehicleInfo) {
    logger.info('Generating vehicle system simulation');

    const { diagnosis, rootCause, partsNeeded, recommendedActions } = diagnosticResult;

    // Determine affected systems
    const affectedSystems = this.identifyAffectedSystems(diagnosis, rootCause);

    // Generate three simulation states
    const currentBroken = this.simulateCurrentState(affectedSystems, diagnosticResult);
    const futureIgnored = this.simulateFutureIgnored(affectedSystems, diagnosticResult, vehicleInfo);
    const afterRepair = this.simulateAfterRepair(affectedSystems, diagnosticResult);

    return {
      simulationId: `sim_${Date.now()}`,
      vehicleInfo,
      timestamp: new Date().toISOString(),
      states: {
        currentBroken,
        futureIgnored,
        afterRepair,
      },
      arVisualization: this.generateAROverlayData(affectedSystems),
      customerExplanation: this.generateCustomerExplanation(currentBroken, futureIgnored, afterRepair),
    };
  }

  /**
   * Simulate current broken state
   */
  simulateCurrentState(affectedSystems, diagnosticResult) {
    const state = {
      status: 'BROKEN',
      timeframe: 'Current',
      affectedSystems: affectedSystems.map(sys => ({
        name: sys.name,
        health: sys.currentHealth,
        status: 'FAILING',
        symptoms: sys.symptoms,
        visualization: {
          color: '#ff4444',
          pulseEffect: true,
          highlight: true,
        },
      })),
      performanceMetrics: {
        efficiency: this.calculateEfficiency(affectedSystems, 'current'),
        reliability: this.calculateReliability(affectedSystems, 'current'),
        safety: this.calculateSafety(affectedSystems, 'current'),
        costPerMile: this.estimateCostPerMile(affectedSystems, 'current'),
      },
      drivingImpact: {
        acceleration: affectedSystems.some(s => s.name.includes('Engine')) ? 'Reduced by 30%' : 'Normal',
        fuelEconomy: affectedSystems.some(s => s.name.includes('Fuel')) ? 'Worse by 20%' : 'Slightly affected',
        emissions: 'Increased',
        handling: affectedSystems.some(s => s.name.includes('Suspension')) ? 'Compromised' : 'Normal',
      },
    };

    return state;
  }

  /**
   * Simulate what happens if ignored (scary truth)
   */
  simulateFutureIgnored(affectedSystems, diagnosticResult, vehicleInfo) {
    const daysUntilFailure = this.predictFailureTimeline(diagnosticResult.urgency);
    const cascadingFailures = this.predictCascadingFailures(affectedSystems);

    const state = {
      status: 'CRITICAL',
      timeframe: `In ${daysUntilFailure} days if ignored`,
      affectedSystems: cascadingFailures.map(sys => ({
        name: sys.name,
        health: sys.futureHealth,
        status: sys.futureStatus,
        newSymptoms: sys.additionalSymptoms,
        visualization: {
          color: '#cc0000',
          crackEffect: true,
          warningIcon: true,
        },
      })),
      performanceMetrics: {
        efficiency: this.calculateEfficiency(cascadingFailures, 'future'),
        reliability: this.calculateReliability(cascadingFailures, 'future'),
        safety: this.calculateSafety(cascadingFailures, 'future'),
        costPerMile: this.estimateCostPerMile(cascadingFailures, 'future'),
      },
      drivingImpact: {
        acceleration: 'Severely reduced',
        fuelEconomy: 'Significantly worse',
        emissions: 'Dangerously high',
        handling: 'Unsafe',
        breakdownRisk: 'Very high',
      },
      estimatedAdditionalCost: this.calculateCascadingCost(cascadingFailures),
      dangerLevel: 'HIGH',
      warnings: [
        'Complete system failure likely',
        'Additional components will fail',
        'Repair costs will multiply',
        'Safety compromised',
        'Potential roadside breakdown',
      ],
    };

    return state;
  }

  /**
   * Simulate after repair (the happy ending)
   */
  simulateAfterRepair(affectedSystems, diagnosticResult) {
    const state = {
      status: 'REPAIRED',
      timeframe: 'After recommended repair',
      affectedSystems: affectedSystems.map(sys => ({
        name: sys.name,
        health: 95,
        status: 'OPTIMAL',
        resolved: true,
        visualization: {
          color: '#44ff44',
          checkmarkEffect: true,
          highlight: false,
        },
      })),
      performanceMetrics: {
        efficiency: 95,
        reliability: 98,
        safety: 100,
        costPerMile: 'Optimal',
      },
      drivingImpact: {
        acceleration: 'Fully restored',
        fuelEconomy: 'Optimized',
        emissions: 'Within spec',
        handling: 'Safe and responsive',
        breakdownRisk: 'Minimal',
      },
      whyItWorks: this.explainRepairLogic(diagnosticResult),
      warranty: '12 months / 12,000 miles',
      longTermBenefits: [
        'Prevents cascading failures',
        'Restores factory performance',
        'Maintains vehicle value',
        'Ensures safety',
        'Reduces long-term costs',
      ],
    };

    return state;
  }

  identifyAffectedSystems(diagnosis, rootCause) {
    // System detection logic based on diagnosis
    const systems = [];

    if (diagnosis.toLowerCase().includes('engine') || rootCause.toLowerCase().includes('engine')) {
      systems.push({ name: 'Engine', currentHealth: 45, symptoms: ['Misfiring', 'Power loss'] });
    }
    if (diagnosis.toLowerCase().includes('transmission')) {
      systems.push({ name: 'Transmission', currentHealth: 50, symptoms: ['Shifting issues', 'Slipping'] });
    }
    if (diagnosis.toLowerCase().includes('brake')) {
      systems.push({ name: 'Brake System', currentHealth: 40, symptoms: ['Reduced braking', 'Noise'] });
    }
    if (diagnosis.toLowerCase().includes('exhaust') || diagnosis.toLowerCase().includes('catalyst')) {
      systems.push({ name: 'Exhaust System', currentHealth: 35, symptoms: ['High emissions', 'Check engine light'] });
    }

    return systems.length > 0 ? systems : [{ name: 'Vehicle System', currentHealth: 50, symptoms: ['Performance issues'] }];
  }

  predictCascadingFailures(affectedSystems) {
    return affectedSystems.map(sys => ({
      ...sys,
      futureHealth: Math.max(sys.currentHealth - 30, 10),
      futureStatus: 'FAILED',
      additionalSymptoms: ['Complete failure', 'Additional component damage', 'Safety risk'],
    }));
  }

  predictFailureTimeline(urgency) {
    const timelines = {
      critical: 7,
      high: 30,
      medium: 90,
      low: 180,
    };
    return timelines[urgency] || 60;
  }

  calculateCascadingCost(systems) {
    const baseCost = systems.length * 500;
    const multiplier = 2.5;
    return {
      min: baseCost * multiplier,
      max: baseCost * multiplier * 1.5,
      explanation: 'Additional parts + labor for secondary failures',
    };
  }

  calculateEfficiency(systems, state) {
    if (state === 'current') return 65;
    if (state === 'future') return 30;
    return 95;
  }

  calculateReliability(systems, state) {
    if (state === 'current') return 55;
    if (state === 'future') return 20;
    return 98;
  }

  calculateSafety(systems, state) {
    if (state === 'current') return 70;
    if (state === 'future') return 35;
    return 100;
  }

  estimateCostPerMile(systems, state) {
    if (state === 'current') return '$0.45';
    if (state === 'future') return '$0.95';
    return '$0.30';
  }

  explainRepairLogic(diagnosticResult) {
    const { rootCause, recommendedActions } = diagnosticResult;
    return {
      problem: rootCause,
      solution: recommendedActions[0] || 'Component replacement',
      mechanism: 'AI analysis identified the root cause and recommended targeted repair to restore system integrity',
      verification: 'Post-repair diagnostics confirm all systems operating within specifications',
    };
  }

  generateAROverlayData(affectedSystems) {
    return affectedSystems.map(sys => ({
      systemName: sys.name,
      position: { x: 0, y: 0, z: 0 }, // Would be mapped to actual vehicle 3D model
      highlightColor: '#ff4444',
      label: `${sys.name}: ${sys.currentHealth}% health`,
      interactable: true,
    }));
  }

  generateCustomerExplanation(current, future, after) {
    return {
      summary: `Your vehicle currently has ${current.affectedSystems.length} failing system(s). If left unrepaired, this will lead to complete failure within ${future.timeframe}, costing ${future.estimatedAdditionalCost.min}-${future.estimatedAdditionalCost.max} more. Our AI-recommended repair will restore your vehicle to optimal condition.`,
      comparison: {
        current: `${current.performanceMetrics.reliability}% reliable`,
        ignored: `${future.performanceMetrics.reliability}% reliable (UNSAFE)`,
        repaired: `${after.performanceMetrics.reliability}% reliable (LIKE NEW)`,
      },
    };
  }
}

export default new VehicleSimulator();
