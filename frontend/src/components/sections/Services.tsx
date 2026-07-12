import React from 'react';
import { motion } from 'framer-motion';
import { useScrollInView } from '@/lib/useScrollInView';
import { 
  Layout, 
  Code2, 
  MousePointerClick, 
  ShoppingCart, 
  Search, 
  Fingerprint, 
  RefreshCcw, 
  Sparkles 
} from 'lucide-react';

const services = [
  { icon: Layout, title: "Web Design", desc: "Award-winning UI/UX that captures attention and builds trust." },
  { icon: Code2, title: "Web Development", desc: "React, Next.js, and modern stacks built for scale and speed." },
  { icon: MousePointerClick, title: "Landing Pages", desc: "High-converting single pages optimized for specific campaigns." },
  { icon: ShoppingCart, title: "E-Commerce", desc: "Bespoke Shopify and headless commerce experiences." },
  { icon: Search, title: "SEO Optimization", desc: "Technical and content SEO to dominate search rankings." },
  { icon: Fingerprint, title: "Brand Identity", desc: "Cohesive visual systems from logos to typography." },
  { icon: RefreshCcw, title: "Website Redesign", desc: "Transform outdated sites into modern conversion machines." },
  { icon: Sparkles, title: "AI Integrations", desc: "Smart features powered by OpenAI and custom models." }
];

export default function Services() {
  const { ref: headerRef, inView: headerInView } = useScrollInView({ threshold: 0.1, triggerOnce: true });
  const { ref: gridRef, inView: gridInView } = useScrollInView({ threshold: 0.1, triggerOnce: true });

  return (
    <section id="services" className="py-32 relative bg-secondary">
      <div className="container mx-auto px-6 md:px-12">
        
        <div ref={headerRef} className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center space-x-3 mb-6"
          >
            <span className="w-8 h-px bg-primary"></span>
            <span className="text-primary text-xs tracking-[0.2em] uppercase font-semibold">Capabilities</span>
            <span className="w-8 h-px bg-primary"></span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="font-display font-bold text-5xl md:text-7xl text-white tracking-tight uppercase"
          >
            What We Build
          </motion.h2>
        </div>

        {/* Mobile & tablet: horizontal swipe/snap carousel */}
        <div ref={gridRef}>
        <div
          
          className="lg:hidden -mx-6 md:-mx-12 flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none px-6 md:px-12 pb-2"
        >
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={gridInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.06, ease: "easeOut" }}
                className="group relative shrink-0 w-[78vw] sm:w-[340px] snap-center p-7 bg-card rounded-2xl border border-white/5 active:border-primary/60 transition-all duration-300 overflow-hidden interactive"
              >
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-[#1A1A1A] border border-white/10 flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="font-display font-semibold text-xl text-white mb-3">{service.title}</h3>
                  <p className="text-sm text-muted-foreground mb-6">{service.desc}</p>

                  <div className="flex items-center text-primary text-sm font-medium">
                    Learn more <span className="ml-2">→</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Desktop: original grid, unchanged */}
        <div className="hidden lg:grid grid-cols-4 gap-6">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={gridInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group relative p-8 bg-card rounded-2xl border border-white/5 hover:border-primary hover:shadow-[0_0_30px_rgba(79,140,255,0.15)] transition-all duration-300 overflow-hidden interactive"
              >
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-[#1A1A1A] border border-white/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 group-hover:border-primary/50 transition-colors duration-300">
                    <Icon className="w-6 h-6 text-white group-hover:text-primary transition-colors" />
                  </div>
                  
                  <h3 className="font-display font-semibold text-xl text-white mb-3">{service.title}</h3>
                  <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{service.desc}</p>
                  
                  <div className="flex items-center text-primary text-sm font-medium opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    Learn more <span className="ml-2">→</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        </div>
      </div>
    </section>
  );
}
