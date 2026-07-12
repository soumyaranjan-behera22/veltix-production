import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useScrollInView } from '@/lib/useScrollInView';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    num: "01",
    title: "Discover",
    desc: "We dissect your goals, audience, and competition. Week 1-2"
  },
  {
    num: "02",
    title: "Design",
    desc: "Wireframes, moodboards, prototypes. Week 2-3"
  },
  {
    num: "03",
    title: "Develop",
    desc: "Engineering with obsessive attention to detail. Week 3-6"
  },
  {
    num: "04",
    title: "Launch",
    desc: "QA, performance optimization, deployment. Week 6-7"
  },
  {
    num: "05",
    title: "Grow",
    desc: "Analytics, iterations, continuous improvement. Ongoing"
  }
];

export default function Process() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { ref: headerRef, inView: headerInView } = useScrollInView({ threshold: 0.5, triggerOnce: true });

  useEffect(() => {
    // Only apply horizontal scroll on desktop
    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      const track = trackRef.current;
      const section = sectionRef.current;
      
      if (!track || !section) return;

      const totalWidth = track.scrollWidth - window.innerWidth + 200; // adding padding

      gsap.to(track, {
        x: -totalWidth,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1,
          start: "center center",
          end: () => `+=${totalWidth}`,
          invalidateOnRefresh: true
        }
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section id="process" ref={sectionRef} className="py-24 lg:py-0 lg:h-screen flex flex-col justify-center bg-[#050505] overflow-hidden border-y border-white/5">
      <div className="container mx-auto px-6 md:px-12 mb-12 lg:mb-24 flex-shrink-0">
        <div ref={headerRef}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex items-center space-x-3 mb-6"
          >
            <span className="w-8 h-px bg-primary"></span>
            <span className="text-primary text-xs tracking-[0.2em] uppercase font-semibold">How We Work</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display font-bold text-4xl md:text-6xl text-white tracking-tight"
          >
            THE PROCESS
          </motion.h2>
        </div>
      </div>

      <div className="pl-6 md:pl-12 lg:pl-24 w-full overflow-x-auto lg:overflow-visible snap-x snap-mandatory scrollbar-none">
        <div ref={trackRef} className="flex flex-row gap-8 lg:gap-16 w-max pr-6 md:pr-12 lg:pr-32">
          {steps.map((step, i) => (
            <div key={i} className="relative w-[280px] md:w-[360px] h-[300px] flex-shrink-0 snap-center group">
              {/* Background Number */}
              <div className="absolute -top-10 -left-6 font-display font-bold text-[180px] leading-none text-white opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-500 pointer-events-none z-0">
                {step.num}
              </div>
              
              <div className="relative z-10 h-full flex flex-col justify-center border-l border-white/10 pl-8 group-hover:border-primary transition-colors duration-500">
                <div className="w-3 h-3 rounded-full bg-white/20 absolute -left-[6.5px] top-1/2 -translate-y-1/2 group-hover:bg-primary group-hover:shadow-[0_0_15px_rgba(79,140,255,0.8)] transition-all duration-500" />
                
                <h3 className="font-display font-bold text-3xl text-white mb-4 group-hover:text-primary transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-muted-foreground font-sans text-lg">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
