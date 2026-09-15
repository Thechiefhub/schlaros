import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  GraduationCap,
  Sparkles,
  Zap,
  Brain,
  ArrowRight,
  Star,
  Check,
  ClipboardList,
  BarChart3,
  Bot,
  Calendar,
  MessageCircle,
  Quote,
  ChevronDown,
  Rocket,
  Heart,
  Globe,
  Award,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SchlarOS — The Operating System for Modern Education" },
      {
        name: "description",
        content:
          "SchlarOS is the operating system for modern education. Lesson planning, grading, attendance, analytics and timetables — aligned with the new NERDC curriculum.",
      },
      { property: "og:title", content: "SchlarOS — The Operating System for Modern Education" },
      {
        property: "og:description",
        content:
          "Lesson planning, grading, attendance, analytics and timetables — aligned with the new NERDC curriculum.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Landing,
});

const STATS = [
  { value: "10K+", label: "Teachers" },
  { value: "2.4M", label: "Lessons created" },
  { value: "87%", label: "Time saved" },
  { value: "4.9★", label: "App rating" },
];

const FEATURES = [
  {
    icon: Brain,
    title: "AI Lesson Notes",
    desc: "Generate curriculum-aligned lesson notes in seconds. Edit, regenerate, ship.",
    color: "from-purple-400 to-pink-400",
  },
  {
    icon: ClipboardList,
    title: "Smart Assessments",
    desc: "Quizzes, drills, and tests built around your syllabus and your students.",
    color: "from-pink-400 to-orange-400",
  },
  {
    icon: Zap,
    title: "Bulk Grading",
    desc: "Mark 40 papers in the time it took to mark 4. With smart feedback.",
    color: "from-amber-400 to-pink-400",
  },
  {
    icon: BarChart3,
    title: "Performance Heatmaps",
    desc: "Spot the class that's slipping. Spot the student who needs you.",
    color: "from-emerald-400 to-cyan-400",
  },
  {
    icon: Bot,
    title: "AI Assistant",
    desc: "Your 24/7 teaching partner. Ask anything. Get answers that actually help.",
    color: "from-cyan-400 to-blue-400",
  },
  {
    icon: Calendar,
    title: "Master Calendar",
    desc: "Lessons, meetings, assessments — one calendar to rule them all.",
    color: "from-purple-400 to-blue-400",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Sign up in 30 seconds",
    desc: "No credit card. No setup tax. Open the app and start.",
  },
  {
    n: "02",
    title: "Tell us your subjects & classes",
    desc: "We tune SchlarOS to your curriculum, your tone, your style.",
  },
  {
    n: "03",
    title: "Generate, teach, repeat",
    desc: "Lesson notes, quizzes, reports — all one click away. Forever.",
  },
];

const TESTIMONIALS = [
  {
    name: "Mrs. Adeyemi",
    role: "Biology, SS2",
    quote: "I got my Sundays back. That alone makes SchlarOS priceless. The lesson notes are gold.",
    color: "bg-purple-500",
  },
  {
    name: "Mr. Okafor",
    role: "Mathematics, JSS3",
    quote: "Bulk grading used to take my whole weekend. Now it takes one cup of coffee. Wild.",
    color: "bg-pink-500",
  },
  {
    name: "Ms. Bello",
    role: "English, SS1",
    quote: "The student insights caught two kids who were quietly drowning. We turned them around.",
    color: "bg-cyan-500",
  },
];

const FAQS = [
  {
    q: "Is SchlarOS really free to start?",
    a: "Yes — the core features are free forever. Upgrade only when you need bulk classes and advanced analytics.",
  },
  {
    q: "Will it work for my curriculum?",
    a: "SchlarOS supports WAEC, NECO, Cambridge, IB and most national curricula. Just tell it what you teach.",
  },
  {
    q: "Is my student data safe?",
    a: "Encrypted at rest and in transit. We never sell data. You own everything you create.",
  },
  {
    q: "Can I use it on my phone?",
    a: "Absolutely. SchlarOS is fully responsive — phone, tablet, laptop, all good.",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6 },
};

