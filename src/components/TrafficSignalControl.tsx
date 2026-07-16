import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/lib/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface TrafficSignalControlProps {
  isAutoMode: boolean;
  onToggleMode: () => void;
  onManualOverride: (direction: 'n' | 'e' | 's' | 'w') => void;
  onGreenCorridor: (direction: 'ns' | 'ew') => void;
  corridorActive: boolean;
  emergencyActive: boolean;
  selectedIntersection: string;
  isDark: boolean;
}

export const TrafficSignalControl = ({
  isAutoMode,
  onToggleMode,
  onManualOverride,
  onGreenCorridor,
  corridorActive,
  emergencyActive,
  selectedIntersection,
  isDark,
}: TrafficSignalControlProps) => {
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [passwordError, setPasswordError] = useState('');
  const { verifyPassword, addAuditEntry, currentUser, currentRole } = useAppStore();

  const requirePassword = (action: () => void, actionName: string) => {
    setPendingAction(() => () => {
      action();
      addAuditEntry({
        action: actionName,
        user: currentUser,
        role: currentRole,
        intersection: selectedIntersection,
        details: `Manual action: ${actionName} at ${selectedIntersection}`
      });
    });
    setShowPasswordDialog(true);
    setPassword('');
    setPasswordError('');
  };

  const handlePasswordSubmit = () => {
    if (verifyPassword(password)) {
      pendingAction?.();
      setShowPasswordDialog(false);
      setPassword('');
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password. Try again.');
    }
  };

  const isViewer = currentRole === 'viewer';

  return (
    <>
      <Card className={`p-5 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Signal Control</h3>
          <Badge variant="outline" className="text-xs">{selectedIntersection}</Badge>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-medium text-sm">Control Mode</div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {isAutoMode ? 'AI-Optimized Timing' : 'Manual Control'}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-xs ${!isAutoMode ? 'font-medium' : isDark ? 'text-gray-500' : 'text-gray-400'}`}>Manual</span>
            <Switch checked={isAutoMode} onCheckedChange={onToggleMode} disabled={isViewer} />
            <span className={`text-xs ${isAutoMode ? 'font-medium' : isDark ? 'text-gray-500' : 'text-gray-400'}`}>Auto</span>
          </div>
        </div>

        {/* Status */}
        <div className={`space-y-2 mb-4 p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs">AI Optimization</span>
            <Badge variant={isAutoMode ? "default" : "secondary"} className="text-xs">
              {isAutoMode ? "Active" : "Off"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs">Emergency Override</span>
            <Badge variant={emergencyActive ? "destructive" : "secondary"} className="text-xs">
              {emergencyActive ? "Active" : "Standby"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs">Green Corridor</span>
            <Badge variant={corridorActive ? "default" : "secondary"} className="text-xs">
              {corridorActive ? "Engaged" : "Off"}
            </Badge>
          </div>
        </div>

        <Separator className={`my-4 ${isDark ? 'bg-gray-700' : ''}`} />

        {/* Per-Intersection Manual Override */}
        <div className="space-y-3">
          <h4 className={`font-medium text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Manual Override — {selectedIntersection}
          </h4>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            🔒 Password required for manual actions
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={isAutoMode ? "outline" : "default"}
              disabled={isAutoMode || isViewer}
              onClick={() => requirePassword(() => onManualOverride('n'), 'North Green Override')}
              className="text-xs"
              size="sm"
            >
              ⬆️ North Green
            </Button>
            <Button
              variant={isAutoMode ? "outline" : "default"}
              disabled={isAutoMode || isViewer}
              onClick={() => requirePassword(() => onManualOverride('e'), 'East Green Override')}
              className="text-xs"
              size="sm"
            >
              ➡️ East Green
            </Button>
            <Button
              variant={isAutoMode ? "outline" : "default"}
              disabled={isAutoMode || isViewer}
              onClick={() => requirePassword(() => onManualOverride('s'), 'South Green Override')}
              className="text-xs"
              size="sm"
            >
              ⬇️ South Green
            </Button>
            <Button
              variant={isAutoMode ? "outline" : "default"}
              disabled={isAutoMode || isViewer}
              onClick={() => requirePassword(() => onManualOverride('w'), 'West Green Override')}
              className="text-xs"
              size="sm"
            >
              ⬅️ West Green
            </Button>
          </div>
          {isAutoMode && (
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Switch to Manual mode to enable overrides
            </p>
          )}
        </div>

        <Separator className={`my-4 ${isDark ? 'bg-gray-700' : ''}`} />

        {/* Green Corridor */}
        <div className="space-y-3">
          <h4 className={`font-medium text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Green Corridor (All Intersections)</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="default"
              onClick={() => requirePassword(() => onGreenCorridor('ns'), 'Green Corridor N-S')}
              disabled={corridorActive || isViewer}
              className="text-xs"
              size="sm"
            >
              🟢 N-S Corridor
            </Button>
            <Button
              variant="default"
              onClick={() => requirePassword(() => onGreenCorridor('ew'), 'Green Corridor E-W')}
              disabled={corridorActive || isViewer}
              className="text-xs"
              size="sm"
            >
              🟢 E-W Corridor
            </Button>
          </div>
        </div>
      </Card>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className={isDark ? 'bg-gray-800 border-gray-700 text-white' : ''}>
          <DialogHeader>
            <DialogTitle>🔒 Authentication Required</DialogTitle>
            <DialogDescription className={isDark ? 'text-gray-400' : ''}>
              Enter the admin password to perform this manual override action.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              type="password"
              placeholder="Enter password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              className={isDark ? 'bg-gray-700 border-gray-600' : ''}
            />
            {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowPasswordDialog(false)} size="sm">
                Cancel
              </Button>
              <Button onClick={handlePasswordSubmit} size="sm">
                Confirm
              </Button>
            </div>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Hint: Default password is "admin123"
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};