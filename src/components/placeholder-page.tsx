import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Construction, ArrowLeft } from "lucide-react";

export function PlaceholderPage({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mx-auto max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-10 text-center"
      >
        <div className="bg-gradient-primary glow-primary mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl">
          <Construction className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-gradient-primary text-4xl font-bold">{title}</h1>
        <p className="mt-3 text-muted-foreground">
          {description ?? `${title} – Coming soon. We're cooking something amazing here.`}
        </p>
        <Link
          to="/dashboard"
          className="bg-gradient-primary glow-primary mt-8 inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-105"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}
