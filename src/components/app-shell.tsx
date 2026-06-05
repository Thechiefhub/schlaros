import { Link, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles } from "lucide-react";
import { useState } from "react";
import { MENU, APP_BRAND } from "@/lib/teacher-menu";

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const Brand = APP_BRAND.icon;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 pt-6 pb-5">
        <div className="bg-gradient-primary glow-primary flex h-11 w-11 items-center justify-center rounded-2xl">
          <Brand className="h-6 w-6 text-white" />
        </div>
        <div>
          <div className="text-gradient-primary font-display text-xl font-bold">{APP_BRAND.name}</div>
          <div className="text-xs text-white/60">{APP_BRAND.tagline}</div>
        </div>
      </div>

      <div className="mx-4 mb-3 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
        <Sparkles className="h-4 w-4 text-amber" />
        <div className="text-xs text-white/70">Pro Educator Plan</div>
      </div>

      <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3 pb-6">
        {MENU.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-gradient-primary glow-primary text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className={`h-4.5 w-4.5 shrink-0 transition-transform group-hover:scale-110 ${active ? "" : ""}`} />
              <span>{item.label}</span>
              {active && (
                <motion.div
                  layoutId="nav-dot"
                  className="ml-auto h-2 w-2 rounded-full bg-white"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-5 py-4 text-[11px] text-white/50">
        © 2026 TeacherGPT — Made with <span className="text-electric-pink">♥</span> by Chief Tolulope
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="bg-sidebar text-sidebar-foreground sticky top-0 hidden h-screen w-72 shrink-0 border-r border-white/10 md:flex md:flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-sidebar text-sidebar-foreground fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 md:hidden"
            >
              <SidebarContent onNavigate={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="glass sticky top-0 z-30 flex items-center justify-between border-b border-white/40 px-4 py-3 md:hidden">
          <button
            onClick={() => setOpen(true)}
            className="rounded-xl bg-white/60 p-2 text-foreground"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="text-gradient-primary font-display font-bold">TeacherGPT</div>
          <div className="w-9" />
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-10">{children}</main>
      </div>

      {/* mobile close FAB hidden — handled in panel via overlay click */}
      {open && (
        <button
          onClick={() => setOpen(false)}
          className="fixed top-4 right-4 z-[60] rounded-xl bg-white/80 p-2 text-foreground md:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
