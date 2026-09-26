import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { scrollToSection } from "@/lib/smoothscroll";
import SectionHeading from "@/components/SectionHeading";
import { PLAN_EVENT } from "@/lib/site";

// ---- Edit your offers here ----

// The 24-hour express build. Leave price as "" to hide it until decided.
const EXPRESS = {
  price: "",
  title: "Live in 24 hours",
  scope: "One landing page, designed, built, and launched in a day.",
  note: "The 24-hour clock starts once we have your content and logo.",
};

// Items are copied from the original plan cards; nothing added.
const PLANS = [
  {
    name: "Starter",
    price: "₹9,999",
    delivery: "14 days",
    pages: "1 landing page",
    revisions: "1 round",
    items: ["Landing page", "Mobile responsive", "5 sections", "Basic SEO", "1 revision round"],
  },
  {
    name: "Business",
    price: "₹15,999",
    delivery: "21 days",
    pages: "Up to 10",
    revisions: "3 rounds",
    items: ["Custom web design", "Up to 10 pages", "Advanced SEO", "CMS integration", "Analytics setup", "3 revision rounds", "Priority support"],
  },
  {
    name: "Premium",
    price: "₹21,999+",
    delivery: "30 days",
    pages: "Unlimited",
    revisions: "Unlimited",
    items: ["Full custom platform", "Unlimited pages", "E-commerce / SaaS", "AI integrations", "Performance optimization", "Unlimited revisions", "Dedicated PM"],
  },
];

const EASE = [0.76, 0, 0.24, 1] as const;

/* ---------- Express card: the only solid-blue block in the section ---------- */
function Clock({ size }: { size: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <svg viewBox="0 0 90 90" width={size} height={size} aria-hidden="true" className="shrink-0">
      <circle cx="45" cy="45" r="36" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="6" />
      <motion.circle
        cx="45" cy="45" r="36" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round"
        strokeDasharray="60 166"
        style={{ rotate: -90, transformOrigin: "50% 50%" }}
        animate={reduceMotion ? undefined : { strokeDashoffset: [0, -226] }}
        transition={{ duration: 8, ease: "linear", repeat: Infinity }}
      />
      <text x="45" y="53" textAnchor="middle" fill="#fff" fontSize="23" fontWeight="600" fontFamily="Space Grotesk, sans-serif">
        24h
      </text>
    </svg>
  );
}

// Tells the Contact chat which offer the visitor chose, then glides there.
function goToContact(plan: string) {
  window.dispatchEvent(new CustomEvent(PLAN_EVENT, { detail: plan }));
  scrollToSection("#contact");
}

