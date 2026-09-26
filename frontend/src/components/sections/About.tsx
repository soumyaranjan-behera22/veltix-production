import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useScrollInView } from '@/lib/useScrollInView';
import { MousePointer2, Smartphone } from 'lucide-react';
import SpotlightCard from '@/components/SpotlightCard';

// Same easing curve as the hero, so motion feels consistent across the site.
const EASE = [0.76, 0, 0.24, 1] as const;

const PRINCIPLES = [
  {
    title: "Obsessive craft",
    desc: "Every micro-interaction is considered. We don't stop when it works; we stop when it feels right.",
  },
  {
    title: "Performance first",
    desc: "Speed is a feature. We build lightweight sites that rank higher and convert better.",
  },
  {
    title: "Conversion driven",
    desc: "Beauty without function is art. We design every page to guide visitors to one clear action.",
  },
];

// Proof 1: a designer's redline measuring the gap between two elements.
function CraftProof({ on }: { on: boolean }) {
  return (
    <div className="relative h-24 rounded-lg border border-white/10">
      <div className="absolute left-5 top-5 h-14 w-14 rounded-md border border-white/20" />
      <div className="absolute right-5 top-5 h-14 w-14 rounded-md border border-white/20" />
      <motion.div
        className="absolute left-[76px] right-[76px] top-12 h-px origin-left bg-primary"
        initial={false}
        animate={{ scaleX: on ? 1 : 0 }}
        transition={{ duration: 0.5, ease: EASE }}
      />
      <span className="absolute left-1/2 top-6 -translate-x-1/2 font-sans text-xs text-primary">
        24
      </span>
    </div>
  );
}

// Proof 2: this page's real load time, measured by the visitor's browser.
function SpeedProof() {
  const [seconds, setSeconds] = useState<string | null>(null);
  useEffect(() => {
    const read = () => {
      const nav = performance.getEntriesByType("navigation")[0] as
        | PerformanceNavigationTiming
        | undefined;
      if (nav && nav.loadEventEnd > 0) {
        setSeconds((nav.loadEventEnd / 1000).toFixed(1));
      }
    };
    if (document.readyState === "complete") read();
    else window.addEventListener("load", read, { once: true });
  }, []);
  return (
    <div className="flex h-24 flex-col justify-center rounded-lg border border-white/10 px-5 font-sans">
      <span className="text-xs text-muted-foreground">This page loaded in</span>
      <span className="font-display text-3xl font-medium text-white">
        {seconds ? `${seconds}s` : "..."}
      </span>
      <span className="text-xs text-muted-foreground">measured on your device</span>
    </div>
  );
}

