import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useScrollInView } from '@/lib/useScrollInView';
import { MousePointer2 } from 'lucide-react';
import SpotlightCard from '@/components/SpotlightCard';

const StatCounter = ({ value, suffix, label, duration = 2 }: { value: number, suffix: string, label: string, duration?: number }) => {
  const [count, setCount] = useState(0);
  const { ref, inView: isInView } = useScrollInView({ threshold: 0.5, triggerOnce: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = parseInt(value.toString().substring(0, 3));
    if (start === end) return;

    const totalMilSecDur = duration * 1000;
    const incrementTime = (totalMilSecDur / end) * 2;

    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration, isInView]);

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="flex flex-col items-center md:items-start">
      <div className="font-display font-bold text-5xl md:text-6xl text-white mb-2 flex">
        {count}
        <span className="text-primary">{suffix}</span>
      </div>
      <div className="text-sm font-sans tracking-wider text-muted-foreground uppercase">{label}</div>
    </div>
  );
};

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

export default function About() {
  const { ref: sectionARef, inView: sectionAInView } = useScrollInView({ threshold: 0.15, triggerOnce: true });
  const { ref: sectionBRef, inView: sectionBInView } = useScrollInView({ threshold: 0.15, triggerOnce: true });
  const { ref: sectionCRef, inView: sectionCInView } = useScrollInView({ threshold: 0.15, triggerOnce: true });

  return (
    <section id="about" className="py-32 relative bg-background overflow-hidden z-10">
      <div className="container mx-auto px-6 md:px-12">
        
        {/* Section A: Story */}
        <div ref={sectionARef} className="flex flex-col lg:flex-row items-center justify-between mb-40 relative">
          <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -z-10 select-none pointer-events-none opacity-[0.03]">
            <span className="font-display font-bold text-[300px] leading-none">07</span>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={sectionAInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full lg:w-1/2 mb-16 lg:mb-0"
          >
            <div className="flex items-center space-x-3 mb-6">
              <span className="w-8 h-px bg-primary"></span>
              <span className="text-primary text-xs tracking-[0.2em] uppercase font-semibold">Years of Craft</span>
            </div>
            <h2 className="font-display font-bold text-4xl md:text-6xl text-white leading-tight mb-8">
              We don't build websites.<br />
              <span className="text-gradient">We architect digital experiences</span><br />
              that compound over time.
            </h2>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={sectionAInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="w-full lg:w-[40%]"
          >
            <p className="text-xl text-muted-foreground font-sans leading-relaxed">
              Founded in 2017, VELTIX has shipped 200+ projects across SaaS, E-commerce, Fintech, and Creator Economy. We treat every pixel as a promise and every line of code as craft.
            </p>
          </motion.div>
        </div>

        {/* Section B: Stats */}
        <div ref={sectionBRef} className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-40 border-y border-white/5 py-16">
          <StatCounter value={200} suffix="+" label="Projects Delivered" />
          <StatCounter value={98} suffix="%" label="Client Satisfaction" />
          <StatCounter value={40} suffix="M+" label="Users Reached" />
          <StatCounter value={12} suffix="" label="Industry Awards" />
        </div>

        {/* Section C: Principles */}
        <div ref={sectionCRef}>
          <Principles inView={sectionCInView} />
        </div>

      </div>
    </section>
  );
}
