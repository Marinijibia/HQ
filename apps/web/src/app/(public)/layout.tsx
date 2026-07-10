'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@hq/ui';
import { useAuth } from '../../contexts/auth-context';
import { useTheme } from '../../contexts/theme-context';
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
    <div className="min-h-screen bg-[#F9F9FB] dark:bg-[#030303] text-[#1A1A1E] dark:text-[#F2F2F7] flex flex-col justify-between font-sans relative overflow-hidden select-none">
      {/* Decorative Dot Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e1e24_1px,transparent_1px)] [background-size:16px_16px] opacity-10 dark:opacity-20 pointer-events-none"></div>

      {/* Giant Ambient Glows */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-hq-blue/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-hq-purple/5 blur-[130px] pointer-events-none"></div>

      {/* Sticky Top Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          scrolled
            ? 'bg-[#F9F9FB]/80 dark:bg-[#030303]/80 backdrop-blur-xl border-black/5 dark:border-[#1E1E24]/80 shadow-lg py-3'
            : 'bg-[#F9F9FB]/40 dark:bg-[#030303]/40 backdrop-blur-md border-black/5 dark:border-[#1E1E24]/30 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-12 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-hq-blue via-[#8B5CF6] to-hq-purple flex items-center justify-center font-extrabold text-white text-sm shadow-[0_0_15px_rgba(14,165,233,0.3)]">
              HQ
            </div>
            <span className="font-extrabold tracking-tight text-[#1A1A1E] dark:text-white text-xl">
              HQ<span className="text-hq-cyan">.</span>
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
                  className={`text-sm font-semibold transition-colors ${
                    isActive
                      ? 'text-hq-cyan font-bold'
                      : 'text-foreground/75 hover:text-[#1A1A1E] dark:hover:text-white'
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
              className="p-2 rounded-full border border-[#1E1E24]/60 bg-[#1E1E24]/10 text-foreground/75 hover:text-white transition-colors"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-400" />
              )}
            </button>
            <div className="h-5 w-px bg-[#1E1E24]/40" />

            {user ? (
              <Link href="/dashboard">
                <Button
                  variant="primary"
                  className="text-xs font-semibold px-4 h-9 bg-gradient-to-r from-hq-blue to-hq-purple text-white border-none shadow-[0_0_15px_rgba(14,165,233,0.2)] hover:shadow-[0_0_20px_rgba(14,165,233,0.4)] transition-all"
                >
                  Enter Boardroom
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-sm font-semibold text-foreground/75 hover:text-[#1A1A1E] dark:hover:text-white transition-colors"
                  >
                    Enter Headquarters
                  </Button>
                </Link>
                <Link href="/onboarding">
                  <Button
                    variant="primary"
                    className="text-xs font-semibold px-4.5 h-9 bg-gradient-to-r from-[#1E1B4B] to-[#311042] border border-hq-purple/40 text-white hover:border-hq-purple transition-all animate-pulse"
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-full border border-[#1E1E24]/60 bg-[#1E1E24]/10 text-foreground/75 hover:text-white transition-colors"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-400" />
              )}
            </button>
            {!user && (
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-sm font-semibold text-foreground/75 hover:text-[#1A1A1E] dark:hover:text-white transition-colors px-2.5"
                >
                  Enter Headquarters
                </Button>
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-foreground/75 hover:bg-[#1E1E24]/30 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#F9F9FB]/95 dark:bg-[#030303]/95 border-b border-black/10 dark:border-[#1E1E24]/60 backdrop-blur-xl px-6 py-4 space-y-2.5 animate-in slide-in-from-top-2 duration-200">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block text-base font-semibold py-2 transition-colors ${
                  pathname === link.href
                    ? 'text-hq-cyan'
                    : 'text-foreground/75 hover:text-[#1A1A1E] dark:hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-3 border-t border-[#1E1E24]/40 flex flex-col gap-2">
              {user ? (
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full h-10 bg-gradient-to-r from-hq-blue to-hq-purple text-white text-xs font-bold">
                    Enter Boardroom
                  </Button>
                </Link>
              ) : (
                <Link href="/onboarding" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full h-10 bg-gradient-to-r from-[#1E1B4B] to-[#311042] border border-hq-purple/40 text-white text-xs font-bold">
                    Get Started
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Workspace Page Panel */}
      <div className="flex-1 pt-20 relative z-10 flex flex-col justify-between">{children}</div>

      {/* Footer */}
      <footer className="h-16 flex items-center justify-between border-t border-black/5 dark:border-[#1E1E24]/50 px-6 sm:px-12 bg-[#F9F9FB]/40 dark:bg-black/40 text-sm text-foreground/45 z-10 relative">
        <span>© 2026 HQ Inc. All rights reserved.</span>
        <div className="flex items-center space-x-6">
          <Link
            href="/privacy"
            className="hover:text-[#1A1A1E] dark:hover:text-white transition-colors"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="hover:text-[#1A1A1E] dark:hover:text-white transition-colors"
          >
            Terms
          </Link>
          <Link
            href="/security"
            className="hover:text-[#1A1A1E] dark:hover:text-white transition-colors"
          >
            Security
          </Link>
          <Link
            href="/status"
            className="hover:text-[#1A1A1E] dark:hover:text-white transition-colors"
          >
            Status
          </Link>
        </div>
      </footer>
    </div>
  );
}
