import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  Shield,
  Briefcase,
  Users,
  AlertCircle,
  HelpCircle,
  User,
  Mail,
  Lock,
  Building,
  BookOpen,
  Hash,
  Phone,
  CheckCircle2,
} from "lucide-react";
import { saveSession, getSession } from "@/lib/store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Welcome to SchlarOS" },
      { name: "description", content: "Access the SchlarOS Educational Operating System." },
    ],
  }),
  component: LoginPage,
});

type AuthTab = "signin" | "signup";
type UserRole = "admin" | "teacher" | "student" | "parent";

function LoginPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AuthTab>("signin");
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Sign In inputs
  const [loginIdentifier, setLoginIdentifier] = useState(""); // Email or Username
  const [loginPassword, setLoginPassword] = useState("");

  // Sign Up inputs (Shared & Role Specific)
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Admin-specific
  const [schoolName, setSchoolName] = useState("");

  // Teacher-specific
  const [subjectSpecialty, setSubjectSpecialty] = useState("");
  const [assignedClass, setAssignedClass] = useState("");

  // Student-specific
  const [studentClass, setStudentClass] = useState("");
  const [admissionNo, setAdmissionNo] = useState("");

  // Parent-specific
  const [wardAdmissionNo, setWardAdmissionNo] = useState("");
  const [contactNo, setContactNo] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    const session = getSession();
    if (session) {
      navigate({ to: "/dashboard" });
    }
  }, [navigate]);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setError("Please fill out all fields.");
      return;
    }

    setLoading(true);
    setError("");

    // Simulate database credentials matching
    setTimeout(() => {
      const identifier = loginIdentifier.toLowerCase().trim();

      // Look up if we have stored credentials or mock them gracefully
      let matchedRole: UserRole = "teacher";
      let name = "Mrs. Adeyemi";
      let klass = "SS3 Gold";

      if (
        identifier.includes("admin") ||
        identifier === "chieftolulope@gmail.com" ||
        identifier === "admin"
      ) {
        matchedRole = "admin";
        name = "Chief Tolulope";
      } else if (
        identifier.includes("student") ||
        identifier === "amaka@schlaros.edu" ||
        identifier === "student"
      ) {
        matchedRole = "student";
        name = "Amaka Promise";
        klass = "JSS 2A";
      } else if (
        identifier.includes("parent") ||
        identifier === "parent@schlaros.edu" ||
        identifier === "parent"
      ) {
        matchedRole = "parent";
        name = "Mr. & Mrs. Promise";
        klass = "SS3 Gold";
      }

      saveSession({
        id: `user-${Date.now()}`,
        name,
        email: identifier.includes("@") ? identifier : `${identifier}@schlaros.edu`,
        role: matchedRole,
        username: identifier.includes("@") ? identifier.split("@")[0] : identifier,
        school: "Legends Academy",
        klass,
        admissionNo: matchedRole === "student" ? "SCH/2026/084" : undefined,
        wardAdmissionNo: matchedRole === "parent" ? "SCH/2026/084" : undefined,
      });

      setLoading(false);
      navigate({ to: "/dashboard" });
    }, 600);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError("Please fill out the core name, email and password.");
      return;
    }

    setLoading(true);
    setError("");

    // Generate neat username if left blank
    const finalUsername = username.trim()
      ? username.trim().toLowerCase()
      : `${selectedRole}_${fullName.toLowerCase().replace(/\s+/g, "")}_${Math.floor(10 + Math.random() * 90)}`;

    setTimeout(() => {
      const userSession = {
        id: `user-${Date.now()}`,
        name: fullName,
        email: email.trim(),
        role: selectedRole,
        username: finalUsername,
        school: selectedRole === "admin" ? schoolName : "Legends Academy",
        klass:
          selectedRole === "student"
            ? studentClass
            : selectedRole === "teacher"
              ? assignedClass
              : "SS3 Gold",
        subjectSpecialty: selectedRole === "teacher" ? subjectSpecialty : undefined,
        admissionNo: selectedRole === "student" ? admissionNo : undefined,
        wardAdmissionNo: selectedRole === "parent" ? wardAdmissionNo : undefined,
        contactNo: selectedRole === "parent" ? contactNo : undefined,
      };

      saveSession(userSession);
      setSuccessMsg(`Account created! Generated Username: ${finalUsername}`);

      setTimeout(() => {
        setLoading(false);
        navigate({ to: "/dashboard" });
      }, 1500);
    }, 800);
  };

  const rolesConfig = [
    {
      type: "admin" as UserRole,
      label: "Admin",
      icon: Shield,
      color: "text-violet-400 border-violet-500/20 hover:border-violet-500/40",
    },
    {
      type: "teacher" as UserRole,
      label: "Teacher",
      icon: Briefcase,
      color: "text-pink-400 border-pink-500/20 hover:border-pink-500/40",
    },
    {
      type: "student" as UserRole,
      label: "Student",
      icon: Users,
      color: "text-cyan-400 border-cyan-500/20 hover:border-cyan-500/40",
    },
    {
      type: "parent" as UserRole,
      label: "Parent",
      icon: GraduationCap,
      color: "text-amber-400 border-amber-500/20 hover:border-amber-500/40",
    },
  ];

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[oklch(0.07_0.02_265)] px-4 py-12 overflow-hidden">
      {/* Background radial effects */}
      <div className="bg-gradient-primary pointer-events-none absolute -top-20 -left-20 h-[35rem] w-[35rem] rounded-full opacity-15 blur-3xl" />
      <div className="bg-gradient-secondary pointer-events-none absolute -bottom-20 -right-20 h-[35rem] w-[35rem] rounded-full opacity-15 blur-3xl" />

      <div className="w-full max-w-lg space-y-6 z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto bg-gradient-primary glow-primary flex h-14 w-14 items-center justify-center rounded-2xl">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white">
            Schlar<span className="text-electric-pink">OS</span>
          </h1>
          <p className="text-sm text-white/50">Educational Operating System</p>
        </div>

        {/* Auth Card */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl shadow-2xl space-y-6">
          {/* Navigation Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
            <button
              onClick={() => {
                setActiveTab("signin");
                setError("");
                setSuccessMsg("");
              }}
              className={`py-2 text-sm font-bold rounded-xl transition-all ${
                activeTab === "signin"
                  ? "bg-primary text-white shadow-lg"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setActiveTab("signup");
                setError("");
                setSuccessMsg("");
              }}
              className={`py-2 text-sm font-bold rounded-xl transition-all ${
                activeTab === "signup"
                  ? "bg-primary text-white shadow-lg"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Register / Sign Up
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 p-3 text-xs text-red-400 border border-red-500/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2.5 rounded-xl bg-emerald-500/10 p-3 text-xs text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {activeTab === "signin" ? (
              <motion.form
                key="signin-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleSignIn}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/70 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-primary" /> Email Address or Username
                  </label>
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="Enter email or registered username"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-electric-pink/50 focus:bg-white/[0.08] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/70 flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-primary" /> Password
                  </label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-electric-pink/50 focus:bg-white/[0.08] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-primary glow-primary flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-transform hover:scale-[1.01]"
                >
                  {loading ? "Authenticating..." : "Sign In to SchlarOS"}
                  <ArrowRight className="h-4 w-4" />
                </button>

                {/* Sandbox Credentials Helper */}
                <div className="pt-4 border-t border-white/5 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block">
                    Sandbox Roles Test accounts
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {[
                      { role: "admin", cred: "admin", label: "Admin Profile" },
                      { role: "teacher", cred: "teacher", label: "Teacher Profile" },
                      { role: "student", cred: "student", label: "Student Profile" },
                      { role: "parent", cred: "parent", label: "Parent Profile" },
                    ].map((h) => (
                      <button
                        key={h.role}
                        type="button"
                        onClick={() => {
                          setLoginIdentifier(h.cred);
                          setLoginPassword("password");
                        }}
                        className="text-left bg-white/5 border border-white/5 hover:bg-white/10 p-2 rounded-lg text-white/70 hover:text-white transition-colors"
                      >
                        <span className="font-bold text-primary block">{h.label}</span>
                        <span>
                          Use key: <code className="text-pink-400 font-mono">{h.cred}</code>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.form>
            ) : (
              <motion.form
                key="signup-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleSignUp}
                className="space-y-4"
              >
                {/* Role Picker */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/70 block">
                    Select Your Workspace Role
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {rolesConfig.map((role) => {
                      const Icon = role.icon;
                      return (
                        <button
                          key={role.type}
                          type="button"
                          onClick={() => setSelectedRole(role.type)}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                            selectedRole === role.type
                              ? "bg-primary/20 border-primary text-white"
                              : "bg-white/5 border-white/10 text-white/60"
                          }`}
                        >
                          <Icon className="h-4.5 w-4.5 mb-1" />
                          <span className="text-[10px] font-bold">{role.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Common Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white/70 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-primary" /> Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Amaka Promise"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-electric-pink/50 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white/70 flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-primary" /> Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. amaka@schlaros.edu"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-electric-pink/50 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white/70 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-primary" /> Username{" "}
                      <span className="text-[9px] text-white/30">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Will auto-generate if blank"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-electric-pink/50 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white/70 flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-primary" /> Password
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-electric-pink/50 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Role-Specific Fields */}
                <div className="pt-3 border-t border-white/5 space-y-3">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                    Role-Specific Registry Profile
                  </span>

                  {/* ADMIN */}
                  {selectedRole === "admin" && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-white/70 flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5 text-primary" /> School Name
                      </label>
                      <input
                        type="text"
                        required
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        placeholder="e.g. Legends Academy"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-electric-pink/50 focus:outline-none"
                      />
                    </div>
                  )}

                  {/* TEACHER */}
                  {selectedRole === "teacher" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-white/70 flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5 text-primary" /> Subject Specialty
                        </label>
                        <input
                          type="text"
                          required
                          value={subjectSpecialty}
                          onChange={(e) => setSubjectSpecialty(e.target.value)}
                          placeholder="e.g. Biology, Chemistry"
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-electric-pink/50 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-white/70 flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-primary" /> Assigned Class Arm
                        </label>
                        <input
                          type="text"
                          required
                          value={assignedClass}
                          onChange={(e) => setAssignedClass(e.target.value)}
                          placeholder="e.g. SS3 Gold, JSS 2A"
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-electric-pink/50 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* STUDENT */}
                  {selectedRole === "student" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-white/70 flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-primary" /> Grade Class
                        </label>
                        <input
                          type="text"
                          required
                          value={studentClass}
                          onChange={(e) => setStudentClass(e.target.value)}
                          placeholder="e.g. SS3 Gold"
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-electric-pink/50 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-white/70 flex items-center gap-1.5">
                          <Hash className="h-3.5 w-3.5 text-primary" /> Admission No.
                        </label>
                        <input
                          type="text"
                          required
                          value={admissionNo}
                          onChange={(e) => setAdmissionNo(e.target.value)}
                          placeholder="e.g. SCH/2026/084"
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-electric-pink/50 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* PARENT */}
                  {selectedRole === "parent" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-white/70 flex items-center gap-1.5">
                          <Hash className="h-3.5 w-3.5 text-primary" /> Ward's Admission No.
                        </label>
                        <input
                          type="text"
                          required
                          value={wardAdmissionNo}
                          onChange={(e) => setWardAdmissionNo(e.target.value)}
                          placeholder="e.g. SCH/2026/084"
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-electric-pink/50 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-white/70 flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-primary" /> Contact Number
                        </label>
                        <input
                          type="tel"
                          required
                          value={contactNo}
                          onChange={(e) => setContactNo(e.target.value)}
                          placeholder="e.g. +234 80 123 4567"
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-electric-pink/50 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-primary glow-primary flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-transform hover:scale-[1.01]"
                >
                  {loading ? "Registering profile..." : "Complete Sign Up & Enter Dashboard"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-white/40">
          <p>© 2026 SchlarOS. Modern Education Operating System.</p>
        </div>
      </div>
    </div>
  );
}
