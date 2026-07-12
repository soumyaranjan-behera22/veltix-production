import React from 'react';
import { motion } from 'framer-motion';
import { useScrollInView } from '@/lib/useScrollInView';

const projects = [
  {
    id: "01",
    title: "NexaBank — Digital Banking Platform",
    category: "Fintech",
    year: "2024",
    tech: ["React", "Node.js", "Stripe"],
    bgClass: "bg-gradient-to-br from-[#0D1B2A] to-[#050505]",
    colSpan: "col-span-1 md:col-span-2"
  },
  {
    id: "02",
    title: "Orion Commerce — Revolution",
    category: "E-Commerce",
    year: "2024",
    tech: ["Next.js", "Shopify", "Three.js"],
    bgClass: "bg-gradient-to-br from-[#2A1508] to-[#050505]",
    colSpan: "col-span-1"
  },
  {
    id: "03",
    title: "Luminary AI — SaaS Dashboard",
    category: "SaaS",
    year: "2023",
    tech: ["React", "Python", "OpenAI"],
    bgClass: "bg-gradient-to-br from-[#1A0B2E] to-[#050505]",
    colSpan: "col-span-1"
  }
];

export default function Projects() {
  const { ref: headerRef, inView: headerInView } = useScrollInView({ threshold: 0.1, triggerOnce: true });
  const { ref: gridRef, inView: gridInView } = useScrollInView({ threshold: 0.1, triggerOnce: true });

  return (
    <section id="work" className="py-32 bg-background relative z-10">
      <div className="container mx-auto px-6 md:px-12">
        
        <div ref={headerRef} className="flex flex-col md:flex-row md:items-end justify-between mb-20">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="flex items-center space-x-3 mb-6"
            >
              <span className="w-8 h-px bg-primary"></span>
              <span className="text-primary text-xs tracking-[0.2em] uppercase font-semibold">Portfolio</span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-display font-bold text-5xl md:text-7xl text-white tracking-tight"
            >
              FEATURED WORK
            </motion.h2>
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={headerInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-8 md:mt-0"
          >
            <button className="text-white border-b border-white pb-1 hover:text-primary hover:border-primary transition-colors interactive">
              View All Projects
            </button>
          </motion.div>
        </div>

        {/* Mobile & tablet: horizontal swipe/snap carousel */}
        <div ref={gridRef}>
        <div
          
          className="lg:hidden -mx-6 md:-mx-12 flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-none px-6 md:px-12 pb-2"
        >
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 50 }}
              animate={gridInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative shrink-0 w-[85vw] sm:w-[420px] snap-center rounded-2xl overflow-hidden aspect-[4/5] group interactive"
              data-cursor="view"
            >
              {/* Abstract Background */}
              <div className={`absolute inset-0 ${project.bgClass}`} />

              {/* Top Meta */}
              <div className="absolute top-6 left-6 right-6 flex justify-between text-white z-10">
                <span className="font-display text-xl font-bold opacity-70">{project.id}</span>
                <div className="flex space-x-4 text-xs font-sans tracking-widest uppercase opacity-70">
                  <span>{project.category}</span>
                  <span>{project.year}</span>
                </div>
              </div>

              {/* Bottom Content */}
              <div className="absolute bottom-0 left-0 w-full p-6 z-10">
                <h3 className="font-display font-bold text-2xl text-white mb-4">{project.title}</h3>

                <div className="flex flex-wrap items-center gap-3">
                  {project.tech.map((t, idx) => (
                    <span key={idx} className="px-3 py-1 text-xs text-white border border-white/20 rounded-full backdrop-blur-md bg-black/20">
                      {t}
                    </span>
                  ))}
                  <div className="ml-auto w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-white transform -rotate-45">→</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Desktop: original grid, unchanged */}
        <div className="hidden lg:grid grid-cols-2 gap-10">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 50 }}
              animate={gridInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className={`${project.colSpan} relative rounded-2xl overflow-hidden h-[600px] group interactive`}
              data-cursor="view"
            >
              {/* Abstract Background */}
              <div className={`absolute inset-0 ${project.bgClass} transition-transform duration-700 group-hover:scale-105`} />
              
              {/* Glass Overlay on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Top Meta */}
              <div className="absolute top-8 left-8 right-8 flex justify-between text-white z-10">
                <span className="font-display text-xl font-bold opacity-50 group-hover:opacity-100 transition-opacity">{project.id}</span>
                <div className="flex space-x-4 text-xs font-sans tracking-widest uppercase opacity-50 group-hover:opacity-100 transition-opacity">
                  <span>{project.category}</span>
                  <span>{project.year}</span>
                </div>
              </div>

              {/* Bottom Content */}
              <div className="absolute bottom-0 left-0 w-full p-8 translate-y-8 group-hover:translate-y-0 transition-transform duration-500 z-10">
                <h3 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">{project.title}</h3>
                
                <div className="flex flex-wrap items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                  {project.tech.map((t, idx) => (
                    <span key={idx} className="px-3 py-1 text-xs text-white border border-white/20 rounded-full backdrop-blur-md bg-black/20">
                      {t}
                    </span>
                  ))}
                  <div className="ml-auto w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-white transform -rotate-45 group-hover:rotate-0 transition-transform duration-300">→</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}
