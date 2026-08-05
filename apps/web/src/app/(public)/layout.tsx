'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@hq/ui';
import { useAuth } from '../../contexts/auth-context';
import { useTheme } from '../../contexts/theme-context';
import { HQLogo } from '../../components/hq-logo';
import { Menu as MenuIcon, X as XIcon, Sun, Moon } from 'lucide-react';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '/features' },
    { name: 'Solutions', href: '/solutions' },
    { name: 'Integrations', href: '/integrations' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Changelog', href: '/changelog' },
    { name: 'Case Studies', href: '/case-studies' },
    { name: 'Demo', href: '/book-demo' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060608] text-slate-900 dark:text-foreground flex flex-col justify-between font-sans relative overflow-hidden select-none animate-in fade-in duration-300">
      {/* Decorative Dot Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#1e1e24_1px,transparent_1px)] [background-size:20px_20px] opacity-15 dark:opacity-20 pointer-events-none"></div>

      {/* Giant Ambient Glows */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[130px] pointer-events-none"></div>

      {/* Sticky Top Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          scrolled
            ? 'bg-white/80 dark:bg-[#060608]/80 backdrop-blur-xl border-slate-200 dark:border-white/10 shadow-sm py-3'
            : 'bg-white/40 dark:bg-[#060608]/40 backdrop-blur-md border-slate-200/50 dark:border-white/5 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-12 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2.5 group transition-transform hover:scale-[1.02]">
            <HQLogo size={32} />
            <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-xl">
              HQ<span className="text-cyan-500">.</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-bold transition-colors ${
                    isActive
                      ? 'text-cyan-500 font-extrabold'
                      : 'text-slate-600 dark:text-foreground/75 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-foreground/75 hover:text-slate-900 dark:hover:text-white transition-colors"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-400" />
              )}
            </button>
            <div className="h-5 w-px bg-slate-300 dark:bg-white/10" />

            {user ? (
              <Link href="/dashboard">
                <Button
                  variant="primary"
                  className="text-xs font-bold px-4 h-9 bg-cyan-500 hover:bg-cyan-400 text-white border-none shadow-md transition-all"
                >
                  Enter Boardroom
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-sm font-bold text-slate-700 dark:text-foreground/75 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    Enter Headquarters
                  </Button>
                </Link>
                <Link href="/onboarding">
                  <Button
                    variant="primary"
                    className="text-xs font-bold px-4.5 h-9 bg-cyan-500 hover:bg-cyan-400 text-white shadow-md transition-all"
                  >
                    Get Started Free
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-foreground/75 hover:text-slate-900 dark:hover:text-white transition-colors"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-400" />
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 dark:text-foreground hover:text-slate-900 dark:hover:text-white"
            >
              {mobileMenuOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white/95 dark:bg-[#060608]/95 backdrop-blur-2xl flex flex-col pt-24 px-6 space-y-4 lg:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/10 pb-3"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 flex flex-col gap-3">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full h-11 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-bold rounded-xl">
                Enter Headquarters
              </Button>
            </Link>
            <Link href="/onboarding" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full h-11 bg-cyan-500 text-white font-bold rounded-xl">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Main Body */}
      <main className="flex-1 pt-24">{children}</main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-white/10 bg-white/50 dark:bg-[#060608]/50 backdrop-blur-md py-12 px-6 sm:px-12 text-left relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            <HQLogo size={24} />
            <span className="text-xs font-extrabold text-slate-900 dark:text-white">HQ AI OS</span>
            <span className="text-xs text-slate-500 dark:text-foreground/45">• Autonomous Executive Command System</span>
          </div>

          <div className="flex flex-wrap gap-6 text-xs font-bold text-slate-600 dark:text-foreground/60">
            <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-900 dark:hover:text-white">Terms of Service</Link>
            <Link href="/security" className="hover:text-slate-900 dark:hover:text-white">Trust Center</Link>
            <Link href="/contact" className="hover:text-slate-900 dark:hover:text-white">Contact</Link>
          </div>

          <p className="text-[11px] text-slate-400 dark:text-foreground/40 font-mono">© 2026 HQ Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
