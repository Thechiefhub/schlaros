import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Video, Mic, MicOff, VideoOff, PhoneOff, Users, GraduationCap, Copy, Check } from "lucide-react";
import { shareUrl } from "@/lib/store";

export const Route = createFileRoute("/m/$slug")({
  head: ({ params }) => ({ meta: [{ title: `Live · ${params.slug} — TeacherGPT` }] }),
  component: MeetingRoom,
});

function MeetingRoom() {
  const { slug } = Route.useParams();
  const [phase, setPhase] = useState<"lobby" | "live" | "ended">("lobby");
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"video" | "audio">("video");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const previewRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => stopStream();
  }, []);

  async function startPreview(useVideo: boolean) {
    setError("");
    stopStream();
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: useVideo ? { width: 1280, height: 720, facingMode: "user" } : false,
        audio: true,
      });
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

  async function join() {
    if (!name.trim()) return;
    if (!streamRef.current) await startPreview(mode === "video");
    setPhase("live");
    setTimeout(() => {
      if (videoRef.current && streamRef.current) videoRef.current.srcObject = streamRef.current;
    }, 50);
  }

  function toggleMic() {
    streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !micOn));
    setMicOn(!micOn);
  }
  function toggleCam() {
    streamRef.current?.getVideoTracks().forEach((t) => (t.enabled = !camOn));
    setCamOn(!camOn);
  }
  function leave() {
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
        <header className="border-b border-white/10 px-6 py-4">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="bg-gradient-primary flex h-9 w-9 items-center justify-center rounded-xl">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-bold">TeacherGPT Live</span>
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
            <p className="mt-1 text-sm text-white/60">Please check your camera & microphone before joining.</p>

            <label className="mt-6 block">
              <span className="mb-1.5 block text-xs font-semibold text-white/70">Your Name</span>
              <input
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm placeholder:text-white/40 focus:border-primary focus:outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
              />
            </label>

            <div className="mt-4 inline-flex rounded-xl bg-white/10 p-1 text-sm">
              {(["video", "audio"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMode(m);
                    if (streamRef.current) startPreview(m === "video");
                  }}
                  className={`rounded-lg px-4 py-1.5 ${mode === m ? "bg-gradient-primary text-white" : "text-white/70"}`}
                >
                  {m === "video" ? <Video className="mr-1 inline h-3.5 w-3.5" /> : <Mic className="mr-1 inline h-3.5 w-3.5" />}
                  {m === "video" ? "Video" : "Audio only"}
                </button>
              ))}
            </div>

            {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}

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
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
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

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" />
          <span className="font-semibold">{slug}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-white/60">
          <Users className="h-3.5 w-3.5" /> 1 participant
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center p-6">
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
          <div className="absolute bottom-3 left-3 rounded-lg bg-black/60 px-2.5 py-1 text-xs font-semibold backdrop-blur">{name} (you)</div>
        </div>
      </main>
      <footer className="flex items-center justify-center gap-3 border-t border-white/10 px-6 py-4">
        <ControlBtn onClick={toggleMic} active={micOn} icon={micOn ? Mic : MicOff} label={micOn ? "Mute" : "Unmute"} />
        {mode === "video" && (
          <ControlBtn onClick={toggleCam} active={camOn} icon={camOn ? Video : VideoOff} label={camOn ? "Stop video" : "Start video"} />
        )}
        <button
          onClick={leave}
          className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold transition hover:bg-rose-700"
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
}: {
  onClick: () => void;
  active: boolean;
  icon: typeof Mic;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`inline-flex h-12 w-12 items-center justify-center rounded-full transition ${
        active ? "bg-white/10 hover:bg-white/20" : "bg-rose-600 hover:bg-rose-700"
      }`}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
