"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User, LogOut, FolderOpen, Sparkles, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/AuthProvider";

export default function Nav() {
  const pathname = usePathname();
  const isPro = pathname?.startsWith("/pro");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, loading } = useAuth();
  const [isProUser, setIsProUser] = useState(false);

  useEffect(() => {
    if (user) {
      fetch(`/api/stripe/check-status?userId=${user.id}`)
        .then((res) => res.json())
        .then((data) => setIsProUser(data.isPro === true))
        .catch(() => setIsProUser(false));
    } else {
      setIsProUser(false);
    }
  }, [user]);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);
  useEffect(() => { document.body.style.overflow = mobileOpen ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [mobileOpen]);

  return (
    <>
      <header className={cn(
        "fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 md:px-10 transition-shadow duration-300",
        isPro
          ? "border-b border-white/5 bg-graphite-700/70 backdrop-blur-md"
          : scrolled
            ? "border-b border-stone-200 bg-white/95 shadow-sm backdrop-blur-lg"
            : "border-b border-stone-200/60 bg-white/80 backdrop-blur-lg"
      )}>
        <Link href="/" className="group flex items-center gap-2">
          <Logo dark={isPro} />
          <span className={cn("font-display text-lg sm:text-xl tracking-tight", isPro ? "text-canvas-50" : "text-stone-800")}>
            naili
          </span>
          <span className={cn("text-[10px] font-mono uppercase tracking-widest", isPro ? "text-mint" : "text-stone-400")}>
            {isPro ? "/ PRO" : ""}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {isPro ? (
            <>
              <NavLink href="/pro" dark>Overview</NavLink>
              <NavLink href="/pro#access" dark>Request Access</NavLink>
              <Link href="/" className="ml-3 px-4 py-2 text-sm text-canvas-50/70 transition hover:text-canvas-50">Homeowner site →</Link>
            </>
          ) : (
            <>
              <NavLink href="/my-projects">My Projects</NavLink>
              <NavLink href="/get-quotes">Get Quotes</NavLink>
              <NavLink href="/pro">For Pros</NavLink>

              {!loading && user ? (
                <div className="relative ml-3" ref={accountRef}>
                  {isProUser && (
                    <span className="absolute -right-1 -top-1 z-10 inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 shadow-sm">
                      <Crown className="h-2.5 w-2.5" /> Pro
                    </span>
                  )}
                  <button onClick={() => setAccountOpen(!accountOpen)}
                    className="flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3.5 py-2 text-sm font-medium text-stone-700 shadow-sm transition hover:shadow-md hover:border-stone-300">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-amber-50">
                      <User className="h-3.5 w-3.5 text-amber-700" />
                    </div>
                    <span className="max-w-[120px] truncate">{user.email?.split('@')[0]}</span>
                  </button>
                  {accountOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-stone-200 bg-white p-1.5 shadow-xl z-50">
                      <div className="border-b border-stone-100 px-3 py-2.5 mb-1.5">
                        <p className="text-[10px] uppercase tracking-wider text-stone-400">Signed in as</p>
                        <p className="truncate text-sm font-medium text-stone-700">{user.email}</p>
                      </div>
                      <Link href="/my-projects" onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-stone-600 transition hover:bg-stone-50">
                        <FolderOpen className="h-4 w-4" /> My Projects
                      </Link>
                      <form action="/auth/signout" method="POST">
                        <button type="submit" className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 transition hover:bg-red-50">
                          <LogOut className="h-4 w-4" /> Sign out
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              ) : !loading && (
                <Link href="/auth/login"
                  className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm transition hover:shadow-md hover:border-stone-300">
                  Sign in
                </Link>
              )}

              <Link href="/"
                className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-stone-800 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-stone-900 hover:shadow-lg active:scale-95">
                <Sparkles className="h-3.5 w-3.5" />
                Start Estimate
              </Link>
            </>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button onClick={() => setMobileOpen(!mobileOpen)}
          className={cn("flex items-center justify-center rounded-xl p-2.5 transition md:hidden active:scale-90",
            isPro ? "text-canvas-50 hover:bg-white/10" : "text-stone-700 hover:bg-stone-100"
          )} aria-label="Toggle menu">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)} />
          <div className={cn("fixed inset-x-0 top-[57px] z-40 max-h-[calc(100vh-57px)] overflow-y-auto border-b px-4 pb-6 pt-3 md:hidden",
            isPro ? "border-white/5 bg-graphite-700/98 backdrop-blur-xl" : "border-stone-200 bg-white/98 backdrop-blur-xl"
          )}>
            <nav className="flex flex-col gap-0.5">
              {isPro ? (
                <>
                  <MobileNavLink href="/pro" dark>Overview</MobileNavLink>
                  <MobileNavLink href="/pro#access" dark>Request Access</MobileNavLink>
                  <div className="my-2 h-px bg-white/10" />
                  <MobileNavLink href="/" dark>Homeowner site →</MobileNavLink>
                </>
              ) : (
                <>
                  <MobileNavLink href="/my-projects">My Projects</MobileNavLink>
                  <MobileNavLink href="/get-quotes">Get Quotes</MobileNavLink>
                  <MobileNavLink href="/pro">For Pros</MobileNavLink>
                  <div className="my-2 h-px bg-stone-100" />
                  {!loading && user && (
                    <div className="flex items-center gap-3 rounded-xl bg-stone-50 px-4 py-3 mb-1">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-amber-50">
                        <User className="h-4 w-4 text-amber-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-stone-400">Signed in as</p>
                        <p className="truncate text-sm font-medium text-stone-700">{user.email}</p>
                      </div>
                    </div>
                  )}
                  {!loading && user && (
                    <form action="/auth/signout" method="POST">
                      <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition active:bg-red-50">
                        <LogOut className="h-4 w-4" /> Sign out
                      </button>
                    </form>
                  )}
                  {!loading && !user && (
                    <MobileNavLink href="/auth/login">Sign in</MobileNavLink>
                  )}
                  <Link href="/#upload" onClick={() => setMobileOpen(false)}
                    className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-stone-800 px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition active:scale-95">
                    <Sparkles className="h-4 w-4" /> Start Estimate
                  </Link>
                </>
              )}
            </nav>
          </div>
        </>
      )}
    </>
  );
}

