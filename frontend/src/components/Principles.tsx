import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Check, MousePointer2 } from "lucide-react";
import SpotlightCard from "@/components/SpotlightCard";

const EASE = [0.76, 0, 0.24, 1] as const;

const PRINCIPLES = [
  {
    title: "Obsessive craft",
    desc: "Every micro-interaction is considered. We don't stop when it works; we stop when it feels right.",
    label: "Redline check",
  },
  {
    title: "Performance first",
    desc: "Speed is a feature. We build lightweight sites that rank higher and convert better.",
    label: "Measured on your device",
  },
  {
    title: "Conversion driven",
    desc: "Beauty without function is art. We design every page to guide visitors to one clear action.",
    label: "One clear action",
  },
];

// ---------------------------------------------------------------------------
// Proof 1: a card being checked like a designer would. A guide line appears,
// the spacing gets measured, and the slightly-off button snaps into line.
// Drawn on a fixed 260 x 164 canvas that's scaled up on desktop.
// ---------------------------------------------------------------------------
function CraftProof({ on }: { on: boolean }) {
  const t = (d: number) => ({ duration: 0.5, delay: on ? d : 0, ease: EASE });
  return (
    <div className="relative h-[164px] w-[260px]">
      {/* The card being checked */}
      <div className="absolute inset-0 rounded-[16px] border border-white/15 bg-white/[0.03]" />
      <div className="absolute left-4 top-4 h-[132px] w-[88px] rounded-[10px] bg-gradient-to-br from-[#4F8CFF] to-[#1E3A8A]" />
      <div className="absolute left-[128px] top-7 h-2.5 w-[100px] rounded-full bg-white/80" />
      <div className="absolute left-[128px] top-12 h-2 w-[80px] rounded-full bg-white/25" />
      <div className="absolute left-[128px] top-[62px] h-2 w-[92px] rounded-full bg-white/25" />
      <motion.div
        className="absolute left-[128px] top-[116px] flex h-7 w-[84px] items-center justify-center rounded-full bg-primary font-sans text-[10px] font-medium text-white"
        initial={false}
        animate={{ x: on ? 0 : 7 }}
        transition={t(1.1)}
      >
        Get started
      </motion.div>

      {/* Alignment guide */}
      <motion.div
        className="absolute left-[128px] top-3 h-[140px] w-px origin-top border-l border-dashed border-[#FF5C7A]"
        initial={false}
        animate={{ scaleY: on ? 1 : 0, opacity: on ? 1 : 0 }}
        transition={t(0.15)}
      />
      {/* Gap between image and text: 24 */}
      <motion.div
        className="absolute left-[104px] top-[88px] h-px w-6 origin-left bg-[#FF5C7A]"
        initial={false}
        animate={{ scaleX: on ? 1 : 0 }}
        transition={t(0.45)}
      />
      <motion.span
        className="absolute left-[103px] top-[94px] rounded bg-[#FF5C7A] px-1 font-mono text-[9px] leading-[14px] text-white"
        initial={false}
        animate={{ opacity: on ? 1 : 0, y: on ? 0 : 4 }}
        transition={t(0.6)}
      >
        24
      </motion.span>
      {/* Top padding: 16 */}
      <motion.div
        className="absolute left-[60px] top-0 h-4 w-px origin-top bg-[#FF5C7A]"
        initial={false}
        animate={{ scaleY: on ? 1 : 0 }}
        transition={t(0.7)}
      />
      <motion.span
        className="absolute left-[64px] top-[2px] rounded bg-[#FF5C7A] px-1 font-mono text-[9px] leading-[14px] text-white"
        initial={false}
        animate={{ opacity: on ? 1 : 0 }}
        transition={t(0.8)}
      >
        16
      </motion.span>

      {/* Done */}
      <motion.span
        className="absolute -right-3 -top-3 flex items-center gap-1 rounded-full bg-white px-2 py-1 font-sans text-[10px] font-medium text-[#0e1016] shadow-lg"
        initial={false}
        animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 0.7 }}
        transition={t(1.5)}
      >
        <Check className="h-3 w-3 text-primary" /> Aligned
      </motion.span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Proof 2: real numbers from this visit, read from the browser. Nothing here
// is made up: if the browser can't tell us something, it shows a dash.
// ---------------------------------------------------------------------------
type Timing = { load: number; paint: number | null; kb: number | null; requests: number };

function usePageTiming() {
  const [timing, setTiming] = useState<Timing | null>(null);
  useEffect(() => {
    const read = () => {
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      if (!nav || nav.loadEventEnd <= 0) return;
      const paint = performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? null;
      const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
      let bytes = nav.transferSize || 0;
      resources.forEach((r) => (bytes += r.transferSize || 0));
      setTiming({
        load: nav.loadEventEnd / 1000,
        paint: paint ? paint / 1000 : null,
        kb: bytes > 0 ? Math.round(bytes / 1024) : null,
        requests: resources.length + 1,
      });
    };
    // The load time is only filled in after the load event has finished,
    // so read it a moment later. (The old version read it too early.)
    if (document.readyState === "complete") setTimeout(read, 50);
    else window.addEventListener("load", () => setTimeout(read, 50), { once: true });
  }, []);
  return timing;
}