function ExpressCard({ compact }: { compact?: boolean }) {
  const book = () => goToContact("Express 24-hour build");
  if (compact) {
    // Phone: a wide strip right under the heading
    return (
      <div className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-3 rounded-[20px] bg-primary px-3.5 py-4 text-white">
        <Clock size={72} />
        <div>
          <h3 className="font-display text-[19px] font-medium leading-tight tracking-[-0.02em]">{EXPRESS.title}</h3>
          <p className="mt-0.5 font-sans text-xs leading-snug text-white/90">{EXPRESS.scope}</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            {EXPRESS.price ? (
              <span className="font-display text-lg font-semibold">{EXPRESS.price}</span>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={book}
              className="interactive flex h-9 items-center gap-1 rounded-full bg-white px-3.5 font-sans text-xs font-medium text-[#0C447C]"
            >
              Book <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }
  // Desktop: a tall card standing apart from the plans
  return (
    <div className="flex h-full flex-col rounded-3xl bg-primary p-7 text-white">
      <p className="font-sans text-sm text-white/90">Express</p>
      <div className="mt-4"><Clock size={96} /></div>
      <h3 className="mt-4 font-display text-3xl font-medium leading-tight tracking-[-0.02em]">{EXPRESS.title}</h3>
      <p className="mt-2 font-sans text-sm leading-relaxed text-white/90">{EXPRESS.scope}</p>
      {EXPRESS.price && <p className="mt-5 font-display text-3xl font-semibold">{EXPRESS.price}</p>}
      <button
        type="button"
        onClick={book}
        className="interactive mt-auto flex h-12 items-center justify-center gap-2 rounded-full bg-white font-sans text-[15px] font-medium text-[#0C447C]"
      >
        Book an express build <ArrowUpRight className="h-4 w-4" />
      </button>
      <p className="mt-3 font-sans text-xs text-white/75">{EXPRESS.note}</p>
    </div>
  );
}

/* ---------- Plan selector: three big tap targets with a sliding pill ---------- */
function Selector({ value, onChange }: { value: number; onChange: (i: number) => void }) {
  return (
    <div role="radiogroup" aria-label="Project size" className="relative grid h-[52px] grid-cols-3 rounded-2xl border border-white/10 bg-[#111] p-1">
      <motion.span
        aria-hidden="true"
        className="absolute bottom-1 left-1 top-1 w-[calc((100%-8px)/3)] rounded-xl bg-white"
        animate={{ x: `${value * 100}%` }}
        transition={{ duration: 0.45, ease: EASE }}
      />
      {PLANS.map((p, i) => (
        <button
          key={p.name}
          type="button"
          role="radio"
          aria-checked={value === i}
          onClick={() => onChange(i)}
          className={`interactive relative z-10 font-sans text-[15px] transition-colors duration-300 ${
            value === i ? "font-medium text-black" : "text-[#8a8a8a]"
          }`}
        >
          {p.name}
        </button>
      ))}
    </div>
  );
}

/* ---------- Receipt: prints out of a slot on every change ---------- */
function Receipt({ plan, maxItems }: { plan: (typeof PLANS)[number]; maxItems?: number }) {
  const reduceMotion = useReducedMotion();
  const shown = maxItems ? plan.items.slice(0, maxItems) : plan.items;
  const extra = plan.items.length - shown.length;
  return (
    <div>
      <div className="relative z-10 h-3 rounded-lg border border-white/15 bg-[#1a1a1a]" aria-hidden="true" />
      <div className="-mt-1.5 overflow-hidden px-2.5 pb-2.5">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={plan.name}
            initial={reduceMotion ? { opacity: 0 } : { y: "-100%" }}
            animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { y: "-100%" }}
            transition={{ duration: reduceMotion ? 0.2 : 0.45, ease: [0.19, 1, 0.22, 1] }}
            className="relative bg-[#f3efe6] px-4 pb-4 pt-3.5 font-mono text-[12px] leading-[1.65] text-[#1a1a1a] md:text-[13px]"
            aria-live="polite"
          >
            {/* Zigzag torn-paper edge along the bottom */}
            <span
              aria-hidden="true"
              className="absolute inset-x-0 -bottom-2 h-2"
              style={{
                background:
                  "linear-gradient(-45deg, transparent 6px, #f3efe6 0), linear-gradient(45deg, transparent 6px, #f3efe6 0)",
                backgroundSize: "12px 8px",
              }}
            />
            <div className="flex justify-between font-bold">
              <span>VELTIX</span>
              <span>{plan.name.toUpperCase()}</span>
            </div>
            <div className="my-1 border-t border-dashed border-black/30" />
            <ul>
              {shown.map((item) => (
                <li key={item} className="flex justify-between gap-3">
                  <span>{item}</span>
                  <span aria-hidden="true">✓</span>
                </li>
              ))}
              {extra > 0 && <li className="text-black/50">+ {extra} more in Compare</li>}
            </ul>
            <div className="my-1 border-t border-dashed border-black/30" />
            <div className="flex justify-between text-[15px] font-bold">
              <span>TOTAL</span>
              <span>{plan.price}</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------- Comparison table: only rows every plan states ---------- */
function Compare({ active }: { active: number }) {
  const rows: [string, (p: (typeof PLANS)[number]) => string][] = [
    ["Price", (p) => p.price],
    ["Pages", (p) => p.pages],
    ["Delivery", (p) => p.delivery],
    ["Revisions", (p) => p.revisions],
    ["Includes", (p) => p.items.join(", ")],
  ];
  return (
    <div className="-mx-6 overflow-x-auto px-6 md:mx-0 md:px-0">
      <table className="w-full min-w-[560px] table-fixed border-collapse font-sans text-sm">
        <thead>
          <tr>
            <th className="w-28" />
            {PLANS.map((p, i) => (
              <th key={p.name} className={`px-4 py-3 text-left font-display text-lg font-medium ${i === active ? "bg-[#0f1a30] text-white" : "text-white/80"}`}>
                {p.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, get]) => (
            <tr key={label} className="border-t border-white/10">
              <th className="py-3 pr-4 text-left align-top font-normal text-muted-foreground">{label}</th>
              {PLANS.map((p, i) => (
                <td key={p.name} className={`px-4 py-3 align-top ${i === active ? "bg-[#0f1a30] text-white" : "text-white/70"}`}>
                  {get(p)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Pricing() {
  const [plan, setPlan] = useState(1);
  const [compareOpen, setCompareOpen] = useState(false);
  const p = PLANS[plan];
  const start = () => goToContact(`${p.name} plan`);

  const compareToggle = (
    <button
      type="button"
      onClick={() => setCompareOpen((o) => !o)}
      aria-expanded={compareOpen}
      className="interactive flex h-11 items-center gap-1.5 font-sans text-sm text-white"
    >
      <span className="border-b border-white/30 pb-px">{compareOpen ? "Hide comparison" : "Compare all plans"}</span>
    </button>
  );

  return (
    <section id="pricing" className="relative z-10 bg-background pb-12 pt-[92px] md:py-32">
      <div className="container mx-auto px-5 md:px-12">
        <p className="mb-1 font-sans text-xs text-muted-foreground md:mb-4 md:text-sm">Pricing</p>
        <SectionHeading className="font-display text-[32px] font-medium leading-none tracking-[-0.03em] text-white md:text-6xl">
          Clear prices.
        </SectionHeading>

        {/* ---------- Phone and tablet: everything on one screen ---------- */}
        <div className="mt-4 lg:hidden">
          <ExpressCard compact />
          <p className="mt-5 font-sans text-[13px] text-muted-foreground">Or choose by project size</p>
          <div className="mt-2"><Selector value={plan} onChange={setPlan} /></div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-display text-[40px] font-medium leading-none tracking-[-0.03em] text-white">{p.price}</span>
            <span className="rounded-full border border-[#22314f] px-2.5 py-1 font-sans text-xs text-[#85B7EB]">{p.delivery}</span>
          </div>
          <div className="mt-3"><Receipt plan={p} maxItems={5} /></div>
          <button
            type="button"
            onClick={start}
            className="interactive mt-3 flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-white/25 font-sans text-base font-medium text-white"
          >
            Start with {p.name} <ArrowUpRight className="h-4 w-4" />
          </button>
          <div className="flex justify-center">{compareToggle}</div>
          <p className="text-center font-sans text-[11px] text-[#6b6b6b]">{EXPRESS.note}</p>
        </div>

        {/* ---------- Desktop: selector | receipt | express ---------- */}
        <div className="mt-16 hidden gap-10 lg:grid lg:grid-cols-[minmax(0,1fr)_340px_300px] lg:items-stretch">
          <div className="flex flex-col">
            <h3 className="font-display text-3xl font-medium tracking-[-0.02em] text-white">How big is your project?</h3>
            <div className="mt-8"><Selector value={plan} onChange={setPlan} /></div>
            <div className="mt-8 flex items-baseline gap-4">
              <span className="font-display text-6xl font-medium tracking-[-0.03em] text-white">{p.price}</span>
              <span className="rounded-full border border-[#22314f] px-3 py-1 font-sans text-sm text-[#85B7EB]">{p.delivery}</span>
            </div>
            <label className="mt-8 flex cursor-pointer items-center gap-3 font-sans text-sm text-muted-foreground">
              Selling online?
              <button
                type="button"
                role="switch"
                aria-checked={plan === 2}
                onClick={() => setPlan(plan === 2 ? 1 : 2)}
                className={`interactive rounded-full border px-3 py-1 text-xs transition-colors ${
                  plan === 2 ? "border-white bg-white text-black" : "border-white/20 text-white/80"
                }`}
              >
                {plan === 2 ? "Yes" : "No"}
              </button>
            </label>
            <button
              type="button"
              onClick={start}
              className="interactive mt-auto flex h-12 w-fit items-center gap-2 rounded-full border border-white/25 px-6 font-sans text-[15px] font-medium text-white transition-colors hover:border-white"
            >
              Start with {p.name} <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <Receipt plan={p} />
          <ExpressCard />
        </div>

        {/* Comparison, both layouts */}
        <div className="mt-2 hidden lg:mt-10 lg:block">{compareToggle}</div>
        <AnimatePresence initial={false}>
          {compareOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="overflow-hidden"
            >
              <div className="pt-4"><Compare active={plan} /></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
