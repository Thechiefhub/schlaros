import { Link, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Sparkles,
  Search,
  Plus,
  Star,
  Clock,
  ChevronDown,
  ChevronRight,
  Settings,
  Bell,
  LifeBuoy,
  LogOut,
  ChevronsUpDown,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { SECTIONS, APP_BRAND, QUICK_ACTIONS, MENU, type MenuItem } from "@/lib/teacher-menu";
import { usePersisted } from "@/hooks/use-persisted";

function MenuRow({
  item,
  active,
  onNavigate,
  pinned,
  onTogglePin,
}: {
  item: MenuItem;
  active: boolean;
  onNavigate?: () => void;
  pinned: boolean;
  onTogglePin: (to: string) => void;
}) {
  const Icon = item.icon;
  const baseCls =
    "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all";
  const stateCls = active
    ? "bg-gradient-to-r from-white/20 to-white/5 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
    : "text-white/70 hover:bg-white/10 hover:text-white";

  if (item.comingSoon || !item.to) {
    return (
      <div
        className={`${baseCls} cursor-not-allowed text-white/40 hover:bg-white/[0.03]`}
        title="Coming soon"
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{item.label}</span>
        <span className="ml-auto rounded-md bg-gradient-to-r from-amber/30 to-electric-pink/30 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-white/80 ring-1 ring-white/10">
          SOON
        </span>
      </div>
    );
  }

  return (
    <div className="group/row relative">
      <Link
        to={item.to}
        onClick={onNavigate}
        className={`${baseCls} ${stateCls}`}
      >
        {active && (
          <motion.div
            layoutId="nav-active-bar"
            className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-gradient-to-b from-electric-pink to-neon-purple"
          />
        )}
        <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
        <span className="truncate">{item.label}</span>
      </Link>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onTogglePin(item.to!);
        }}
        className={`absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1 transition-opacity ${
          pinned ? "opacity-100" : "opacity-0 group-hover/row:opacity-100"
        }`}
        title={pinned ? "Unpin" : "Pin to favorites"}
      >
        <Star
          className={`h-3.5 w-3.5 ${pinned ? "fill-amber text-amber" : "text-white/50 hover:text-white"}`}
        />
      </button>
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const Brand = APP_BRAND.icon;
  const [query, setQuery] = useState("");
  const [openSections, setOpenSections] = usePersisted<Record<string, boolean>>(
    "tgpt:sections",
    Object.fromEntries(SECTIONS.map((s) => [s.id, s.defaultOpen ?? true])),
  );
  const [favorites, setFavorites] = usePersisted<string[]>("tgpt:favorites", [
    "/dashboard",
    "/lesson-notes",
    "/assessments",
  ]);
  const [recents, setRecents] = usePersisted<string[]>("tgpt:recents", []);
  const [quickOpen, setQuickOpen] = useState(false);

  // Track recents
  useEffect(() => {
    if (!MENU.find((m) => m.to === pathname)) return;
    setRecents((prev) => {
      const next = [pathname, ...prev.filter((p) => p !== pathname)].slice(0, 5);
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Cmd+K focus
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const togglePin = (to: string) =>
    setFavorites((prev) =>
      prev.includes(to) ? prev.filter((p) => p !== to) : [...prev, to],
    );

  const q = query.trim().toLowerCase();
  const filteredSections = useMemo(() => {
    if (!q) return SECTIONS;
    return SECTIONS.map((s) => ({
      ...s,
      items: s.items.filter((i) => i.label.toLowerCase().includes(q)),
    })).filter((s) => s.items.length > 0);
  }, [q]);

  const favItems = favorites
    .map((to) => MENU.find((m) => m.to === to))
    .filter(Boolean) as MenuItem[];
  const recentItems = recents
    .map((to) => MENU.find((m) => m.to === to))
    .filter(Boolean) as MenuItem[];

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4">
        <div className="bg-gradient-primary glow-primary flex h-10 w-10 items-center justify-center rounded-xl">
          <Brand className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <div className="text-gradient-primary font-display text-lg font-bold leading-tight">
            {APP_BRAND.name}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-white/50">
            {APP_BRAND.tagline}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools, lessons, reports..."
            className="w-full rounded-lg border border-white/10 bg-white/[0.04] py-1.5 pl-8 pr-12 text-xs text-white placeholder:text-white/40 focus:border-electric-pink/50 focus:bg-white/[0.07] focus:outline-none"
          />
          <kbd className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[9px] font-medium text-white/50 md:block">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="relative mx-3 mt-2.5">
        <button
          onClick={() => setQuickOpen((o) => !o)}
          className="bg-gradient-primary glow-primary flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white transition-transform hover:scale-[1.02]"
        >
          <Plus className="h-3.5 w-3.5" />
          Quick Create
          <ChevronDown
            className={`h-3 w-3 transition-transform ${quickOpen ? "rotate-180" : ""}`}
          />
        </button>
        <AnimatePresence>
          {quickOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute left-0 right-0 top-full z-20 mt-1.5 overflow-hidden rounded-lg border border-white/10 bg-[oklch(0.18_0.04_265)] p-1 shadow-2xl"
            >
              {QUICK_ACTIONS.map((a) => {
                const I = a.icon;
                return (
                  <Link
                    key={a.to}
                    to={a.to}
                    onClick={() => {
                      setQuickOpen(false);
                      onNavigate?.();
                    }}
                    className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    <I className="h-3.5 w-3.5 text-electric-pink" />
                    {a.label}
                  </Link>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mx-3 mt-3 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5">
        <Sparkles className="h-3.5 w-3.5 text-amber" />
        <div className="text-[10px] font-medium text-white/70">Pro Educator</div>
        <div className="ml-auto rounded bg-mint/20 px-1.5 py-0.5 text-[9px] font-bold text-mint">
          ACTIVE
        </div>
      </div>

      {/* Scrollable nav */}
      <nav className="scrollbar-thin mt-3 flex-1 space-y-3 overflow-y-auto px-3 pb-4">
        {/* Favorites */}
        {!q && favItems.length > 0 && (
          <div>
            <div className="mb-1 flex items-center gap-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-white/40">
              <Star className="h-3 w-3 text-amber" /> Favorites
            </div>
            <div className="space-y-0.5">
              {favItems.map((item) => (
                <MenuRow
                  key={`fav-${item.to}`}
                  item={item}
                  active={pathname === item.to}
                  onNavigate={onNavigate}
                  pinned
                  onTogglePin={togglePin}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recents */}
        {!q && recentItems.length > 0 && (
          <div>
            <div className="mb-1 flex items-center gap-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-white/40">
              <Clock className="h-3 w-3 text-cyan" /> Recent
            </div>
            <div className="space-y-0.5">
              {recentItems.map((item) => (
                <MenuRow
                  key={`rec-${item.to}`}
                  item={item}
                  active={pathname === item.to}
                  onNavigate={onNavigate}
                  pinned={favorites.includes(item.to!)}
                  onTogglePin={togglePin}
                />
              ))}
            </div>
          </div>
        )}

        {/* Sections */}
        {filteredSections.map((section) => {
          const isOpen = q ? true : openSections[section.id] ?? true;
          const SectionIcon = section.icon;
          return (
            <div key={section.id} className="">
              <button
                onClick={() =>
                  setOpenSections((prev) => ({ ...prev, [section.id]: !isOpen }))
                }
                className="group flex w-full items-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-2 py-1.5 text-left transition-all hover:border-white/10 hover:bg-white/[0.06]"
              >
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br ${section.accent} shadow-lg`}
                >
                  <SectionIcon className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[11px] font-bold uppercase tracking-wider text-white/80">
                    {section.label}
                  </div>
                </div>
                {isOpen ? (
                  <ChevronDown className="h-3.5 w-3.5 text-white/40 transition-transform" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-white/40 transition-transform" />
                )}
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-1 space-y-0.5 pl-1">
                      {section.items.map((item, idx) => (
                        <MenuRow
                          key={`${section.id}-${item.to ?? item.label}-${idx}`}
                          item={item}
                          active={!!item.to && pathname === item.to}
                          onNavigate={onNavigate}
                          pinned={!!item.to && favorites.includes(item.to)}
                          onTogglePin={togglePin}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {q && filteredSections.length === 0 && (
          <div className="px-2 py-6 text-center text-xs text-white/50">
            No results for "{query}"
          </div>
        )}
      </nav>

      {/* Profile */}
      <div className="border-t border-white/10 p-3">
        <div className="group relative flex items-center gap-2.5 rounded-lg border border-white/5 bg-white/[0.04] px-2 py-2 hover:bg-white/[0.08]">
          <div className="bg-gradient-secondary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white shadow-lg">
            TA
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold text-white">Tolulope A.</div>
            <div className="truncate text-[10px] text-white/50">Teacher • Legends Academy</div>
          </div>
          <ChevronsUpDown className="h-3.5 w-3.5 text-white/40" />
        </div>
        <div className="mt-2 grid grid-cols-4 gap-1">
          {[
            { icon: Bell, label: "Alerts" },
            { icon: Settings, label: "Settings" },
            { icon: LifeBuoy, label: "Help" },
            { icon: LogOut, label: "Logout" },
          ].map((a) => {
            const I = a.icon;
            return (
              <button
                key={a.label}
                title={a.label}
                className="flex items-center justify-center rounded-md py-1.5 text-white/60 hover:bg-white/10 hover:text-white"
              >
                <I className="h-3.5 w-3.5" />
              </button>
            );
          })}
        </div>
        <div className="mt-2 text-center text-[9px] text-white/30">
          © 2026 SchlarOS — by Chief Tolulope
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const current = MENU.find((m) => m.to === pathname);
  const section = SECTIONS.find((s) => s.items.some((i) => i.to === pathname));

  return (
    <div className="flex min-h-screen">
      <aside className="bg-sidebar text-sidebar-foreground sticky top-0 hidden h-screen w-72 shrink-0 border-r border-white/10 md:flex md:flex-col">
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="bg-sidebar text-sidebar-foreground fixed inset-y-0 left-0 z-50 flex w-[19rem] flex-col border-r border-white/10 md:hidden"
            >
              <SidebarContent onNavigate={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar with breadcrumbs */}
        <header className="glass sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-white/40 px-4 py-2.5 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="rounded-lg bg-white/60 p-2 text-foreground md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <nav className="flex min-w-0 items-center gap-1.5 text-xs">
              <span className="text-muted-foreground">SchlarOS</span>
              {section && (
                <>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{section.label}</span>
                </>
              )}
              {current && (
                <>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  <span className="text-gradient-primary truncate font-semibold">
                    {current.label}
                  </span>
                </>
              )}
            </nav>
          </div>
          <div className="hidden items-center gap-1 md:flex">
            <button className="rounded-lg p-2 text-foreground/60 hover:bg-white/60 hover:text-foreground">
              <Bell className="h-4 w-4" />
            </button>
            <button className="rounded-lg p-2 text-foreground/60 hover:bg-white/60 hover:text-foreground">
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-10">{children}</main>
      </div>

      {open && (
        <button
          onClick={() => setOpen(false)}
          className="fixed top-3 right-3 z-[60] rounded-lg bg-white/80 p-2 text-foreground md:hidden"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
