import { createRef, useEffect, useRef, useState, type RefObject } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";

// ---------------------------------------------------------------------------
// Your projects. Add one object per real project, in the order you want.
// Put each screenshot in frontend/public/work/ (about 1600px wide).
// url is optional: leave it out and the card simply has no "Visit site" link.
// ---------------------------------------------------------------------------
type Project = {
  title: string;
  summary: string;
  category: string;
  year: string;
  tech: string[];
  image: string;
  url?: string;
};

const PROJECTS: Project[] = [
  {
    title: "NexaBank",
    summary: "Digital banking platform",
    category: "Fintech",
    year: "2024",
    tech: ["React", "Node.js", "Stripe"],
    image: "/nexa.png",
  },
  // Concept work: self-initiated designs, labelled "concept" so visitors
  // know they aren't client projects. Replace them as real work comes in.
  {
    title: "Ember",
    summary: "Concept: coffee subscription store",
    category: "E-commerce concept",
    year: "2026",
    tech: ["React", "Shopify"],
    image: "/work/ember.webp",
  },
  {
    title: "Stride",
    summary: "Concept: fitness app landing page",
    category: "App landing concept",
    year: "2026",
    tech: ["Next.js", "Framer Motion"],
    image: "/work/stride.webp",
  },
  {
    title: "Nivaas",
    summary: "Concept: homestay booking site",
    category: "Booking concept",
    year: "2026",
    tech: ["React", "Node.js"],
    image: "/work/nivaas.webp",
  },
  // {
  //   title: "Project name",
  //   summary: "One line on what you built",
  //   category: "E-commerce",
  //   year: "2025",
  //   tech: ["Next.js", "Shopify"],
  //   image: "/work/project-name.webp",
  //   url: "https://example.com",
  // },
];

// Same stacking feel as React Bits ScrollStack, built on the page's own
// scroll instead of starting a second smooth-scroll engine.
const STACK = {
  topDesktop: 104, // where the first card sticks, in px from the top
  topPhone: 84,
  bandDesktop: 52, // height of each card's coloured strip, which is also
  bandPhone: 44, //   how much of each earlier card stays visible
  baseScale: 0.88, // how small the back card gets...
  scaleStep: 0.03, // ...each later card shrinks a little less (the staircase)
};

// Strip colours, in order. They repeat if you have more projects.
// ink is the text colour that reads on that strip.
const ACCENTS = [
  { bg: "#4F8CFF", ink: "#ffffff" }, // Veltix blue
  { bg: "#F3EFE6", ink: "#1a1a1a" }, // paper, same as the Pricing receipt
  { bg: "#1E3A8A", ink: "#ffffff" }, // deep navy
];

function StackCard({
  project,
  i,
  total,
  selfRef,
  nextRef,
  isDesktop,
  reduceMotion,
}: {
  project: Project;
  i: number;
  total: number;
  selfRef: RefObject<HTMLDivElement | null>;
  nextRef: RefObject<HTMLDivElement | null>;
  isDesktop: boolean;
  reduceMotion: boolean | null;
}) {
  const band = isDesktop ? STACK.bandDesktop : STACK.bandPhone;
  const topFor = (n: number) => (isDesktop ? STACK.topDesktop : STACK.topPhone) + n * band;
  const top = topFor(i);
  const isLast = i === total - 1;
  const accent = ACCENTS[i % ACCENTS.length];

  // This card gets covered by the NEXT card: 0 when the next card enters the
  // bottom of the screen, 1 when it reaches its own sticky spot on top.
  const { scrollYProgress: next } = useScroll({
    target: isLast ? selfRef : nextRef,
    offset: ["start end", `start ${topFor(i + 1)}px`],
  });
  // Covered cards shrink toward their staircase size. The last card is never
  // covered, so it stays full size. Written as functions for the same reason
  // as the hero (native scroll timelines misfire on sticky elements).
  const target = Math.min(STACK.baseScale + i * STACK.scaleStep, 1);
  const scale = useTransform(next, (v) => {
    if (reduceMotion || isLast) return 1;
    const c = Math.min(Math.max(v, 0), 1);
    return 1 - c * (1 - target);
  });

  const num = String(i + 1).padStart(2, "0");

  return (
    <div ref={selfRef} className="sticky mb-[14svh] last:mb-0" style={{ top }}>
      <motion.article
        style={{ scale }}
        className="relative origin-top overflow-hidden rounded-3xl bg-[#0c0d10] shadow-[0_-12px_40px_rgba(0,0,0,0.55)]"
      >
        {/* Coloured strip: stays visible when later cards stack on top */}
        <div
          className="flex items-center justify-between gap-4 px-6 font-sans text-sm font-medium md:px-10"
          style={{ height: band, background: accent.bg, color: accent.ink }}
        >
          <span className="flex items-center gap-3 truncate">
            <span className="opacity-60">{num}</span>
            <span className="truncate">{project.title}</span>
          </span>
          <span className="shrink-0 opacity-70">
            {project.category}, {project.year}
          </span>
        </div>

        <div className="grid grid-cols-1 border-x border-b border-white/10 lg:h-[min(500px,calc(100svh-340px))] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] rounded-b-3xl">
          {/* Screenshot: on top on phones, on the right on desktop */}
          <div className="relative order-1 aspect-[16/10] overflow-hidden border-b border-white/10 lg:order-2 lg:aspect-auto lg:h-full lg:border-b-0 lg:border-l">
            <img
              src={project.image}
              alt={`${project.title}, ${project.summary}`}
              loading="lazy"
              className="h-full w-full object-cover object-top"
            />
          </div>

          {/* Details */}
          <div className="order-2 flex flex-col p-6 md:p-10 lg:order-1 lg:p-12">
            <h3 className="font-display text-[34px] font-medium leading-none tracking-[-0.03em] text-white md:text-5xl lg:mt-auto lg:text-6xl">
              {project.title}
            </h3>
            <p className="mt-3 font-sans text-base text-muted-foreground md:text-lg">{project.summary}</p>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {project.tech.map((t) => (
                <span key={t} className="rounded-full border border-white/15 px-3 py-1 font-sans text-xs text-white/85">
                  {t}
                </span>
              ))}
            </div>
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="interactive group mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/25 font-sans text-[15px] font-medium text-white transition-colors hover:border-white md:w-fit md:rounded-full md:px-6"
              >
                Visit site
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
              </a>
            )}
          </div>
        </div>
      </motion.article>
    </div>
  );
}

export default function Projects() {
  const reduceMotion = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);
  // One ref per card, so each card can watch the one after it.
  const cardRefs = useRef(PROJECTS.map(() => createRef<HTMLDivElement>()));

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <section id="work" className="relative z-10 bg-background py-24 md:py-32">
      <div className="container mx-auto px-5 md:px-12">
        <div className="mb-12 md:mb-20">
          <p className="mb-4 font-sans text-sm text-muted-foreground">Work</p>
          <SectionHeading className="font-display text-5xl font-medium leading-none tracking-[-0.03em] text-white md:text-7xl">
            Selected work
          </SectionHeading>
        </div>

        <div>
          {PROJECTS.map((project, i) => (
            <StackCard
              key={project.title}
              project={project}
              i={i}
              total={PROJECTS.length}
              selfRef={cardRefs.current[i]}
              nextRef={cardRefs.current[i + 1] ?? cardRefs.current[i]}
              isDesktop={isDesktop}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
