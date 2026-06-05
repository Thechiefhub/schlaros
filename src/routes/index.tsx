import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { GraduationCap, Sparkles, Zap, Brain, Users, ArrowRight, Star } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TeacherGPT — Teach More Impact" },
      { name: "description", content: "AI-powered teaching platform that helps teachers plan, assess, and inspire — in half the time." },
      { property: "og:title", content: "TeacherGPT — Teach More Impact" },
      { property: "og:description", content: "AI-powered teaching platform that helps teachers plan, assess, and inspire." },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: Brain, title: "AI Lesson Notes", desc: "Generate full lesson notes in seconds, aligned to your curriculum." },
  { icon: Zap, title: "Bulk Grading", desc: "Mark assessments 10x faster with smart AI feedback." },
  { icon: Users, title: "Student Insights", desc: "Spot students who need extra support before it's too late." },
];

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Floating blobs */}
      <div className="bg-gradient-primary pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-30 blur-3xl" />
      <div className="bg-gradient-secondary pointer-events-none absolute top-1/3 -right-32 h-96 w-96 rounded-full opacity-30 blur-3xl" />

      {/* Nav */}
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-primary glow-primary flex h-11 w-11 items-center justify-center rounded-2xl">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-gradient-primary font-display text-xl font-bold">TeacherGPT</div>
            <div className="text-xs text-muted-foreground">Teach More Impact</div>
          </div>
        </div>
        <Link
          to="/dashboard"
          className="bg-gradient-primary glow-primary rounded-2xl px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105"
        >
          Sign Up
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pt-12 pb-20 text-center md:pt-20">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-white/60 px-4 py-1.5 text-xs font-semibold backdrop-blur-md"
        >
          <Star className="h-3.5 w-3.5 text-amber" />
          Loved by 10,000+ educators worldwide
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-display text-5xl leading-[1.05] font-bold md:text-7xl"
        >
          Your AI co-teacher.<br />
          <span className="text-gradient-primary">Built for legends.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
        >
          TeacherGPT plans your lessons, grades your tests, tracks every student, and gives you back the hours you deserve. So you can do what you love — teach.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <Link
            to="/dashboard"
            className="bg-gradient-primary glow-primary group inline-flex items-center gap-2 rounded-2xl px-7 py-3.5 text-base font-bold text-white transition-transform hover:scale-105"
          >
            Sign Up — It's Free
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <a
            href="#features"
            className="glass inline-flex items-center gap-2 rounded-2xl px-7 py-3.5 text-base font-bold text-foreground transition-all hover:-translate-y-0.5"
          >
            <Sparkles className="h-5 w-5" /> See how it works
          </a>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-3xl p-6 transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="bg-gradient-primary mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <footer className="relative z-10 border-t border-border py-8 text-center text-xs text-muted-foreground">
        © 2026 TeacherGPT — Made with <span className="text-electric-pink">♥</span> by Chief Tolulope
      </footer>
    </div>
  );
}
