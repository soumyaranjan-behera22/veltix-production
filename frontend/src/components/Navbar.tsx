import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Services', href: '#services' },
    { name: 'Work', href: '#work' },
    { name: 'Process', href: '#process' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-3 left-3 right-3 md:top-0 md:left-0 md:right-0 z-[100] transition-all duration-300 ${
  scrolled
    ? 'py-2 md:py-4 bg-black/55 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,.35)] border-b border-white/5'
    : 'py-3 md:py-6 bg-transparent'
}`}
      >
       <div className="container mx-auto px-4 sm:px-5 md:px-12 flex items-center justify-between">
         <Link href="/" className="group flex items-center gap-2">
<img
  src="/veltix-main-logo.png"
  alt="VELTIX Logo"
  width={40}
  height={40}
  draggable={false}
  className="w-8 h-8 md:w-10 md:h-10 object-contain transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
/>
<div className="leading-none -ml-2">
  <span className="font-display font-bold text-[18px] sm:text-[20px] md:text-xl tracking-[0.12em] text-white">
    VELTIX
    <span  className="text-[#4F8CFF]">.</span>
  </span>
</div>
</Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link, i) => (
              <motion.a
                key={link.name}
                href={link.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
                className="text-sm font-sans text-muted-foreground hover:text-white transition-colors duration-300"
              >
                {link.name}
              </motion.a>
            ))}
          </div>

          <div className="hidden md:block">
            <motion.a
              href="#contact"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium tracking-wide text-white transition-all duration-300 border border-primary rounded-full hover:bg-primary interactive overflow-hidden group"
            >
              <span className="relative z-10">Start Project</span>
              <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
            </motion.a>
          </div>

          <button
className="md:hidden relative flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl z-[110]"
  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
>
            <span className={`block w-5 h-[2px] rounded-full bg-white transition-transform duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block w-5 h-[2px] rounded-full bg-white transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
            <span className={`block w-5 h-[2px] rounded-full bg-white transition-transform duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileMenuOpen && (
         <motion.div
  initial={{ opacity: 0, y: -40 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -40 }}
  transition={{ duration: .45 }}
  className="fixed inset-0 z-[90] bg-[#050505]/95 backdrop-blur-[30px]"
> 
            <div className="w-full h-full flex flex-col justify-between px-8 pt-28 pb-10">

  {/* Top */}
  <div>
    <p className="text-xs uppercase tracking-[0.35em] text-white/40 mb-10">
      Navigation
    </p>

    <div className="flex flex-col gap-5">
      {navLinks.map((link, i) => (
        <motion.a
          key={link.name}
          href={link.href}
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{
            delay: i * 0.07,
            duration: 0.45,
          }}
          onClick={() => setMobileMenuOpen(false)}
          className="group flex items-center justify-between border-b border-white/10 pb-5"
        >
          <span className="text-[34px] font-bold tracking-tight text-white transition-all duration-300 group-hover:text-[#4F8CFF]">
            {link.name}
          </span>

          <span className="text-white/30 text-xl group-hover:translate-x-2 transition-all">
            →
          </span>
        </motion.a>
      ))}
    </div>
  </div>

  {/* Bottom */}
  <div>

    <motion.a
      href="#contact"
      onClick={() => setMobileMenuOpen(false)}
      whileTap={{ scale: 0.96 }}
      className="flex justify-center items-center w-full rounded-full py-4 bg-[#4F8CFF] text-white font-semibold text-lg shadow-[0_0_40px_rgba(79,140,255,.35)]"
    >
      Start Project →
    </motion.a>

    <div className="mt-10 flex justify-between text-white/35 text-sm">
      <span>VELTIX.</span>

      <span>2026</span>
    </div>

  </div>

</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
