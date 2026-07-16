import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { IntersectionSimState } from '@/hooks/useTrafficSimulation';
import { useAppStore } from '@/lib/store';

interface IntersectionViewProps {
  intersection: IntersectionSimState;
  onSimulateAccident: () => void;
  onCallEmergency: () => void;
  isDark: boolean;
}

export const IntersectionView = ({
  intersection,
  onSimulateAccident,
  onCallEmergency,
  isDark,
}: IntersectionViewProps) => {
  const { signalState, trafficData, emergencyActive, accidentActive, label, queueLengths } = intersection;
  const { pedestrianPriority, togglePedestrianPriority, currentRole } = useAppStore();
  const pedActive = pedestrianPriority[intersection.id] || false;

  const getSignalColor = (signal: 'green' | 'yellow' | 'red') => {
    switch (signal) {
      case 'green': return 'bg-green-500 shadow-green-400 shadow-lg';
      case 'yellow': return 'bg-yellow-500 shadow-yellow-400 shadow-lg';
      case 'red': return 'bg-red-500 shadow-red-400 shadow-lg';
    }
  };

  const TrafficLight = ({ signal, direction }: { signal: 'green' | 'yellow' | 'red', direction: string }) => (
    <div className="flex flex-col items-center space-y-1">
      <div className={`text-[10px] font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{direction}</div>
      <div className={`p-1 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-800'} flex flex-col gap-0.5`}>
        <div className={`w-3 h-3 rounded-full ${signal === 'red' ? getSignalColor('red') : 'bg-gray-600'}`} />
        <div className={`w-3 h-3 rounded-full ${signal === 'yellow' ? getSignalColor('yellow') : 'bg-gray-600'}`} />
        <div className={`w-3 h-3 rounded-full ${signal === 'green' ? getSignalColor('green') : 'bg-gray-600'}`} />
      </div>
    </div>
  );

  const QueueBar = ({ count, direction, maxQueue = 20 }: { count: number; direction: string; maxQueue?: number }) => (
    <div className="flex items-center gap-2">
      <span className={`text-xs w-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{direction}</span>
      <Progress value={(count / maxQueue) * 100} className="h-2 flex-1" />
      <span className={`text-xs font-mono w-6 text-right ${count > 12 ? 'text-red-500' : isDark ? 'text-gray-300' : 'text-gray-700'}`}>{count}</span>
    </div>
  );

  return (
    <Card className={`p-5 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{label}</h3>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Phase: {signalState.currentPhase.replace('-', ' ').toUpperCase()} • {signalState.timeRemaining}s remaining
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pedActive && <Badge variant="default" className="text-xs">🚶 Pedestrian</Badge>}
          {emergencyActive && <Badge variant="destructive" className="animate-pulse">🚨 EMERGENCY</Badge>}
          {accidentActive && <Badge variant="destructive" className="animate-pulse">⚠️ ACCIDENT</Badge>}
        </div>
      </div>

      {accidentActive && (
        <Alert className="mb-4 border-red-300 bg-red-50 dark:bg-red-900/20">
          <AlertDescription className="flex items-center justify-between text-red-800 dark:text-red-200 gap-2">
            <span className="text-sm">⚠️ Accident detected. All signals RED. Emergency services notified.</span>
            <Button size="sm" variant="destructive" onClick={onCallEmergency}>
              Clear & Resume
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Intersection Visualization */}
      <div className="relative w-full h-56 mx-auto mb-4">
        {/* Roads */}
        <div className={`absolute inset-x-0 top-1/2 -translate-y-1/2 h-14 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded`}>
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] border-t-2 border-dashed border-yellow-400" />
        </div>
        <div className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-14 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded`}>
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] border-l-2 border-dashed border-yellow-400" />
        </div>

        {/* Center controller */}
        <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-xl flex flex-col items-center justify-center ${isDark ? 'bg-gray-600 border-gray-500' : 'bg-yellow-50 border-yellow-300'} border-2`}>
          <div className="text-2xl">🚦</div>
          <div className={`text-sm font-bold ${signalState.timeRemaining <= 5 ? 'text-red-500 animate-pulse' : ''}`}>
            {signalState.timeRemaining}s
          </div>
        </div>

        {/* Traffic lights */}
        <div className="absolute left-1/2 -translate-x-1/2 top-2">
          <TrafficLight signal={signalState.north} direction="N" />
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <TrafficLight signal={signalState.east} direction="E" />
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 bottom-2">
          <TrafficLight signal={signalState.south} direction="S" />
        </div>
        <div className="absolute left-2 top-1/2 -translate-y-1/2">
          <TrafficLight signal={signalState.west} direction="W" />
        </div>

        {/* Vehicle counts */}
        <div className="absolute left-1/2 -translate-x-1/2 top-14">
          <Badge variant={trafficData.northbound > 10 ? "destructive" : "secondary"} className="text-xs">
            {trafficData.northbound} 🚗
          </Badge>
        </div>
        <div className="absolute right-14 top-1/2 -translate-y-1/2">
          <Badge variant={trafficData.eastbound > 10 ? "destructive" : "secondary"} className="text-xs">
            {trafficData.eastbound} 🚗
          </Badge>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 bottom-14">
          <Badge variant={trafficData.southbound > 10 ? "destructive" : "secondary"} className="text-xs">
            {trafficData.southbound} 🚗
          </Badge>
        </div>
        <div className="absolute left-14 top-1/2 -translate-y-1/2">
          <Badge variant={trafficData.westbound > 10 ? "destructive" : "secondary"} className="text-xs">
            {trafficData.westbound} 🚗
          </Badge>
        </div>

        {/* Flow animations */}
        <div className="absolute inset-0 pointer-events-none">
          {signalState.north === 'green' && (
            <div className="absolute top-4 left-1/2 -translate-x-3 w-2 h-8 bg-green-400/50 rounded animate-pulse" />
          )}
          {signalState.east === 'green' && (
            <div className="absolute top-1/2 -translate-y-3 right-4 w-8 h-2 bg-green-400/50 rounded animate-pulse" />
          )}
          {signalState.south === 'green' && (
            <div className="absolute bottom-4 left-1/2 translate-x-1 w-2 h-8 bg-green-400/50 rounded animate-pulse" />
          )}
          {signalState.west === 'green' && (
            <div className="absolute top-1/2 translate-y-1 left-4 w-8 h-2 bg-green-400/50 rounded animate-pulse" />
          )}
        </div>
      </div>

      {/* Queue Length Estimation */}
      <div className={`p-3 rounded-lg mb-4 ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
        <h4 className={`text-xs font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          📊 Queue Length (vehicles waiting)
        </h4>
        <div className="space-y-1.5">
          <QueueBar count={queueLengths.northbound} direction="N" />
          <QueueBar count={queueLengths.eastbound} direction="E" />
          <QueueBar count={queueLengths.southbound} direction="S" />
          <QueueBar count={queueLengths.westbound} direction="W" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex gap-2">
          {currentRole !== 'viewer' && (
            <Button size="sm" variant="outline" onClick={onSimulateAccident} disabled={accidentActive}>
              ⚠️ Simulate Accident
            </Button>
          )}
          {currentRole !== 'viewer' && (
            <Button
              size="sm"
              variant={pedActive ? "default" : "outline"}
              onClick={() => togglePedestrianPriority(intersection.id)}
            >
              🚶 {pedActive ? 'Ped Active' : 'Ped Priority'}
            </Button>
          )}
        </div>
        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Total: {trafficData.northbound + trafficData.southbound + trafficData.eastbound + trafficData.westbound} vehicles
        </div>
      </div>
    </Card>
  );
};