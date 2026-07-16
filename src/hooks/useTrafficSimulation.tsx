import { useState, useEffect, useCallback } from 'react';
import { TrafficData, SignalState, TrafficMetrics, trafficOptimizer } from '@/lib/trafficAlgorithms';
import { useAppStore } from '@/lib/store';

export interface SimulationState {
  trafficData: TrafficData;
  signalState: SignalState;
  metrics: TrafficMetrics;
  isAutoMode: boolean;
  emergencyActive: boolean;
  predictedFlow: TrafficData;
}

type Dir4 = 'north' | 'east' | 'south' | 'west';
type ShortDir = 'n' | 'e' | 's' | 'w';

const shortToLong: Record<ShortDir, Dir4> = { n: 'north', e: 'east', s: 'south', w: 'west' };

const nextDirectionClockwise = (phase: SignalState['currentPhase']): Dir4 => {
  const dir = phase.split('-')[0] as Dir4;
  switch (dir) {
    case 'north': return 'east';
    case 'east': return 'south';
    case 'south': return 'west';
    case 'west': return 'north';
  }
};

const signalsForPhase = (phase: SignalState['currentPhase']): Pick<SignalState, 'north' | 'east' | 'south' | 'west'> => {
  const [dir, color] = phase.split('-') as [Dir4, 'green' | 'yellow'];
  const allRed: Pick<SignalState, 'north' | 'east' | 'south' | 'west'> = { north: 'red', east: 'red', south: 'red', west: 'red' };
  if (color === 'green') {
    return { ...allRed, [dir]: 'green' } as Pick<SignalState, 'north' | 'east' | 'south' | 'west'>;
  }
  return { ...allRed, [dir]: 'yellow' } as Pick<SignalState, 'north' | 'east' | 'south' | 'west'>;
};

export interface IntersectionSimState {
  id: string;
  label: string;
  trafficData: TrafficData;
  predictedFlow: TrafficData;
  signalState: SignalState;
  metrics: TrafficMetrics;
  emergencyActive: boolean;
  accidentActive: boolean;
  queueLengths: TrafficData;
}

