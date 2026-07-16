import { useState } from 'react';
import { useTrafficSimulation } from '@/hooks/useTrafficSimulation';
import { IntersectionView } from '@/components/IntersectionView';
import { TrafficSignalControl } from '@/components/TrafficSignalControl';
import { VehicleDetection } from '@/components/VehicleDetection';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { EmergencyControls } from '@/components/EmergencyControls';
import { ControlPanel } from '@/components/ControlPanel';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SmartTrafficDashboard() {
  const {
    intersections,
    isAutoMode,
    corridorActive,
    corridorDirection,
    toggleMode,
    manualOverrideSingle,
    triggerEmergencySingle,
    simulateAccident,
    clearAccident,
    triggerGreenCorridor,
  } = useTrafficSimulation();

  const { theme, toggleTheme, currentRole, currentUser } = useAppStore();
  const [selectedIntersection, setSelectedIntersection] = useState(0);

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-br from-slate-50 to-blue-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-md ${isDark ? 'bg-gray-900/90 border-gray-700' : 'bg-white/90 border-gray-200'}`}>
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'}`}>
              Smart Traffic Management
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>AI-Driven Multi-Intersection Control</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs">
              👤 {currentUser} ({currentRole})
            </Badge>
            <Badge variant="default" className="animate-pulse text-xs">🟢 Online</Badge>
            <Badge variant={corridorActive ? "default" : "secondary"} className="text-xs">
              {corridorActive ? `🟢 Corridor (${corridorDirection?.toUpperCase()})` : 'Normal'}
            </Badge>
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Split Layout */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-73px)]">
        {/* Left Panel - Intersections (always visible) */}
        <div className={`lg:w-1/2 xl:w-3/5 overflow-y-auto p-4 border-r ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          {/* Network Map Overview */}
          <div className={`mb-4 p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              🗺️ Network Overview
              <Badge variant="secondary" className="text-xs">6 Intersections</Badge>
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {intersections.map((ix, idx) => (
                <button
                  key={ix.id}
                  onClick={() => setSelectedIntersection(idx)}
                  className={`p-2 rounded-lg border-2 transition-all text-left ${
                    selectedIntersection === idx
                      ? isDark ? 'border-blue-500 bg-blue-900/30' : 'border-blue-500 bg-blue-50'
                      : isDark ? 'border-gray-600 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300'
                  } ${ix.accidentActive ? 'border-red-500 animate-pulse' : ''} ${ix.emergencyActive ? 'border-orange-500' : ''}`}
                >
                  <div className="text-xs font-medium truncate">{ix.label}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <div className={`w-2 h-2 rounded-full ${ix.signalState.north === 'green' ? 'bg-green-500' : ix.signalState.north === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                    <div className={`w-2 h-2 rounded-full ${ix.signalState.east === 'green' ? 'bg-green-500' : ix.signalState.east === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                    <div className={`w-2 h-2 rounded-full ${ix.signalState.south === 'green' ? 'bg-green-500' : ix.signalState.south === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                    <div className={`w-2 h-2 rounded-full ${ix.signalState.west === 'green' ? 'bg-green-500' : ix.signalState.west === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                    <span className="text-[10px] ml-auto">{ix.signalState.timeRemaining}s</span>
                  </div>
                  {ix.accidentActive && <span className="text-[10px] text-red-500">⚠️ Accident</span>}
                  {ix.emergencyActive && <span className="text-[10px] text-orange-500">🚨 Emergency</span>}
                </button>
              ))}
            </div>
            {/* Connection lines description */}
            <div className={`mt-3 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} flex items-center gap-2`}>
              <span>↔️ Signals interconnected:</span>
              <span>Row 1: Main St corridor</span>
              <span>|</span>
              <span>Row 2: Oak Rd corridor</span>
            </div>
          </div>

          {/* Selected Intersection Detail */}
          <IntersectionView
            key={intersections[selectedIntersection].id}
            intersection={intersections[selectedIntersection]}
            onSimulateAccident={() => simulateAccident(selectedIntersection)}
            onCallEmergency={() => {
              clearAccident(selectedIntersection);
            }}
            isDark={isDark}
          />
        </div>

        {/* Right Panel - Controls */}
        <div className={`lg:w-1/2 xl:w-2/5 overflow-y-auto p-4 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50/50'}`}>
          <Tabs defaultValue="controls" className="w-full">
            <TabsList className={`grid w-full grid-cols-5 mb-4 ${isDark ? 'bg-gray-700' : ''}`}>
              <TabsTrigger value="controls" className="text-xs">Controls</TabsTrigger>
              <TabsTrigger value="detection" className="text-xs">Detection</TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs">Analytics</TabsTrigger>
              <TabsTrigger value="scenarios" className="text-xs">Scenarios</TabsTrigger>
              <TabsTrigger value="system" className="text-xs">System</TabsTrigger>
            </TabsList>

            <TabsContent value="controls" className="space-y-4">
              <TrafficSignalControl
                isAutoMode={isAutoMode}
                onToggleMode={toggleMode}
                onManualOverride={(dir) => manualOverrideSingle(selectedIntersection, dir)}
                emergencyActive={intersections[selectedIntersection].emergencyActive}
                onGreenCorridor={triggerGreenCorridor}
                corridorActive={corridorActive}
                selectedIntersection={intersections[selectedIntersection].label}
                isDark={isDark}
              />
              <EmergencyControls
                emergencyActive={intersections[selectedIntersection].emergencyActive}
                onTriggerEmergency={(dir) => triggerEmergencySingle(selectedIntersection, dir)}
                selectedIntersection={intersections[selectedIntersection].label}
                isDark={isDark}
              />
            </TabsContent>

            <TabsContent value="detection" className="space-y-4">
              <VehicleDetection
                intersections={intersections}
                isDark={isDark}
              />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <AnalyticsDashboard
                intersections={intersections}
                isAutoMode={isAutoMode}
                isDark={isDark}
              />
            </TabsContent>

            <TabsContent value="scenarios">
              <ControlPanel
                tab="scenarios"
                intersections={intersections}
                isDark={isDark}
              />
            </TabsContent>

            <TabsContent value="system">
              <ControlPanel
                tab="system"
                intersections={intersections}
                isDark={isDark}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}