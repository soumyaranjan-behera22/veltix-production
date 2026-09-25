import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Threads from "@/components/Threads";
import { scrollToSection } from "@/lib/smoothscroll";

// One easing curve for the whole hero, the same one the old loader used.
const EASE = [0.76, 0, 0.24, 1] as const;

// Brand blue #4F8CFF written as 0-1 RGB, which is the format Threads expects.
const THREADS_COLOR: [number, number, number] = [0.31, 0.55, 1];

const LINES = [
  { text: "We build", className: "" },
  { text: "websites", className: "ml-[13vw] lg:ml-[22%]" },
  { text: "that win.", className: "text-[#6b6b6b]" },
];

const MagnetButton = ({ children, className, ...props }: any) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    setPos({
      x: (e.clientX - (left + width / 2)) * 0.3,
      y: (e.clientY - (top + height / 2)) * 0.3,
    });
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      onMouseMove={handleMouse}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      animate={{ x: pos.x, y: pos.y }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default function Hero() {
  const reduceMotion = useReducedMotion();
  const [showLoader, setShowLoader] = useState(!reduceMotion);
  const [finePointer, setFinePointer] = useState(false);

  // Selection frame state
  const headRef = useRef<HTMLHeadingElement>(null);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const lastPointer = useRef("mouse");
  const [active, setActive] = useState(1);
  const [box, setBox] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [showFrame, setShowFrame] = useState(false);

  // When the headline starts revealing (seconds after page load)
  const T0 = reduceMotion ? 0 : 1.0;

  useEffect(() => {
    setFinePointer(window.matchMedia("(pointer: fine)").matches);
    const loaderTimer = setTimeout(() => setShowLoader(false), 1500);
    const frameTimer = setTimeout(
      () => setShowFrame(true),
      (T0 + 0.9) * 1000,
    );
    return () => {
      clearTimeout(loaderTimer);
      clearTimeout(frameTimer);
    };
  }, [T0]);

  // Measure the active line so the frame hugs its real rendered size.
  useLayoutEffect(() => {
    const measure = () => {
      const head = headRef.current;
      const line = lineRefs.current[active];
      if (!head || !line) return;
      const h = head.getBoundingClientRect();
      const r = line.getBoundingClientRect();
      setBox({ x: r.left - h.left, y: r.top - h.top, w: r.width, h: r.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (headRef.current) ro.observe(headRef.current);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [active]);

  return (
    <section className="relative isolate min-h-[100svh] w-full overflow-hidden bg-background">
      {/* Background: Threads (skipped entirely for reduced-motion users) */}
      {!reduceMotion && (
        <div className="absolute inset-0 z-0 opacity-70">
          <Threads
            color={THREADS_COLOR}
            amplitude={1}
            distance={0}
            enableMouseInteraction={finePointer}
          />
        </div>
      )}
      {/* Soft fade so the threads don't cut off hard at the section edge */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-40 bg-gradient-to-b from-transparent to-background" />

      {/* Loader: 1.2s, then slides away */}
      {showLoader && (
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: "-100%" }}
          transition={{ duration: 0.6, delay: 0.8, ease: EASE }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background"
        >
          <div className="flex gap-2">
            {"VELTIX".split("").map((letter, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: "easeOut" }}
                className="font-display text-6xl font-bold tracking-widest text-white md:text-8xl"
              >
                {letter}
              </motion.span>
            ))}
          </div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 200 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 h-0.5 bg-primary"
          />
        </motion.div>
      )}

      {/* Content layer. pointer-events-none lets the mouse reach Threads
          underneath; interactive children switch pointer events back on. */}
      <div className="pointer-events-none relative z-10 container mx-auto flex min-h-[100svh] w-full flex-col px-7 pb-10 pt-[150px] sm:px-8 md:px-12 lg:pb-16 lg:pt-40">
        {/* STEP 4: meta row goes here */}

        <h1
          ref={headRef}
          onPointerDown={(e) => (lastPointer.current = e.pointerType)}
          onClick={() => {
            if (lastPointer.current !== "mouse") {
              setActive((a) => (a + 1) % LINES.length);
            }
          }}
          className="relative m-0 font-display text-[clamp(48px,15.4vw,60px)] font-medium leading-[0.95] tracking-[-0.04em] text-white lg:text-[clamp(96px,10vw,176px)]"
        >
          {LINES.map((line, i) => (
            <span key={line.text} className={`block ${line.className}`}>
              <span
                ref={(el) => {
                  lineRefs.current[i] = el;
                }}
                onPointerEnter={(e) => {
                  if (e.pointerType === "mouse") setActive(i);
                }}
                className="interactive pointer-events-auto relative inline-block overflow-hidden pb-[0.06em] align-top"
              >
                <motion.span
                  className="inline-block"
                  initial={{ y: reduceMotion ? "0%" : "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.8, delay: T0 + i * 0.12, ease: EASE }}
                >
                  {line.text}
                </motion.span>
              </span>
            </span>
          ))}

          {/* The selection frame */}
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 block border-2 border-primary"
            initial={false}
            animate={{
              x: box.x - 8,
              y: box.y - 4,
              width: box.w + 16,
              height: box.h + 8,
              opacity: showFrame ? 1 : 0,
            }}
            transition={{ duration: reduceMotion ? 0 : 0.45, ease: EASE }}
          >
            <span className="absolute -left-[5px] -top-[5px] h-[9px] w-[9px] border-2 border-primary bg-background" />
            <span className="absolute -right-[5px] -top-[5px] h-[9px] w-[9px] border-2 border-primary bg-background" />
            <span className="absolute -bottom-[5px] -left-[5px] h-[9px] w-[9px] border-2 border-primary bg-background" />
            <span className="absolute -bottom-[5px] -right-[5px] h-[9px] w-[9px] border-2 border-primary bg-background" />
            <span className="absolute -bottom-7 right-0 whitespace-nowrap rounded bg-primary px-1.5 py-0.5 font-sans text-xs font-medium leading-none tracking-normal text-white lg:left-0 lg:right-auto">
              W {Math.round(box.w)}
            </span>
          </motion.span>
        </h1>

        {/* STEP 5: showreel window goes here */}

        <div className="mt-12 flex flex-col gap-8 lg:mt-auto lg:flex-row-reverse lg:items-end lg:justify-between">
          <motion.p
            initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: T0 + 0.45 }}
            className="max-w-[34ch] font-sans text-base leading-[1.5] text-muted-foreground lg:text-lg"
          >
            We design and build fast, conversion-focused websites for startups
            and creators.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: T0 + 0.55 }}
            className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-8"
          >
            <MagnetButton
              onClick={() => scrollToSection("#contact")}
              className="interactive group pointer-events-auto flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-8 font-sans text-base font-medium text-white transition-shadow lg:w-auto lg:rounded-full lg:hover:shadow-[0_0_30px_rgba(79,140,255,0.4)]"
            >
              Start a project
              <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:rotate-45" />
            </MagnetButton>

            <button
              type="button"
              onClick={() => scrollToSection("#work")}
              className="interactive pointer-events-auto flex h-12 items-center justify-center font-sans text-[15px] text-white lg:justify-start"
            >
              <span className="border-b border-white/30 pb-0.5 transition-colors hover:border-white">
                See our work
              </span>
            </button>
          </motion.div>
        </div>

        {/* STEP 4: services ticker goes here */}
      </div>
    </section>
  );
}
