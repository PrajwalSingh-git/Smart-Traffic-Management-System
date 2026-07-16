export interface TrafficData {
  northbound: number;
  southbound: number;
  eastbound: number;
  westbound: number;
}

export type Light = 'green' | 'yellow' | 'red';
export type Phase =
  | 'north-green' | 'north-yellow'
  | 'east-green' | 'east-yellow'
  | 'south-green' | 'south-yellow'
  | 'west-green' | 'west-yellow';

export interface SignalState {
  north: Light;
  east: Light;
  south: Light;
  west: Light;
  timeRemaining: number;
  currentPhase: Phase;
}

export interface TrafficMetrics {
  avgWaitTime: number;
  throughput: number;
  efficiency: number;
  co2Reduction: number;
}

export class TrafficOptimizer {
  private minGreenTime = 15; // seconds
  private maxGreenTime = 60; // seconds
  private yellowTime = 3; // seconds

  getYellowTime() {
    return this.yellowTime;
  }

  calculateOptimalTimingForDirection(
    direction: 'north' | 'east' | 'south' | 'west',
    trafficData: TrafficData,
    predictedFlow?: TrafficData
  ): number {
    // Current counts by direction
    const currentMap: Record<typeof direction, number> = {
      north: trafficData.northbound,
      east: trafficData.eastbound,
      south: trafficData.southbound,
      west: trafficData.westbound,
    };

    // Predicted counts by direction (weighted)
    const predMap: Record<typeof direction, number> = {
      north: predictedFlow ? predictedFlow.northbound * 0.3 : 0,
      east: predictedFlow ? predictedFlow.eastbound * 0.3 : 0,
      south: predictedFlow ? predictedFlow.southbound * 0.3 : 0,
      west: predictedFlow ? predictedFlow.westbound * 0.3 : 0,
    };

    const totals: Record<typeof direction, number> = {
      north: currentMap.north + predMap.north,
      east: currentMap.east + predMap.east,
      south: currentMap.south + predMap.south,
      west: currentMap.west + predMap.west,
    };

    const totalTraffic = totals.north + totals.east + totals.south + totals.west;
    if (totalTraffic === 0) return this.minGreenTime;

    const share = totals[direction] / totalTraffic;
    const baseTime = this.minGreenTime + (this.maxGreenTime - this.minGreenTime) * share;

    return Math.max(this.minGreenTime, Math.min(this.maxGreenTime, Math.round(baseTime)));
  }

  handleEmergencyVehicle(
    currentSignal: SignalState,
    emergencyDirection: 'n' | 'e' | 's' | 'w'
  ): SignalState {
    // Immediately switch to green for the emergency approach, all others red
    const map: Record<'n' | 'e' | 's' | 'w', SignalState> = {
      n: { north: 'green', east: 'red', south: 'red', west: 'red', timeRemaining: 30, currentPhase: 'north-green' },
      e: { north: 'red', east: 'green', south: 'red', west: 'red', timeRemaining: 30, currentPhase: 'east-green' },
      s: { north: 'red', east: 'red', south: 'green', west: 'red', timeRemaining: 30, currentPhase: 'south-green' },
      w: { north: 'red', east: 'red', south: 'red', west: 'green', timeRemaining: 30, currentPhase: 'west-green' },
    };
    return map[emergencyDirection];
  }

  calculateMetrics(trafficData: TrafficData, signalState: SignalState, cycleTime: number): TrafficMetrics {
    const totalVehicles = Object.values(trafficData).reduce((sum, count) => sum + count, 0);

    // Simulated metrics calculations
    const avgWaitTime = Math.max(5, 45 - totalVehicles * 0.5); // better with more vehicles processed
    const throughput = Math.min(100, totalVehicles * 2.5); // vehicles per minute
    const efficiency = Math.min(100, ((120 - cycleTime) / 120) * 100); // based on cycle time
    const co2Reduction = Math.max(0, (60 - avgWaitTime) * 0.8); // percentage proxy

    return {
      avgWaitTime: Math.round(avgWaitTime * 10) / 10,
      throughput: Math.round(throughput * 10) / 10,
      efficiency: Math.round(efficiency * 10) / 10,
      co2Reduction: Math.round(co2Reduction * 10) / 10,
    };
  }
}

export const trafficOptimizer = new TrafficOptimizer();