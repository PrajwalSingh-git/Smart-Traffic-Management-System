import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { IntersectionSimState } from '@/hooks/useTrafficSimulation';
import { useAppStore } from '@/lib/store';

interface AnalyticsDashboardProps {
  intersections: IntersectionSimState[];
  isAutoMode: boolean;
  isDark: boolean;
}

export const AnalyticsDashboard = ({ intersections, isAutoMode, isDark }: AnalyticsDashboardProps) => {
  const [selectedIx, setSelectedIx] = useState('all');
  const { hourlyData } = useAppStore();

  // Aggregate metrics
  const avgMetrics = (() => {
    const n = intersections.length || 1;
    const sums = intersections.reduce(
      (acc, ix) => ({
        avgWaitTime: acc.avgWaitTime + ix.metrics.avgWaitTime,
        throughput: acc.throughput + ix.metrics.throughput,
        efficiency: acc.efficiency + ix.metrics.efficiency,
        co2Reduction: acc.co2Reduction + ix.metrics.co2Reduction,
      }),
      { avgWaitTime: 0, throughput: 0, efficiency: 0, co2Reduction: 0 }
    );
    return {
      avgWaitTime: Math.round((sums.avgWaitTime / n) * 10) / 10,
      throughput: Math.round((sums.throughput / n) * 10) / 10,
      efficiency: Math.round((sums.efficiency / n) * 10) / 10,
      co2Reduction: Math.round((sums.co2Reduction / n) * 10) / 10,
    };
  })();

  // Hourly chart data
  const getHourlyChartData = () => {
    const filtered = selectedIx === 'all'
      ? hourlyData
      : hourlyData.filter(d => d.intersectionId === selectedIx);

    const grouped: Record<number, number[]> = {};
    for (const d of filtered) {
      if (!grouped[d.hour]) grouped[d.hour] = [];
      grouped[d.hour].push(d.density);
    }

    return Array.from({ length: 24 }, (_, h) => ({
      hour: `${h.toString().padStart(2, '0')}:00`,
      density: grouped[h] ? Math.round(grouped[h].reduce((a, b) => a + b, 0) / grouped[h].length) : 0,
    }));
  };

  // Predictive data (next 4 hours)
  const currentHour = new Date().getHours();
  const predictiveData = Array.from({ length: 4 }, (_, i) => {
    const h = (currentHour + i + 1) % 24;
    const chartData = getHourlyChartData();
    return {
      hour: `${h.toString().padStart(2, '0')}:00`,
      predicted: chartData[h]?.density || 30,
      recommendation: chartData[h]?.density > 60 ? 'Increase cycle time' : 'Normal timing',
    };
  });

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <Card className={`p-5 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Performance</h3>
          <Badge variant={isAutoMode ? "default" : "secondary"} className="text-xs">
            {isAutoMode ? "AI Optimized" : "Manual"}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
            <div className="text-xs text-gray-500">⏱️ Avg Wait</div>
            <div className="text-xl font-bold">{avgMetrics.avgWaitTime}s</div>
            <Progress value={Math.max(0, 100 - (avgMetrics.avgWaitTime / 60) * 100)} className="h-1 mt-1" />
          </div>
          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-green-50'}`}>
            <div className="text-xs text-gray-500">🚗 Throughput</div>
            <div className="text-xl font-bold">{avgMetrics.throughput}/min</div>
            <Progress value={avgMetrics.throughput} className="h-1 mt-1" />
          </div>
          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-purple-50'}`}>
            <div className="text-xs text-gray-500">⚡ Efficiency</div>
            <div className="text-xl font-bold">{avgMetrics.efficiency}%</div>
            <Progress value={avgMetrics.efficiency} className="h-1 mt-1" />
          </div>
          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-emerald-50'}`}>
            <div className="text-xs text-gray-500">🌱 CO₂ Saved</div>
            <div className="text-xl font-bold">{avgMetrics.co2Reduction}%</div>
            <Progress value={avgMetrics.co2Reduction} className="h-1 mt-1" />
          </div>
        </div>
      </Card>

      {/* Hourly Traffic Density */}
      <Card className={`p-5 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm">📊 Hourly Traffic Density</h3>
          <Select value={selectedIx} onValueChange={setSelectedIx}>
            <SelectTrigger className={`w-36 h-8 text-xs ${isDark ? 'bg-gray-700 border-gray-600' : ''}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Intersections</SelectItem>
              {intersections.map(ix => (
                <SelectItem key={ix.id} value={ix.id}>{ix.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={getHourlyChartData()} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="hour" tick={{ fontSize: 9 }} interval={3} stroke={isDark ? '#9ca3af' : '#6b7280'} />
              <YAxis tick={{ fontSize: 9 }} stroke={isDark ? '#9ca3af' : '#6b7280'} />
              <Tooltip
                contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#fff', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: isDark ? '#e5e7eb' : '#111' }}
              />
              <Area type="monotone" dataKey="density" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Shows average traffic density (vehicles) by hour of day
        </p>
      </Card>

      {/* Predictive Analytics */}
      <Card className={`p-5 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
        <h3 className="font-semibold text-sm mb-3">🔮 Predictive Analytics (Next 4 Hours)</h3>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={predictiveData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke={isDark ? '#9ca3af' : '#6b7280'} />
              <YAxis tick={{ fontSize: 10 }} stroke={isDark ? '#9ca3af' : '#6b7280'} />
              <Tooltip
                contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#fff', border: 'none', borderRadius: '8px', fontSize: '12px' }}
              />
              <Bar dataKey="predicted" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 space-y-1">
          {predictiveData.map(p => (
            <div key={p.hour} className="flex justify-between items-center">
              <span className="text-xs">{p.hour}</span>
              <Badge variant={p.predicted > 60 ? "destructive" : "secondary"} className="text-[10px]">
                {p.recommendation}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};