function NavLink({ href, children, dark }: { href: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <Link href={href} className={cn("rounded-full px-3.5 py-2 text-sm transition-all duration-300",
      dark ? "text-canvas-50/70 hover:bg-white/5 hover:text-canvas-50" : "text-stone-600 hover:bg-stone-100 hover:text-stone-800")}>
      {children}
    </Link>
  );
}

function MobileNavLink({ href, children, dark, icon }: { href: string; children: React.ReactNode; dark?: boolean; icon?: React.ReactNode }) {
  return (
    <Link href={href} className={cn("flex items-center gap-3 rounded-xl px-4 py-3.5 text-[15px] font-medium transition active:scale-[0.98]",
      dark ? "text-canvas-50/80 hover:bg-white/5 hover:text-canvas-50" : "text-stone-600 hover:bg-stone-50 hover:text-stone-800")}>
      {icon && <span className="text-stone-400">{icon}</span>}
      <span className="flex-1">{children}</span>
    </Link>
  );
}

function Logo({ dark }: { dark?: boolean }) {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-500 group-hover:rotate-12">
      <circle cx="16" cy="16" r="15" stroke={dark ? "#B8D8C8" : "#292524"} strokeWidth="1.5" opacity="0.9" />
      <path d="M10 22 L10 10 L22 22 L22 10" stroke={dark ? "#B8D8C8" : "#292524"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="16" r="1.4" fill="#D8B98A" />
    </svg>
  );
}
