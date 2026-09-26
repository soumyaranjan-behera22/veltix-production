import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { Smartphone } from 'lucide-react';
import PrinciplesSection from '@/components/Principles';

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
  return (
    // No overflow-hidden here: it would stop the manifesto from pinning.
    <section id="about" className="relative z-10 bg-background pb-24 md:pb-32">
      <Manifesto />

      <div className="container mx-auto mt-16 px-6 md:mt-24 md:px-12">
        {/* Principles: pinned list + proof stage on desktop, cards on phones */}
        <PrinciplesSection />
      </div>
    </section>
  );
}
