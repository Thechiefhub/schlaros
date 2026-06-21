import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Video, Mic, MicOff, VideoOff, PhoneOff, Users, GraduationCap, Copy, Check,
  Wifi, WifiOff, Signal, Hand,
} from "lucide-react";
import { shareUrl } from "@/lib/store";

export const Route = createFileRoute("/m/$slug")({
  head: ({ params }) => ({ meta: [{ title: `Live · ${params.slug} — SchlarOS` }] }),
  component: MeetingRoom,
});

type Participant = {
  id: string;
  name: string;
  micOn: boolean;
  camOn: boolean;
  handRaised: boolean;
  joinedAt: number;
  self?: boolean;
};

type Quality = "excellent" | "good" | "poor" | "offline";

function useConnectionQuality(): Quality {
  const [q, setQ] = useState<Quality>("good");
  useEffect(() => {
    function measure() {
      if (!navigator.onLine) return setQ("offline");
      const c = (navigator as unknown as { connection?: { effectiveType?: string; downlink?: number } }).connection;
      const eff = c?.effectiveType;
      if (eff === "4g") setQ("excellent");
      else if (eff === "3g") setQ("good");
      else if (eff === "2g" || eff === "slow-2g") setQ("poor");
      else setQ("good");
    }
    measure();
    window.addEventListener("online", measure);
    window.addEventListener("offline", measure);
    const i = window.setInterval(measure, 5000);
    return () => {
      window.removeEventListener("online", measure);
      window.removeEventListener("offline", measure);
      window.clearInterval(i);
    };
  }, []);
  return q;
}

