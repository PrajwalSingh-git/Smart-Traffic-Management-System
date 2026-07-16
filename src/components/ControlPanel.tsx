import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore, UserRole } from '@/lib/store';
import { IntersectionSimState } from '@/hooks/useTrafficSimulation';

interface ControlPanelProps {
  tab: 'scenarios' | 'system';
  intersections: IntersectionSimState[];
  isDark: boolean;
}

export const ControlPanel = ({ tab, intersections, isDark }: ControlPanelProps) => {
  if (tab === 'scenarios') return <ScenariosPanel intersections={intersections} isDark={isDark} />;
  return <SystemPanel intersections={intersections} isDark={isDark} />;
};

function ScenariosPanel({ intersections, isDark }: { intersections: IntersectionSimState[]; isDark: boolean }) {
  const { scenarios, activeScenario, setActiveScenario } = useAppStore();

  return (
    <div className="space-y-4">
      <Card className={`p-5 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
        <h3 className="text-lg font-semibold mb-3">🎬 Traffic Scenarios</h3>
        <p className={`text-xs mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Simulate different traffic patterns to test signal optimization
        </p>

        <div className="grid grid-cols-1 gap-2">
          {scenarios.map(scenario => (
            <button
              key={scenario.id}
              onClick={() => setActiveScenario(activeScenario === scenario.id ? null : scenario.id)}
              className={`p-3 rounded-lg border text-left transition-all ${
                activeScenario === scenario.id
                  ? isDark ? 'border-blue-500 bg-blue-900/30' : 'border-blue-500 bg-blue-50'
                  : isDark ? 'border-gray-600 hover:border-gray-500 bg-gray-700/50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{scenario.icon}</span>
                  <div>
                    <div className="text-sm font-medium">{scenario.name}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{scenario.description}</div>
                  </div>
                </div>
                {activeScenario === scenario.id && (
                  <Badge variant="default" className="text-xs">Active</Badge>
                )}
              </div>
              <div className="mt-2 flex gap-2">
                <span className="text-[10px]">N:{scenario.trafficMultipliers.north}x</span>
                <span className="text-[10px]">E:{scenario.trafficMultipliers.east}x</span>
                <span className="text-[10px]">S:{scenario.trafficMultipliers.south}x</span>
                <span className="text-[10px]">W:{scenario.trafficMultipliers.west}x</span>
              </div>
            </button>
          ))}
        </div>

        {activeScenario && (
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full text-xs"
            onClick={() => setActiveScenario(null)}
          >
            ⏹️ Stop Scenario — Return to Normal
          </Button>
        )}
      </Card>
    </div>
  );
}

function SystemPanel({ intersections, isDark }: { intersections: IntersectionSimState[]; isDark: boolean }) {
  const {
    notifications,
    markRead,
    clearNotifications,
    auditLog,
    currentRole,
    currentUser,
    setRole,
    setUser,
  } = useAppStore();
  const [exportRange, setExportRange] = useState('today');

  const handleExport = () => {
    // Generate CSV data
    const headers = ['Intersection', 'Northbound', 'Southbound', 'Eastbound', 'Westbound', 'Total', 'Timestamp'];
    const rows = intersections.map(ix => [
      ix.label,
      ix.trafficData.northbound,
      ix.trafficData.southbound,
      ix.trafficData.eastbound,
      ix.trafficData.westbound,
      ix.trafficData.northbound + ix.trafficData.southbound + ix.trafficData.eastbound + ix.trafficData.westbound,
      new Date().toISOString()
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `traffic-report-${exportRange}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-4">
      {/* Role Management */}
      <Card className={`p-5 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
        <h3 className="font-semibold text-sm mb-3">👤 User & Roles</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs w-12">User:</span>
            <Select value={currentUser} onValueChange={setUser}>
              <SelectTrigger className={`h-8 text-xs flex-1 ${isDark ? 'bg-gray-700 border-gray-600' : ''}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Operator1">Operator 1</SelectItem>
                <SelectItem value="Operator2">Operator 2</SelectItem>
                <SelectItem value="Viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs w-12">Role:</span>
            <Select value={currentRole} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger className={`h-8 text-xs flex-1 ${isDark ? 'bg-gray-700 border-gray-600' : ''}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin (Full Access)</SelectItem>
                <SelectItem value="operator">Operator (Limited)</SelectItem>
                <SelectItem value="viewer">Viewer (Read Only)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className={`text-xs p-2 rounded ${isDark ? 'bg-gray-700/50 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
            {currentRole === 'admin' && '✅ Full access: All controls, overrides, and settings'}
            {currentRole === 'operator' && '⚠️ Limited: Can trigger emergencies, no system settings'}
            {currentRole === 'viewer' && '🔒 Read only: Can view data but cannot make changes'}
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card className={`p-5 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">🔔 Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && <Badge variant="destructive" className="text-xs">{unreadCount}</Badge>}
            <Button variant="ghost" size="sm" className="text-xs h-6" onClick={clearNotifications}>
              Clear
            </Button>
          </div>
        </div>
        <ScrollArea className="h-40">
          {notifications.length === 0 ? (
            <p className={`text-xs text-center py-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No notifications</p>
          ) : (
            <div className="space-y-2">
              {notifications.slice(0, 20).map(n => (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`p-2 rounded-lg cursor-pointer transition-all ${
                    n.read
                      ? isDark ? 'bg-gray-700/30' : 'bg-gray-50'
                      : isDark ? 'bg-gray-700' : 'bg-blue-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">
                      {n.type === 'error' ? '🔴' : n.type === 'warning' ? '🟡' : n.type === 'success' ? '🟢' : '🔵'} {n.title}
                    </span>
                    <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {n.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className={`text-[10px] mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>

      {/* Audit Log */}
      <Card className={`p-5 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
        <h3 className="font-semibold text-sm mb-3">📋 Audit Log</h3>
        <ScrollArea className="h-40">
          {auditLog.length === 0 ? (
            <p className={`text-xs text-center py-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No actions recorded</p>
          ) : (
            <div className="space-y-2">
              {auditLog.slice(0, 20).map(entry => (
                <div key={entry.id} className={`p-2 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{entry.action}</span>
                    <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {entry.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="text-[10px]">{entry.user}</Badge>
                    <Badge variant="secondary" className="text-[10px]">{entry.role}</Badge>
                    {entry.intersection && (
                      <span className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{entry.intersection}</span>
                    )}
                  </div>
                  <p className={`text-[10px] mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{entry.details}</p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>

      <Separator className={isDark ? 'bg-gray-700' : ''} />

      {/* Export Reports */}
      <Card className={`p-5 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
        <h3 className="font-semibold text-sm mb-3">📥 Export Reports</h3>
        <div className="space-y-3">
          <Select value={exportRange} onValueChange={setExportRange}>
            <SelectTrigger className={`h-8 text-xs ${isDark ? 'bg-gray-700 border-gray-600' : ''}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport} className="w-full text-xs" size="sm">
            📥 Download CSV Report
          </Button>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Exports current traffic data for all intersections
          </p>
        </div>
      </Card>
    </div>
  );
}