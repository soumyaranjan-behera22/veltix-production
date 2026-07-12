import React from 'react';
import { motion } from 'framer-motion';
import { useScrollInView } from '@/lib/useScrollInView';

const testimonials = [
  {
    quote: "VELTIX transformed our conversion rate by 340%. Best investment we made.",
    author: "Sarah Chen",
    role: "CEO of NexaLabs"
  },
  {
    quote: "The attention to detail is unmatched. Our Lighthouse score went from 54 to 98 overnight.",
    author: "Marcus Rodriguez",
    role: "CTO of Orion"
  },
  {
    quote: "Finally an agency that actually understands modern web. Extraordinary work.",
    author: "Priya Sharma",
    role: "Founder of Luminary"
  },
  {
    quote: "We launched in 3 weeks. The results were immediate. 5x traffic increase.",
    author: "David Kim",
    role: "Head of Growth"
  },
  {
    quote: "VELTIX doesn't just build websites. They build growth machines.",
    author: "Emma Thompson",
    role: "CMO"
  }
];

// Duplicate for infinite scroll
const row1 = [...testimonials, ...testimonials];
const row2 = [...testimonials.reverse(), ...testimonials];

const StarRating = () => (
  <div className="flex space-x-1 mb-4">
    {[1,2,3,4,5].map(i => (
      <svg key={i} className="w-4 h-4 text-[#FACC15]" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

export default function Testimonials() {
  const { ref: headerRef, inView: headerInView } = useScrollInView({ threshold: 0.1, triggerOnce: true });

  return (
    <section className="py-32 bg-secondary overflow-hidden relative border-y border-white/5">
      <div className="container mx-auto px-6 md:px-12 mb-20 relative z-10">
        <div ref={headerRef} className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center space-x-3 mb-6"
          >
            <span className="w-8 h-px bg-primary"></span>
            <span className="text-primary text-xs tracking-[0.2em] uppercase font-semibold">Client Success</span>
            <span className="w-8 h-px bg-primary"></span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display font-bold text-4xl md:text-6xl text-white tracking-tight"
          >
            WHAT CLIENTS SAY
          </motion.h2>
        </div>
      </div>

      {/* Mobile & tablet: single-row swipeable snap carousel */}
      <div className="lg:hidden px-6 md:px-12">
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2">
          {testimonials.map((item, i) => (
            <div
              key={i}
              className="w-[80vw] sm:w-[380px] shrink-0 snap-center p-7 rounded-2xl bg-white/[0.02] border border-white/5"
            >
              <StarRating />
              <p className="text-white text-base font-sans mb-6 leading-relaxed">"{item.quote}"</p>
              <div>
                <div className="font-display font-bold text-white">{item.author}</div>
                <div className="text-sm text-muted-foreground">{item.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: original auto-scrolling marquee, unchanged */}
      <div className="hidden lg:block relative w-full" data-cursor="drag">
        {/* Gradients to fade edges */}
        <div className="absolute top-0 left-0 bottom-0 w-32 bg-gradient-to-r from-secondary to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-secondary to-transparent z-10 pointer-events-none" />
        
        {/* Row 1 - Left */}
        <div className="flex w-[200%] mb-6 hover:[animation-play-state:paused]">
          <div className="flex w-1/2 animate-marquee-left">
            {row1.map((item, i) => (
              <div key={i} className="w-[400px] flex-shrink-0 mx-3 p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                <StarRating />
                <p className="text-white text-lg font-sans mb-6 leading-relaxed">"{item.quote}"</p>
                <div>
                  <div className="font-display font-bold text-white">{item.author}</div>
                  <div className="text-sm text-muted-foreground">{item.role}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex w-1/2 animate-marquee-left">
            {row1.map((item, i) => (
              <div key={`dup-${i}`} className="w-[400px] flex-shrink-0 mx-3 p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                <StarRating />
                <p className="text-white text-lg font-sans mb-6 leading-relaxed">"{item.quote}"</p>
                <div>
                  <div className="font-display font-bold text-white">{item.author}</div>
                  <div className="text-sm text-muted-foreground">{item.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 - Right */}
        <div className="flex w-[200%] hover:[animation-play-state:paused]">
          <div className="flex w-1/2 animate-marquee-right">
            {row2.map((item, i) => (
              <div key={i} className="w-[400px] flex-shrink-0 mx-3 p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                <StarRating />
                <p className="text-white text-lg font-sans mb-6 leading-relaxed">"{item.quote}"</p>
                <div>
                  <div className="font-display font-bold text-white">{item.author}</div>
                  <div className="text-sm text-muted-foreground">{item.role}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex w-1/2 animate-marquee-right">
            {row2.map((item, i) => (
              <div key={`dup-${i}`} className="w-[400px] flex-shrink-0 mx-3 p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                <StarRating />
                <p className="text-white text-lg font-sans mb-6 leading-relaxed">"{item.quote}"</p>
                <div>
                  <div className="font-display font-bold text-white">{item.author}</div>
                  <div className="text-sm text-muted-foreground">{item.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
