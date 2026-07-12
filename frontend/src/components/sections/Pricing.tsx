import React from 'react';
import { motion } from 'framer-motion';
import { useScrollInView } from '@/lib/useScrollInView';
import { Check } from 'lucide-react';

export default function Pricing() {
  const { ref: headerRef, inView: headerInView } = useScrollInView({ threshold: 0.1, triggerOnce: true });
  const { ref: gridRef, inView: gridInView } = useScrollInView({ threshold: 0.1, triggerOnce: true });

  const plans = [
    {
      name: "Starter",
      price: "₹ 11,999",
      features: [
        "Landing Page",
        "Mobile Responsive",
        "5 Sections",
        "Basic SEO",
        "14 Day Delivery",
        "1 Revision Round"
      ],
      button: "Get Started",
      featured: false
    },
    {
      name: "Business",
      price: "₹ 15,999",
      features: [
        "Custom Web Design",
        "Up to 10 Pages",
        "Advanced SEO",
        "CMS Integration",
        "Analytics Setup",
        "21 Day Delivery",
        "3 Revision Rounds",
        "Priority Support"
      ],
      button: "Start Project",
      featured: true
    },
    {
      name: "Premium",
      price: "₹ 21,999+",
      features: [
        "Full Custom Platform",
        "Unlimited Pages",
        "E-Commerce / SaaS",
        "AI Integrations",
        "Performance Optimization",
        "30 Day Delivery",
        "Unlimited Revisions",
        "Dedicated PM"
      ],
      button: "Let's Talk",
      featured: false
    }
  ];

  return (
    <section id="pricing" className="py-32 bg-background relative z-10">
      <div className="container mx-auto px-6 md:px-12">
        
        <div ref={headerRef} className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center space-x-3 mb-6"
          >
            <span className="w-8 h-px bg-primary"></span>
            <span className="text-primary text-xs tracking-[0.2em] uppercase font-semibold">Investment</span>
            <span className="w-8 h-px bg-primary"></span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display font-bold text-4xl md:text-6xl text-white tracking-tight mb-6"
          >
            TRANSPARENT PRICING
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground font-sans text-lg max-w-2xl mx-auto"
          >
            No hidden fees. No surprises. Just results.
          </motion.p>
        </div>

        {/* Mobile & tablet: horizontal swipe/snap carousel */}
          <div ref={gridRef}>
        <div
          ref={gridRef}
          className="lg:hidden -mx-6 md:-mx-12 flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-none px-6 md:px-12 pb-2"
        >
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              animate={gridInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
              className={`relative shrink-0 w-[82vw] sm:w-[360px] snap-center rounded-3xl overflow-hidden p-8 ${
                plan.featured
                  ? 'bg-gradient-to-br from-[#111] to-[#0D1B35] border border-primary/40 shadow-[0_0_50px_rgba(79,140,255,0.1)]'
                  : 'bg-card border border-white/5'
              }`}
            >
              {plan.featured && (
                <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold uppercase tracking-widest py-1 px-4 rounded-bl-lg">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="font-display font-bold text-xl text-white mb-4">{plan.name}</h3>
                <div className="flex items-baseline text-white">
                  <span className="font-display font-bold text-4xl">{plan.price}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-10">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start text-muted-foreground text-sm font-sans">
                    <Check className={`w-5 h-5 mr-3 flex-shrink-0 ${plan.featured ? 'text-primary' : 'text-white/30'}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-4 rounded-full font-medium tracking-wide transition-all duration-300 interactive ${
                  plan.featured
                    ? 'bg-primary text-white active:scale-[0.98]'
                    : 'bg-transparent border border-white/20 text-white active:bg-white/5'
                }`}
              >
                {plan.button}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Desktop: original grid, unchanged */}
        <div className="hidden lg:grid grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              animate={gridInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
              className={`relative rounded-3xl overflow-hidden p-8 ${
                plan.featured 
                  ? 'bg-gradient-to-br from-[#111] to-[#0D1B35] border border-primary/40 md:-mt-8 shadow-[0_0_50px_rgba(79,140,255,0.1)] z-10' 
                  : 'bg-card border border-white/5'
              }`}
            >
              {plan.featured && (
                <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold uppercase tracking-widest py-1 px-4 rounded-bl-lg">
                  Most Popular
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="font-display font-bold text-xl text-white mb-4">{plan.name}</h3>
                <div className="flex items-baseline text-white">
                  <span className="font-display font-bold text-4xl md:text-5xl">{plan.price}</span>
                </div>
              </div>
              
              <ul className="space-y-4 mb-10 min-h-[320px]">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start text-muted-foreground text-sm font-sans">
                    <Check className={`w-5 h-5 mr-3 flex-shrink-0 ${plan.featured ? 'text-primary' : 'text-white/30'}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button 
                className={`w-full py-4 rounded-full font-medium tracking-wide transition-all duration-300 interactive ${
                  plan.featured
                    ? 'bg-primary text-white hover:shadow-[0_0_20px_rgba(79,140,255,0.4)] hover:scale-[1.02]'
                    : 'bg-transparent border border-white/20 text-white hover:border-white hover:bg-white/5'
                }`}
              >
                {plan.button}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
      </div>
    </section>
  );
}
