import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowUpRight, Check } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import { AGENCY_EMAIL } from "@/lib/site";

// ---------------------------------------------------------------------------
// Promises: only things you actually commit to. Edit freely.
// ---------------------------------------------------------------------------
const PROMISES = [
  {
    title: "A reply within 24 hours",
    detail: "Every brief gets a real answer from a person, not an autoresponder.",
  },
  {
    title: "The price we quote is the price you pay",
    detail: "Fixed before we start. No surprise invoices at the end.",
  },
  {
    title: "A delivery date in writing",
    detail: "14, 21, or 30 days by plan, or 24 hours for an express build, agreed at kickoff.",
  },
  {
    title: "Tested on real phones",
    detail: "Every page is checked on actual devices before it goes live.",
  },
];

// ---------------------------------------------------------------------------
// Real reviews only. Leave empty until you have one; the "What clients say"
// block appears automatically once there's at least one entry:
//   1–2 reviews: shown side by side
//   3 or more:   two sliding rows, one moving left and one moving right
// Always include source: a link where the review can be seen (Google,
// LinkedIn, Clutch...). rating is optional; only add it if the source has one.
// ---------------------------------------------------------------------------
type Review = { quote: string; name: string; role: string; source: string; rating?: number };
const REVIEWS: Review[] = [
  // {
  //   quote: "What the client actually wrote.",
  //   name: "Client name",
  //   role: "Role, Company",
  //   source: "https://g.page/r/your-google-review-link",
  //   rating: 5,
  // },
];

// Preview only: while REVIEWS is empty, these sample cards show on your own
// computer (npm run dev) so you can see the sliding design. They never
// appear on the live site, because Vite's DEV flag is false in the build
// that Vercel deploys. Set to false if you don't want them locally either.
const SHOW_SAMPLES_WHILE_DEVELOPING = true;
const SAMPLE_REVIEWS: Review[] = [1, 2, 3, 4].map((n) => ({
  quote: `Sample review ${n}. Your client's real words go here.`,
  name: `Sample client ${n}`,
  role: "Preview only, not on the live site",
  source: "#",
  rating: 5,
}));
const SHOWN_REVIEWS: Review[] =
  REVIEWS.length > 0
    ? REVIEWS
    : import.meta.env.DEV && SHOW_SAMPLES_WHILE_DEVELOPING
      ? SAMPLE_REVIEWS
      : [];

// Where "Leave a review" points. Swap for your Google review link when you
// have a Google Business Profile.
const REVIEW_LINK = `mailto:${AGENCY_EMAIL}?subject=${encodeURIComponent("A review for Veltix")}`;

