import { useEffect, useRef, useState } from "react";
import { animate, motion, useReducedMotion } from "framer-motion";
import { ArrowLeftRight, ArrowUpRight } from "lucide-react";
import { useScrollInView } from "@/lib/useScrollInView";
import { scrollToSection } from "@/lib/smoothscroll";
import ScrollReveal from "@/components/ScrollReveal";

// Pins sit on the images at these positions (percent of width and height).
// Blue pins are on the Veltix page, orange pins on the template page.
const VELTIX_POINTS = [
  { label: "One clear action", x: 5.5, y: 84 },
  { label: "Text you can read without zooming", x: 5.5, y: 72 },
  { label: "Nothing covering the page", x: 5.5, y: 31 },
];
const TEMPLATE_POINTS = [
  { label: "A pop-up before you've seen anything", x: 92.5, y: 37.5 },
  { label: "Tiny text in a generic greeting", x: 92.5, y: 53.5 },
  { label: "Three buttons fighting for attention", x: 92.5, y: 64 },
];

function Pin({ n, x, y, tone }: { n: number; x: number; y: number; tone: "veltix" | "template" }) {
  return (
    <span
      aria-hidden="true"
      style={{ left: `${x}%`, top: `${y}%` }}
      className={`absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-sans text-xs font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.4)] ${
        tone === "veltix" ? "bg-primary text-white" : "bg-[#ffb020] text-[#1a1a1a]"
      }`}
    >
      {n}
    </span>
  );
}

function CompareSlider({ inView }: { inView: boolean }) {
  const reduceMotion = useReducedMotion();
  const boxRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(62); // percent of the width showing Veltix
  const dragging = useRef(false);
  const touched = useRef(false);

  const moveTo = (clientX: number) => {
    const box = boxRef.current;
    if (!box) return;
    const r = box.getBoundingClientRect();
    const p = ((clientX - r.left) / r.width) * 100;
    setPos(Math.max(3, Math.min(97, p)));
  };

  // One-time nudge when the slider first appears, so people know it moves.
  // Skipped if they've already touched it or prefer reduced motion.
  useEffect(() => {
    if (!inView || reduceMotion || touched.current) return;
    const seq = [45, 75, 62];
    let i = 0;
    let controls: ReturnType<typeof animate> | undefined;
    const next = (from: number) => {
      if (i >= seq.length || touched.current) return;
      const to = seq[i++];
      controls = animate(from, to, {
        duration: 0.5,
        ease: [0.76, 0, 0.24, 1],
        onUpdate: setPos,
        onComplete: () => next(to),
      });
    };
    const t = setTimeout(() => next(62), 600);
    return () => {
      clearTimeout(t);
      controls?.stop();
    };
  }, [inView, reduceMotion]);

  const veltixSide = pos >= 50;
  const points = veltixSide ? VELTIX_POINTS : TEMPLATE_POINTS;

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)] lg:items-center lg:gap-16">
      <div
        ref={boxRef}
        role="slider"
        tabIndex={0}
        aria-label="Compare a template website with a Veltix website"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        aria-valuetext={veltixSide ? "Showing mostly the Veltix version" : "Showing mostly the template version"}
        onPointerDown={(e) => {
          touched.current = true;
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          moveTo(e.clientX);
        }}
        onPointerMove={(e) => dragging.current && moveTo(e.clientX)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") setPos((p) => Math.max(3, p - 5));
          if (e.key === "ArrowRight") setPos((p) => Math.min(97, p + 5));
        }}
        // pan-y: vertical swipes still scroll the page; sideways drags move the slider.
        style={{ touchAction: "pan-y" }}
        className="interactive relative mx-auto aspect-[4/5] w-full max-w-[560px] cursor-ew-resize select-none overflow-hidden rounded-3xl border border-white/10 outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {/* Template page underneath */}
        <img src="/compare/template.webp" alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
        {TEMPLATE_POINTS.map((p, i) => (
          <Pin key={p.label} n={i + 1} x={p.x} y={p.y} tone="template" />
        ))}

        {/* Veltix page on top, cut off at the handle */}
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <img src="/compare/veltix.webp" alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
          {VELTIX_POINTS.map((p, i) => (
            <Pin key={p.label} n={i + 1} x={p.x} y={p.y} tone="veltix" />
          ))}
        </div>

        {/* Labels */}
        <span className="absolute bottom-3 left-3 rounded-full bg-black/70 px-3 py-1 font-sans text-xs text-[#85B7EB]">Veltix</span>
        <span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 font-sans text-xs text-white/80">Template</span>

        {/* Handle */}
        <div className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white" style={{ left: `${pos}%` }}>
          <span className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
            <ArrowLeftRight className="h-5 w-5" />
          </span>
        </div>
      </div>

      {/* Legend: switches to whichever side is showing more */}
      <div aria-live="polite">
        <p className="font-sans text-sm text-muted-foreground">
          {veltixSide ? "What makes the difference" : "What goes wrong"}
        </p>
        <ul className="mt-3">
          {points.map((p, i) => (
            <li key={p.label} className="flex items-center gap-4 border-t border-white/10 py-4 last:border-b">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-sans text-xs font-semibold ${
                  veltixSide ? "bg-primary text-white" : "bg-[#ffb020] text-[#1a1a1a]"
                }`}
              >
                {i + 1}
              </span>
              <span className="font-display text-lg font-medium tracking-[-0.01em] text-white md:text-2xl">{p.label}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-[40ch] font-sans text-base leading-relaxed text-muted-foreground">
          Both pages sell the same coffee. One was assembled from a template; one was
          designed for a single brand. That difference is what we build.
        </p>
        <button
          type="button"
          onClick={() => scrollToSection("#contact")}
          className="interactive group mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 font-sans text-[15px] font-medium text-white sm:w-fit sm:rounded-full"
        >
          Get the right side
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
        </button>
      </div>
    </div>
  );
}

export default function WhyVeltix() {
  const reduceMotion = useReducedMotion();
  const { ref: gridRef, inView: gridInView } = useScrollInView({ threshold: 0.2, triggerOnce: true });

  return (
    <section className="relative bg-background py-24 md:py-32">
      <div className="container mx-auto px-6 md:px-12">
        <p className="mb-4 font-sans text-sm text-muted-foreground">How we're different</p>
        {reduceMotion ? (
          <h2 className="font-display text-5xl font-medium leading-[1.02] tracking-[-0.03em] text-white md:text-7xl">
            Same page. Two builds.
          </h2>
        ) : (
          <ScrollReveal
            baseOpacity={0.1}
            baseRotation={3}
            blurStrength={4}
            rotationEnd="bottom 60%"
            wordAnimationEnd="bottom 60%"
            textClassName="font-display text-5xl font-medium leading-[1.02] tracking-[-0.03em] text-white md:text-7xl"
          >
            Same page. Two builds.
          </ScrollReveal>
        )}

        <motion.div
          ref={gridRef}
          initial={{ opacity: 0, y: 40 }}
          animate={gridInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mt-12 md:mt-20"
        >
          <CompareSlider inView={gridInView} />
        </motion.div>
      </div>
    </section>
  );
}
