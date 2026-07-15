'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sparkles, HelpCircle, X, ChevronRight, Check } from 'lucide-react';
import { Button } from '@hq/ui';
import { useGuideMode } from '../contexts/guide-mode-context';

export function GuideModeBanner() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    guideModeEnabled,
    missionsCompleted,
    ftxStep,
    visitedWorkspaces,
    setGuideModeEnabled,
    triggerHelp,
    setTriggerHelp,
    resetProgress,
  } = useGuideMode();

  const [minimized, setMinimized] = React.useState(false);
  const [showHelpModal, setShowHelpModal] = React.useState(false);

  // Sync help trigger modal visibility
  React.useEffect(() => {
    if (triggerHelp) {
      setShowHelpModal(true);
    }
  }, [triggerHelp]);

  if (!guideModeEnabled) return null;

  // Determine active guide tip text based on pathname and FTX step
  let tipText = 'Describe a business goal to get started.';
  if (pathname === '/dashboard') {
    if (ftxStep === 'arrival') {
      tipText = "Welcome! Click 'Start First Mission' to begin your strategic journey.";
    } else if (ftxStep === 'input') {
      tipText = 'Describe what you would like to achieve (e.g. Launch a new product).';
    } else if (ftxStep === 'reasoning') {
      tipText = 'The CEO is analyzing your goals, timeline, and dependencies...';
    } else if (ftxStep === 'assigned') {
      tipText = 'Review your assigned AI Board of Directors, then click Launch.';
    } else if (ftxStep === 'executing') {
      tipText = "Click 'Watch Collaboration' to open the boardroom console.";
    } else if (ftxStep === 'completed') {
      tipText = 'First mission complete! Explore the rest of the workspace modules.';
    }
  } else if (pathname === '/boardroom') {
    tipText = 'Watch your AI Board of Directors debate task objectives in real-time.';
  } else if (pathname === '/assets') {
    tipText = 'Here is the Asset Center. Open your new generated strategic brief document.';
  } else if (pathname === '/missions') {
    tipText = 'Welcome to Mission Control. Track task execution status and board health.';
  } else {
    tipText = 'Explore this workspace module to understand your strategic capabilities.';
  }

  // Checkmark progression checks
  const isStarted = ftxStep !== 'arrival';
  const isPlanned = ftxStep === 'assigned' || ftxStep === 'executing' || ftxStep === 'completed';
  const isCollaboration = visitedWorkspaces.includes('boardroom');
  const isDeliverable = visitedWorkspaces.includes('assets');
  const isCompleted = missionsCompleted >= 1;

  const currentMissionNumber = Math.min(missionsCompleted + 1, 2);

  return (
    <>
      {/* Floating Guided Banner */}
      <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 rounded-xl border border-hq-blue/30 bg-[#0B0B0E]/95 backdrop-blur-md p-4 text-sm shadow-2xl transition-all duration-300 select-none animate-in slide-in-from-bottom-5">
        {/* Banner Header */}
        <div className="flex items-center justify-between pb-2 border-b border-hq-graphite/40">
          <div className="flex items-center space-x-2 text-hq-blue">
            <Sparkles className="h-4.5 w-4.5 animate-pulse" />
            <span className="font-bold tracking-wide uppercase text-[10px]">
              HQ Guide Mode — Mission {currentMissionNumber} of 2
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setMinimized(!minimized)}
              className="text-foreground/50 hover:text-foreground text-xs px-1.5 py-0.5 rounded hover:bg-hq-graphite/30"
            >
              {minimized ? 'Expand' : 'Hide'}
            </button>
            <button
              onClick={() => setGuideModeEnabled(false)}
              className="text-foreground/40 hover:text-foreground/80"
              title="Disable Guide"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {!minimized && (
          <div className="mt-3 space-y-3">
            {/* Step Progress Checklist */}
            <div className="flex items-center justify-between text-[10px] text-foreground/60 font-medium">
              <div className="flex items-center space-x-1">
                <div
                  className={`h-3 w-3 rounded-full flex items-center justify-center border ${isStarted ? 'border-hq-blue bg-hq-blue/10 text-hq-blue' : 'border-foreground/30'}`}
                >
                  {isStarted && <Check className="h-2 w-2" />}
                </div>
                <span>Start</span>
              </div>
              <ChevronRight className="h-3 w-3 text-foreground/20" />
              <div className="flex items-center space-x-1">
                <div
                  className={`h-3 w-3 rounded-full flex items-center justify-center border ${isPlanned ? 'border-hq-blue bg-hq-blue/10 text-hq-blue' : 'border-foreground/30'}`}
                >
                  {isPlanned && <Check className="h-2 w-2" />}
                </div>
                <span>Plan</span>
              </div>
              <ChevronRight className="h-3 w-3 text-foreground/20" />
              <div className="flex items-center space-x-1">
                <div
                  className={`h-3 w-3 rounded-full flex items-center justify-center border ${isCollaboration ? 'border-hq-blue bg-hq-blue/10 text-hq-blue' : 'border-foreground/30'}`}
                >
                  {isCollaboration && <Check className="h-2 w-2" />}
                </div>
                <span>Collab</span>
              </div>
              <ChevronRight className="h-3 w-3 text-foreground/20" />
              <div className="flex items-center space-x-1">
                <div
                  className={`h-3 w-3 rounded-full flex items-center justify-center border ${isDeliverable ? 'border-hq-blue bg-hq-blue/10 text-hq-blue' : 'border-foreground/30'}`}
                >
                  {isDeliverable && <Check className="h-2 w-2" />}
                </div>
                <span>Brief</span>
              </div>
              <ChevronRight className="h-3 w-3 text-foreground/20" />
              <div className="flex items-center space-x-1">
                <div
                  className={`h-3 w-3 rounded-full flex items-center justify-center border ${isCompleted ? 'border-hq-blue bg-hq-blue/10 text-hq-blue' : 'border-foreground/30'}`}
                >
                  {isCompleted && <Check className="h-2 w-2" />}
                </div>
                <span>Finish</span>
              </div>
            </div>

            {/* Instruction Tip */}
            <div className="bg-hq-graphite/20 border border-hq-graphite/40 rounded-lg p-3 text-xs leading-relaxed text-foreground/90">
              <span className="font-semibold text-hq-blue block mb-1">CEO Guidance:</span>
              {tipText}
            </div>

            {/* Help Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHelpModal(true)}
              className="w-full text-[11px] font-medium tracking-tight text-foreground/75 hover:text-white"
            >
              <HelpCircle className="h-3.5 w-3.5 mr-1" />
              Ask CEO for platform overview
            </Button>
          </div>
        )}
      </div>

      {/* CEO Explainer Assistance Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-hq-blue/40 bg-[#0B0B0E] p-6 text-sm shadow-2xl relative">
            <button
              onClick={() => {
                setShowHelpModal(false);
                setTriggerHelp(false);
              }}
              className="absolute top-4 right-4 text-foreground/45 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 text-hq-blue mb-4">
              <Sparkles className="h-6 w-6" />
              <h3 className="text-base font-bold tracking-tight text-white">CEO Mentor Briefing</h3>
            </div>

            <p className="text-foreground/80 leading-relaxed text-xs mb-4">
              It looks like you're exploring the HQ base console! Let me briefly review how these
              workspaces coordinate:
            </p>

            <div className="space-y-3 mb-6 text-xs text-foreground/90">
              <div className="flex items-start space-x-2.5">
                <span className="h-4 w-4 rounded-full bg-hq-blue/15 text-hq-blue flex items-center justify-center font-bold text-[10px]">
                  1
                </span>
                <div>
                  <span className="font-semibold text-white">Headquarters (Dashboard):</span> Run
                  strategic directives and view company summaries.
                </div>
              </div>
              <div className="flex items-start space-x-2.5">
                <span className="h-4 w-4 rounded-full bg-hq-blue/15 text-hq-blue flex items-center justify-center font-bold text-[10px]">
                  2
                </span>
                <div>
                  <span className="font-semibold text-white">Boardroom:</span> Watch our C-Suite AI
                  Directors coordinate and debate operations.
                </div>
              </div>
              <div className="flex items-start space-x-2.5">
                <span className="h-4 w-4 rounded-full bg-hq-blue/15 text-hq-blue flex items-center justify-center font-bold text-[10px]">
                  3
                </span>
                <div>
                  <span className="font-semibold text-white">Asset Center:</span> Access generated
                  marketing strategies, code outputs, and brief logs.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowHelpModal(false);
                  setTriggerHelp(false);
                }}
                className="text-foreground/50 hover:text-white"
              >
                Not now
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setShowHelpModal(false);
                  setTriggerHelp(false);
                  router.push('/dashboard');
                }}
                className="bg-hq-blue hover:bg-hq-blue/90 text-white"
              >
                Return to Dashboard
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