const EASE = [0.76, 0, 0.24, 1] as const;

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------
function Stars({ n }: { n: number }) {
  return (
    <div className="mb-4 flex gap-1" aria-label={`${n} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 20 20" className={`h-4 w-4 ${i <= n ? "text-[#FACC15]" : "text-white/15"}`} fill="currentColor" aria-hidden="true">
          <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.07 3.29a1 1 0 00.95.69h3.46c.97 0 1.37 1.24.59 1.81l-2.8 2.03a1 1 0 00-.36 1.12l1.07 3.29c.3.92-.76 1.69-1.54 1.12l-2.8-2.03a1 1 0 00-1.18 0l-2.8 2.03c-.78.57-1.84-.2-1.54-1.12l1.07-3.29a1 1 0 00-.36-1.12L2.98 8.72c-.78-.57-.38-1.81.59-1.81h3.46a1 1 0 00.95-.69l1.07-3.29z" />
        </svg>
      ))}
    </div>
  );
}

// Same card as the original testimonials design.
function ReviewCard({ r, className = "" }: { r: Review; className?: string }) {
  return (
    <figure
      className={`flex flex-col rounded-2xl border border-white/5 bg-white/[0.02] p-7 transition-colors hover:bg-white/[0.04] md:p-8 ${className}`}
    >
      {r.rating && <Stars n={r.rating} />}
      <blockquote className="mb-6 font-sans text-base leading-relaxed text-white md:text-lg">"{r.quote}"</blockquote>
      <figcaption className="mt-auto flex items-end justify-between gap-4 font-sans text-sm">
        <span>
          <span className="block font-display font-bold text-white">{r.name}</span>
          <span className="text-muted-foreground">{r.role}</span>
        </span>
        <a
          href={r.source}
          target="_blank"
          rel="noopener noreferrer"
          className="interactive shrink-0 text-[#85B7EB] underline-offset-4 hover:underline"
        >
          View review
        </a>
      </figcaption>
    </figure>
  );
}

// One sliding row. The cards are laid out twice, back to back, in a strip
// that is as wide as its content (w-max). The strip slides by exactly half
// its own width, so copy two lands where copy one started and the loop is
// seamless. The old version squeezed this strip into half the page width,
// which is why its cards overlapped.
function MarqueeRow({ items, direction }: { items: Review[]; direction: "left" | "right" }) {
  // Repeat short lists so one copy is always wider than a large screen.
  const minCards = 6;
  const copy = Array.from({ length: Math.ceil(minCards / items.length) }, () => items).flat();
  const seconds = copy.length * 9; // same speed however many reviews there are

  return (
    <div className="group flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
      <div
        className={`flex w-max gap-6 pr-6 group-hover:[animation-play-state:paused] motion-reduce:animate-none ${
          direction === "left" ? "animate-marquee-left" : "animate-marquee-right"
        }`}
        style={{ animationDuration: `${seconds}s` }}
      >
        {[0, 1].map((half) =>
          copy.map((r, i) => (
            <ReviewCard
              key={`${half}-${i}`}
              r={r}
              className="w-[80vw] shrink-0 sm:w-[380px] lg:w-[400px]"
              // The second copy is only there for the loop; hide it from
              // screen readers so each review is read once.
              {...(half === 1 || i >= items.length ? { "aria-hidden": true } : {})}
            />
          )),
        )}
      </div>
    </div>
  );
}

function Reviews() {
  if (SHOWN_REVIEWS.length === 0) return null;
  return (
    <div className="mt-28 md:mt-32">
      {/* Same heading as the original testimonials design */}
      <div className="text-center">
        <div className="mb-6 flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-primary" />
          <span className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-primary">Client success</span>
          <span className="h-px w-8 bg-primary" />
        </div>
        <SectionHeading className="font-display text-4xl font-bold tracking-tight text-white md:text-6xl">
          WHAT CLIENTS SAY
        </SectionHeading>
      </div>
      {SHOWN_REVIEWS.length < 3 ? (
        <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-6 md:mt-20 md:grid-cols-2">
          {SHOWN_REVIEWS.map((r) => (
            <ReviewCard key={r.name} r={r} />
          ))}
        </div>
      ) : (
        // Full-bleed: the rows run edge to edge of the screen
        <div className="-mx-5 mt-14 space-y-6 md:-mx-12 md:mt-20">
          <MarqueeRow items={SHOWN_REVIEWS} direction="left" />
          <MarqueeRow items={[...SHOWN_REVIEWS].reverse()} direction="right" />
        </div>
      )}
    </div>
  );
}

// One promise line. It ticks when the scroll passes its threshold.
function PromiseRow({
  item,
  i,
  progress,
  reduceMotion,
}: {
  item: (typeof PROMISES)[number];
  i: number;
  progress: MotionValue<number>;
  reduceMotion: boolean | null;
}) {
  // Rows tick one after another across the first 70% of the scroll range.
  const at = 0.1 + (i / PROMISES.length) * 0.6;
  const on = useTransform(progress, (p) => (reduceMotion || p >= at ? 1 : 0));
  const inkOpacity = useTransform(on, (v) => (v ? 1 : 0.35));
  const boxBg = useTransform(on, (v) => (v ? "#1a1a1a" : "rgba(0,0,0,0)"));
  const tickScale = useTransform(on, (v) => v);

  return (
    <li className="flex gap-4 border-b border-dashed border-black/20 py-4 md:gap-5 md:py-5">
      <motion.span
        style={{ backgroundColor: boxBg }}
        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 border-[#1a1a1a] transition-colors duration-300"
        aria-hidden="true"
      >
        <motion.span style={{ scale: tickScale }} className="flex transition-transform duration-300">
          <Check className="h-4 w-4 text-[#f3efe6]" strokeWidth={3} />
        </motion.span>
      </motion.span>
      <motion.div style={{ opacity: inkOpacity }} className="transition-opacity duration-300">
        <p className="font-display text-xl font-medium leading-snug tracking-[-0.01em] md:text-2xl">{item.title}</p>
        <p className="mt-1 font-sans text-sm leading-relaxed text-[#5b554b] md:text-base">{item.detail}</p>
      </motion.div>
    </li>
  );
}

export default function Testimonials() {
  const reduceMotion = useReducedMotion();
  const paperRef = useRef<HTMLDivElement>(null);

  // 0 when the paper's top is 85% down the screen, 1 when its middle
  // reaches 40% down. Ticks and the signature are driven by this.
  const { scrollYProgress } = useScroll({
    target: paperRef,
    offset: ["start 85%", "center 40%"],
  });
  // The signature draws itself over the last part of the range.
  const sign = useTransform(scrollYProgress, (p) =>
    reduceMotion ? 1 : Math.min(Math.max((p - 0.72) / 0.28, 0), 1),
  );
  // Hidden until drawing starts, so the pen-stroke ends don't show as dots.
  const inkVisible = useTransform(sign, (v) => (v > 0.01 ? 1 : 0));
  // The stamp lands as the signature finishes.
  const stampScale = useTransform(sign, [0, 1], [1.4, 1]);

  return (
    <section className="relative border-y border-white/5 bg-secondary py-24 md:py-32">
      <div className="container mx-auto px-5 md:px-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
          {/* Left: heading and the honest framing */}
          <div className="lg:sticky lg:top-32 lg:self-start">
            <p className="mb-4 font-sans text-sm text-muted-foreground">Our promise</p>
            <SectionHeading className="font-display text-5xl font-medium leading-[1.02] tracking-[-0.03em] text-white md:text-6xl">
              Promises you can hold us to.
            </SectionHeading>
            <p className="mt-6 max-w-[40ch] font-sans text-base leading-relaxed text-muted-foreground md:text-lg">
              We'd rather put our commitments in writing than fill this space with praise. If we
              break one, tell us.
            </p>
          </div>

          {/* Right: the signed paper */}
          <motion.div
            ref={paperRef}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="relative rounded-md bg-[#f3efe6] px-6 pb-8 pt-7 text-[#1a1a1a] shadow-[0_30px_80px_rgba(0,0,0,0.45)] md:px-10 md:pb-10 md:pt-9"
          >
            <div className="flex items-baseline justify-between font-mono text-xs md:text-sm">
              <span className="font-bold">VELTIX</span>
              <span className="text-[#7a7266]">Our promise to every client</span>
            </div>
            <ul className="mt-3 border-t border-dashed border-black/20">
              {PROMISES.map((item, i) => (
                <PromiseRow key={item.title} item={item} i={i} progress={scrollYProgress} reduceMotion={reduceMotion} />
              ))}
            </ul>

            {/* Signature */}
            <div className="mt-8 flex items-end justify-between gap-6">
              <div>
                <svg viewBox="0 0 220 80" className="h-16 w-44 md:h-20 md:w-56" aria-label="Signed, Veltix" role="img">
                  <motion.path
                    d="M8 22 C14 40 20 56 26 60 C30 48 36 30 46 18 C44 40 52 46 60 38 C66 30 58 26 54 34 C50 44 60 54 72 46 C82 36 88 14 84 10 C78 8 76 40 82 52 C86 58 94 54 98 46 C102 38 104 30 106 24 M100 34 L116 32 M106 24 C104 40 104 52 112 54 C118 54 122 48 124 44 C126 40 128 48 130 52 C132 56 138 52 140 46 M142 40 C150 48 156 54 162 58 M162 40 C154 46 148 52 142 60 M20 70 C80 64 140 64 200 60"
                    fill="none"
                    stroke="#1a1a1a"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ pathLength: sign, opacity: inkVisible }}
                  />
                  <motion.circle cx="128" cy="34" r="1.8" fill="#1a1a1a" style={{ opacity: sign }} />
                </svg>
                <p className="border-t border-black/30 pt-2 font-mono text-xs text-[#7a7266]">Signed, the Veltix team</p>
              </div>
              {/* Stamp */}
              <motion.div
                style={{ opacity: sign, scale: stampScale }}
                className="flex h-20 w-20 shrink-0 -rotate-12 items-center justify-center rounded-full border-2 border-primary text-center font-mono text-[10px] font-bold leading-tight text-primary md:h-24 md:w-24 md:text-xs"
                aria-hidden="true"
              >
                IN
                <br />
                WRITING
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Real reviews: appears only once REVIEWS has entries */}
        <Reviews />

        {/* Invitation for past clients */}
        <div className="mt-14 flex flex-col items-start gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-sans text-base text-muted-foreground">Worked with us? We'd love to hear how it went.</p>
          <a
            href={REVIEW_LINK}
            className="interactive group flex h-12 items-center gap-2 rounded-full border border-white/25 px-6 font-sans text-[15px] font-medium text-white transition-colors hover:border-white"
          >
            Leave a review
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
          </a>
        </div>
      </div>
    </section>
  );
}
