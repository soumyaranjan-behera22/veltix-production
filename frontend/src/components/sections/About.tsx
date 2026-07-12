import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useScrollInView } from '@/lib/useScrollInView';

const StatCounter = ({ value, suffix, label, duration = 2 }: { value: number, suffix: string, label: string, duration?: number }) => {
  const [count, setCount] = useState(0);
  const { ref, inView: isInView } = useScrollInView({ threshold: 0.5, triggerOnce: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = parseInt(value.toString().substring(0, 3));
    if (start === end) return;

    const totalMilSecDur = duration * 1000;
    const incrementTime = (totalMilSecDur / end) * 2;

    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration, isInView]);

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="flex flex-col items-center md:items-start">
      <div className="font-display font-bold text-5xl md:text-6xl text-white mb-2 flex">
        {count}
        <span className="text-primary">{suffix}</span>
      </div>
      <div className="text-sm font-sans tracking-wider text-muted-foreground uppercase">{label}</div>
    </div>
  );
};

export default function About() {
  const { ref: sectionARef, inView: sectionAInView } = useScrollInView({ threshold: 0.15, triggerOnce: true });
  const { ref: sectionBRef, inView: sectionBInView } = useScrollInView({ threshold: 0.15, triggerOnce: true });
  const { ref: sectionCRef, inView: sectionCInView } = useScrollInView({ threshold: 0.15, triggerOnce: true });

  return (
    <section id="about" className="py-32 relative bg-background overflow-hidden z-10">
      <div className="container mx-auto px-6 md:px-12">
        
        {/* Section A: Story */}
        <div ref={sectionARef} className="flex flex-col lg:flex-row items-center justify-between mb-40 relative">
          <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -z-10 select-none pointer-events-none opacity-[0.03]">
            <span className="font-display font-bold text-[300px] leading-none">07</span>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={sectionAInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full lg:w-1/2 mb-16 lg:mb-0"
          >
            <div className="flex items-center space-x-3 mb-6">
              <span className="w-8 h-px bg-primary"></span>
              <span className="text-primary text-xs tracking-[0.2em] uppercase font-semibold">Years of Craft</span>
            </div>
            <h2 className="font-display font-bold text-4xl md:text-6xl text-white leading-tight mb-8">
              We don't build websites.<br />
              <span className="text-gradient">We architect digital experiences</span><br />
              that compound over time.
            </h2>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={sectionAInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="w-full lg:w-[40%]"
          >
            <p className="text-xl text-muted-foreground font-sans leading-relaxed">
              Founded in 2017, VELTIX has shipped 200+ projects across SaaS, E-commerce, Fintech, and Creator Economy. We treat every pixel as a promise and every line of code as craft.
            </p>
          </motion.div>
        </div>

        {/* Section B: Stats */}
        <div ref={sectionBRef} className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-40 border-y border-white/5 py-16">
          <StatCounter value={200} suffix="+" label="Projects Delivered" />
          <StatCounter value={98} suffix="%" label="Client Satisfaction" />
          <StatCounter value={40} suffix="M+" label="Users Reached" />
          <StatCounter value={12} suffix="" label="Industry Awards" />
        </div>

        {/* Section C: Philosophy */}
        <div ref={sectionCRef} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Obsessive Craft", desc: "Every micro-interaction is considered. We don't stop when it works; we stop when it feels perfect." },
            { title: "Performance First", desc: "Speed is a feature. We architect lightweight, blazing-fast experiences that rank high and convert better." },
            { title: "Conversion Driven", desc: "Beauty without function is art. We build design systems that guide users toward your business goals." }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={sectionCInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="glass-card p-8 rounded-2xl border-t-2 border-t-primary border-x-white/5 border-b-white/5 group hover:bg-[#111] transition-colors"
            >
              <h3 className="font-display font-bold text-2xl text-white mb-4 group-hover:text-primary transition-colors">{item.title}</h3>
              <p className="text-muted-foreground font-sans leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