function SpeedProof({ on }: { on: boolean }) {
  const timing = usePageTiming();
  const shown = useMotionValue(0);
  const text = useTransform(shown, (v) => v.toFixed(1));
  const scaleMax = Math.max(4, Math.ceil(timing?.load ?? 0));
  const fill = useTransform(shown, (v) => Math.min(v / scaleMax, 1));

  // Count up the first time this proof is shown; after that, keep the number.
  const [played, setPlayed] = useState(false);
  useEffect(() => {
    if (!timing || !on) return;
    setPlayed(true);
    shown.set(0);
    const c = animate(shown, timing.load, { duration: 1.2, ease: [0.22, 1, 0.36, 1] });
    return () => c.stop();
  }, [on, timing, shown]);

  const stat = (label: string, value: string) => (
    <div>
      <p className="text-[11px] text-white/45">{label}</p>
      <p className="mt-0.5 font-display text-sm text-white lg:text-lg">{value}</p>
    </div>
  );

  return (
    <div className="flex h-full w-full flex-col justify-center px-6 font-sans lg:px-12">
      <p className="text-xs text-white/50 lg:text-sm">This page loaded in</p>
      <p className="font-display text-[52px] font-medium leading-none tracking-[-0.04em] text-white lg:text-[112px]">
        {timing && played ? (
          <>
            <motion.span>{text}</motion.span>
            <span className="text-primary">s</span>
          </>
        ) : (
          <span className="text-white/30">…</span>
        )}
      </p>

      <div className="mt-3 lg:mt-8">
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div className="h-full origin-left rounded-full bg-primary" style={{ scaleX: fill }} />
        </div>
        <div className="mt-1.5 flex justify-between text-[10px] text-white/35">
          <span>0s</span>
          <span>{scaleMax}s</span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3 border-t border-white/10 pt-3 lg:mt-8 lg:pt-6">
        {stat("First paint", timing?.paint ? `${timing.paint.toFixed(1)}s` : "–")}
        {stat(
          "Transferred",
          timing?.kb ? (timing.kb >= 1024 ? `${(timing.kb / 1024).toFixed(1)} MB` : `${timing.kb} KB`) : "–",
        )}
        {stat("Requests", timing ? String(timing.requests) : "–")}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Proof 3: a small page where the cursor is led straight to the one button,
// clicks it, and the button confirms. Loops while this proof is showing.
// ---------------------------------------------------------------------------
function ConvertProof({ on }: { on: boolean }) {
  const reduceMotion = useReducedMotion();
  const [cycle, setCycle] = useState(0);
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    setClicked(false);
    if (!on) return;
    const click = setTimeout(() => setClicked(true), 1250);
    const next = reduceMotion ? undefined : setTimeout(() => setCycle((c) => c + 1), 3600);
    return () => {
      clearTimeout(click);
      if (next) clearTimeout(next);
    };
  }, [on, cycle, reduceMotion]);

  return (
    <div className="relative h-[164px] w-[260px] overflow-hidden rounded-[14px] border border-white/15 bg-white/[0.03]">
      {/* Browser bar */}
      <div className="flex h-[22px] items-center gap-1 border-b border-white/10 px-2.5">
        <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
        <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
        <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
      </div>
      {/* Page */}
      <div className="absolute left-[18px] top-10 h-3 w-[150px] rounded-full bg-white/80" />
      <div className="absolute left-[18px] top-[58px] h-3 w-[110px] rounded-full bg-white/80" />
      <div className="absolute left-[18px] top-[82px] h-1.5 w-[170px] rounded-full bg-white/20" />
      <div className="absolute left-[18px] top-[94px] h-1.5 w-[140px] rounded-full bg-white/20" />

      <motion.div
        className="absolute left-[18px] top-[116px] flex h-7 w-[108px] items-center justify-center overflow-hidden rounded-full font-sans text-[10px] font-medium"
        animate={{
          backgroundColor: clicked ? "#ffffff" : "#4F8CFF",
          color: clicked ? "#0e1016" : "#ffffff",
          scale: clicked ? [0.92, 1] : 1,
        }}
        transition={{ duration: 0.35 }}
      >
        {clicked ? (
          <span className="flex items-center gap-1">
            <Check className="h-3 w-3 text-primary" /> Brief sent
          </span>
        ) : (
          "Start a project"
        )}
      </motion.div>

      {/* Click ripple */}
      {on && clicked && (
        <motion.span
          key={`ripple-${cycle}`}
          className="absolute left-[72px] top-[130px] h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary"
          initial={{ scale: 0.4, opacity: 1 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 0.7 }}
        />
      )}

      {/* Cursor */}
      <motion.span
        key={`cursor-${cycle}`}
        className="absolute left-0 top-0 text-white drop-shadow"
        initial={{ x: 210, y: 150 }}
        animate={on ? { x: [210, 150, 74], y: [150, 110, 128], scale: [1, 1, 1] } : { x: 210, y: 150 }}
        transition={{ duration: 1.1, times: [0, 0.45, 1], ease: EASE, delay: 0.15 }}
      >
        <MousePointer2 className="h-5 w-5 fill-white" />
      </motion.span>
    </div>
  );
}

