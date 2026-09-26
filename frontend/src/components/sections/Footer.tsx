import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowUp, ArrowUpRight, Check, Copy } from "lucide-react";
import { scrollToSection } from "@/lib/smoothscroll";
import { AGENCY_EMAIL, AVAILABILITY } from "@/lib/site";

// Only links that go somewhere real. Add pages here when they exist.
const NAV = [
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "Process", href: "#process" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

// Social accounts: add { label, href } entries only for real profiles.
const SOCIALS: { label: string; href: string }[] = [
  // { label: "LinkedIn", href: "https://www.linkedin.com/company/your-page" },
  // { label: "Instagram", href: "https://www.instagram.com/your-handle" },
];
// Who builds Veltix. linkedin is optional: leave "" for plain text.
const FOUNDER = {
  name: "Soumya.",
  linkedin: "https://www.linkedin.com/in/soumyaranjan-behera007/", // e.g. "https://www.linkedin.com/in/your-profile"
};

const WORDMARK = "VELTIX";
const EASE = [0.76, 0, 0.24, 1] as const;

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
  return <>{time} IST</>;
}

// Copies the email address; falls back to opening the mail app.
function CopyEmail() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(AGENCY_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${AGENCY_EMAIL}`;
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="interactive group flex h-14 w-full items-center justify-between gap-3 rounded-2xl border border-white/15 px-5 font-sans text-[15px] text-white transition-colors hover:border-white/40 sm:w-auto sm:rounded-full"
    >
      <span className="truncate">{AGENCY_EMAIL}</span>
      <span className="flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground" aria-live="polite">
        {copied ? (
          <>
            <Check className="h-4 w-4 text-primary" /> Copied
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" /> Copy
          </>
        )}
      </span>
    </button>
  );
}

// One letter of the giant wordmark. It rises into place when the footer
// appears, and on desktop it lifts and turns blue as the cursor passes.
function Letter({
  char,
  i,
  mouseX,
  shown,
  reduceMotion,
}: {
  char: string;
  i: number;
  mouseX: MotionValue<number>;
  shown: boolean;
  reduceMotion: boolean | null;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const center = useRef(0);
  const width = useRef(1);

  useLayoutEffect(() => {
    const measure = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      center.current = r.left + r.width / 2;
      width.current = r.width;
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // 1 when the cursor is right over this letter, fading to 0 about
  // one and a half letters away. -1 means the cursor isn't over the wordmark.
  const near = useTransform(mouseX, (x) => {
    if (x < 0) return 0;
    const d = Math.abs(x - center.current) / (width.current * 1.5);
    return Math.max(0, 1 - d);
  });
  const lift = useSpring(useTransform(near, (n) => n * -0.12), { stiffness: 260, damping: 22 });
  const y = useTransform(lift, (v) => `${v * 100}%`);
  const color = useTransform(near, [0, 1], ["#ffffff", "#4F8CFF"]);

  return (
    // Mask > rise-in on appear > lift toward the cursor. Two separate layers,
    // because one element can't be driven by two animations on the same axis.
    <span className="inline-block overflow-hidden pb-[0.02em] align-bottom">
      <motion.span
        className="inline-block"
        initial={reduceMotion ? false : { y: "105%" }}
        animate={shown || reduceMotion ? { y: "0%" } : { y: "105%" }}
        transition={{ duration: 0.9, delay: i * 0.06, ease: EASE }}
      >
        <motion.span ref={ref} className="inline-block" style={reduceMotion ? undefined : { y, color }}>
          {char}
        </motion.span>
      </motion.span>
    </span>
  );
}

function Wordmark() {
  const reduceMotion = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const shown = useInView(wrapRef, { once: true, amount: 0.4 });
  const mouseX = useMotionValue(-1);

  return (
    <div
      ref={wrapRef}
      onPointerMove={(e) => e.pointerType === "mouse" && mouseX.set(e.clientX)}
      onPointerLeave={() => mouseX.set(-1)}
      aria-label="Veltix"
      role="img"
      className="interactive select-none text-center font-display text-[25vw] font-bold leading-[0.8] tracking-[-0.04em] text-white"
    >
      {/* Letters are split for the animation; the aria-label reads it once */}
      <span aria-hidden="true" className="flex justify-center">
        {WORDMARK.split("").map((c, i) => (
          <Letter key={i} char={c} i={i} mouseX={mouseX} shown={shown} reduceMotion={reduceMotion} />
        ))}
      </span>
    </div>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();
  const go = (href: string) => (e: MouseEvent) => {
    e.preventDefault();
    scrollToSection(href);
  };
  const backToTop = () => {
    const lenis = (window as unknown as { lenis?: { scrollTo: (t: number) => void } }).lenis;
    if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative z-10 overflow-hidden border-t border-white/5 bg-[#030303] pt-20 md:pt-28">
      <div className="container mx-auto px-5 md:px-12">
        {/* One last invitation */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="max-w-[14ch] font-display text-[44px] font-medium leading-[1] tracking-[-0.03em] text-white md:text-7xl">
            Got a project in mind?
          </h2>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <a
              href="#contact"
              onClick={go("#contact")}
              className="interactive group flex h-14 items-center justify-center gap-2 rounded-2xl bg-primary px-7 font-sans text-[15px] font-medium text-white sm:rounded-full"
            >
              Start a project
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
            </a>
            <CopyEmail />
          </div>
        </div>

        {/* Details */}
        <div className="mt-16 grid grid-cols-2 gap-10 border-t border-white/10 pt-10 md:mt-24 md:grid-cols-3">
          <nav aria-label="Footer">
            <p className="mb-4 font-sans text-sm text-muted-foreground">Navigate</p>
            <ul className="space-y-2.5">
              {NAV.map((n) => (
                <li key={n.href}>
                  <a
                    href={n.href}
                    onClick={go(n.href)}
                    className="interactive font-sans text-[15px] text-white/85 transition-colors hover:text-white"
                  >
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="mb-4 font-sans text-sm text-muted-foreground">Studio</p>
            <ul className="space-y-2.5 font-sans text-[15px] text-white/85">
              <li className="flex items-center gap-2">
                <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-primary" />
                {AVAILABILITY}
              </li>
              <li>
                <IndiaTime />
              </li>
                            <li>Replies within 24 hours</li>
              <li className="text-muted-foreground">
                Founded by{" "}
                {FOUNDER.linkedin ? (
                    <a                  
                    href={FOUNDER.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="interactive text-white/85 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white hover:decoration-white/60"
                  >
                    {FOUNDER.name}
                  </a>
                ) : (
                  <span className="text-white/85">{FOUNDER.name}</span>
                )}
              </li>
            </ul>
          </div>

          {SOCIALS.length > 0 && (
            <div>
              <p className="mb-4 font-sans text-sm text-muted-foreground">Elsewhere</p>
              <ul className="space-y-2.5">
                {SOCIALS.map((s) => (
                  <li key={s.href}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="interactive font-sans text-[15px] text-white/85 hover:text-white"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Giant wordmark, edge to edge */}
      <div className="mt-16 px-2 md:mt-20">
        <Wordmark />
      </div>

      {/* Bottom bar */}
      <div className="container mx-auto flex items-center justify-between gap-4 px-5 pb-8 pt-6 font-sans text-sm text-muted-foreground md:px-12">
               <span>
          © {year} Veltix · Built by {FOUNDER.name}
        </span>
                <button
          type="button"
          onClick={backToTop}
          className="interactive flex h-11 shrink-0 items-center gap-2 whitespace-nowrap text-white/85 transition-colors hover:text-white"
        >
          Back to top <ArrowUp className="h-4 w-4" />
        </button>
      </div>
    </footer>
  );
}
