import { create } from 'zustand';

export type UserRole = 'admin' | 'operator' | 'viewer';
export type ThemeMode = 'light' | 'dark';

export interface AuditEntry {
  id: string;
  timestamp: Date;
  action: string;
  user: string;
  role: UserRole;
  intersection?: string;
  details: string;
}

export interface Notification {
  id: string;
  timestamp: Date;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  read: boolean;
}

export interface TrafficScenario {
  id: string;
  name: string;
  description: string;
  trafficMultipliers: { north: number; east: number; south: number; west: number };
  icon: string;
}

export interface HourlyData {
  hour: number;
  density: number;
  intersectionId: string;
}

interface AppStore {
  // Theme
  theme: ThemeMode;
  toggleTheme: () => void;

  // User & Roles
  currentRole: UserRole;
  currentUser: string;
  setRole: (role: UserRole) => void;
  setUser: (user: string) => void;
  verifyPassword: (password: string) => boolean;

  // Notifications
  notifications: Notification[];
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markRead: (id: string) => void;
  clearNotifications: () => void;

  // Audit Log
  auditLog: AuditEntry[];
  addAuditEntry: (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => void;

  // Scenarios
  activeScenario: string | null;
  scenarios: TrafficScenario[];
  setActiveScenario: (id: string | null) => void;

  // Pedestrian Priority
  pedestrianPriority: Record<string, boolean>;
  togglePedestrianPriority: (intersectionId: string) => void;

  // Hourly data
  hourlyData: HourlyData[];
  addHourlyData: (data: HourlyData) => void;
}

const ADMIN_PASSWORD = 'admin123';

export const useAppStore = create<AppStore>((set, get) => ({
  // Theme
  theme: 'light',
  toggleTheme: () => set(state => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

  // User & Roles
  currentRole: 'admin',
  currentUser: 'Admin',
  setRole: (role) => set({ currentRole: role }),
  setUser: (user) => set({ currentUser: user }),
  verifyPassword: (password) => password === ADMIN_PASSWORD,

  // Notifications
  notifications: [],
  addNotification: (n) => set(state => ({
    notifications: [
      { ...n, id: `notif-${Date.now()}-${Math.random().toString(36).slice(2)}`, timestamp: new Date(), read: false },
      ...state.notifications
    ].slice(0, 50)
  })),
  markRead: (id) => set(state => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
  })),
  clearNotifications: () => set({ notifications: [] }),

  // Audit Log
  auditLog: [],
  addAuditEntry: (entry) => set(state => ({
    auditLog: [
      { ...entry, id: `audit-${Date.now()}-${Math.random().toString(36).slice(2)}`, timestamp: new Date() },
      ...state.auditLog
    ].slice(0, 100)
  })),

  // Scenarios
  activeScenario: null,
  scenarios: [
    { id: 'normal', name: 'Normal Traffic', description: 'Standard weekday traffic flow', trafficMultipliers: { north: 1, east: 1, south: 1, west: 1 }, icon: '🚗' },
    { id: 'rush-morning', name: 'Morning Rush', description: 'Heavy inbound traffic (7-9 AM)', trafficMultipliers: { north: 2.5, east: 1.5, south: 0.8, west: 1.2 }, icon: '🌅' },
    { id: 'rush-evening', name: 'Evening Rush', description: 'Heavy outbound traffic (5-7 PM)', trafficMultipliers: { north: 0.8, east: 1.2, south: 2.5, west: 1.5 }, icon: '🌆' },
    { id: 'event', name: 'Event Traffic', description: 'Stadium/concert event nearby', trafficMultipliers: { north: 3, east: 3, south: 1, west: 1 }, icon: '🎉' },
    { id: 'road-closure', name: 'Road Closure', description: 'North road closed, traffic diverted', trafficMultipliers: { north: 0.1, east: 2, south: 1.5, west: 2 }, icon: '🚧' },
    { id: 'weekend', name: 'Weekend Light', description: 'Low traffic weekend pattern', trafficMultipliers: { north: 0.5, east: 0.5, south: 0.5, west: 0.5 }, icon: '☀️' },
  ],
  setActiveScenario: (id) => {
    set({ activeScenario: id });
    const store = get();
    store.addAuditEntry({
      action: 'Scenario Change',
      user: store.currentUser,
      role: store.currentRole,
      details: id ? `Activated scenario: ${store.scenarios.find(s => s.id === id)?.name}` : 'Returned to normal operation'
    });
  },

  // Pedestrian Priority
  pedestrianPriority: {},
  togglePedestrianPriority: (intersectionId) => set(state => ({
    pedestrianPriority: {
      ...state.pedestrianPriority,
      [intersectionId]: !state.pedestrianPriority[intersectionId]
    }
  })),

  // Hourly data
  hourlyData: generateInitialHourlyData(),
  addHourlyData: (data) => set(state => ({ hourlyData: [...state.hourlyData, data] })),
}));

function generateInitialHourlyData(): HourlyData[] {
  const data: HourlyData[] = [];
  const intersectionIds = ['ix-1', 'ix-2', 'ix-3', 'ix-4', 'ix-5', 'ix-6'];
  
  for (const id of intersectionIds) {
    for (let hour = 0; hour < 24; hour++) {
      // Simulate realistic traffic patterns
      let density: number;
      if (hour >= 7 && hour <= 9) density = 70 + Math.random() * 25; // Morning rush
      else if (hour >= 17 && hour <= 19) density = 75 + Math.random() * 20; // Evening rush
      else if (hour >= 11 && hour <= 14) density = 50 + Math.random() * 20; // Midday
      else if (hour >= 22 || hour <= 5) density = 5 + Math.random() * 15; // Night
      else density = 30 + Math.random() * 25; // Other times
      
      data.push({ hour, density: Math.round(density), intersectionId: id });
    }
  }
  return data;
}