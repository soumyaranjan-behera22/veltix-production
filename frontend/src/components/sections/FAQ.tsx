import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollInView } from '@/lib/useScrollInView';
import SectionHeading from "@/components/SectionHeading";

const faqs = [
  {
    q: "How long does a typical project take?",
    a: "Most projects take 2-6 weeks depending on scope. Landing pages in 1-2 weeks, complex platforms in 4-8 weeks."
  },
  {
    q: "Do you work with startups?",
    a: "Absolutely. Many of our best projects started with early-stage founders who had big visions."
  },
  {
    q: "What's included in the design process?",
    a: "Discovery, wireframing, UI design, prototyping, and design handoff documentation."
  },
  {
    q: "Can you redesign my existing website?",
    a: "Yes — website redesigns are one of our most requested services. We audit the current site, identify performance bottlenecks, and completely revamp the UX/UI."
  },
  {
    q: "Do you offer ongoing support?",
    a: "Yes, we offer monthly retainers for maintenance, updates, and growth optimization."
  },
  {
    q: "What technologies do you use?",
    a: "React, Next.js, TypeScript, Node.js, Three.js, Framer Motion, and Tailwind CSS. We use the modern stack for modern results."
  },
  {
    q: "Do you sign NDAs?",
    a: "Absolutely. We treat every project with complete confidentiality and are happy to sign your standard NDA before discovery."
  },
  {
    q: "How do we get started?",
    a: "Click 'Start Your Project', fill out the brief, and we'll schedule a discovery call within 24 hours to discuss your goals."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { ref, inView } = useScrollInView({ threshold: 0.1, triggerOnce: true });

  const toggleOpen = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-32 bg-secondary border-t border-white/5">
      <div className="container mx-auto px-6 md:px-12 max-w-4xl" ref={ref}>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center space-x-3 mb-6">
            <span className="w-8 h-px bg-primary"></span>
            <span className="text-primary text-xs tracking-[0.2em] uppercase font-semibold">Answers</span>
            <span className="w-8 h-px bg-primary"></span>
          </div>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-white tracking-tight">
            FREQUENTLY ASKED
          </h2>
        </motion.div>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="border-b border-white/10"
            >
              <button
                onClick={() => toggleOpen(i)}
                className="w-full py-6 flex items-center justify-between text-left focus:outline-none interactive group"
              >
                <span className="font-display font-medium text-lg text-white group-hover:text-primary transition-colors pr-8">
                  {faq.q}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === i ? 45 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0 text-white/50 group-hover:text-primary"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </motion.div>
              </button>
              
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="pb-6 text-muted-foreground font-sans leading-relaxed">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
