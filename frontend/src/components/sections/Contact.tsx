import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SectionHeading from "@/components/SectionHeading";
import { AGENCY_EMAIL, AVAILABILITY, PLAN_EVENT } from "@/lib/site";

// Backend base URL — set VITE_API_URL in production.
// Defaults to localhost:8080 so `npm run dev` works with no config.
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

// ---------------------------------------------------------------------------
// Data sent to the backend — same five fields and values as before
// ---------------------------------------------------------------------------
interface FormData {
  name: string;
  email: string;
  project: string;
  budget: string;
  message: string;
}
const EMPTY_FORM: FormData = { name: "", email: "", project: "", budget: "", message: "" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// `value` is what the backend receives (unchanged); `label` is what people see.
const PROJECT_TYPES = [
  { value: "Landing Page", label: "Landing page", image: "/services/landing-pages.webp" },
  { value: "Web Design", label: "Web design", image: "/services/web-design.webp" },
  { value: "Web Development", label: "Web development", image: "/services/web-development.webp" },
  { value: "E-Commerce", label: "Online store", image: "/services/e-commerce.webp" },
  { value: "Other", label: "Something else", image: "" },
];
const BUDGET_OPTIONS = [
  { value: "₹10,000 – ₹25,000", label: "₹10k–25k" },
  { value: "₹25,000 – ₹50,000", label: "₹25k–50k" },
  { value: "₹50,000 – ₹1,00,000", label: "₹50k–1L" },
  { value: "₹1,00,000 – ₹2,50,000", label: "₹1L–2.5L" },
  { value: "₹2,50,000+", label: "₹2.5L+" },
  { value: "Not Sure Yet", label: "Not sure yet" },
];

const EASE = [0.76, 0, 0.24, 1] as const;
const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? "";
const shorten = (s: string, n = 28) => (s.length > n ? `${s.slice(0, n)}…` : s);
const labelFor = (list: { value: string; label: string }[], v: string) =>
  list.find((o) => o.value === v)?.label ?? v;

type Step = 0 | 1 | 2 | 3 | 4 | 5;

// ---------------------------------------------------------------------------
// Small pieces
// ---------------------------------------------------------------------------

// Types a value in letter by letter whenever it changes.
function Typed({ text }: { text: string }) {
  const reduceMotion = useReducedMotion();
  const [shown, setShown] = useState(text);
  useEffect(() => {
    if (reduceMotion) return setShown(text);
    let i = 0;
    setShown("");
    const t = setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(t);
    }, 22);
    return () => clearInterval(t);
  }, [text, reduceMotion]);
  return <>{shown}</>;
}

function BriefRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-dashed border-black/20 py-0.5">
      <span className="text-[#7a7266]">{label}</span>
      <span className={`text-right ${value ? "" : "text-[#bdb4a4]"}`}>{value ? <Typed text={value} /> : "—"}</span>
    </div>
  );
}

function Envelope({ play }: { play: boolean }) {
  return (
    <motion.svg
      viewBox="0 0 200 120"
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-1 top-16 h-32 w-[calc(100%-8px)]"
      initial={false}
      animate={
        play
          ? { opacity: 1, x: [0, 0, 180], y: [0, 0, -220], rotate: [0, 0, -18], scale: [1, 1, 0.4] }
          : { opacity: 0, x: 0, y: 0, rotate: 0, scale: 1 }
      }
      transition={play ? { duration: 1.6, times: [0, 0.55, 1], ease: EASE, delay: 0.45 } : { duration: 0 }}
    >
      <rect x="2" y="2" width="196" height="116" rx="8" fill="#e9e3d6" />
      <path d="M2 10 L100 66 L198 10" fill="none" stroke="#b9ae98" strokeWidth="3" />
      <motion.g
        initial={false}
        animate={{ scale: play ? 1 : 0 }}
        transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1], delay: play ? 0.85 : 0 }}
        style={{ transformOrigin: "100px 66px" }}
      >
        <circle cx="100" cy="66" r="15" fill="#4F8CFF" />
        <text x="100" y="71" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="700" fontFamily="Space Grotesk, sans-serif">V</text>
      </motion.g>
    </motion.svg>
  );
}

