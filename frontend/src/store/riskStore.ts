import { create } from 'zustand';
import { RiskScenario, RiskAppetite, User, AuditEntry, UserRole } from '../types/risk';
import { generateMockRisks, generateMockAppetites } from '../utils/mockData';

interface RiskStore {
  risks: RiskScenario[];
  appetites: RiskAppetite[];
  currentUser: User;
  auditLog: AuditEntry[];
  
  // Actions
  setCurrentUser: (user: User) => void;
  updateRisk: (id: string, updates: Partial<RiskScenario>) => void;
  deleteRisk: (id: string) => void;
  addRisk: (risk: Omit<RiskScenario, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => void;
  updateAppetite: (category: string, updates: Partial<RiskAppetite>) => void;
  logAction: (action: string, riskId?: string, details?: Record<string, any>) => void;
  
  // Computed values
  getTopRisks: (limit?: number) => RiskScenario[];
  getRisksByCategory: (category: string) => RiskScenario[];
  getBreachedAppetites: () => RiskAppetite[];
  getExposureDistribution: () => { low: number; medium: number; high: number };
}

export const useRiskStore = create<RiskStore>((set, get) => ({
  risks: generateMockRisks(),
  appetites: generateMockAppetites(),
  currentUser: {
    id: '1',
    name: 'John Executive',
    role: 'executive',
    department: 'C-Suite'
  },
  auditLog: [],

  setCurrentUser: (user) => set({ currentUser: user }),

  updateRisk: (id, updates) => {
    set((state) => {
      const riskIndex = state.risks.findIndex(r => r.id === id);
      if (riskIndex === -1) return state;

      const updatedRisk = {
        ...state.risks[riskIndex],
        ...updates,
        exposure: (updates.likelihood || state.risks[riskIndex].likelihood) * 
                 (updates.impact || state.risks[riskIndex].impact),
        updatedAt: new Date(),
        version: state.risks[riskIndex].version + 1
      };

      const newRisks = [...state.risks];
      newRisks[riskIndex] = updatedRisk;

      // Update appetites breach status
      const newAppetites = state.appetites.map(appetite => ({
        ...appetite,
        breached: newRisks
          .filter(r => r.category === appetite.category)
          .some(r => r.exposure > appetite.threshold)
      }));

      return { 
        risks: newRisks,
        appetites: newAppetites
      };
    });

    get().logAction('Risk Updated', id, updates);
  },

  deleteRisk: (id) => {
    set((state) => ({
      risks: state.risks.filter(r => r.id !== id)
    }));
    get().logAction('Risk Deleted', id);
  },

  addRisk: (riskData) => {
    const newRisk: RiskScenario = {
      ...riskData,
      id: Math.random().toString(36).substr(2, 9),
      exposure: riskData.likelihood * riskData.impact,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    set((state) => ({ risks: [...state.risks, newRisk] }));
    get().logAction('Risk Created', newRisk.id);
  },

  updateAppetite: (category, updates) => {
    set((state) => {
      const appetites = state.appetites.map(a => 
        a.category === category ? { ...a, ...updates } : a
      );
      return { appetites };
    });
  },

  logAction: (action, riskId?, details?) => {
    const entry: AuditEntry = {
      id: Math.random().toString(36).substr(2, 9),
      userId: get().currentUser.id,
      action,
      riskId: riskId || '',
      timestamp: new Date(),
      details: details || {}
    };

    set((state) => ({
      auditLog: [entry, ...state.auditLog].slice(0, 1000) // Keep last 1000 entries
    }));
  },

  getTopRisks: (limit = 10) => {
    return get().risks
      .sort((a, b) => b.exposure - a.exposure)
      .slice(0, limit);
  },

  getRisksByCategory: (category) => {
    return get().risks.filter(r => r.category === category);
  },

  getBreachedAppetites: () => {
    return get().appetites.filter(a => a.breached);
  },

  getExposureDistribution: () => {
    const risks = get().risks;
    return {
      low: risks.filter(r => r.exposure <= 6).length,
      medium: risks.filter(r => r.exposure >= 7 && r.exposure <= 12).length,
      high: risks.filter(r => r.exposure > 12).length
    };
  }
}));