function Proof({ i, on: wanted }: { i: number; on: boolean }) {
  // Switch "on" a frame after mounting, so each proof animates in from its
  // resting state instead of appearing already finished.
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!wanted) return setOn(false);
    const t = setTimeout(() => setOn(true), 80);
    return () => clearTimeout(t);
  }, [wanted]);

  if (i === 1) return <SpeedProof on={on} />;
  return (
    // The drawn proofs are 260px wide; scale them up on big screens
    <div className="flex h-full w-full items-center justify-center">
      <div className="scale-[0.92] sm:scale-110 lg:scale-[1.55]">
        {i === 0 ? <CraftProof on={on} /> : <ConvertProof on={on} />}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pinned on every screen. Scroll moves through the three principles; the
// list fills a progress line and the stage swaps the proof. Desktop puts the
// list on the left and the stage on the right; phones stack them.
// ---------------------------------------------------------------------------
function ProgressLine({ progress, i }: { progress: MotionValue<number>; i: number }) {
  const n = PRINCIPLES.length;
  const scaleX = useTransform(progress, (p) => Math.min(Math.max(p * n - i, 0), 1));
  return (
    <div className="mt-3 h-px w-full bg-white/10 lg:mt-5">
      <motion.div className="h-full origin-left bg-primary" style={{ scaleX }} />
    </div>
  );
}

function PinnedPrinciples() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const n = PRINCIPLES.length;
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setActive(Math.min(n - 1, Math.max(0, Math.floor(p * n))));
  });

  // Clicking a principle scrolls to the middle of its part of the track.
  const jumpTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const travel = el.offsetHeight - window.innerHeight;
    const y = top + travel * ((i + 0.5) / n);
    const lenis = (window as unknown as { lenis?: { scrollTo: (y: number, o?: object) => void } }).lenis;
    if (lenis) lenis.scrollTo(y, { duration: 1.1 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <div ref={trackRef} className="relative" style={{ height: `${n * 75 + 25}svh` }}>
      <div className="sticky top-0 flex h-[100svh] items-center pb-4 pt-[76px] lg:pb-0 lg:pt-0">
        <div className="grid w-full grid-cols-1 items-center gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          {/* List */}
          <div>
            <div className="mb-4 flex items-center justify-between font-sans text-sm text-muted-foreground lg:mb-10">
              <span>How we work</span>
              <span className="tabular-nums">
                <span className="text-white">0{active + 1}</span> / 0{n}
              </span>
            </div>

            <ul className="space-y-3 lg:space-y-8">
              {PRINCIPLES.map((p, i) => {
                const on = active === i;
                return (
                  <li key={p.title}>
                    <button type="button" onClick={() => jumpTo(i)} className="interactive block w-full text-left">
                      <span className="flex items-baseline gap-4 lg:gap-5">
                        <span className={`font-mono text-xs transition-colors duration-500 ${on ? "text-primary" : "text-white/30"}`}>
                          0{i + 1}
                        </span>
                        <span
                          className={`font-display text-[clamp(24px,7vw,30px)] font-medium lg:text-[clamp(36px,3.4vw,54px)] leading-[1.05] tracking-[-0.03em] transition-colors duration-500 ${
                            on ? "text-white" : "text-white/25 hover:text-white/50"
                          }`}
                        >
                          {p.title}
                        </span>
                      </span>
                      {/* Description opens only for the active principle */}
                      <span
                        className={`grid pl-[30px] lg:pl-[34px] transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
                          on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <span className="overflow-hidden">
                          <span className="block max-w-[44ch] pt-2 font-sans text-sm leading-relaxed text-muted-foreground lg:pt-4 lg:text-base">
                            {p.desc}
                          </span>
                        </span>
                      </span>
                    </button>
                    <div className="pl-[30px] lg:pl-[34px]">
                      <ProgressLine progress={scrollYProgress} i={i} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Stage */}
          <SpotlightCard
            spotlightColor="rgba(79, 140, 255, 0.14)"
            className="relative h-[min(300px,36svh)] overflow-hidden rounded-2xl border border-white/10 bg-[#0b0c10] lg:h-[min(560px,68svh)] lg:rounded-3xl"
          >
            {/* Faint grid, like a design canvas */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.35]"
              style={{
                backgroundImage: "radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)",
                backgroundSize: "22px 22px",
              }}
            />
            <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 py-3 font-sans text-[11px] text-white/50 lg:px-6 lg:py-5 lg:text-xs">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={active}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {PRINCIPLES[active].label}
                </motion.span>
              </AnimatePresence>
              <span className="tabular-nums">0{active + 1}</span>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                className="absolute inset-0 flex items-center justify-center pt-6 lg:pt-8"
                initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -30, filter: "blur(8px)" }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <Proof i={active} on />
              </motion.div>
            </AnimatePresence>
          </SpotlightCard>
        </div>
      </div>
    </div>
  );
}

export default function Principles() {
  return (
    <PinnedPrinciples />
  );
}
