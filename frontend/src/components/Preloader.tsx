import { useEffect, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from "framer-motion";

// Timing, in seconds. The hero reads HERO_START so its headline begins
// rising exactly as the curtain lifts.
const COUNT_TIME = 1.65; // counter runs 000 -> 100
const EXIT_AT = 1.95; // counter and texts slide out
const CURTAIN_AT = 2.25; // columns start lifting
export const HERO_START = 2.45;
const DONE_AT = 3.3; // loader removed from the page

const WORDS = ["Strategy", "Design", "Development", "Launch"];
const COLUMNS = 5;
const EASE = [0.76, 0, 0.24, 1] as const;

// Text that sits in a mask, rises in at the start and leaves upward at the end.
function Masked({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <span className={`block overflow-hidden ${className}`}>
      <motion.span
        className="block"
        initial={{ y: "105%" }}
        animate={{ y: ["105%", "0%", "0%", "-105%"] }}
        transition={{
          duration: EXIT_AT + 0.5 - delay,
          delay,
          times: [0, 0.5 / (EXIT_AT + 0.5 - delay), (EXIT_AT - delay) / (EXIT_AT + 0.5 - delay), 1],
          ease: EASE,
        }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export default function Preloader() {
  const reduceMotion = useReducedMotion();
  const [done, setDone] = useState(false);
  const [word, setWord] = useState(0);

  const count = useMotionValue(0);
  const digits = useTransform(count, (v) => String(Math.round(v)).padStart(3, "0"));
  const bar = useTransform(count, (v) => v / 100);

  // Change the word as the counter passes each quarter.
  useMotionValueEvent(count, "change", (v) => {
    setWord(Math.min(WORDS.length - 1, Math.floor(v / (100 / WORDS.length))));
  });

  useEffect(() => {
    if (reduceMotion) return;

    // Quick at first, slowing near 100, like a real load.
    const counter = animate(count, 100, { duration: COUNT_TIME, delay: 0.15, ease: [0.65, 0, 0.35, 1] });

    // Freeze the page underneath until the curtain lifts. The smooth-scroll
    // engine starts a moment after this component, hence the setTimeout.
    type Lenis = { stop: () => void; start: () => void };
    const getLenis = () => (window as unknown as { lenis?: Lenis }).lenis;
    const stopTimer = setTimeout(() => getLenis()?.stop(), 0);
    document.documentElement.style.overflow = "hidden";
    window.scrollTo(0, 0);

    const unlock = setTimeout(() => {
      getLenis()?.start();
      document.documentElement.style.overflow = "";
    }, CURTAIN_AT * 1000);
    const remove = setTimeout(() => setDone(true), DONE_AT * 1000);

    return () => {
      counter.stop();
      clearTimeout(stopTimer);
      clearTimeout(unlock);
      clearTimeout(remove);
      getLenis()?.start();
      document.documentElement.style.overflow = "";
    };
  }, [reduceMotion, count]);

  if (reduceMotion || done) return null;

  return (
    <div className="fixed inset-0 z-[300]" aria-hidden="true">
      {/* Two curtains of columns: dark on top, blue behind it. The dark one
          lifts first, the blue one follows, then the site shows through. */}
      {[
        { color: "#4F8CFF", lag: 0.12 },
        { color: "#050505", lag: 0 },
      ].map((layer) => (
        <div key={layer.color} className="absolute inset-0 flex">
          {Array.from({ length: COLUMNS }).map((_, i) => (
            <motion.div
              key={i}
              className="-mr-px h-full flex-1"
              style={{ background: layer.color }}
              initial={{ y: "0%" }}
              animate={{ y: "-100%" }}
              transition={{
                duration: 0.75,
                delay: CURTAIN_AT + layer.lag + i * 0.05,
                ease: EASE,
              }}
            />
          ))}
        </div>
      ))}

      {/* Content sits on the dark curtain */}
      <div className="absolute inset-0 flex flex-col justify-between px-5 pb-6 pt-6 text-white md:px-12 md:pb-10 md:pt-9">
        {/* Top row */}
        <div className="flex items-start justify-between font-sans text-[13px] text-white/55">
          <Masked className="font-display text-lg font-bold tracking-[0.12em] text-white md:text-xl">
            VELTIX<span className="text-primary">.</span>
          </Masked>
          <Masked delay={0.08} className="hidden text-right sm:block">
            Design and development studio
          </Masked>
        </div>

        {/* Middle: logo mark that slowly turns */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.img
            src="/veltix-main-logo.png"
            alt=""
            className="h-14 w-14 object-contain md:h-16 md:w-16"
            initial={{ opacity: 0, scale: 0.6, rotate: -90 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.6, 1, 1, 0.8], rotate: [-90, 0, 0, 30] }}
            transition={{ duration: EXIT_AT + 0.3, times: [0, 0.25, 0.85, 1], ease: EASE }}
          />
        </div>

        {/* Bottom: big counter on the left, changing word on the right */}
        <div>
          <div className="flex items-end justify-between gap-4">
            <Masked delay={0.05} className="leading-[0.82]">
              <span className="font-display text-[clamp(96px,26vw,260px)] font-medium tabular-nums tracking-[-0.05em]">
                <motion.span>{digits}</motion.span>
              </span>
            </Masked>

            <div className="mb-[0.6em] text-right font-sans text-[13px] md:mb-6 md:text-base">
              <Masked delay={0.12} className="text-white/45">
                Now loading
              </Masked>
              <Masked delay={0.15}>
              <span className="block h-[1.4em] overflow-hidden">
                <motion.span
                  key={word}
                  className="block font-display text-[22px] font-medium tracking-[-0.02em] text-white md:text-[32px]"
                  initial={{ y: "100%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  {WORDS[word]}
                </motion.span>
              </span>
              </Masked>
            </div>
          </div>

          {/* Progress line */}
          <motion.div
            className="mt-4 h-px w-full bg-white/10"
            animate={{ opacity: [1, 1, 0] }}
            transition={{ duration: EXIT_AT + 0.2, times: [0, 0.9, 1] }}
          >
            <motion.div className="h-full origin-left bg-primary" style={{ scaleX: bar }} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
