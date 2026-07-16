import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAppStore } from '@/lib/store';

interface EmergencyControlsProps {
  emergencyActive: boolean;
  onTriggerEmergency: (direction: 'n' | 'e' | 's' | 'w') => void;
  selectedIntersection: string;
  isDark: boolean;
}

export const EmergencyControls = ({ emergencyActive, onTriggerEmergency, selectedIntersection, isDark }: EmergencyControlsProps) => {
  const { currentRole, addAuditEntry, currentUser } = useAppStore();
  const isViewer = currentRole === 'viewer';

  const handleEmergency = (dir: 'n' | 'e' | 's' | 'w') => {
    onTriggerEmergency(dir);
    addAuditEntry({
      action: 'Emergency Override',
      user: currentUser,
      role: currentRole,
      intersection: selectedIntersection,
      details: `Emergency vehicle priority activated from ${dir.toUpperCase()} direction at ${selectedIntersection}`
    });
  };

  return (
    <Card className={`p-5 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Emergency Controls</h3>
        <Badge variant={emergencyActive ? "destructive" : "secondary"} className="text-xs">
          {emergencyActive ? "🚨 ACTIVE" : "🟢 STANDBY"}
        </Badge>
      </div>

      <Badge variant="outline" className="text-xs mb-3">{selectedIntersection}</Badge>

      {emergencyActive && (
        <Alert className="mb-4 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <AlertDescription className={`text-sm ${isDark ? 'text-red-200' : 'text-red-800'}`}>
            🚨 Emergency vehicle priority active. Normal flow resumes automatically in 30s.
          </AlertDescription>
        </Alert>
      )}

      {/* Emergency Vehicle Override */}
      <div className="space-y-3">
        <h4 className={`font-medium text-sm ${isDark ? 'text-gray-300' : ''}`}>Emergency Vehicle Override</h4>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="destructive"
            onClick={() => handleEmergency('n')}
            disabled={emergencyActive || isViewer}
            className="text-xs"
            size="sm"
          >
            🚑 North
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleEmergency('e')}
            disabled={emergencyActive || isViewer}
            className="text-xs"
            size="sm"
          >
            🚒 East
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleEmergency('s')}
            disabled={emergencyActive || isViewer}
            className="text-xs"
            size="sm"
          >
            🚓 South
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleEmergency('w')}
            disabled={emergencyActive || isViewer}
            className="text-xs"
            size="sm"
          >
            🚨 West
          </Button>
        </div>
        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          Instantly clears the selected direction for emergency passage
        </p>
      </div>

      {/* Detection Systems */}
      <div className={`mt-4 p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
        <h4 className={`font-medium text-xs mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Detection Systems</h4>
        <div className="space-y-1.5">
          {[
            { icon: '🔊', name: 'Audio Detection', status: 'Active' },
            { icon: '📡', name: 'Radio Frequency', status: 'Monitoring' },
            { icon: '🎥', name: 'Visual Recognition', status: 'Scanning' },
            { icon: '📱', name: 'Emergency Beacon', status: 'Standby' },
          ].map(sys => (
            <div key={sys.name} className="flex justify-between items-center">
              <span className="text-xs">{sys.icon} {sys.name}</span>
              <Badge variant="secondary" className="text-[10px]">{sys.status}</Badge>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};