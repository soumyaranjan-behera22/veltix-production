import { useEffect, useState, type MouseEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Check, Copy } from "lucide-react";
import PillNav from "@/components/PillNav";
import { HERO_START } from "@/components/Preloader";
import { scrollToSection } from "@/lib/smoothscroll";
import { AGENCY_EMAIL, AVAILABILITY } from "@/lib/site";

// In page order, so the "you are here" marker moves forward as you scroll.
const LINKS = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Process", href: "#process" },
  { label: "Work", href: "#work" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
];

const BLUE = "#4F8CFF";
const INK = "#0e1016"; // dark pill colour
const EASE = [0.76, 0, 0.24, 1] as const;

// Which section is under the top third of the screen. "" means the hero.
function useActiveSection() {
  const [active, setActive] = useState("");
  useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      const line = window.innerHeight * 0.35;
      let current = "";
      for (const l of LINKS) {
        const el = document.querySelector(l.href);
        if (el && el.getBoundingClientRect().top <= line) current = l.href;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);
  return active;
}

function useIndiaTime() {
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
  return time;
}

// The same "circle rises from the bottom" fill as the pills, in plain CSS,
// for buttons that sit outside PillNav. `on` forces it (used for taps).
function RiseFill({ color, on = false }: { color: string; on?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute bottom-0 left-1/2 aspect-square w-[135%] -translate-x-1/2 translate-y-1/2 rounded-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        on ? "scale-100" : "scale-0 group-hover:scale-100"
      }`}
      style={{ background: color }}
    />
  );
}

// Phone menu button: a 3x3 grid of dots. When the menu opens, the four
// middle-edge dots vanish and the rest turn, leaving an X made of dots.
function DotsButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-controls="mobile-menu"
      aria-label={open ? "Close menu" : "Open menu"}
      className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors duration-500 active:scale-95"
      style={{ background: open ? BLUE : "#ffffff" }}
    >
      <span
        className="grid grid-cols-3 gap-[3px] transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)]"
        style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
      >
        {Array.from({ length: 9 }).map((_, i) => {
          const isEdge = i % 2 === 1; // 1, 3, 5, 7: the middle of each side
          return (
            <span
              key={i}
              className="block h-[5px] w-[5px] rounded-full transition-all duration-500"
              style={{
                background: open ? "#ffffff" : INK,
                transform: open && isEdge ? "scale(0)" : "scale(1)",
                transitionDelay: `${(open ? i : 8 - i) * 25}ms`,
              }}
            />
          );
        })}
      </span>
    </button>
  );
}

export default function NavbarPill() {
  const reduceMotion = useReducedMotion();
  const active = useActiveSection();
  const time = useIndiaTime();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [tapped, setTapped] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // While the phone menu is open: freeze the page and let Escape close it.
  useEffect(() => {
    if (!open) return;
    const lenis = (window as unknown as { lenis?: { stop: () => void; start: () => void } }).lenis;
    lenis?.stop();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Close the phone menu if the screen grows to desktop size.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toTop = (e: MouseEvent) => {
    e.preventDefault();
    const lenis = (window as unknown as { lenis?: { scrollTo: (t: number) => void } }).lenis;
    if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const go = (href: string) => (e: MouseEvent) => {
    e.preventDefault();
    scrollToSection(href);
  };

  // Phone: play the rising fill on the tapped pill, close, then scroll.
  const goFromMenu = (href: string) => (e: MouseEvent) => {
    e.preventDefault();
    setTapped(href);
    setTimeout(() => setOpen(false), 280);
    setTimeout(() => {
      setTapped(null);
      scrollToSection(href);
    }, 620);
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(AGENCY_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${AGENCY_EMAIL}`;
    }
  };

  const activeIndex = LINKS.findIndex((l) => l.href === active);
  const chip = scrolled && activeIndex >= 0 ? `0${activeIndex + 1}  ${LINKS[activeIndex].label}` : "VELTIX.";

  return (
    <>
      {/* ------------------------------------------------------------------
          DESKTOP: wordmark, React Bits pill nav in the middle, CTA pill
         ------------------------------------------------------------------ */}
      <motion.header
        initial={reduceMotion ? false : { opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: reduceMotion ? 0 : HERO_START - 0.2, ease: EASE }}
        className="pointer-events-none fixed inset-x-0 top-0 z-[100] hidden lg:block"
      >
        <div className="container mx-auto grid h-24 grid-cols-[1fr_auto_1fr] items-center px-12">
          {/* Wordmark: shown at the top, fades once the page moves
              (the logo circle in the pill nav stays) */}
          <motion.a
            href="#top"
            onClick={toTop}
            animate={{ opacity: scrolled ? 0 : 1, x: scrolled ? -12 : 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className={`interactive justify-self-start font-display text-xl font-bold tracking-[0.12em] text-white ${
              scrolled ? "" : "pointer-events-auto"
            }`}
          >
            VELTIX<span className="text-primary">.</span>
          </motion.a>

          <div className="pointer-events-auto">
            <PillNav
              logo="/veltix-main-logo.png"
              logoAlt=""
              items={LINKS}
              activeHref={active}
              baseColor={BLUE}
              pillColor={INK}
              pillTextColor="#ffffff"
              hoveredPillTextColor="#ffffff"
              initialLoadAnimation={!reduceMotion}
              initialDelay={HERO_START - 0.2}
              onItemClick={(href, e) => go(href)(e)}
              onLogoClick={toTop}
            />
          </div>

          <a
            href="#contact"
            onClick={go("#contact")}
            className="interactive group pointer-events-auto relative flex h-[46px] items-center gap-2 justify-self-end overflow-hidden rounded-full bg-white pl-5 pr-4 font-sans text-sm font-medium text-[#0e1016] transition-colors duration-300 hover:text-white"
          >
            <RiseFill color={BLUE} />
            <span className="relative">Start a project</span>
            <ArrowUpRight className="relative h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
          </a>
        </div>
      </motion.header>

      {/* ------------------------------------------------------------------
          PHONE: logo circle + a chip showing where you are + dots button
         ------------------------------------------------------------------ */}
      <motion.header
        initial={reduceMotion ? false : { y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: reduceMotion ? 0 : HERO_START - 0.2, ease: EASE }}
        className="fixed inset-x-3 top-3 z-[110] flex items-center justify-between lg:hidden"
      >
        <a href="#top" onClick={toTop} aria-label="Veltix, back to top" className="flex items-center gap-2">
          <span className="flex h-12 w-12 items-center justify-center rounded-full p-2.5" style={{ background: BLUE }}>
            <img src="/veltix-main-logo.png" alt="" className="h-full w-full object-contain" />
          </span>
          {/* The chip reads "VELTIX." at the top, then the current section */}
          <span
            className={`flex h-12 items-center overflow-hidden rounded-full px-4 transition-colors duration-500 ${
              scrolled || open ? "border border-white/10 bg-[#0e1016]/90 backdrop-blur-md" : "border border-transparent"
            }`}
          >
            <span className="relative h-5 overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={chip}
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  exit={{ y: "-110%" }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className={`block whitespace-pre leading-5 ${
                    chip === "VELTIX."
                      ? "font-display text-[17px] font-bold tracking-[0.12em] text-white"
                      : "font-sans text-[13px] text-white/75"
                  }`}
                >
                  {chip === "VELTIX." ? (
                    <>
                      VELTIX<span className="text-primary">.</span>
                    </>
                  ) : (
                    chip
                  )}
                </motion.span>
              </AnimatePresence>
            </span>
          </span>
        </a>

        <DotsButton open={open} onClick={() => setOpen((o) => !o)} />
      </motion.header>

      {/* ------------------------------------------------------------------
          PHONE MENU: a blue frame that unrolls downward, holding dark pills,
          the same build as the desktop pill nav
         ------------------------------------------------------------------ */}
      <AnimatePresence>
        {open && (
          <>
            {/* Dimmed page behind; tap it to close */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[104] bg-black/60 backdrop-blur-sm lg:hidden"
            />

            <motion.div
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              initial={reduceMotion ? { opacity: 0 } : { clipPath: "inset(0% 0% 100% 0% round 28px)" }}
              animate={reduceMotion ? { opacity: 1 } : { clipPath: "inset(0% 0% 0% 0% round 28px)" }}
              exit={reduceMotion ? { opacity: 0 } : { clipPath: "inset(0% 0% 100% 0% round 28px)" }}
              transition={{ duration: 0.65, ease: EASE }}
              className="fixed inset-x-3 top-[72px] z-[105] max-h-[calc(100svh-84px)] overflow-y-auto rounded-[28px] p-1 lg:hidden"
              style={{ background: BLUE }}
            >
              {/* Status line on the blue frame */}
              <div className="flex items-center justify-between px-4 pb-2.5 pt-2 font-sans text-[12px] font-medium text-white">
                <span className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                  </span>
                  {AVAILABILITY}
                </span>
                <span className="opacity-80">IST {time}</span>
              </div>

              <ul className="flex flex-col gap-1">
                {LINKS.map((l, i) => {
                  const isActive = active === l.href;
                  const isTapped = tapped === l.href;
                  return (
                    <motion.li
                      key={l.href}
                      initial={reduceMotion ? false : { opacity: 0, y: -14, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.12 + i * 0.045, ease: EASE }}
                    >
                      <a
                        href={l.href}
                        onClick={goFromMenu(l.href)}
                        aria-current={isActive ? "true" : undefined}
                        className="group relative flex h-[58px] items-center justify-between overflow-hidden rounded-full pl-5 pr-2"
                        style={{ background: INK }}
                      >
                        <RiseFill color={BLUE} on={isTapped} />
                        <span className="relative flex items-baseline gap-3">
                          <span className="w-5 font-mono text-[11px] text-white/40">0{i + 1}</span>
                          <span className="font-display text-[24px] font-medium tracking-[-0.02em] text-white">
                            {l.label}
                          </span>
                        </span>
                        <span
                          className={`relative flex h-[42px] w-[42px] items-center justify-center rounded-full transition-colors duration-300 ${
                            isActive ? "bg-white text-[#0e1016]" : "bg-white/[0.07] text-white"
                          }`}
                        >
                          {isActive ? (
                            <span className="h-2 w-2 rounded-full" style={{ background: BLUE }} />
                          ) : (
                            <ArrowUpRight className="h-4 w-4" />
                          )}
                        </span>
                        {isActive && (
                          <span className="absolute right-[60px] top-1/2 -translate-y-1/2 font-sans text-[11px] text-white/45">
                            You're here
                          </span>
                        )}
                      </a>
                    </motion.li>
                  );
                })}
              </ul>

              {/* Email + start a project */}
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.42, ease: EASE }}
                className="mt-1 grid grid-cols-[1fr_auto] gap-1"
              >
                <button
                  type="button"
                  onClick={copyEmail}
                  className="flex h-[58px] min-w-0 items-center gap-2 rounded-full px-5 font-sans text-[14px] text-white"
                  style={{ background: INK }}
                  aria-live="polite"
                >
                  {copied ? <Check className="h-4 w-4 shrink-0 text-primary" /> : <Copy className="h-4 w-4 shrink-0 text-white/50" />}
                  <span className="truncate">{copied ? "Email copied" : AGENCY_EMAIL}</span>
                </button>
                <a
                  href="#contact"
                  onClick={goFromMenu("#contact")}
                  className="flex h-[58px] items-center gap-1.5 rounded-full bg-white px-5 font-sans text-[14px] font-semibold text-[#0e1016] active:scale-[0.97]"
                >
                  Start
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
