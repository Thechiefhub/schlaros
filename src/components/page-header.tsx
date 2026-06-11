import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({
  icon: Icon,
  title,
  description,
  actions,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 flex flex-wrap items-end justify-between gap-4"
    >
      <div className="flex items-center gap-4">
        <div className="bg-gradient-primary glow-primary flex h-12 w-12 items-center justify-center rounded-2xl">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-gradient-primary font-display text-3xl font-bold md:text-4xl">{title}</h1>
          {description && <p className="text-muted-foreground text-sm md:text-base">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </motion.div>
  );
}

export function Section({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="glass rounded-3xl border border-white/40 p-5 md:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
