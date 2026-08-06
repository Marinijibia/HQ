'use client';

import * as React from 'react';
import { Button, Badge } from '@hq/ui';
import { Download, Share, X, Smartphone } from 'lucide-react';
import { HQLogo } from './hq-logo';

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [showBanner, setShowBanner] = React.useState(false);
  const [isIos, setIsIos] = React.useState(false);
  const [showIosGuide, setShowIosGuide] = React.useState(false);
  const [isStandalone, setIsStandalone] = React.useState(false);
  const [isInstalled, setIsInstalled] = React.useState(false);
  const [isMinimized, setIsMinimized] = React.useState(false);

  React.useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('Service worker registration notice:', err);
      });
    }

    // 2. Detect standalone mode or persistent installed status
    if (typeof window !== 'undefined') {
      const isStandaloneApp =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneApp);

      const hasInstalledBefore = localStorage.getItem('hq_pwa_installed') === 'true';
      if (hasInstalledBefore || isStandaloneApp) {
        setIsInstalled(true);
        return; // Don't attach prompt listeners if already installed
      }

      // Detect iOS Safari
      const userAgent = window.navigator.userAgent;
      const isIosDevice = /iPhone|iPad|iPod/i.test(userAgent) && !isStandaloneApp;
      setIsIos(isIosDevice);

      // Check if user previously dismissed main popup banner
      const dismissed = localStorage.getItem('hq_pwa_banner_dismissed') === 'true';

      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        if (!isStandaloneApp && !hasInstalledBefore) {
          if (dismissed) {
            setIsMinimized(true);
          } else {
            setShowBanner(true);
          }
        }
      };

      // Browser event fired when app is successfully installed
      const handleAppInstalled = () => {
        setIsInstalled(true);
        setShowBanner(false);
        setIsMinimized(false);
        setShowIosGuide(false);
        localStorage.setItem('hq_pwa_installed', 'true');
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);

      if (isIosDevice && !isStandaloneApp && !hasInstalledBefore) {
        if (dismissed) {
          setIsMinimized(true);
        } else {
          setShowBanner(true);
        }
      }

      // Listen for global custom event to trigger install anytime (e.g. from header/settings)
      const handleGlobalTrigger = () => {
        if (isInstalled || isStandaloneApp) return;
        if (isIosDevice) {
          setShowIosGuide(true);
        } else {
          setShowBanner(true);
          setIsMinimized(false);
        }
      };

      window.addEventListener('hq:trigger-pwa-install', handleGlobalTrigger);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
        window.removeEventListener('hq:trigger-pwa-install', handleGlobalTrigger);
      };
    }
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      setShowBanner(false);
      return;
    }

    if (!deferredPrompt) {
      setShowIosGuide(true);
      setShowBanner(false);
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setShowBanner(false);
      setIsMinimized(false);
      setShowIosGuide(false);
      localStorage.setItem('hq_pwa_installed', 'true');
    }
    setDeferredPrompt(null);
  };

  const handleDismissBanner = () => {
    setShowBanner(false);
    setIsMinimized(true);
    localStorage.setItem('hq_pwa_banner_dismissed', 'true');
  };

  const handleOpenFromPill = () => {
    if (isIos) {
      setShowIosGuide(true);
    } else {
      setShowBanner(true);
      setIsMinimized(false);
    }
  };

  // Completely disappear if app is already installed or running standalone
  if (isStandalone || isInstalled) {
    return null;
  }

  return (
    <>
      {/* 1. Main Prominent PWA Install Banner */}
      {showBanner && !showIosGuide && (
        <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-lg z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-[#0A0B10]/95 backdrop-blur-2xl border border-cyan-500/30 p-4 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.25)] flex items-center justify-between gap-3 text-white">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
                <HQLogo size={24} />
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xs text-white">HQ Mobile App</span>
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-cyan-500/30 text-cyan-300 font-bold">
                    INSTANT 0MS
                  </Badge>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  Install HQ App on your device for 1-tap Boardroom access.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                onClick={handleInstallClick}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs h-9 px-3.5 rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                Install App
              </Button>
              <button
                onClick={handleDismissBanner}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg transition-colors"
                aria-label="Dismiss banner into floating pill"
                title="Minimize banner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Persistent Minimized Floating Install Pill (Only available when banner is dismissed AND app NOT installed) */}
      {isMinimized && !showBanner && !showIosGuide && (
        <button
          onClick={handleOpenFromPill}
          className="fixed bottom-20 sm:bottom-6 right-5 z-50 bg-[#0A0B10]/90 backdrop-blur-xl border border-cyan-500/40 hover:border-cyan-400 text-white px-3.5 py-2.5 rounded-full shadow-[0_0_25px_rgba(6,182,212,0.3)] flex items-center gap-2 transition-all hover:scale-105 group"
          title="Install HQ App"
        >
          <div className="h-6 w-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
            <Download className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">
            Install HQ App
          </span>
        </button>
      )}

      {/* 3. iOS Safari Installation Guide Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0A0B10] border border-cyan-500/30 p-6 rounded-3xl max-w-sm w-full text-center space-y-5 shadow-2xl relative">
            <button
              onClick={() => {
                setShowIosGuide(false);
                setIsMinimized(true);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
              <Smartphone className="h-7 w-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-white">Install HQ App on iOS</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Follow these 2 steps to add HQ to your iPhone or iPad Home Screen:
              </p>
            </div>

            <div className="bg-black/60 border border-white/10 p-3.5 rounded-2xl text-left space-y-3 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <span className="h-6 w-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs shrink-0">
                  1
                </span>
                <span>Tap the <strong className="text-white">Share</strong> button <Share className="h-3.5 w-3.5 text-cyan-400 inline mx-0.5" /> in Safari's bottom toolbar.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="h-6 w-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs shrink-0">
                  2
                </span>
                <span>Scroll down and select <strong className="text-white">'Add to Home Screen'</strong>.</span>
              </div>
            </div>

            <Button
              onClick={() => {
                setShowIosGuide(false);
                setIsMinimized(true);
              }}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs h-11 rounded-xl"
            >
              Got It
            </Button>
          </div>
        </div>
      )}
    </>
  );
}


