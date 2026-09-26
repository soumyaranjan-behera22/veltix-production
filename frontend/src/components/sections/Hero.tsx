import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
   motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Threads from "@/components/Threads";
import { HERO_START } from "@/components/Preloader";
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

// STEP 5: the showreel. When your video is ready, put the MP4 in
// frontend/public/ and set video to "/your-file.mp4". Until then the
// poster image is shown instead.
const REEL = {
  video: "",
       poster: "/hero-visual.webp",
     caption: "Code, design, live: how every Veltix site is built",
};

// Plays the video if one is set, otherwise shows the poster image.
function ReelMedia({ className = "" }: { className?: string }) {
  if (REEL.video) {
    return (
      <video
        src={REEL.video}
        poster={REEL.poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }
  return (
    <img
      src={REEL.poster}
      alt=""
      className={`h-full w-full object-cover object-top ${className}`}
    />
  );
}

// Keep this true. Update it whenever your availability changes.
const AVAILABILITY = "Booking November projects";

// Same services as your Services section, so the ticker never promises
// something the rest of the site doesn't back up.
const SERVICES = [
  "Web Design",
  "Web Development",
  "Landing Pages",
  "E-Commerce",
  "SEO Optimization",
  "Brand Identity",
  "Website Redesign",
  "AI Integrations",
];

// Live India time, updated every 30 seconds.
function IndiaTime() {
  const format = () =>
    new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date());
  const [time, setTime] = useState(format);
  useEffect(() => {
    const id = setInterval(() => setTime(format()), 30000);
    return () => clearInterval(id);
  }, []);
  return <span>IST {time}</span>;
}

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
  // Threads (WebGL) starts once the preloader has gone, so the two
  // don't fight for the processor during the intro.
  const [showThreads, setShowThreads] = useState(false);
  const [finePointer, setFinePointer] = useState(false);

  // Selection frame state
  const headRef = useRef<HTMLHeadingElement>(null);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const lastPointer = useRef("mouse");
  const [active, setActive] = useState(1);
  const [box, setBox] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [showFrame, setShowFrame] = useState(false);

  // Scroll moment
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLButtonElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [pill, setPill] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [stage, setStage] = useState({ w: 1, h: 1 });
  const [cardGrow, setCardGrow] = useState(1);

  // 0 when the hero top is at the top of the screen,
  // 1 when the hero bottom has scrolled past the top.
  const { scrollYProgress: p } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Desktop: the section is 220svh tall and the stage is sticky,
  // so the pill has 0 to 0.45 of progress to grow to full screen.
  const grow = useTransform(p, [0.02, 0.4], [0, 1], { clamp: true });
  // Reveal with clip-path and scale with transform: no layout work while scrolling.
  const s0 = stage.w ? pill.w / stage.w : 1;
  const expClip = useTransform(grow, (g) => {
    const k = 1 - g;
    const top = pill.y * k;
    const right = (stage.w - pill.x - pill.w) * k;
    const bottom = (stage.h - pill.y - pill.h) * k;
    const left = pill.x * k;
    return `inset(${top}px ${right}px ${bottom}px ${left}px round ${(pill.h / 2) * k}px)`;
  });
  const mediaScale = useTransform(grow, (g) => s0 + (1 - s0) * g);
  const mediaX = useTransform(grow, (g) => pill.x * (1 - g));
  const mediaY = useTransform(grow, (g) => (pill.y - (stage.h * s0 - pill.h) / 2) * (1 - g));

  // Stop drawing the Threads background once the reel covers the screen.
  const [threadsPaused, setThreadsPaused] = useState(false);
  useMotionValueEvent(grow, "change", (g) => setThreadsPaused(g > 0.98));
  // Opacity values are written as functions on purpose: Framer Motion
  // hands simple opacity ranges to the browser's native scroll timeline,
  // which doesn't account for the sticky stage and fires at the wrong time.
  const expShow = useTransform(p, (v) => Math.min(v / 0.02, 1));
  const expCaption = useTransform(grow, (g) => Math.max((g - 0.8) / 0.2, 0));
  const expPointer = useTransform(grow, (g) => (g > 0.8 ? "auto" : "none"));

  // Headline lifts away. Ranges differ because the phone hero is not pinned.
  const headOpacity = useTransform(p, (v) =>
    isDesktop
      ? Math.max(1 - v / 0.25, 0)
      : Math.max(1 - (v / 0.35) * 0.85, 0.15),
  );
  const headY = useTransform(p, [0, 0.4], [0, isDesktop ? -80 : 0]);

  // Phone: the card grows until it runs edge to edge.
  const cardScale = useTransform(p, [0, 0.35], [1, cardGrow], { clamp: true });
  const cardRadius = useTransform(p, [0, 0.35], [20, 0], { clamp: true });

  // When the headline starts revealing (seconds after page load)
    const T0 = reduceMotion ? 0 : HERO_START;

  useEffect(() => {
    setFinePointer(window.matchMedia("(pointer: fine)").matches);
    const threadsTimer = setTimeout(() => setShowThreads(true), (T0 ? T0 + 0.9 : 0) * 1000);
    const frameTimer = setTimeout(
      () => setShowFrame(true),
      (T0 + 0.9) * 1000,
    );
    return () => {
      clearTimeout(threadsTimer);
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

  // Measure where the pill and card sit, so the scroll moment starts
  // exactly from them. Re-measured after the reveal and on every resize.
  useEffect(() => {
    const measure = () => {
      const desktop = window.matchMedia("(min-width: 1024px)").matches;
      setIsDesktop(desktop);
      const st = stageRef.current;
      if (!st) return;
      const s = st.getBoundingClientRect();
      setStage({ w: s.width, h: s.height });
      if (pillRef.current) {
        const r = pillRef.current.getBoundingClientRect();
        setPill({ x: r.left - s.left, y: r.top - s.top, w: r.width, h: r.height });
      }
      if (cardRef.current) {
        setCardGrow(window.innerWidth / cardRef.current.offsetWidth);
      }
    };
    const t = setTimeout(measure, (T0 + 1) * 1000);
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measure);
    };
  }, [T0]);

  return (
    <section
      ref={sectionRef}
      className={`relative isolate w-full bg-background ${reduceMotion ? "" : "lg:h-[220svh]"}`}
    >
      <div
        ref={stageRef}
        className="relative min-h-[100svh] w-full overflow-hidden lg:sticky lg:top-0 lg:h-[100svh]"
      >
      {/* Background: Threads (skipped entirely for reduced-motion users) */}
      {!reduceMotion && showThreads && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 z-0"
        >
          <Threads
            color={THREADS_COLOR}
            amplitude={1}
            distance={0}
            enableMouseInteraction={finePointer}
            paused={threadsPaused}
          />
        </motion.div>
      )}
      {/* Soft fade so the threads don't cut off hard at the section edge */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-40 bg-gradient-to-b from-transparent to-background" />

            {/* Content layer. pointer-events-none lets the mouse reach Threads
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
      <div className="pointer-events-none relative z-10 container mx-auto flex min-h-[100svh] w-full flex-col px-7 pb-[84px] pt-[92px] sm:px-8 md:px-12 lg:pb-[104px] lg:pt-28">
        <motion.div style={{ opacity: headOpacity, y: headY }}>
        {/* Meta row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: T0 + 0.3 }}
          className="mb-4 flex items-center justify-between border-t border-white/10 pt-3 font-sans text-xs text-muted-foreground lg:mb-10 lg:text-[13px]"
        >
          <span className="hidden lg:inline">Design and development studio</span>
          <span className="flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5">
            <span className="h-[7px] w-[7px] rounded-full bg-primary" />
            {AVAILABILITY}
          </span>
          <IndiaTime />
        </motion.div>


        <h1
          ref={headRef}
          onPointerDown={(e) => (lastPointer.current = e.pointerType)}
          onClick={() => {
            if (lastPointer.current !== "mouse") {
              setActive((a) => (a + 1) % LINES.length);
            }
          }}
          className="relative m-0 font-display text-[clamp(48px,15.4vw,60px)] font-medium leading-[0.95] tracking-[-0.04em] text-white lg:text-[clamp(80px,min(10vw,16svh),176px)]"
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
                  {i === 0 && (
                    <span
                      ref={pillRef}
                      onClick={() => scrollToSection("#work")}
                      className="interactive ml-[0.22em] hidden h-[0.72em] w-[1.9em] overflow-hidden rounded-full bg-[#15213a] align-[-0.02em] lg:inline-block"
                    >
                      <ReelMedia />
                    </span>
                  )}
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
        </motion.div>

        {/* Phone showreel card */}
        <motion.button
          ref={cardRef}
          type="button"
          onClick={() => scrollToSection("#work")}
          initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: T0 + 0.4 }}
          style={reduceMotion ? { borderRadius: 20 } : { scale: cardScale, borderRadius: cardRadius }}
          className="interactive pointer-events-auto relative mt-8 block aspect-video w-full overflow-hidden border border-white/10 bg-[#15213a] text-left [@media(max-height:700px)]:aspect-[21/9] lg:hidden"
        >
          <ReelMedia />
          <span className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/75 to-transparent px-3.5 pb-3 pt-10 font-sans">
            <span className="text-xs text-white/90">{REEL.caption}</span>
            <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-black/70">
              <ArrowUpRight className="h-4 w-4 text-white" />
            </span>
          </span>
        </motion.button>

        <div className="mt-6 flex flex-col gap-6 lg:mt-auto lg:flex-row-reverse lg:items-end lg:justify-between">
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
      </div>

      {/* Services ticker, pinned to the bottom edge. It reuses the
          animate-marquee-left keyframes already in your index.css. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: T0 + 0.7 }}
        className="absolute inset-x-0 bottom-0 z-10 flex h-[52px] items-center overflow-hidden border-t border-white/10 lg:h-16"
      >
        <div className="flex w-max animate-marquee-left motion-reduce:animate-none">
          {[0, 1].map((copy) => (
            <span
              key={copy}
              aria-hidden={copy === 1}
              className="flex shrink-0 items-center whitespace-nowrap font-sans text-[13px] text-muted-foreground lg:text-sm"
            >
              {SERVICES.map((service) => (
                <span key={service} className="flex items-center">
                  <span className="px-5 lg:px-8">{service}</span>
                  <span className="text-white/20">/</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Desktop scroll moment: grows from the pill to full screen */}
      {!reduceMotion && isDesktop && pill.w > 0 && (
        <motion.div
                    style={{
            clipPath: expClip,
            opacity: expShow,
            pointerEvents: expPointer,
          }}
          className="absolute inset-0 z-20 overflow-hidden bg-[#15213a] will-change-[clip-path]"
        >
          <motion.div
            style={{ x: mediaX, y: mediaY, scale: mediaScale }}
            className="absolute inset-0 origin-top-left will-change-transform"
          >
            <ReelMedia />
          </motion.div>
          <motion.div
            style={{ opacity: expCaption }}
            className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/70 to-transparent px-12 pb-10 pt-24 font-sans"
          >
            <span className="text-base text-white/90">{REEL.caption}</span>
            <button
              type="button"
              onClick={() => scrollToSection("#work")}
              className="interactive flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-black"
            >
              View case <ArrowUpRight className="h-4 w-4" />
            </button>
          </motion.div>
        </motion.div>
      )}
      </div>
    </section>
  );
}