const chip =
  "interactive rounded-full border border-white/15 px-4 py-2.5 font-sans text-sm text-white/90 transition-colors hover:border-primary";
const field =
  "w-full border-0 border-b-2 border-white/15 bg-transparent py-2 font-display text-2xl text-white outline-none placeholder:text-white/20 focus:border-primary md:text-[26px]";
const nextBtn =
  "interactive flex h-12 items-center gap-2 rounded-full bg-white px-6 font-sans text-sm font-medium text-black";

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function Contact() {
  const { toast } = useToast();
  const reduceMotion = useReducedMotion();

  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [step, setStep] = useState<Step>(0);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [customBudget, setCustomBudget] = useState(false);
  const [plan, setPlan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  // Pricing buttons tell us which plan the visitor picked.
  useEffect(() => {
    const onPlan = (e: Event) => setPlan((e as CustomEvent<string>).detail);
    window.addEventListener(PLAN_EVENT, onPlan);
    return () => window.removeEventListener(PLAN_EVENT, onPlan);
  }, []);

  // Pre-fill the text field when going back to a step.
  useEffect(() => {
    setError("");
    setCustomBudget(false);
    const keys: (keyof FormData | null)[] = ["name", null, null, "email", "message", null];
    const k = keys[step];
    setDraft(k ? form[k] : "");
    // Focus only after the visitor has started, so the page doesn't jump on load.
    if (step > 0) setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 350);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const save = (key: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setStep((s) => (s + 1) as Step);
  };

  // Each step checks its own answer, with a friendly message.
  const submitText = () => {
    const v = draft.trim();
    if (step === 0) {
      if (!v) return setError("We'd love to know your name.");
      return save("name", v);
    }
    if (step === 3) {
      if (!EMAIL_RE.test(v)) return setError("That email doesn't look right. Can you check it?");
      return save("email", v);
    }
    if (step === 4) {
      if (v.length < 20) return setError(`A little more, please: at least 20 characters (${v.length}/20).`);
      return save("message", v);
    }
    if (step === 2 && customBudget) {
      if (!v) return setError("Enter an amount, or pick a range.");
      return save("budget", `Custom: ₹${v}`);
    }
  };

  const QUESTIONS = [
    "What should we call you?",
    `Nice to meet you, ${firstName(form.name)}. What are we building?`,
    "What's your budget?",
    "Where should we reply?",
    "Tell us about the project.",
    "Ready to send?",
  ];
  const HISTORY_Q = ["Name", "Project", "Budget", "Email", "Idea"];
  const historyA = [
    form.name,
    labelFor(PROJECT_TYPES, form.project),
    labelFor(BUDGET_OPTIONS, form.budget),
    form.email,
    shorten(form.message),
  ];

  // Same request as the old form: same endpoint, same fields.
  const send = async () => {
    setIsSubmitting(true);
    const payload: FormData = plan
      ? { ...form, message: `${form.message}\n\nInterested in: ${plan}` }
      : form;
    try {
      const res = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) throw new Error(data.error ?? "Unknown error");
      setSent(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send message.";
      toast({
        title: "❌ Failed to send message.",
        description: `${message} Please try again, or email ${AGENCY_EMAIL}.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setForm(EMPTY_FORM);
    setPlan("");
    setSent(false);
    setStep(0);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitText();
    }
  };

  // ---------------- The answer controls for each step ----------------
  const controls = () => {
    if (step === 0 || step === 3 || step === 4 || (step === 2 && customBudget)) {
      const isMessage = step === 4;
      return (
        <div>
          <div className="flex items-center gap-2">
            {step === 2 && <span className="font-display text-2xl text-[#85B7EB]">₹</span>}
            {isMessage ? (
              <textarea
                id="contact-answer"
                ref={inputRef}
                rows={3}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKey}
                placeholder="What does your business do, and what should the site achieve?"
                className={`${field} resize-none font-sans !text-lg`}
              />
            ) : (
              <input
                id="contact-answer"
                ref={inputRef}
                value={draft}
                onChange={(e) => {
                  const v = e.target.value;
                  // Custom budget: digits only, formatted the Indian way (1,00,000)
                  if (step === 2) {
                    const n = v.replace(/\D/g, "");
                    return setDraft(n ? Number(n).toLocaleString("en-IN") : "");
                  }
                  setDraft(v);
                }}
                onKeyDown={onKey}
                type={step === 3 ? "email" : "text"}
                inputMode={step === 2 ? "numeric" : step === 3 ? "email" : "text"}
                autoComplete={step === 0 ? "name" : step === 3 ? "email" : "off"}
                placeholder={step === 0 ? "Your name" : step === 3 ? "you@email.com" : "Your budget"}
                className={field}
              />
            )}
          </div>
          {isMessage && <p className="mt-1 text-right font-sans text-xs text-muted-foreground">{draft.trim().length}/20 min</p>}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button type="button" onClick={submitText} className={nextBtn}>
              Next <ArrowRight className="h-4 w-4" />
            </button>
            {step === 2 && (
              <button type="button" onClick={() => setCustomBudget(false)} className={chip}>
                Back to ranges
              </button>
            )}
          </div>
        </div>
      );
    }
    if (step === 1) {
      return (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {PROJECT_TYPES.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => save("project", p.value)}
              className="interactive group overflow-hidden rounded-xl border border-white/10 bg-[#0b0b0b] text-left transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-primary"
            >
              <span className="block aspect-[16/9] bg-[#15213a]">
                {p.image && <img src={p.image} alt="" loading="lazy" className="h-full w-full object-cover" />}
              </span>
              <span className="block px-3 py-2 font-sans text-sm text-white">{p.label}</span>
            </button>
          ))}
        </div>
      );
    }
    if (step === 2) {
      return (
        <div className="flex flex-wrap gap-2">
          {BUDGET_OPTIONS.map((b) => (
            <button key={b.value} type="button" onClick={() => save("budget", b.value)} className={chip}>
              {b.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setCustomBudget(true);
              setTimeout(() => inputRef.current?.focus(), 50);
            }}
            className={`${chip} border-primary text-[#85B7EB]`}
          >
            Custom amount
          </button>
        </div>
      );
    }
    // step 5: review and send
    return (
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={send}
          disabled={isSubmitting}
          className="interactive flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-sans text-sm font-medium text-white disabled:opacity-60"
        >
          {isSubmitting ? "Sending…" : "Send brief"} <ArrowUpRight className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => setStep(0)} className={chip}>
          Edit answers
        </button>
      </div>
    );
  };

  const answered = Math.min(step, 5);
  const recent = Array.from({ length: answered }, (_, i) => i).slice(-2);

  return (
    <section id="contact" className="relative z-10 border-t border-white/5 bg-background py-20 md:py-28">
      <div className="container mx-auto px-5 md:px-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
          {/* ---------- Left: heading and direct details ---------- */}
          <div>
            <p className="mb-2 font-sans text-sm text-muted-foreground">Contact</p>
            <SectionHeading className="font-display text-4xl font-medium leading-[1.02] tracking-[-0.03em] text-white md:text-6xl">
              Let's build something.
            </SectionHeading>
            <div className="mt-6 space-y-1.5 font-sans text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <span className="h-[7px] w-[7px] rounded-full bg-primary" />
                {AVAILABILITY}
              </p>
              <p>Replies within 24 hours</p>
            </div>
            {/* Visible on every screen size now, not just desktop */}
            <p className="mt-8 font-sans text-xs text-muted-foreground">Prefer email?</p>
            <a
              href={`mailto:${AGENCY_EMAIL}`}
              className="interactive mt-1 inline-block border-b border-white/25 pb-0.5 font-display text-lg text-white transition-colors hover:border-white md:text-xl"
            >
              {AGENCY_EMAIL}
            </a>
          </div>

          {/* ---------- Right: the conversation and the brief ---------- */}
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="min-h-[420px]">
              <div className="flex items-center justify-between font-sans text-xs text-muted-foreground">
                <span>
                  {step > 0 && !sent && (
                    <button
                      type="button"
                      onClick={() => setStep((s) => (s - 1) as Step)}
                      className="interactive flex items-center gap-1 hover:text-white"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> Back
                    </button>
                  )}
                </span>
                <span>{String(Math.min(step + 1, 5)).padStart(2, "0")} / 05</span>
              </div>

              {plan && !sent && (
                <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#22314f] px-3 py-1 font-sans text-xs text-[#85B7EB]">
                  Plan: {plan}
                  <button type="button" onClick={() => setPlan("")} aria-label="Remove plan" className="interactive">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {/* Last two answers, as chat bubbles */}
              {!sent && (
                <div className="mt-4 flex min-h-[20px] flex-col gap-1.5">
                  <AnimatePresence initial={false}>
                    {recent.map((i) => (
                      <motion.div
                        key={i}
                        layout
                        initial={{ opacity: 0, y: 14, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
                        className="flex items-center justify-between gap-3"
                      >
                        <span className="font-sans text-xs text-[#777]">{HISTORY_Q[i]}</span>
                        <span className="rounded-2xl rounded-br-sm bg-primary px-3 py-1 font-sans text-sm text-white">
                          {historyA[i]}
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* The big question, revealed from behind a mask */}
              <div className="mt-5 overflow-hidden" aria-live="polite">
                <motion.label
                  key={sent ? "sent" : step}
                  htmlFor="contact-answer"
                  initial={reduceMotion ? { opacity: 0 } : { y: "105%" }}
                  animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
                  transition={{ duration: 0.7, ease: EASE, delay: sent ? 1.3 : 0 }}
                  className="block font-display text-[30px] font-medium leading-[1.05] tracking-[-0.03em] text-white md:text-[40px]"
                >
                  {sent ? `Sent. We'll reply to ${form.email} within 24 hours.` : QUESTIONS[step]}
                </motion.label>
              </div>

              <div className="mt-6">
                {sent ? (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.8 }}
                    type="button"
                    onClick={reset}
                    className={chip}
                  >
                    Send another brief
                  </motion.button>
                ) : (
                  controls()
                )}
                {error && (
                  <p role="alert" className="mt-3 font-sans text-sm text-[#ff8a8a]">
                    {error}
                  </p>
                )}
              </div>
            </div>

            {/* The brief card, filling in live (desktop) */}
            <div className="relative hidden h-[260px] lg:block">
              <motion.div
                initial={false}
                animate={sent ? { scaleY: 0.08, y: -200, opacity: 0 } : { scaleY: 1, y: 0, opacity: 1 }}
                transition={sent ? { duration: 0.6, ease: EASE } : { duration: 0 }}
                style={{ transformOrigin: "50% 100%" }}
                className="absolute inset-x-0 top-0 rounded-md bg-[#f3efe6] px-4 pb-5 pt-4 font-mono text-[11px] leading-[1.85] text-[#1a1a1a]"
              >
                <p className="mb-1.5 font-bold">BRIEF · VELTIX</p>
                <BriefRow label="Name" value={form.name} />
                <BriefRow label="Project" value={form.project ? labelFor(PROJECT_TYPES, form.project) : ""} />
                <BriefRow label="Budget" value={form.budget ? labelFor(BUDGET_OPTIONS, form.budget) : ""} />
                <BriefRow label="Reply to" value={form.email} />
                <BriefRow label="Idea" value={form.message ? shorten(form.message) : ""} />
                {plan && <BriefRow label="Plan" value={plan} />}
              </motion.div>
              {!reduceMotion && <Envelope play={sent} />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
