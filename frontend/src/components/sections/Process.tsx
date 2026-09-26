import { useEffect, useRef, useState, type RefObject } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useScrollInView } from "@/lib/useScrollInView";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollReveal from "@/components/ScrollReveal";

gsap.registerPlugin(ScrollTrigger);

// start/end are week numbers. Week 8 is shown as "Ongoing".
// "gets" should name the real deliverable at the end of each step.
const STEPS = [
  { num: "01", title: "Discover", desc: "We dig into your goals, audience, and competitors.", gets: "A project brief and sitemap", start: 1, end: 2 },
  { num: "02", title: "Design", desc: "Wireframes, moodboards, and a clickable prototype.", gets: "A prototype you can click through", start: 2, end: 3 },
  { num: "03", title: "Develop", desc: "We build it, testing on real phones as we go.", gets: "A private staging link", start: 3, end: 6 },
  { num: "04", title: "Launch", desc: "QA, speed tuning, and going live.", gets: "Your live site", start: 6, end: 7 },
  { num: "05", title: "Grow", desc: "Analytics, improvements, and updates.", gets: "Monthly reports", start: 8, end: 8 },
];
const WEEKS = 8;
const weekLabel = (w: number) => (w >= WEEKS ? "Ongoing" : `Week ${w}`);
const rangeLabel = (s: (typeof STEPS)[number]) =>
  s.start >= WEEKS ? "Ongoing" : `Weeks ${s.start}–${s.end}`;

// Which step is active at a given (fractional) week.
const stepAt = (week: number) => {
  let active = 0;
  STEPS.forEach((s, i) => {
    if (Math.floor(week) >= s.start) active = i;
  });
  return active;
};

