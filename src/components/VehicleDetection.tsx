import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IntersectionSimState } from '@/hooks/useTrafficSimulation';

interface VehicleDetectionProps {
  intersections: IntersectionSimState[];
  isDark: boolean;
}

export const VehicleDetection = ({ intersections, isDark }: VehicleDetectionProps) => {
  const maxVehicles = 20;

  const DetectionLane = ({
    direction,
    current,
    predicted,
    icon
  }: {
    direction: string;
    current: number;
    predicted: number;
    icon: string;
  }) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <span className="text-sm">{icon}</span>
          <span className="font-medium text-xs">{direction}</span>
        </div>
        <Badge variant={current > 10 ? "destructive" : current > 5 ? "default" : "secondary"} className="text-xs">
          {current}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Progress value={(current / maxVehicles) * 100} className="h-1.5 flex-1" />
        <span className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>+{predicted}</span>
      </div>
    </div>
  );

  return (
    <Card className={`p-5 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Vehicle Detection</h3>
        <Badge variant="default" className="text-xs">CV Active</Badge>
      </div>

      <Tabs defaultValue={intersections[0]?.id} className="w-full">
        <TabsList className={`grid grid-cols-3 mb-3 ${isDark ? 'bg-gray-700' : ''}`}>
          {intersections.slice(0, 3).map((ix) => (
            <TabsTrigger key={ix.id} value={ix.id} className="text-[10px] px-1">
              {ix.label.split(' & ')[0]}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsList className={`grid grid-cols-3 mb-3 ${isDark ? 'bg-gray-700' : ''}`}>
          {intersections.slice(3, 6).map((ix) => (
            <TabsTrigger key={ix.id} value={ix.id} className="text-[10px] px-1">
              {ix.label.split(' & ')[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        {intersections.map((ix) => {
          const totalCurrent = ix.trafficData.northbound + ix.trafficData.southbound + ix.trafficData.eastbound + ix.trafficData.westbound;
          const totalPredicted = ix.predictedFlow.northbound + ix.predictedFlow.southbound + ix.predictedFlow.eastbound + ix.predictedFlow.westbound;

          return (
            <TabsContent key={ix.id} value={ix.id} className="space-y-3">
              {/* Stats */}
              <div className={`grid grid-cols-2 gap-3 p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">{totalCurrent}</div>
                  <div className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Detected</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">+{totalPredicted}</div>
                  <div className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Incoming</div>
                </div>
              </div>

              {/* Lanes */}
              <div className="space-y-2">
                <DetectionLane direction="North" current={ix.trafficData.northbound} predicted={ix.predictedFlow.northbound} icon="⬆️" />
                <DetectionLane direction="South" current={ix.trafficData.southbound} predicted={ix.predictedFlow.southbound} icon="⬇️" />
                <DetectionLane direction="East" current={ix.trafficData.eastbound} predicted={ix.predictedFlow.eastbound} icon="➡️" />
                <DetectionLane direction="West" current={ix.trafficData.westbound} predicted={ix.predictedFlow.westbound} icon="⬅️" />
              </div>

              {/* CCTV Status for this intersection */}
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-green-50'}`}>
                <h4 className={`font-medium text-xs mb-2 ${isDark ? 'text-gray-300' : 'text-green-900'}`}>
                  🎥 CCTV — {ix.label}
                </h4>
                <div className="space-y-1">
                  {['North', 'South', 'East', 'West'].map(dir => (
                    <div key={dir} className="flex justify-between items-center">
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-green-700'}`}>Camera {dir}</span>
                      <Badge variant="secondary" className="text-[10px]">Online</Badge>
                    </div>
                  ))}
                  <div className="flex justify-between items-center">
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-green-700'}`}>YOLO v8</span>
                    <Badge variant="secondary" className="text-[10px]">Active</Badge>
                  </div>
                </div>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </Card>
  );
};