export const useTrafficSimulation = () => {
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [corridor, setCorridor] = useState<{ active: boolean; direction: 'ns' | 'ew' | null; timeRemaining: number }>({
    active: false,
    direction: null,
    timeRemaining: 0,
  });

  const { activeScenario, scenarios, addNotification, pedestrianPriority } = useAppStore();

  const makeIntersection = (idx: number): IntersectionSimState => {
    const labels = ['Main St & 1st Ave', 'Main St & 2nd Ave', 'Main St & 3rd Ave', 'Oak Rd & 1st Ave', 'Oak Rd & 2nd Ave', 'Oak Rd & 3rd Ave'];
    const phases: SignalState['currentPhase'][] = ['north-green', 'east-green', 'south-green', 'west-green', 'north-green', 'east-green'];
    const startPhase = phases[idx % phases.length];
    const startGreen = 30;

    return {
      id: `ix-${idx + 1}`,
      label: labels[idx],
      trafficData: { northbound: 5 + (idx % 3), southbound: 3 + (idx % 2), eastbound: 7 + (idx % 4), westbound: 4 + (idx % 3) },
      predictedFlow: { northbound: 2, southbound: 1, eastbound: 3, westbound: 2 },
      signalState: {
        ...(signalsForPhase(startPhase)),
        timeRemaining: startGreen,
        currentPhase: startPhase
      },
      metrics: { avgWaitTime: 25.5, throughput: 45.2, efficiency: 78.3, co2Reduction: 15.7 },
      emergencyActive: false,
      accidentActive: false,
      queueLengths: { northbound: 3, southbound: 2, eastbound: 4, westbound: 2 },
    };
  };

  const [intersections, setIntersections] = useState<IntersectionSimState[]>(
    Array.from({ length: 6 }, (_, i) => makeIntersection(i))
  );

  // Get scenario multipliers
  const getMultipliers = useCallback(() => {
    if (!activeScenario) return { north: 1, east: 1, south: 1, west: 1 };
    const scenario = scenarios.find(s => s.id === activeScenario);
    return scenario?.trafficMultipliers ?? { north: 1, east: 1, south: 1, west: 1 };
  }, [activeScenario, scenarios]);

  // Simulate real-time traffic data updates (NO automatic accidents)
  useEffect(() => {
    const interval = setInterval(() => {
      const multipliers = getMultipliers();

      setIntersections(prev =>
        prev.map(ix => {
          if (ix.accidentActive) return ix; // Don't update traffic during accident

          // Apply scenario multipliers to traffic generation
          const td: TrafficData = {
            northbound: Math.max(0, Math.round((ix.trafficData.northbound + Math.floor(Math.random() * 3) - 1) * (0.9 + multipliers.north * 0.1))),
            southbound: Math.max(0, Math.round((ix.trafficData.southbound + Math.floor(Math.random() * 3) - 1) * (0.9 + multipliers.south * 0.1))),
            eastbound: Math.max(0, Math.round((ix.trafficData.eastbound + Math.floor(Math.random() * 3) - 1) * (0.9 + multipliers.east * 0.1))),
            westbound: Math.max(0, Math.round((ix.trafficData.westbound + Math.floor(Math.random() * 3) - 1) * (0.9 + multipliers.west * 0.1))),
          };
          const pf: TrafficData = {
            northbound: Math.floor(Math.random() * 5 * multipliers.north),
            southbound: Math.floor(Math.random() * 5 * multipliers.south),
            eastbound: Math.floor(Math.random() * 5 * multipliers.east),
            westbound: Math.floor(Math.random() * 5 * multipliers.west),
          };

          // Queue lengths based on red signals
          const ql: TrafficData = {
            northbound: ix.signalState.north === 'red' ? Math.min(20, td.northbound + Math.floor(Math.random() * 3)) : Math.max(0, td.northbound - 2),
            southbound: ix.signalState.south === 'red' ? Math.min(20, td.southbound + Math.floor(Math.random() * 3)) : Math.max(0, td.southbound - 2),
            eastbound: ix.signalState.east === 'red' ? Math.min(20, td.eastbound + Math.floor(Math.random() * 3)) : Math.max(0, td.eastbound - 2),
            westbound: ix.signalState.west === 'red' ? Math.min(20, td.westbound + Math.floor(Math.random() * 3)) : Math.max(0, td.westbound - 2),
          };

          // Check for congestion notifications
          const totalVehicles = td.northbound + td.southbound + td.eastbound + td.westbound;
          if (totalVehicles > 50) {
            addNotification({
              type: 'warning',
              title: `High Congestion: ${ix.label}`,
              message: `Total vehicles: ${totalVehicles}. Consider manual intervention.`
            });
          }

          return {
            ...ix,
            trafficData: td,
            predictedFlow: pf,
            queueLengths: ql,
          };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [getMultipliers, addNotification]);

  // Signal timing countdown and phase switching per intersection
  useEffect(() => {
    const interval = setInterval(() => {
      setIntersections(prev => {
        return prev.map(ix => {
          // If accident active, hold all red and countdown
          if (ix.accidentActive) {
            const newTime = Math.max(0, ix.signalState.timeRemaining - 1);
            return {
              ...ix,
              signalState: { ...ix.signalState, timeRemaining: newTime },
            };
          }

          // If pedestrian priority active for this intersection, give extra time to current green
          const pedActive = pedestrianPriority[ix.id];

          // If green corridor active, enforce corridor signals
          if (corridor.active) {
            const enforced: SignalState =
              corridor.direction === 'ns'
                ? { north: 'green', south: 'green', east: 'red', west: 'red', timeRemaining: corridor.timeRemaining, currentPhase: 'north-green' }
                : { north: 'red', south: 'red', east: 'green', west: 'green', timeRemaining: corridor.timeRemaining, currentPhase: 'east-green' };
            return { ...ix, signalState: enforced };
          }

          const newTimeRemaining = ix.signalState.timeRemaining - 1;
          if (newTimeRemaining > 0) {
            return { ...ix, signalState: { ...ix.signalState, timeRemaining: newTimeRemaining } };
          }

          // Switch phases for this intersection
          let newSignalState: SignalState;
          if (ix.signalState.currentPhase.endsWith('green')) {
            const dir = ix.signalState.currentPhase.split('-')[0] as Dir4;
            const yellowPhase = `${dir}-yellow` as SignalState['currentPhase'];
            newSignalState = {
              ...signalsForPhase(yellowPhase),
              timeRemaining: trafficOptimizer.getYellowTime(),
              currentPhase: yellowPhase
            };
          } else {
            const nextDir = nextDirectionClockwise(ix.signalState.currentPhase);
            const greenPhase = `${nextDir}-green` as SignalState['currentPhase'];
            let greenTime = isAutoMode
              ? trafficOptimizer.calculateOptimalTimingForDirection(nextDir, ix.trafficData, ix.predictedFlow)
              : 30;

            // Add pedestrian crossing time if active
            if (pedActive) {
              greenTime = Math.max(greenTime, 20); // Minimum 20s for pedestrians
            }

            newSignalState = {
              ...signalsForPhase(greenPhase),
              timeRemaining: greenTime,
              currentPhase: greenPhase
            };
          }

          const metrics = trafficOptimizer.calculateMetrics(
            ix.trafficData,
            newSignalState,
            newSignalState.timeRemaining + trafficOptimizer.getYellowTime()
          );

          return { ...ix, signalState: newSignalState, metrics };
        });
      });

      // Corridor timer countdown
      if (corridor.active) {
        setCorridor(prev => ({
          ...prev,
          timeRemaining: Math.max(0, prev.timeRemaining - 1),
          active: prev.timeRemaining - 1 > 0
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAutoMode, corridor.active, corridor.direction, corridor.timeRemaining, pedestrianPriority]);

  const toggleMode = useCallback(() => {
    setIsAutoMode(prev => !prev);
  }, []);

  // Apply a manual override to a SINGLE intersection
  const manualOverrideSingle = useCallback((intersectionIndex: number, direction: ShortDir) => {
    setIntersections(prev => prev.map((ix, i) => {
      if (i !== intersectionIndex) return ix;
      const dir = shortToLong[direction];
      const greenPhase = `${dir}-green` as SignalState['currentPhase'];
      return {
        ...ix,
        signalState: {
          ...signalsForPhase(greenPhase),
          timeRemaining: 30,
          currentPhase: greenPhase
        }
      };
    }));
  }, []);

  // Trigger emergency on a specific intersection
  const triggerEmergencySingle = useCallback((intersectionIndex: number, direction: ShortDir) => {
    setIntersections(prev => prev.map((ix, i) => {
      if (i !== intersectionIndex) return ix;
      return {
        ...ix,
        emergencyActive: true,
        signalState: trafficOptimizer.handleEmergencyVehicle(ix.signalState, direction)
      };
    }));
    // Clear emergency after 30s
    setTimeout(() => {
      setIntersections(prev => prev.map((ix, i) => i === intersectionIndex ? { ...ix, emergencyActive: false } : ix));
    }, 30_000);
  }, []);

  // Simulate an accident on a specific intersection (MANUAL ONLY)
  const simulateAccident = useCallback((index: number) => {
    setIntersections(prev => prev.map((ix, i) => i === index
      ? { ...ix, accidentActive: true, signalState: { north: 'red', east: 'red', south: 'red', west: 'red', timeRemaining: 30, currentPhase: ix.signalState.currentPhase } }
      : ix
    ));
    addNotification({
      type: 'error',
      title: 'Accident Detected',
      message: `Manual accident simulation at intersection ${index + 1}. All signals set to RED.`
    });
  }, [addNotification]);

  // Clear an accident
  const clearAccident = useCallback((index: number) => {
    setIntersections(prev => prev.map((ix, i) => {
      if (i !== index) return ix;
      const nextDir = nextDirectionClockwise(ix.signalState.currentPhase);
      const greenPhase = `${nextDir}-green` as SignalState['currentPhase'];
      return {
        ...ix,
        accidentActive: false,
        signalState: {
          ...signalsForPhase(greenPhase),
          timeRemaining: 30,
          currentPhase: greenPhase
        }
      };
    }));
  }, []);

  // Green Corridor across ALL intersections
  const triggerGreenCorridor = useCallback((direction: 'ns' | 'ew', duration = 30) => {
    setCorridor({ active: true, direction, timeRemaining: duration });
    addNotification({
      type: 'info',
      title: 'Green Corridor Activated',
      message: `${direction === 'ns' ? 'North-South' : 'East-West'} corridor engaged for ${duration}s.`
    });
  }, [addNotification]);

  return {
    intersections,
    isAutoMode,
    corridorActive: corridor.active,
    corridorDirection: corridor.direction,
    toggleMode,
    manualOverrideSingle,
    triggerEmergencySingle,
    simulateAccident,
    clearAccident,
    triggerGreenCorridor,
  };
};