/* ---------------- Desktop: timeline driven by the pinned scroll ---------------- */
function DesktopTimeline() {
  const reduceMotion = useReducedMotion();
  const pinRef = useRef<HTMLDivElement>(null);
  // 1 to 8.99: where the playhead is, in weeks
  const week = useMotionValue(1);
  const [active, setActive] = useState(0);
  const playheadLeft = useTransform(week, (w) => `${((w - 1) / WEEKS) * 100}%`);
  const [label, setLabel] = useState("Week 1");

  useMotionValueEvent(week, "change", (w) => {
    setActive(stepAt(w));
    setLabel(weekLabel(Math.floor(w)));
  });

  // The section's existing pinned scroll, kept. Instead of sliding cards
  // sideways, scroll progress now moves the playhead through the weeks.
  useEffect(() => {
    if (reduceMotion) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      if (!pinRef.current) return;
      ScrollTrigger.create({
        trigger: pinRef.current,
        pin: true,
        start: "top top",
        end: "+=150%",
        scrub: 1,
        onUpdate: (self) => week.set(1 + self.progress * (WEEKS - 0.01)),
      });
    });
    return () => mm.revert();
  }, [reduceMotion, week]);

  const step = STEPS[active];

  return (
    <div ref={pinRef} className="hidden h-screen flex-col justify-center lg:flex">
      <div className="container mx-auto px-12">
        <Header />

        <div className="relative mt-14">
          {/* Week labels */}
          <div className="grid grid-cols-8 font-sans text-xs text-muted-foreground">
            {Array.from({ length: WEEKS }, (_, i) => (
              <div key={i} className="border-l border-white/5 pl-2">
                {weekLabel(i + 1)}
              </div>
            ))}
          </div>

          {/* Bars */}
          <div className="relative mt-4" style={{ height: STEPS.length * 52 }}>
            {STEPS.map((s, i) => {
              const state = i === active ? "on" : i < active ? "done" : "todo";
              const Tag = reduceMotion ? "button" : "div";
              return (
                <Tag
                  key={s.num}
                  {...(reduceMotion ? { type: "button", onClick: () => setActive(i) } : {})}
                  style={{
                    left: `${((s.start - 1) / WEEKS) * 100}%`,
                    width: `calc(${((s.end - s.start + 1) / WEEKS) * 100}% - 6px)`,
                    top: i * 52,
                  }}
                  className={`absolute flex h-10 items-center gap-3 overflow-hidden whitespace-nowrap rounded-lg border px-4 font-display text-base font-medium transition-colors duration-300 ${
                    state === "on"
                      ? "border-primary bg-primary text-white"
                      : state === "done"
                        ? "border-[#22314f] bg-[#15213a] text-[#85B7EB]"
                        : "border-white/10 bg-[#0f1014] text-[#6b6b6b]"
                  }`}
                >
                  <span className="font-sans text-xs opacity-70">{s.num}</span>
                  {s.title}
                </Tag>
              );
            })}
          </div>

          {/* Playhead */}
          {!reduceMotion && (
            <motion.div
              aria-hidden="true"
              style={{ left: playheadLeft }}
              className="pointer-events-none absolute -top-2 bottom-0 w-0.5 bg-white"
            >
              <span className="absolute -top-6 left-2 whitespace-nowrap rounded bg-white px-1.5 py-0.5 font-sans text-[11px] font-medium text-black">
                {label}
              </span>
            </motion.div>
          )}
        </div>

        {/* Detail of the active step */}
        <div className="mt-10 grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-8 border-t border-white/10 pt-8" aria-live="polite">
          <span className="font-display text-6xl font-medium tracking-[-0.03em] text-primary">{step.num}</span>
          <div>
            <h3 className="font-display text-3xl font-medium tracking-[-0.02em] text-white">
              {step.title}
              <span className="ml-4 font-sans text-sm font-normal text-muted-foreground">{rangeLabel(step)}</span>
            </h3>
            <p className="mt-2 max-w-[52ch] font-sans text-lg text-muted-foreground">{step.desc}</p>
            <p className="mt-3 font-sans text-sm text-[#85B7EB]">You get: {step.gets}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Phone and tablet: vertical timeline ---------------- */
function PhoneTimeline() {
  const listRef = useRef<HTMLOListElement>(null);
  const [reached, setReached] = useState(0);
  // 0 when the list top is 70% down the screen, 1 when its bottom is.
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 70%", "end 70%"],
  });
  const fill = useTransform(scrollYProgress, (v) => v);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setReached(Math.min(STEPS.length - 1, Math.floor(v * STEPS.length)));
  });

  return (
    <div className="container mx-auto px-6 py-24 md:px-12 lg:hidden">
      <Header />
      <ol ref={listRef} className="relative mt-12 ml-1.5">
        {/* Grey line and the blue line that fills over it */}
        <span aria-hidden="true" className="absolute bottom-2 left-0 top-2 w-0.5 bg-white/10" />
        <motion.span
          aria-hidden="true"
          style={{ scaleY: fill }}
          className="absolute bottom-2 left-0 top-2 w-0.5 origin-top bg-primary"
        />
        {STEPS.map((s, i) => {
          const on = i <= reached;
          return (
            <li key={s.num} className="relative pb-10 pl-8 last:pb-0">
              <span
                aria-hidden="true"
                className={`absolute -left-[5px] top-1.5 h-3 w-3 rounded-full border-2 transition-colors duration-300 ${
                  on ? "border-primary bg-primary" : "border-white/25 bg-background"
                }`}
              />
              <div className="flex items-baseline justify-between gap-4">
                <h3 className={`font-display text-2xl font-medium tracking-[-0.02em] transition-colors duration-300 ${on ? "text-white" : "text-[#6b6b6b]"}`}>
                  <span className="mr-2 font-sans text-sm text-muted-foreground">{s.num}</span>
                  {s.title}
                </h3>
                <span className="shrink-0 font-sans text-xs text-muted-foreground">{rangeLabel(s)}</span>
              </div>
              <p className="mt-2 font-sans text-base leading-relaxed text-muted-foreground">{s.desc}</p>
              <p className="mt-2 font-sans text-sm text-[#85B7EB]">You get: {s.gets}</p>
              {/* Mini week bar: which of the 7 weeks this step covers */}
              <div className="mt-3 flex gap-1" aria-hidden="true">
                {Array.from({ length: 7 }, (_, w) => (
                  <span
                    key={w}
                    className={`h-1.5 w-5 rounded-sm ${w + 1 >= s.start && w + 1 <= s.end ? "bg-primary" : "bg-white/10"}`}
                  />
                ))}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Header() {
  const reduceMotion = useReducedMotion();
  const { ref, inView } = useScrollInView({ threshold: 0.5, triggerOnce: true });
  return (
    <div ref={ref as RefObject<HTMLDivElement>}>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="mb-4 font-sans text-sm text-muted-foreground"
      >
        Process
      </motion.p>
           {reduceMotion ? (
        <h2 className="max-w-[18ch] font-display text-4xl font-medium leading-[1.05] tracking-[-0.03em] text-white md:text-6xl">
          From first call to launch in seven weeks Or INn 24Hrs
        </h2>
      ) : (
        <ScrollReveal
          baseOpacity={0.1}
          baseRotation={3}
          blurStrength={4}
          rotationEnd="bottom 60%"
          wordAnimationEnd="bottom 60%"
          textClassName="max-w-[18ch] font-display text-4xl font-medium leading-[1.05] tracking-[-0.03em] text-white md:text-6xl"
        >
          From first call to launch in seven weeks.
        </ScrollReveal>
      )}
    </div>
  );
}

export default function Process() {
  return (
    <section id="process" className="border-y border-white/5 bg-[#050505]">
      <DesktopTimeline />
      <PhoneTimeline />
    </section>
  );
}
