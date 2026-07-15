'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from './auth-context';

export type FtxStep = 'arrival' | 'input' | 'reasoning' | 'assigned' | 'executing' | 'completed';

interface GuideModeContextType {
  guideModeEnabled: boolean;
  missionsCompleted: number;
  ftxStep: FtxStep;
  visitedWorkspaces: string[];
  objectiveText: string;
  activeMissionId: string | null;
  setGuideModeEnabled: (enabled: boolean) => void;
  setFtxStep: (step: FtxStep) => void;
  startMission: (objective: string) => void;
  completeMission: (missionId: string) => void;
  registerWorkspaceVisit: (path: string) => void;
  resetProgress: () => void;
  confusionCount: number;
  triggerHelp: boolean;
  setTriggerHelp: (val: boolean) => void;
}

const GuideModeContext = React.createContext<GuideModeContextType | undefined>(undefined);

export function GuideModeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { token } = useAuth();

  // Core Guide State
  const [guideModeEnabled, setGuideModeEnabledState] = React.useState<boolean>(true);
  const [missionsCompleted, setMissionsCompleted] = React.useState<number>(0);
  const [ftxStep, setFtxStepState] = React.useState<FtxStep>('arrival');
  const [visitedWorkspaces, setVisitedWorkspaces] = React.useState<string[]>([]);
  const [objectiveText, setObjectiveText] = React.useState<string>('');
  const [activeMissionId, setActiveMissionId] = React.useState<string | null>(null);

  // Behaviour / Confusion detection states
  const [confusionCount, setConfusionCount] = React.useState<number>(0);
  const [lastVisitedPage, setLastVisitedPage] = React.useState<string>('');
  const [triggerHelp, setTriggerHelp] = React.useState<boolean>(false);

  // Telemetry Start Time
  const [startTime, setStartTime] = React.useState<number | null>(null);

  // 1. Hydrate state on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const mode = localStorage.getItem('hq_guide_mode');
      const count = localStorage.getItem('hq_missions_completed');
      const step = localStorage.getItem('hq_ftx_step');
      const visited = localStorage.getItem('hq_visited_workspaces');
      const activeObj = localStorage.getItem('hq_ftx_objective');
      const activeId = localStorage.getItem('hq_ftx_mission_id');
      const sTime = localStorage.getItem('hq_ftx_start_time');

      if (mode !== null) setGuideModeEnabledState(mode === 'true');
      if (count !== null) setMissionsCompleted(parseInt(count, 10));
      if (step !== null) setFtxStepState(step as FtxStep);
      if (visited !== null) {
        try {
          setVisitedWorkspaces(JSON.parse(visited));
        } catch {
          setVisitedWorkspaces([]);
        }
      }
      if (activeObj !== null) setObjectiveText(activeObj);
      if (activeId !== null) setActiveMissionId(activeId);

      if (sTime !== null) {
        setStartTime(parseInt(sTime, 10));
      } else {
        const now = Date.now();
        localStorage.setItem('hq_ftx_start_time', String(now));
        setStartTime(now);
      }
    }
  }, []);

  // 2. Set Guide Mode state helper
  const setGuideModeEnabled = (enabled: boolean) => {
    setGuideModeEnabledState(enabled);
    localStorage.setItem('hq_guide_mode', String(enabled));
  };

  // 3. Transition Onboarding steps
  const setFtxStep = (step: FtxStep) => {
    setFtxStepState(step);
    localStorage.setItem('hq_ftx_step', step);
  };

  // 4. Start mission onboarding trigger
  const startMission = (objective: string) => {
    setObjectiveText(objective);
    localStorage.setItem('hq_ftx_objective', objective);
    setFtxStep('reasoning');
  };

  // 5. Log Telemetry helper
  const logTelemetry = React.useCallback(async (event: string, metadata: any) => {
    if (!token) return;
    try {
      await fetch('/api/settings/audit-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: `FTX_ANALYTICS_${event.toUpperCase()}`,
          details: JSON.stringify(metadata)
        })
      });
    } catch {
      // Fail silently in local sandbox
    }
  }, [token]);

  // 6. Complete mission onboarding trigger
  const completeMission = (missionId: string) => {
    const nextCount = missionsCompleted + 1;
    setMissionsCompleted(nextCount);
    localStorage.setItem('hq_missions_completed', String(nextCount));
    setActiveMissionId(missionId);
    localStorage.setItem('hq_ftx_mission_id', missionId);
    setFtxStep('completed');

    // Telemetry: First Mission Finished
    if (nextCount === 1 && startTime) {
      const durationSeconds = Math.round((Date.now() - startTime) / 1000);
      logTelemetry('first_mission_completed', { durationSeconds, missionId });
    }

    // Auto-disable Criteria check
    if (
      nextCount >= 2 &&
      visitedWorkspaces.includes('boardroom') &&
      visitedWorkspaces.includes('missions') &&
      visitedWorkspaces.includes('assets')
    ) {
      setGuideModeEnabled(false);
      logTelemetry('guide_auto_completed', { totalMissions: nextCount });
    }
  };

  // 7. Track route transitions for visited workspaces and confusion logs
  const registerWorkspaceVisit = React.useCallback((path: string) => {
    const cleanPath = path.replace('/', '');
    if (!['boardroom', 'missions', 'assets'].includes(cleanPath)) return;

    setVisitedWorkspaces((prev) => {
      if (prev.includes(cleanPath)) return prev;
      const next = [...prev, cleanPath];
      localStorage.setItem('hq_visited_workspaces', JSON.stringify(next));

      // Telemetry: First workspace visited
      if (next.length === 1) {
        logTelemetry('first_workspace_visited', { workspace: cleanPath });
      }

      // Check auto-disable criteria on visit
      if (
        missionsCompleted >= 2 &&
        next.includes('boardroom') &&
        next.includes('missions') &&
        next.includes('assets')
      ) {
        setGuideModeEnabled(false);
        logTelemetry('guide_auto_completed', { totalMissions: missionsCompleted });
      }

      return next;
    });
  }, [missionsCompleted, logTelemetry]);

  // Track active pathname changes to detect user confusion loops
  React.useEffect(() => {
    if (!guideModeEnabled) return;
    registerWorkspaceVisit(pathname);

    // Confusion Check: opens settings repeatedly
    if (pathname === '/settings') {
      setConfusionCount((c) => {
        const next = c + 1;
        if (next >= 3) {
          setTriggerHelp(true);
        }
        return next;
      });
    }

    if (lastVisitedPage === '/boardroom' && pathname === '/dashboard') {
      setConfusionCount((c) => {
        const next = c + 1;
        if (next >= 4) {
          setTriggerHelp(true);
        }
        return next;
      });
    }

    setLastVisitedPage(pathname);
  }, [pathname, lastVisitedPage, guideModeEnabled, registerWorkspaceVisit]);

  // 8. Reset Progress parameters
  const resetProgress = () => {
    setMissionsCompleted(0);
    setFtxStepState('arrival');
    setVisitedWorkspaces([]);
    setObjectiveText('');
    setActiveMissionId(null);
    setConfusionCount(0);
    setTriggerHelp(false);

    const now = Date.now();
    setStartTime(now);

    localStorage.setItem('hq_missions_completed', '0');
    localStorage.setItem('hq_ftx_step', 'arrival');
    localStorage.setItem('hq_visited_workspaces', JSON.stringify([]));
    localStorage.removeItem('hq_ftx_objective');
    localStorage.removeItem('hq_ftx_mission_id');
    localStorage.setItem('hq_ftx_start_time', String(now));

    setGuideModeEnabled(true);
  };

  return (
    <GuideModeContext.Provider
      value={{
        guideModeEnabled,
        missionsCompleted,
        ftxStep,
        visitedWorkspaces,
        objectiveText,
        activeMissionId,
        setGuideModeEnabled,
        setFtxStep,
        startMission,
        completeMission,
        registerWorkspaceVisit,
        resetProgress,
        confusionCount,
        triggerHelp,
        setTriggerHelp,
      }}
    >
      {children}
    </GuideModeContext.Provider>
  );
}

export function useGuideMode() {
  const context = React.useContext(GuideModeContext);
  if (context === undefined) {
    throw new Error('useGuideMode must be used within a GuideModeProvider');
  }
  return context;
}