// Proof 3: a cursor guided to one clear action.
function ConvertProof({ on }: { on: boolean }) {
  return (
    <div className="relative h-24 overflow-hidden rounded-lg border border-white/10">
      <span className="absolute bottom-4 right-4 rounded-full bg-primary px-3.5 py-1.5 font-sans text-xs font-medium text-white">
        Start a project
      </span>
      <motion.span
        className="absolute left-5 top-4 text-white"
        initial={false}
        animate={on ? { x: 110, y: 38 } : { x: 0, y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <MousePointer2 className="h-5 w-5" />
      </motion.span>
    </div>
  );
}

function Principles({ inView }: { inView: boolean }) {
  const [active, setActive] = useState(0);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Phones have no hover, so the row crossing the middle of the screen
  // becomes active as you scroll. The margin shrinks the "viewport" to a
  // thin band across the centre of the screen.
  useEffect(() => {
    if (!window.matchMedia("(pointer: coarse)").matches) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const i = rowRefs.current.indexOf(entry.target as HTMLDivElement);
          if (i >= 0) setActive(i);
        });
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    rowRefs.current.forEach((row) => row && io.observe(row));
    return () => io.disconnect();
  }, []);

  return (
    <div className="border-b border-white/10">
      {PRINCIPLES.map((item, i) => {
        const on = active === i;
        return (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <SpotlightCard
              spotlightColor="rgba(79, 140, 255, 0.12)"
              className="border-t border-white/10"
            >
              <div
                ref={(el) => {
                  rowRefs.current[i] = el;
                }}
                onMouseEnter={() => setActive(i)}
                className="interactive grid grid-cols-1 gap-6 px-3 py-10 md:grid-cols-[minmax(0,1fr)_240px] md:items-center md:gap-12 md:px-6"
              >
                <div>
                  <h3
                    className={`relative inline-block font-display text-[34px] font-medium leading-tight tracking-[-0.03em] transition-colors duration-300 md:text-5xl ${
                      on ? "text-white" : "text-[#6b6b6b]"
                    }`}
                  >
                    {item.title}
                    {on && (
                      <motion.span
                        layoutId="principle-frame"
                        aria-hidden="true"
                        className="pointer-events-none absolute -inset-x-2 -inset-y-1 border-2 border-primary"
                        transition={{ duration: 0.45, ease: EASE }}
                      >
                        <span className="absolute -left-[5px] -top-[5px] h-[9px] w-[9px] border-2 border-primary bg-background" />
                        <span className="absolute -bottom-[5px] -right-[5px] h-[9px] w-[9px] border-2 border-primary bg-background" />
                      </motion.span>
                    )}
                  </h3>
                  <p className="mt-4 max-w-[46ch] font-sans text-base leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
                <div
                  className={`max-w-[280px] transition-opacity duration-300 ${
                    on ? "opacity-100" : "opacity-40"
                  }`}
                >
                  {i === 0 && <CraftProof on={on} />}
                  {i === 1 && <SpeedProof />}
                  {i === 2 && <ConvertProof on={on} />}
                </div>
              </div>
            </SpotlightCard>
          </motion.div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Manifesto: the first thing visitors read after the hero.
// {site} and {phone} are the little image pills inside the sentence.
// The last word is drawn in Veltix blue.
// ---------------------------------------------------------------------------
const MANIFESTO =
  "We don't build websites to look nice. We build them to {site} bring in customers: fast, clear, and made for the phone {phone} in your hand.";

// Short facts under the manifesto. Only things you can stand behind.
const FACTS = [
  { title: "Based in India", detail: "Working with clients worldwide" },
  { title: "Replies within 24 hours", detail: "From the people who build it" },
  { title: "Live in 14 to 30 days", detail: "Or 24 hours with Express" },
];

// How far through the pinned scroll the words finish filling (0 to 1).
const FILL_END = 0.72;

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

// One word. It fills from dark grey to white (or blue) as the scroll
// reaches it. Written as functions, like the hero, so the browser's native
// scroll timeline can't mistime it.
function Word({ text, i, n, progress, accent }: { text: string; i: number; n: number; progress: MotionValue<number>; accent: boolean }) {
  const t = useTransform(progress, (p) => clamp01((p / FILL_END) * n - i));
  const color = useTransform(t, [0, 1], ["#2e2e2e", accent ? "#4F8CFF" : "#ffffff"]);
  return <motion.span style={{ color }}>{text} </motion.span>;
}

function Pill({ kind, i, n, progress }: { kind: "site" | "phone"; i: number; n: number; progress: MotionValue<number> }) {
  const t = useTransform(progress, (p) => clamp01((p / FILL_END) * n - i));
  const scale = useTransform(t, (v) => 0.5 + v * 0.5);
  const opacity = useTransform(t, (v) => v);
  return (
    <motion.span
      aria-hidden="true"
      style={{ scale, opacity }}
      className={`mr-[0.25em] inline-flex h-[0.78em] translate-y-[0.08em] items-center justify-center overflow-hidden rounded-full align-baseline ${
        kind === "site" ? "w-[1.9em] bg-[#15213a]" : "w-[1.25em] bg-primary"
      }`}
    >
      {kind === "site" ? (
        <img src="/hero-visual.webp" alt="" className="h-full w-full object-cover" />
      ) : (
        <Smartphone className="h-[0.5em] w-[0.5em] text-white" strokeWidth={2.2} />
      )}
    </motion.span>
  );
}

function Fact({ fact, i, progress }: { fact: (typeof FACTS)[number]; i: number; progress: MotionValue<number> }) {
  const start = FILL_END + 0.04 + i * 0.05;
  const t = useTransform(progress, (p) => clamp01((p - start) / 0.08));
  const y = useTransform(t, (v) => (1 - v) * 16);
  return (
    <motion.div style={{ opacity: t, y }} className="border-t border-white/15 pt-3 md:pt-4">
      <p className="font-display text-lg font-medium text-white md:text-xl">{fact.title}</p>
      <p className="mt-0.5 font-sans text-sm text-muted-foreground">{fact.detail}</p>
    </motion.div>
  );
}

function Manifesto() {
  const reduceMotion = useReducedMotion();
  const pinRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: pinRef, offset: ["start start", "end end"] });
  // Reduced motion: everything shown, fully filled, no pinning.
  const progress = useTransform(scrollYProgress, (p) => (reduceMotion ? 1 : p));

  const tokens = MANIFESTO.split(" ");
  const n = tokens.length;
  const plain = MANIFESTO.replace(/\{(site|phone)\} /g, "");

  return (
    <div ref={pinRef} className={`relative ${reduceMotion ? "" : "h-[210svh] lg:h-[260svh]"}`}>
      <div className={`${reduceMotion ? "py-24" : "sticky top-0 h-[100svh]"} flex flex-col justify-center`}>
        <div className="container mx-auto px-5 md:px-12">
          <p className="mb-5 font-sans text-sm text-muted-foreground md:mb-8">About</p>
          {/* Screen readers get the sentence once, as plain text */}
          <h2 className="sr-only">{plain}</h2>
          <p
            aria-hidden="true"
            className="max-w-[24ch] font-display text-[34px] font-medium leading-[1.06] tracking-[-0.03em] sm:text-5xl lg:max-w-[21ch] lg:text-[clamp(56px,5.4vw,92px)]"
          >
            {tokens.map((tok, i) =>
              tok === "{site}" || tok === "{phone}" ? (
                <Pill key={i} kind={tok === "{site}" ? "site" : "phone"} i={i} n={n} progress={progress} />
              ) : (
                <Word key={i} text={tok} i={i} n={n} progress={progress} accent={i === n - 1} />
              ),
            )}
          </p>
          <div className="mt-10 grid grid-cols-1 gap-4 md:mt-14 md:grid-cols-3 md:gap-8">
            {FACTS.map((f, i) => (
              <Fact key={f.title} fact={f} i={i} progress={progress} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function About() {
  const { ref: sectionCRef, inView: sectionCInView } = useScrollInView({ threshold: 0.15, triggerOnce: true });

  return (
    // No overflow-hidden here: it would stop the manifesto from pinning.
    <section id="about" className="relative z-10 bg-background pb-24 md:pb-32">
      <Manifesto />

      <div className="container mx-auto mt-16 px-6 md:mt-24 md:px-12">
        {/* Principles */}
        <div ref={sectionCRef}>
          <Principles inView={sectionCInView} />
        </div>
      </div>
    </section>
  );
}
