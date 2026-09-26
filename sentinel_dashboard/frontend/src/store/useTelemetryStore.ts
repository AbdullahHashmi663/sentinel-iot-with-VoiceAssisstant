// ==============================================================================
// SENTINEL-IOT: ZUSTAND GLOBAL TELEMETRY STORE (SECTION 3.2)
// Version 2.4 - Enterprise Production Edition - FYP-II
// ==============================================================================

import { create } from 'zustand';
import {
  TelemetryEvent,
  DomainType,
  ActiveRule,
  AdversarialState
} from '../types/sentinel';
import { mockTelemetry } from '../services/mockTelemetryService';

export interface TelemetryStoreState {
  // Navigation & View Mode
  activeConsole: 'overview' | 'threat_lab' | 'xai' | 'adversarial' | 'remediation' | 'compliance' | 'execute';
  setActiveConsole: (consoleId: 'overview' | 'threat_lab' | 'xai' | 'adversarial' | 'remediation' | 'compliance' | 'execute') => void;

  // 1. Sliding queue of latest 50 incidents
  events: TelemetryEvent[];
  latestEvent: TelemetryEvent | null;
  addEvent: (event: TelemetryEvent) => void;

  // 2. Active Model Domain (13 ToN_IoT domains)
  activeDomain: DomainType;
  setActiveDomain: (domain: DomainType) => void;

  // 3. Live WebSocket vs Offline Mock Mode
  isMockMode: boolean;
  setIsMockMode: (val: boolean) => void;
  isConnected: boolean;
  setIsConnected: (val: boolean) => void;

  // 4. Adversarial Evasion Robustness State
  adversarialState: AdversarialState;
  setAdversarialEpsilon: (eps: number) => void;
  setAdversarialAttackType: (type: 'FGSM' | 'PGD_20') => void;
  triggerAdversarialAttack: () => void;

  // 5. IEC 62443 Four-Eyes Safety Interlock
  interlockCountdown: number;
  isInterlockModalOpen: boolean;
  interlockTargetNode: string | null;
  startInterlockCountdown: (targetNode: string) => void;
  cancelInterlock: () => void;
  overrideInterlock: (operatorBadge: string) => void;
  tickInterlock: () => void;

  // Active Remediation Rules Ledger
  activeRules: ActiveRule[];
  revokeRule: (ruleId: string) => void;

  // System & Host KPI Metrics
  ingestionVelocity: number;
  threatsContainedCount: number;
  activeProtectedNodesCount: number;
  nistCsfScore: number;
  mttrCurrentMs: number;

  // Emergency Full Fleet Lockdown
  isLockdownActive: boolean;
  toggleEmergencyLockdown: () => void;

  // Advanced Upgrades (Ideas 2, 3, 4)
  isPacketSnifferOpen: boolean;
  openPacketSniffer: () => void;
  closePacketSniffer: () => void;

  isSoarBuilderOpen: boolean;
  openSoarBuilder: () => void;
  closeSoarBuilder: () => void;

  isAgenticSocOpen: boolean;
  agenticIncident: any | null;
  openAgenticSoc: (incident?: any) => void;
  closeAgenticSoc: () => void;
}

