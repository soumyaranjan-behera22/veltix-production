import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useScrollInView } from "@/lib/useScrollInView";
import { scrollToSection } from "@/lib/smoothscroll";
import FlowingMenu from "@/components/FlowingMenu";

// Edit services here. Images live in frontend/public/services/.
// "included" should list what you actually deliver.
const SERVICES = [
  {
    title: "Web design",
    desc: "Interfaces that earn trust in the first five seconds.",
    included: ["Wireframes", "UI design", "Clickable prototype"],
    image: "/services/web-design.webp",
  },
  {
    title: "Web development",
    desc: "React and Next.js builds made for speed and scale.",
    included: ["Front-end build", "CMS setup", "Launch and hosting"],
    image: "/services/web-development.webp",
  },
  {
    title: "Landing pages",
    desc: "One page, one goal, built for a specific campaign.",
    included: ["Page structure", "Design and build", "Analytics setup"],
    image: "/services/landing-pages.webp",
  },
  {
    title: "E-commerce",
    desc: "Shopify and headless stores built to sell.",
    included: ["Store design", "Checkout flow", "Payment integrations"],
    image: "/services/e-commerce.webp",
  },
  {
    title: "SEO",
    desc: "Technical and content SEO so the right people find you.",
    included: ["Technical audit", "On-page fixes", "Content plan"],
    image: "/services/seo.webp",
  },
  {
    title: "Brand identity",
    desc: "Logo, type, and colour that work together.",
    included: ["Logo", "Colour palette", "Type system"],
    image: "/services/brand-identity.webp",
  },
  {
    title: "Website redesign",
    desc: "Turn an outdated site into one that converts.",
    included: ["Site audit", "Redesign", "Content migration"],
    image: "/services/website-redesign.webp",
  },
  {
    title: "AI integrations",
    desc: "Useful AI features built into your product.",
    included: ["Chat assistants", "Smart search", "Workflow automation"],
    image: "/services/ai-integrations.webp",
  },
];

function StackCard({
  service,
  i,
  total,
  progress,
  reduceMotion,
}: {
  service: (typeof SERVICES)[number];
  i: number;
  total: number;
  progress: MotionValue<number>;
  reduceMotion: boolean | null;
}) {
  // Once the next card starts covering this one, shrink it slightly and
  // dim it, so the stack reads as depth. Written as functions, not ranges,
  // for the same reason as in the hero (native scroll timelines misfire).
  const start = i / total;
  const scale = useTransform(progress, (p) => {
    if (reduceMotion || p <= start) return 1;
    const covered = Math.min((p - start) / (1 - start), 1);
    return 1 - covered * (total - i) * 0.02;
  });
  const dim = useTransform(progress, (p) => {
    if (reduceMotion || p <= start) return 0;
    return Math.min(((p - start) / (1 - start)) * 1.5, 0.6);
  });

  // Each card sticks a little lower than the one before, so the top
  // edges of earlier cards peek out above it like a stack of paper.
  const top = 84 + i * 10;

  return (
    <div className="sticky mb-[8svh] last:mb-0" style={{ top }}>
      <motion.article
        style={{ scale }}
        className="relative origin-top overflow-hidden rounded-3xl border border-white/10 bg-[#0c0d10]"
      >
        <div className="flex flex-col">
          <div className="order-2 flex flex-col p-6 md:p-10">
            <h3 className="font-display text-[34px] font-medium leading-none tracking-[-0.03em] text-white md:text-5xl">
              {service.title}
            </h3>
            <p className="mt-4 max-w-[40ch] font-sans text-base leading-relaxed text-muted-foreground md:text-lg">
              {service.desc}
            </p>
            <ul className="mt-6 hidden space-y-2 font-sans text-sm text-white/80 md:block">
              {service.included.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="h-px w-4 bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => scrollToSection("#contact")}
              className="interactive group mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 font-sans text-[15px] font-medium text-white md:w-fit md:rounded-full"
            >
              Start this project
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
            </button>
          </div>
          <div className="order-1 aspect-[16/10] overflow-hidden border-b border-white/10">
            <img
              src={service.image}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
        {/* Dims the card as the next one slides over it */}
        <motion.div
          style={{ opacity: dim }}
          className="pointer-events-none absolute inset-0 bg-black"
        />
      </motion.article>
    </div>
  );
}

// Desktop only: the sticky panel beside the list. It shows whichever
// service the mouse is over.
function ServicePanel({ index }: { index: number }) {
  const service = SERVICES[index];
  return (
    <div className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-[#0c0d10]">
      <div className="relative aspect-[16/10] overflow-hidden border-b border-white/10">
        <AnimatePresence initial={false}>
          <motion.img
            key={service.image}
            src={service.image}
            alt=""
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1] }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>
      </div>
      <div className="p-8">
        <p className="font-sans text-lg leading-relaxed text-white">{service.desc}</p>
        <ul className="mt-5 space-y-2 font-sans text-sm text-white/70">
          {service.included.map((item) => (
            <li key={item} className="flex items-center gap-3">
              <span className="h-px w-4 bg-primary" />
              {item}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => scrollToSection("#contact")}
          className="interactive group mt-8 flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-sans text-[15px] font-medium text-white"
        >
          Start this project
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
        </button>
      </div>
    </div>
  );
}

export default function Services() {
  const { ref: headerRef, inView: headerInView } = useScrollInView({ threshold: 0.1, triggerOnce: true });
  const reduceMotion = useReducedMotion();
  const stackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // 0 when the stack's top reaches the top of the screen,
  // 1 when its bottom reaches the bottom of the screen.
  const { scrollYProgress } = useScroll({
    target: stackRef,
    offset: ["start start", "end end"],
  });

  return (
    <section id="services" className="relative bg-secondary py-24 md:py-32">
      <div className="container mx-auto px-6 md:px-12">
        <div className="lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          {/* Left: heading, plus the sticky service panel on desktop */}
          <div className="lg:sticky lg:top-28 lg:self-start">
        <div ref={headerRef} className="mb-12 max-w-2xl md:mb-20 lg:mb-0">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="mb-4 font-sans text-sm text-muted-foreground"
          >
            Services
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="font-display text-5xl font-medium leading-none tracking-[-0.03em] text-white md:text-7xl"
          >
            What we build
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 max-w-[42ch] font-sans text-base leading-relaxed text-muted-foreground md:text-lg"
          >
            Eight things, done properly. Pick one, or combine them into a
            single project.
          </motion.p>
        </div>

            <div className="hidden lg:block">
              <ServicePanel index={active} />
            </div>
          </div>

          {/* Right on desktop: the flowing list */}
          <div className="hidden lg:block lg:h-[720px] lg:border-y lg:border-white/10">
            <FlowingMenu
              items={SERVICES.map((service) => ({
                link: "#contact",
                text: service.title,
                image: service.image,
              }))}
              speed={18}
              textColor="#ffffff"
              bgColor="transparent"
              marqueeBgColor="#4F8CFF"
              marqueeTextColor="#050505"
              borderColor="rgba(255,255,255,0.1)"
              onHover={setActive}
              onSelect={() => scrollToSection("#contact")}
            />
          </div>

          {/* Phones and tablets: stacking cards */}
          <div ref={stackRef} className="lg:hidden">
            {SERVICES.map((service, i) => (
              <StackCard
                key={service.title}
                service={service}
                i={i}
                total={SERVICES.length}
                progress={scrollYProgress}
                reduceMotion={reduceMotion}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