function MeetingRoom() {
  const { slug } = Route.useParams();
  const [phase, setPhase] = useState<"lobby" | "live" | "ended">("lobby");
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"video" | "audio">("video");
  // Sensible defaults: mic muted on entry to avoid hot-mic embarrassment;
  // camera on for video meetings, off for audio-only.
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [showParticipants, setShowParticipants] = useState(true);
  const meRef = useRef<string>(Math.random().toString(36).slice(2, 9));
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const previewRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const quality = useConnectionQuality();

  useEffect(() => () => {
    stopStream();
    channelRef.current?.close();
  }, []);

  async function startPreview(useVideo: boolean) {
    setError("");
    stopStream();
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: useVideo ? { width: 1280, height: 720, facingMode: "user" } : false,
        audio: true,
      });
      // Apply current toggle defaults to fresh tracks
      s.getAudioTracks().forEach((t) => (t.enabled = micOn));
      s.getVideoTracks().forEach((t) => (t.enabled = camOn));
      streamRef.current = s;
      if (previewRef.current) previewRef.current.srcObject = s;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not access camera/microphone.");
    }
  }

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function broadcast(p: Partial<Participant> & { type: "join" | "update" | "leave" }) {
    channelRef.current?.postMessage({ ...p, id: meRef.current, ts: Date.now() });
  }

  async function join() {
    if (!name.trim()) return;
    if (!streamRef.current) await startPreview(mode === "video");
    setPhase("live");

    const me: Participant = {
      id: meRef.current,
      name: name.trim(),
      micOn,
      camOn: mode === "video" && camOn,
      handRaised: false,
      joinedAt: Date.now(),
      self: true,
    };
    setParticipants([me]);

    // Realtime presence within the same browser via BroadcastChannel.
    // (Cross-device presence would need a backend room server.)
    const ch = new BroadcastChannel(`schlaros-meeting-${slug}`);
    channelRef.current = ch;
    ch.onmessage = (ev) => {
      const m = ev.data as Partial<Participant> & { type: string };
      if (!m || m.id === meRef.current) return;
      if (m.type === "join" || m.type === "update") {
        setParticipants((prev) => {
          const i = prev.findIndex((p) => p.id === m.id);
          const next: Participant = {
            id: m.id!,
            name: m.name ?? "Guest",
            micOn: !!m.micOn,
            camOn: !!m.camOn,
            handRaised: !!m.handRaised,
            joinedAt: m.joinedAt ?? Date.now(),
          };
          if (i >= 0) {
            const copy = [...prev];
            copy[i] = next;
            return copy;
          }
          // On join, re-announce so the newcomer sees us.
          if (m.type === "join") broadcast({ type: "update", name: me.name, micOn, camOn: me.camOn, handRaised });
          return [...prev, next];
        });
      } else if (m.type === "leave") {
        setParticipants((prev) => prev.filter((p) => p.id !== m.id));
      }
    };
    broadcast({ type: "join", name: me.name, micOn, camOn: me.camOn, handRaised: false });

    setTimeout(() => {
      if (videoRef.current && streamRef.current) videoRef.current.srcObject = streamRef.current;
    }, 50);
  }

  function updateSelf(patch: Partial<Participant>) {
    setParticipants((prev) => prev.map((p) => (p.self ? { ...p, ...patch } : p)));
    broadcast({ type: "update", name, ...patch });
  }

  function toggleMic() {
    const next = !micOn;
    streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = next));
    setMicOn(next);
    updateSelf({ micOn: next });
  }
  function toggleCam() {
    const next = !camOn;
    streamRef.current?.getVideoTracks().forEach((t) => (t.enabled = next));
    setCamOn(next);
    updateSelf({ camOn: next });
  }
  function toggleHand() {
    const next = !handRaised;
    setHandRaised(next);
    updateSelf({ handRaised: next });
  }
  function leave() {
    broadcast({ type: "leave", name });
    channelRef.current?.close();
    channelRef.current = null;
    stopStream();
    setPhase("ended");
  }

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl(`/m/${slug}`));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (phase === "lobby") {
    return (
      <div className="min-h-dvh bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
        <header className="border-b border-white/10 px-6 py-4">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="bg-gradient-primary flex h-9 w-9 items-center justify-center rounded-xl">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-bold">SchlarOS Live</span>
          </Link>
        </header>
        <main className="mx-auto grid max-w-5xl gap-8 p-6 md:grid-cols-2 md:p-10">
          <div className="aspect-video overflow-hidden rounded-3xl bg-black ring-1 ring-white/10">
            {streamRef.current ? (
              <video ref={previewRef} autoPlay muted playsInline className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-center">
                <div>
                  <Video className="mx-auto h-12 w-12 text-white/30" />
                  <p className="mt-2 text-sm text-white/60">Camera preview will appear here</p>
                  <button
                    onClick={() => startPreview(mode === "video")}
                    className="bg-gradient-primary mt-4 inline-flex rounded-xl px-4 py-2 text-xs font-semibold"
                  >
                    Test camera &amp; mic
                  </button>
                </div>
              </div>
            )}
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-white/50">Joining meeting</p>
            <h1 className="font-display text-3xl font-bold">{slug}</h1>
            <p className="mt-1 text-sm text-white/60">You'll join muted by default — unmute when ready.</p>

            <label className="mt-6 block">
              <span className="mb-1.5 block text-xs font-semibold text-white/70">Your Name</span>
              <input
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm placeholder:text-white/40 focus:border-primary focus:outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                aria-label="Your display name"
              />
            </label>

            <div className="mt-4 inline-flex rounded-xl bg-white/10 p-1 text-sm" role="tablist" aria-label="Meeting mode">
              {(["video", "audio"] as const).map((m) => (
                <button
                  key={m}
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => {
                    setMode(m);
                    if (m === "audio") setCamOn(false); else setCamOn(true);
                    if (streamRef.current) startPreview(m === "video");
                  }}
                  className={`rounded-lg px-4 py-1.5 ${mode === m ? "bg-gradient-primary text-white" : "text-white/70"}`}
                >
                  {m === "video" ? <Video className="mr-1 inline h-3.5 w-3.5" /> : <Mic className="mr-1 inline h-3.5 w-3.5" />}
                  {m === "video" ? "Video" : "Audio only"}
                </button>
              ))}
            </div>

            <div className="mt-4 flex gap-2 text-xs">
              <button
                onClick={() => { const n = !micOn; setMicOn(n); streamRef.current?.getAudioTracks().forEach(t => t.enabled = n); }}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 ${micOn ? "bg-emerald-500/20 text-emerald-200" : "bg-white/10 text-white/70"}`}
                aria-pressed={micOn}
                aria-label={micOn ? "Microphone on" : "Microphone off"}
              >
                {micOn ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
                {micOn ? "Mic on" : "Mic off"}
              </button>
              {mode === "video" && (
                <button
                  onClick={() => { const n = !camOn; setCamOn(n); streamRef.current?.getVideoTracks().forEach(t => t.enabled = n); }}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 ${camOn ? "bg-emerald-500/20 text-emerald-200" : "bg-white/10 text-white/70"}`}
                  aria-pressed={camOn}
                  aria-label={camOn ? "Camera on" : "Camera off"}
                >
                  {camOn ? <Video className="h-3.5 w-3.5" /> : <VideoOff className="h-3.5 w-3.5" />}
                  {camOn ? "Cam on" : "Cam off"}
                </button>
              )}
            </div>

            {error && <p className="mt-3 text-sm text-rose-400" role="alert">{error}</p>}

            <button
              onClick={join}
              disabled={!name.trim()}
              className="bg-gradient-primary glow-primary mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold disabled:opacity-50"
            >
              Join meeting
            </button>

            <button
              onClick={copyLink}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-xs"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy invitation link"}
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (phase === "ended") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold">You left the meeting</h1>
          <p className="mt-2 text-white/60">Thanks for joining.</p>
          <Link to="/" className="bg-gradient-primary mt-6 inline-flex rounded-xl px-5 py-2.5 text-sm font-semibold">
            Back home
          </Link>
        </div>
      </div>
    );
  }

  const QualityIcon = quality === "offline" ? WifiOff : quality === "excellent" ? Wifi : Signal;
  const qualityColor =
    quality === "offline" ? "text-rose-400"
    : quality === "excellent" ? "text-emerald-400"
    : quality === "good" ? "text-amber-300"
    : "text-orange-400";

  return (
    <div className="flex min-h-dvh flex-col bg-black text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" aria-hidden />
          <span className="font-semibold">{slug}</span>
          <span className={`ml-3 inline-flex items-center gap-1 ${qualityColor}`} title={`Connection: ${quality}`}>
            <QualityIcon className="h-3.5 w-3.5" aria-hidden />
            <span className="text-xs capitalize">{quality}</span>
          </span>
        </div>
        <button
          onClick={() => setShowParticipants((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-xs hover:bg-white/20"
          aria-pressed={showParticipants}
          aria-label={`Toggle participants panel (${participants.length})`}
        >
          <Users className="h-3.5 w-3.5" /> {participants.length}
        </button>
      </header>

      <main className="flex flex-1">
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-3xl bg-slate-900 ring-1 ring-white/10">
            {mode === "video" && camOn ? (
              <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="bg-gradient-primary mx-auto flex h-24 w-24 items-center justify-center rounded-full">
                    <span className="font-display text-3xl font-bold">{name.charAt(0).toUpperCase()}</span>
                  </div>
                  <p className="mt-3 font-semibold">{name}</p>
                  <p className="text-xs text-white/50">{mode === "audio" ? "Audio only" : "Camera off"}</p>
                </div>
              </div>
            )}
            <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg bg-black/60 px-2.5 py-1 text-xs font-semibold backdrop-blur">
              <span>{name} (you)</span>
              {!micOn && <MicOff className="h-3 w-3 text-rose-300" aria-label="Microphone muted" />}
              {handRaised && <Hand className="h-3 w-3 text-amber-300" aria-label="Hand raised" />}
            </div>
          </div>
        </div>

        {showParticipants && (
          <aside className="hidden w-64 shrink-0 border-l border-white/10 bg-slate-950/60 p-3 md:block" aria-label="Participants">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-white/60">
              <span>Participants · {participants.length}</span>
            </div>
            <ul className="space-y-1.5">
              {participants.map((p) => (
                <li key={p.id} className="flex items-center gap-2 rounded-lg bg-white/5 px-2 py-1.5 text-sm">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-bold">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1 truncate">
                    {p.name} {p.self && <span className="text-white/40">(you)</span>}
                  </div>
                  {p.handRaised && <Hand className="h-3.5 w-3.5 text-amber-300" aria-label="Hand raised" />}
                  {p.micOn ? <Mic className="h-3.5 w-3.5 text-emerald-300" aria-label="Mic on" />
                           : <MicOff className="h-3.5 w-3.5 text-rose-300" aria-label="Mic muted" />}
                  {p.camOn ? <Video className="h-3.5 w-3.5 text-emerald-300" aria-label="Cam on" />
                           : <VideoOff className="h-3.5 w-3.5 text-white/40" aria-label="Cam off" />}
                </li>
              ))}
            </ul>
          </aside>
        )}
      </main>

      <footer className="flex items-center justify-center gap-3 border-t border-white/10 px-6 py-4">
        <ControlBtn
          onClick={toggleMic}
          active={micOn}
          icon={micOn ? Mic : MicOff}
          label={micOn ? "Mute microphone" : "Unmute microphone"}
          activeStateLabel={micOn ? "Mic on" : "Mic muted"}
        />
        {mode === "video" && (
          <ControlBtn
            onClick={toggleCam}
            active={camOn}
            icon={camOn ? Video : VideoOff}
            label={camOn ? "Turn camera off" : "Turn camera on"}
            activeStateLabel={camOn ? "Camera on" : "Camera off"}
          />
        )}
        <ControlBtn
          onClick={toggleHand}
          active={handRaised}
          icon={Hand}
          label={handRaised ? "Lower hand" : "Raise hand"}
          activeStateLabel={handRaised ? "Hand raised" : "Hand lowered"}
          activeClass="bg-amber-500/90 hover:bg-amber-500"
        />
        <button
          onClick={leave}
          className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold transition hover:bg-rose-700"
          aria-label="Leave meeting"
        >
          <PhoneOff className="h-4 w-4" /> Leave
        </button>
      </footer>
    </div>
  );
}

function ControlBtn({
  onClick,
  active,
  icon: Icon,
  label,
  activeStateLabel,
  activeClass,
}: {
  onClick: () => void;
  active: boolean;
  icon: typeof Mic;
  label: string;
  activeStateLabel: string;
  activeClass?: string;
}) {
  // When `active` is true we treat the feature as ON (mic transmitting, cam streaming,
  // hand visibly raised). Off-state uses a warning red to make state obvious.
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={`relative inline-flex h-12 w-12 items-center justify-center rounded-full transition ${
        active ? (activeClass ?? "bg-white/10 hover:bg-white/20") : "bg-rose-600 hover:bg-rose-700"
      }`}
    >
      <Icon className="h-5 w-5" aria-hidden />
      <span className="sr-only">{activeStateLabel}</span>
      <span
        className={`absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full ring-2 ring-black ${
          active ? "bg-emerald-400" : "bg-rose-300"
        }`}
        aria-hidden
      />
    </button>
  );
}