export const useTelemetryStore = create<TelemetryStoreState>((set, get) => ({
  activeConsole: 'overview',
  setActiveConsole: (consoleId) => set({ activeConsole: consoleId }),

  events: [],
  latestEvent: null,

  addEvent: (event: TelemetryEvent) => {
    set((state) => {
      const updatedEvents = [event, ...state.events].slice(0, 50);
      const isBlocked = event.remediationStatus === 'ACTIVE_BLOCKED';
      const newContained = isBlocked ? state.threatsContainedCount + 1 : state.threatsContainedCount;

      let newRules = state.activeRules;
      if (isBlocked && event.remediationAction && event.remediationAction !== 'Baseline Verified') {
        const newRule: ActiveRule = {
          id: `rule_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          timestamp: new Date().toLocaleTimeString(),
          threatType: event.predictedClass,
          targetIp: event.sourceIp,
          targetPid: event.processId,
          command: event.remediationAction,
          status: 'ACTIVE_BLOCKED',
          nistControl: event.compliance.nistControlId,
          isoControl: event.compliance.isoControlId
        };
        newRules = [newRule, ...state.activeRules].slice(0, 20);
      }

      return {
        events: updatedEvents,
        latestEvent: event,
        threatsContainedCount: newContained,
        activeRules: newRules,
        mttrCurrentMs: event.mttrLatencyMs || 21.5
      };
    });
  },

  activeDomain: 'Network_Traffic',
  setActiveDomain: (domain: DomainType) => {
    mockTelemetry.setActiveDomain(domain);
    set({ activeDomain: domain });
  },

  isMockMode: false,
  setIsMockMode: (val: boolean) => set({ isMockMode: val }),

  isConnected: false,
  setIsConnected: (val: boolean) => set({ isConnected: val }),

  adversarialState: {
    epsilon: 0.05,
    attackType: 'PGD_20',
    isAttacking: false,
    conformerAcc: 96.8,
    cnnAcc: 41.2,
    bilstmAcc: 46.8,
    ksPValue: 0.142,
    psiScore: 0.048
  },

  setAdversarialEpsilon: (eps: number) => {
    set((state) => ({
      adversarialState: {
        ...state.adversarialState,
        epsilon: eps,
        // Accuracy degrades slightly for baselines as epsilon grows
        conformerAcc: Number((98.5 - eps * 12).toFixed(1)),
        cnnAcc: Number((58.0 - eps * 115).toFixed(1)),
        bilstmAcc: Number((62.0 - eps * 105).toFixed(1)),
        ksPValue: Number((0.18 - eps * 0.8).toFixed(3)),
        psiScore: Number((0.02 + eps * 0.45).toFixed(3))
      }
    }));
  },

  setAdversarialAttackType: (type: 'FGSM' | 'PGD_20') => {
    set((state) => ({
      adversarialState: { ...state.adversarialState, attackType: type }
    }));
  },

  triggerAdversarialAttack: () => {
    const { adversarialState } = get();
    set((state) => ({
      adversarialState: { ...state.adversarialState, isAttacking: true }
    }));

    const event = mockTelemetry.triggerAdversarialEvent(
      adversarialState.epsilon,
      adversarialState.attackType
    );
    get().addEvent(event);

    setTimeout(() => {
      set((state) => ({
        adversarialState: { ...state.adversarialState, isAttacking: false }
      }));
    }, 1500);
  },

  interlockCountdown: 30,
  isInterlockModalOpen: false,
  interlockTargetNode: null,

  startInterlockCountdown: (targetNode: string) => {
    set({
      isInterlockModalOpen: true,
      interlockCountdown: 30,
      interlockTargetNode: targetNode
    });
  },

  cancelInterlock: () => {
    set({
      isInterlockModalOpen: false,
      interlockCountdown: 30,
      interlockTargetNode: null
    });
  },

  overrideInterlock: (operatorBadge: string) => {
    const { interlockTargetNode, activeRules } = get();
    const updatedRules = activeRules.map((rule) => {
      if (rule.targetIp === interlockTargetNode || rule.command.includes(interlockTargetNode || '')) {
        return { ...rule, status: 'OVERRIDDEN' as const, operatorBadge };
      }
      return rule;
    });

    set({
      isInterlockModalOpen: false,
      interlockCountdown: 30,
      interlockTargetNode: null,
      activeRules: updatedRules
    });
  },

  tickInterlock: () => {
    set((state) => {
      if (!state.isInterlockModalOpen) return state;
      const nextCount = state.interlockCountdown - 1;
      if (nextCount <= 0) {
        return {
          interlockCountdown: 0,
          isInterlockModalOpen: false
        };
      }
      return { interlockCountdown: nextCount };
    });
  },

  activeRules: [
    {
      id: 'rule_init_1',
      timestamp: '16:20:11',
      threatType: 'ddos',
      targetIp: '192.168.100.45',
      command: 'iptables -A INPUT -s 192.168.100.45 -j DROP',
      status: 'ACTIVE_BLOCKED',
      nistControl: 'SC-5',
      isoControl: 'A.12.1.3'
    },
    {
      id: 'rule_init_2',
      timestamp: '16:21:40',
      threatType: 'ransomware',
      targetIp: '192.168.100.18',
      targetPid: 4120,
      command: 'taskkill /F /PID 4120',
      status: 'ACTIVE_BLOCKED',
      nistControl: 'SI-3',
      isoControl: 'A.12.6.1'
    }
  ],

  revokeRule: (ruleId: string) => {
    set((state) => ({
      activeRules: state.activeRules.map((r) =>
        r.id === ruleId ? { ...r, status: 'REVOKED' } : r
      )
    }));
  },

  ingestionVelocity: 4820,
  threatsContainedCount: 142,
  activeProtectedNodesCount: 13,
  nistCsfScore: 96.4,
  mttrCurrentMs: 21.5,

  isLockdownActive: false,
  toggleEmergencyLockdown: () => {
    set((state) => ({ isLockdownActive: !state.isLockdownActive }));
  },

  // Advanced Upgrades (Ideas 2, 3, 4)
  isPacketSnifferOpen: false,
  openPacketSniffer: () => set({ isPacketSnifferOpen: true }),
  closePacketSniffer: () => set({ isPacketSnifferOpen: false }),

  isSoarBuilderOpen: false,
  openSoarBuilder: () => set({ isSoarBuilderOpen: true }),
  closeSoarBuilder: () => set({ isSoarBuilderOpen: false }),

  isAgenticSocOpen: false,
  agenticIncident: null,
  openAgenticSoc: (incident) => set({ isAgenticSocOpen: true, agenticIncident: incident || null }),
  closeAgenticSoc: () => set({ isAgenticSocOpen: false, agenticIncident: null })
}));