function Landing() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const blobY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const blobY2 = useTransform(scrollYProgress, [0, 1], [0, -150]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Nav */}
      <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-primary glow-primary flex h-11 w-11 items-center justify-center rounded-2xl">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-gradient-primary font-display text-xl font-bold">SchlarOS</div>
            <div className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              Modern Education OS
            </div>
          </div>
        </div>
        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#features"
            className="text-sm font-semibold text-foreground/70 transition-colors hover:text-foreground"
          >
            Features
          </a>
          <a
            href="#how"
            className="text-sm font-semibold text-foreground/70 transition-colors hover:text-foreground"
          >
            How it works
          </a>
          <a
            href="#love"
            className="text-sm font-semibold text-foreground/70 transition-colors hover:text-foreground"
          >
            Educators
          </a>
          <a
            href="#faq"
            className="text-sm font-semibold text-foreground/70 transition-colors hover:text-foreground"
          >
            FAQ
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="hidden rounded-2xl border border-border bg-white/70 px-4 py-2.5 text-sm font-semibold text-foreground backdrop-blur-md transition-colors hover:bg-white sm:inline-flex"
          >
            Sign In
          </Link>
          <Link
            to="/login"
            className="bg-gradient-primary glow-primary rounded-2xl px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section
        ref={heroRef}
        className="relative z-10 mx-auto max-w-6xl px-6 pt-12 pb-24 text-center md:pt-20"
      >
        <motion.div
          style={{ y: blobY }}
          className="bg-gradient-primary pointer-events-none absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full opacity-30 blur-3xl"
        />
        <motion.div
          style={{ y: blobY2 }}
          className="bg-gradient-secondary pointer-events-none absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full opacity-30 blur-3xl"
        />

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-4 py-1.5 text-xs font-semibold backdrop-blur-md"
        >
          <Star className="h-3.5 w-3.5 fill-amber text-amber" />
          Trusted by educators across 47 African nations
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-display text-5xl leading-[1.02] font-bold md:text-7xl"
        >
          The Operating System for
          <br />
          <span className="text-gradient-primary">Modern Education.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
        >
          <span className="font-semibold text-foreground">
            SchlarOS — The Operating System for Modern Education.
          </span>{" "}
          One unified platform for lesson planning, grading, attendance, analytics, timetables and
          parent communication — aligned with the new NERDC curriculum.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            to="/login"
            className="bg-gradient-primary glow-primary group inline-flex items-center gap-2 rounded-2xl px-7 py-4 text-base font-bold text-white transition-transform hover:scale-105"
          >
            Get Started Free
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/login"
            className="glass inline-flex items-center gap-2 rounded-2xl px-7 py-4 text-base font-bold text-foreground transition-all hover:-translate-y-0.5"
          >
            Sign In to your account
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="mt-4 text-xs text-muted-foreground"
        >
          For admins · teachers · parents · students
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground"
        >
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-4 w-4 text-emerald-500" /> No credit card
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-4 w-4 text-emerald-500" /> Setup in 30 seconds
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-4 w-4 text-emerald-500" /> Cancel anytime
          </span>
        </motion.div>

        {/* Hero preview card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="relative mx-auto mt-16 max-w-4xl"
        >
          <div className="bg-gradient-primary absolute -inset-1 rounded-3xl opacity-40 blur-2xl" />
          <div className="glass relative overflow-hidden rounded-3xl border-2 border-white/60 p-2 shadow-2xl">
            <div className="rounded-2xl bg-slate-900 p-6 text-left">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
                <div className="ml-3 text-xs text-white/40">schlaros.app/lesson-notes</div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Lesson Notes", v: 142, c: "from-purple-400 to-pink-400" },
                  { label: "Assessments", v: 38, c: "from-cyan-400 to-blue-400" },
                  { label: "Hours Saved", v: 96, c: "from-emerald-400 to-teal-400" },
                ].map((c, i) => (
                  <motion.div
                    key={c.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 + i * 0.1 }}
                    className={`bg-gradient-to-br ${c.c} rounded-xl p-3 text-white`}
                  >
                    <div className="text-2xl font-bold">{c.v}</div>
                    <div className="text-[10px] opacity-90">{c.label}</div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-3 rounded-xl bg-white/5 p-4">
                <div className="mb-2 flex items-center gap-2 text-xs text-white/60">
                  <Bot className="h-3.5 w-3.5 text-cyan-300" /> AI Assistant
                </div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 1.2, duration: 1.5 }}
                  className="overflow-hidden whitespace-nowrap text-sm text-white"
                >
                  ✨ Generating Biology lesson note for SS2: Photosynthesis…
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* STATS */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-20">
        <div className="glass grid grid-cols-2 gap-6 rounded-3xl p-8 md:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="text-center"
            >
              <div className="text-gradient-primary font-display text-4xl font-bold md:text-5xl">
                {s.value}
              </div>
              <div className="mt-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <motion.div {...fadeUp} className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-bold tracking-wide text-primary uppercase backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" /> Everything you need
          </div>
          <h2 className="font-display mt-4 text-4xl font-bold md:text-5xl">
            One app. <span className="text-gradient-primary">Every superpower.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            We obsessed over the parts of teaching that should never have been hard. Then we shipped
            them.
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -6 }}
                className="glass group relative overflow-hidden rounded-3xl p-6 transition-shadow hover:shadow-2xl"
              >
                <div
                  className={`bg-gradient-to-br ${f.color} mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                <div
                  className={`bg-gradient-to-br ${f.color} absolute -right-12 -bottom-12 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity group-hover:opacity-30`}
                />
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <motion.div {...fadeUp} className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-bold tracking-wide text-primary uppercase backdrop-blur-md">
            <Rocket className="h-3.5 w-3.5" /> 60 seconds to magic
          </div>
          <h2 className="font-display mt-4 text-4xl font-bold md:text-5xl">
            How it <span className="text-gradient-primary">actually works</span>
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass relative rounded-3xl p-7"
            >
              <div className="text-gradient-primary font-display text-6xl font-bold opacity-30">
                {s.n}
              </div>
              <h3 className="mt-2 text-xl font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="love" className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <motion.div {...fadeUp} className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-bold tracking-wide text-primary uppercase backdrop-blur-md">
            <Heart className="h-3.5 w-3.5 fill-electric-pink text-electric-pink" /> Teacher love
          </div>
          <h2 className="font-display mt-4 text-4xl font-bold md:text-5xl">
            Less paperwork. <span className="text-gradient-primary">More teaching.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Built for the real pains of the classroom — endless lesson notes, score sheets,
            attendance and reports.
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass relative rounded-3xl p-6"
            >
              <Quote className="text-primary/30 absolute top-5 right-5 h-8 w-8" />
              <div className="flex gap-1 text-amber">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className="h-4 w-4 fill-amber" />
                ))}
              </div>
              <p className="mt-4 text-foreground/85">"{t.quote}"</p>
              <div className="mt-6 flex items-center gap-3">
                <div
                  className={`${t.color} flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white`}
                >
                  {t.name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <div className="text-sm font-bold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative z-10 mx-auto max-w-3xl px-6 py-20">
        <motion.div {...fadeUp} className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-bold tracking-wide text-primary uppercase backdrop-blur-md">
            <MessageCircle className="h-3.5 w-3.5" /> Questions
          </div>
          <h2 className="font-display mt-4 text-4xl font-bold md:text-5xl">
            Things teachers <span className="text-gradient-primary">always ask</span>
          </h2>
        </motion.div>

        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <motion.details
              key={f.q}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass group rounded-2xl p-5 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-bold">
                {f.q}
                <ChevronDown className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
            </motion.details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-primary glow-primary relative overflow-hidden rounded-[2.5rem] p-10 text-center text-white md:p-16"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3),transparent_50%)]" />
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-white/20 blur-3xl" />
          <div className="relative">
            <Award className="mx-auto h-12 w-12" />
            <h2 className="font-display mt-4 text-4xl font-bold md:text-6xl">
              Ready to teach like a legend?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/90 md:text-lg">
              Join 10,000+ teachers using SchlarOS to do more, faster — without burning out.
            </p>
            <Link
              to="/dashboard"
              className="group mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-4 text-base font-bold text-foreground shadow-xl transition-transform hover:scale-105"
            >
              Sign Up — It's Free
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <div className="mt-4 text-xs text-white/80">No credit card required ✨</div>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-primary flex h-9 w-9 items-center justify-center rounded-xl">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div className="text-gradient-primary font-display font-bold">SchlarOS</div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Globe className="h-3.5 w-3.5" /> Built worldwide
          </div>
          <div className="text-xs text-muted-foreground">
            © 2026 SchlarOS — Made with <span className="text-electric-pink">♥</span> by Chief
            Tolulope
          </div>
        </div>
      </footer>
    </div>
  );
}
