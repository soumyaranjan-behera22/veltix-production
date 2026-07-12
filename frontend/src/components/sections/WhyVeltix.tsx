import React from 'react';
import { motion } from 'framer-motion';
import { useScrollInView } from '@/lib/useScrollInView';
import { Zap, Target, Smartphone, Paintbrush, TrendingUp, Layers } from 'lucide-react';

const advantages = [
  {
    icon: Zap,
    title: "Lightning Fast",
    stat: "< 0.5s",
    subtext: "Load Time",
    desc: "We use edge computing and modern frameworks to ensure your site loads instantly worldwide.",
    featured: true
  },
  {
    icon: Target,
    title: "SEO Optimized",
    stat: "Page 1",
    subtext: "Results",
    desc: "Built-in technical SEO that search engines love.",
    featured: false
  },
  {
    icon: Smartphone,
    title: "100% Responsive",
    stat: "All",
    subtext: "Devices",
    desc: "Flawless rendering on every screen size and orientation.",
    featured: false
  },
  {
    icon: Paintbrush,
    title: "Premium UI",
    stat: "Awards",
    subtext: "Winning",
    desc: "Design that elevates your brand perception instantly.",
    featured: false
  },
  {
    icon: TrendingUp,
    title: "Conversion Focused",
    stat: "+340%",
    subtext: "Avg. Conversion",
    desc: "Data-driven layouts designed specifically to turn your visitors into paying customers.",
    featured: true
  },
  {
    icon: Layers,
    title: "Modern Tech",
    stat: "React",
    subtext: "Ecosystem",
    desc: "Built on the same technology powering top tech companies.",
    featured: false
  }
];

export default function WhyVeltix() {
  const { ref: headerRef, inView: headerInView } = useScrollInView({ threshold: 0.1, triggerOnce: true });
  const { ref: gridRef, inView: gridInView } = useScrollInView({ threshold: 0.1, triggerOnce: true });

  return (
    <section className="py-32 bg-background relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        
        <div ref={headerRef} className="flex flex-col items-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex items-center space-x-3 mb-6"
          >
            <span className="text-primary text-xs tracking-[0.2em] uppercase font-semibold">The Veltix Advantage</span>
          </motion.div>
          
          <div className="relative flex items-center justify-center w-full max-w-4xl mx-auto">
            <motion.h2 
              initial={{ opacity: 0, x: -50 }}
              animate={headerInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="font-display font-bold text-4xl md:text-6xl text-white"
            >
              VELTIX
            </motion.h2>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0 }}
              animate={headerInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mx-8 md:mx-16 w-16 h-16 rounded-full bg-card border border-white/10 flex items-center justify-center italic font-display font-bold text-muted-foreground relative z-10"
            >
              VS
              <div className="absolute top-1/2 left-[-100px] right-[-100px] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent -z-10" />
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, x: 50 }}
              animate={headerInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="font-display font-bold text-4xl md:text-6xl text-muted-foreground/50"
            >
              OTHERS
            </motion.h2>
          </div>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {advantages.map((adv, i) => {
            const Icon = adv.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={gridInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                className={`glass-card p-8 rounded-2xl flex flex-col justify-between group hover:border-primary/50 transition-colors ${adv.featured ? 'md:col-span-2' : 'md:col-span-1'}`}
              >
                <div>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-sans font-semibold text-white mb-2">{adv.title}</h3>
                  <p className="text-sm text-muted-foreground mb-8">{adv.desc}</p>
                </div>
                
                <div className="mt-auto">
                  <div className="font-display font-bold text-3xl text-white group-hover:text-primary transition-colors">{adv.stat}</div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{adv.subtext}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
