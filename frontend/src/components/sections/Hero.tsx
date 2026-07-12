import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from 'framer-motion';
import { ArrowUpRight, MousePointer2 } from 'lucide-react';

const MagnetButton = ({ children, className, ...props }: any) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.3, y: middleY * 0.3 });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default function Hero() {
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springX = useSpring(mouseX, { damping: 50, stiffness: 400 });
  const springY = useSpring(mouseY, { damping: 50, stiffness: 400 });

  // Cursor-tracked spotlight — follows the actual pointer instead of sitting static
  const spotlightBackground = useMotionTemplate`radial-gradient(circle 600px at ${springX}px ${springY}px, rgba(79, 140, 255, 0.15), transparent 40%)`;

  // Scroll-linked depth: as the user scrolls past the Hero, the floating
  // cards and headline drift at slightly different rates for a parallax feel
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const cardsY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const cardsOpacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 1, 0]);
  const headlineY = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const headlineOpacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 1, 0.3]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const veltixLetters = "VELTIX".split("");

  return (
    <div ref={containerRef} className="relative min-h-[100dvh] w-full overflow-hidden flex items-center pt-20">
      {/* Spotlight — tracks the cursor in real time */}
      <motion.div 
        className="pointer-events-none absolute inset-0 z-0 opacity-30 hidden md:block"
        style={{
          background: spotlightBackground,
        }}
      />
      <motion.div 
        className="pointer-events-none absolute z-0 w-[600px] h-[600px] rounded-full opacity-30 blur-[100px]"
        style={{
          background: 'rgba(79, 140, 255, 0.3)',
          x: useTransform(springX, (x) => x - 300),
          y: useTransform(springY, (y) => y - 300),
        }}
      />

      {/* Orbs */}
      <motion.div 
        animate={{ 
          x: [0, 100, 0, -100, 0],
          y: [0, 50, -50, 0, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[10%] left-[20%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"
      />
      <motion.div 
        animate={{ 
          x: [0, -150, 0, 150, 0],
          y: [0, -100, 100, 0, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] right-[10%] w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"
      />

      {/* Loading Overlay */}
      {isLoading && (
        <motion.div 
          initial={{ y: 0 }}
          animate={{ y: "-100%" }}
          transition={{ duration: 0.8, delay: 1.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[200] bg-[#050505] flex flex-col items-center justify-center"
        >
          <div className="flex space-x-2">
            {veltixLetters.map((letter, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
                className="font-display font-bold text-6xl md:text-8xl text-white tracking-widest"
              >
                {letter}
              </motion.span>
            ))}
          </div>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "200px" }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-0.5 bg-primary mt-8"
          />
        </motion.div>
      )}

      {/* Grid Background */}
      <div className="absolute inset-0 z-0 opacity-[0.03]" 
           style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '64px 64px' }} />

      {/* ============================================================
          MOBILE & TABLET HERO (< lg) — editorial composition, isolated
          from the desktop hero below. Desktop markup is untouched.
      ============================================================ */}
      <div className="lg:hidden w-full px-6 relative z-10">

        {/* Floating ambient glows, mobile-only */}
        <motion.div
          animate={{ y: [0, -16, 0], x: [0, 8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -top-8 right-[-10%] w-52 h-52 rounded-full bg-primary/25 blur-[70px]"
        />
        <motion.div
          animate={{ y: [0, 14, 0], x: [0, -10, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          className="pointer-events-none absolute top-[38%] left-[-15%] w-56 h-56 rounded-full bg-purple-500/15 blur-[80px]"
        />

        {/* Eyebrow pill + floating stat chip — asymmetric editorial row */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? 16 : 0 }}
            transition={{ duration: 0.6, delay: 2.05 }}
            className="inline-flex items-center gap-2 pl-3 pr-4 py-2 rounded-full glass-card"
          >
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex w-full h-full rounded-full bg-primary opacity-75 animate-ping" />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-primary" />
            </span>
            <span className="text-primary text-[11px] font-sans tracking-[0.18em] uppercase font-semibold">Digital Experiences</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={
              isLoading
                ? { opacity: 0, scale: 0.8, y: 10 }
                : { opacity: 1, scale: 1, y: [0, -6, 0] }
            }
            transition={{
              opacity: { duration: 0.6, delay: 2.7 },
              scale: { duration: 0.6, delay: 2.7 },
              y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 3.2 },
            }}
            className="glass-card rounded-2xl pl-3 pr-4 py-2 shadow-2xl flex items-center gap-2.5 flex-shrink-0"
          >
            <div className="w-2 h-2 rounded-full bg-[#00FF66] shadow-[0_0_8px_#00FF66] flex-shrink-0" />
            <div>
              <div className="text-[9px] text-muted-foreground leading-none mb-0.5">Lighthouse</div>
              <div className="font-display font-bold text-lg text-white leading-none">98</div>
            </div>
          </motion.div>
        </div>

        {/* Headline */}
        <div className="relative font-display font-bold leading-[0.92] tracking-tight mb-5">
          <motion.div
            initial={{ clipPath: "inset(100% 0 0 0)", y: 16 }}
            animate={{ clipPath: isLoading ? "inset(100% 0 0 0)" : "inset(0% 0 0 0)", y: isLoading ? 16 : 0 }}
            transition={{ duration: 0.7, delay: 2.15, ease: [0.76, 0, 0.24, 1] }}
          >
            <h1 className="text-[clamp(40px,13vw,64px)] text-white m-0 p-0">WE BUILD</h1>
          </motion.div>

          <motion.div
            initial={{ clipPath: "inset(100% 0 0 0)", y: 16 }}
            animate={{ clipPath: isLoading ? "inset(100% 0 0 0)" : "inset(0% 0 0 0)", y: isLoading ? 16 : 0 }}
            transition={{ duration: 0.7, delay: 2.3, ease: [0.76, 0, 0.24, 1] }}
          >
            <h1 className="text-[clamp(40px,13vw,64px)] text-white m-0 p-0">WEBSITES</h1>
          </motion.div>

          <motion.div
            initial={{ clipPath: "inset(100% 0 0 0)", y: 16 }}
            animate={{ clipPath: isLoading ? "inset(100% 0 0 0)" : "inset(0% 0 0 0)", y: isLoading ? 16 : 0 }}
            transition={{ duration: 0.7, delay: 2.45, ease: [0.76, 0, 0.24, 1] }}
          >
            <h1 className="text-[clamp(40px,13vw,64px)] bg-clip-text text-transparent bg-gradient-to-r from-primary via-[#8AAFFF] to-muted-foreground m-0 p-0">
              THAT WIN.
            </h1>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? 16 : 0 }}
          transition={{ duration: 0.6, delay: 2.6 }}
          className="text-muted-foreground font-sans text-base max-w-[420px] mb-7 leading-relaxed"
        >
          Premium web experiences crafted for ambitious startups, creators, and businesses.
        </motion.p>

        {/* Large, thumb-friendly CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? 16 : 0 }}
          transition={{ duration: 0.6, delay: 2.75 }}
          className="flex flex-col gap-3.5 mb-6"
        >
          <MagnetButton className="group relative h-16 w-full rounded-2xl bg-primary text-white font-semibold text-base interactive shadow-[0_10px_35px_rgba(79,140,255,0.35)] active:scale-[0.97] transition-transform">
            <span className="flex items-center justify-center gap-2">
              <span>Start Your Project</span>
              <ArrowUpRight className="w-5 h-5 group-active:rotate-45 transition-transform duration-300" />
            </span>
          </MagnetButton>

          <MagnetButton className="h-16 w-full rounded-2xl bg-white/5 backdrop-blur-md border border-white/15 text-white font-medium text-base interactive active:bg-white/10 transition-colors">
            View Our Work
          </MagnetButton>
        </motion.div>

        {/* Combined stats + social proof panel — premium glass card, no scrolling required */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? 16 : 0 }}
          transition={{ duration: 0.6, delay: 2.95 }}
          className="glass-card rounded-2xl p-4 mb-8"
        >
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div>
              <div className="font-display text-xl font-bold text-white leading-tight">+127%</div>
              <div className="text-[10px] text-muted-foreground leading-tight">Revenue</div>
            </div>
            <div className="border-l border-white/10 pl-2">
              <div className="font-display text-xl font-bold text-white leading-tight">98</div>
              <div className="text-[10px] text-muted-foreground leading-tight">Lighthouse</div>
            </div>
            <div className="border-l border-white/10 pl-2">
              <div className="font-display text-xl font-bold text-white leading-tight flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5 text-[#00FF66] mr-0.5" />
                340%
              </div>
              <div className="text-[10px] text-muted-foreground leading-tight">Traffic</div>
            </div>
          </div>
          <div className="h-px bg-white/10 mb-4" />
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3 flex-shrink-0">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold ${i === 1 ? 'bg-[#4F8CFF] text-white' : i === 2 ? 'bg-[#2A2A2A] text-white' : 'bg-[#E0E0E0] text-black'}`}>
                  {i === 1 ? 'NL' : i === 2 ? 'OR' : 'LM'}
                </div>
              ))}
            </div>
            <div className="flex flex-col">
              <span className="text-white font-medium text-sm leading-tight">3 projects launched</span>
              <span className="text-muted-foreground text-xs leading-tight">this week</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10 flex flex-col lg:flex-row items-center w-full">
        
        {/* Left Content — desktop only (lg+); mobile/tablet has its own hero above */}
        <motion.div 
          style={{ y: headlineY, opacity: headlineOpacity }}
          className="hidden lg:flex w-full lg:w-[55%] flex-col items-start justify-center z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? 20 : 0 }}
            transition={{ duration: 0.6, delay: 2.1 }}
            className="flex items-center space-x-3 mb-6"
          >
            <span className="w-8 h-px bg-primary"></span>
            <span className="text-primary text-xs md:text-sm font-sans tracking-[0.2em] uppercase font-semibold">Digital Experiences</span>
          </motion.div>

          <div className="font-display font-bold leading-[0.95] tracking-tight mb-8">
            <motion.div
              initial={{ clipPath: "inset(100% 0 0 0)", y: 20 }}
              animate={{ clipPath: isLoading ? "inset(100% 0 0 0)" : "inset(0% 0 0 0)", y: isLoading ? 20 : 0 }}
              transition={{ duration: 0.8, delay: 2.2, ease: [0.76, 0, 0.24, 1] }}
            >
              <h1 className="text-[clamp(46px,10.5vw,128px)] text-white m-0 p-0">WE BUILD</h1>
            </motion.div>
            
            <motion.div
              initial={{ clipPath: "inset(100% 0 0 0)", y: 20 }}
              animate={{ clipPath: isLoading ? "inset(100% 0 0 0)" : "inset(0% 0 0 0)", y: isLoading ? 20 : 0 }}
              transition={{ duration: 0.8, delay: 2.35, ease: [0.76, 0, 0.24, 1] }}
            >
              <h1 className="text-[clamp(46px,10.5vw,128px)] text-white m-0 p-0 relative inline-block">
                WEBSITES
              </h1>
            </motion.div>
            
            <motion.div
              initial={{ clipPath: "inset(100% 0 0 0)", y: 20 }}
              animate={{ clipPath: isLoading ? "inset(100% 0 0 0)" : "inset(0% 0 0 0)", y: isLoading ? 20 : 0 }}
              transition={{ duration: 0.8, delay: 2.5, ease: [0.76, 0, 0.24, 1] }}
            >
              <h1 className="text-[clamp(46px,10.5vw,128px)] bg-clip-text text-transparent bg-gradient-to-r from-primary via-[#8AAFFF] to-muted-foreground m-0 p-0 pr-4">
                THAT WIN.
              </h1>
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? 20 : 0 }}
            transition={{ duration: 0.6, delay: 2.7 }}
            className="text-muted-foreground font-sans text-lg md:text-xl max-w-[440px] mb-10 leading-relaxed"
          >
            Premium web experiences crafted for ambitious startups, creators, and businesses.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? 20 : 0 }}
            transition={{ duration: 0.6, delay: 2.9 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 w-full sm:w-auto"
          >
            <MagnetButton className="group relative h-14 px-8 rounded-full bg-primary text-white font-medium interactive hover:shadow-[0_0_30px_rgba(79,140,255,0.4)] transition-shadow w-full sm:w-auto">
              <span className="flex items-center justify-center space-x-2">
                <span>Start Your Project</span>
                <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
              </span>
            </MagnetButton>
            
            <MagnetButton className="h-14 px-8 rounded-full bg-transparent border border-white/20 text-white font-medium interactive hover:border-white transition-colors w-full sm:w-auto">
              View Our Work
            </MagnetButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoading ? 0 : 1 }}
            transition={{ duration: 1, delay: 3.2 }}
            className="mt-12 flex items-center space-x-4"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`w-10 h-10 rounded-full border-2 border-background flex items-center justify-center text-xs font-bold ${i===1?'bg-[#4F8CFF] text-white':i===2?'bg-[#2A2A2A] text-white':'bg-[#E0E0E0] text-black'}`}>
                  {i===1?'NL':i===2?'OR':'LM'}
                </div>
              ))}
            </div>
            <div className="flex flex-col">
              <span className="text-white font-medium text-sm">3 projects launched</span>
              <span className="text-muted-foreground text-xs">this week</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Content - Abstract UI Cards */}
        <motion.div 
          style={{ y: cardsY, opacity: cardsOpacity }}
          className="w-full lg:w-[45%] h-[600px] hidden lg:block relative z-10 perspective-[1000px]">
          
          {/* Card 1: Revenue (Top Center) */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? 50 : 0 }}
            transition={{ duration: 0.8, delay: 2.6 }}
            className="absolute top-10 left-[15%] w-64 p-5 glass-card rounded-2xl shadow-2xl z-20"
            style={{
              x: useTransform(springX, (x) => (x - 500) * -0.05),
              y: useTransform(springY, (y) => (y - 500) * -0.05),
            }}
          >
            <div className="text-xs text-muted-foreground mb-1">Revenue Growth</div>
            <div className="font-display text-3xl font-bold text-white mb-4">+127%</div>
            <div className="flex items-end justify-between h-16 space-x-2">
              {[40, 60, 45, 80, 55, 100].map((h, i) => (
                <motion.div 
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 1, delay: 3 + i * 0.1 }}
                  className={`w-full rounded-sm ${i === 5 ? 'bg-primary' : 'bg-white/10'}`}
                />
              ))}
            </div>
          </motion.div>

          {/* Card 2: Performance (Right Side) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: isLoading ? 0 : 1, x: isLoading ? 50 : 0 }}
            transition={{ duration: 0.8, delay: 2.8 }}
            className="absolute top-[35%] right-0 w-48 p-5 glass-card rounded-2xl shadow-2xl z-30"
            style={{
              x: useTransform(springX, (x) => (x - 500) * -0.08),
              y: useTransform(springY, (y) => (y - 500) * -0.08),
            }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="text-xs text-muted-foreground">Lighthouse</div>
              <div className="w-2 h-2 rounded-full bg-[#00FF66] shadow-[0_0_10px_#00FF66]" />
            </div>
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="none" />
                <motion.circle 
                  cx="48" cy="48" r="40" stroke="#00FF66" strokeWidth="6" fill="none" 
                  strokeDasharray="251.2"
                  initial={{ strokeDashoffset: 251.2 }}
                  animate={{ strokeDashoffset: 251.2 * 0.02 }}
                  transition={{ duration: 1.5, delay: 3.2, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display font-bold text-2xl text-white">98</span>
              </div>
            </div>
          </motion.div>

          {/* Card 3: SEO (Bottom Left) */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? 50 : 0 }}
            transition={{ duration: 0.8, delay: 2.9 }}
            className="absolute bottom-10 left-0 w-56 p-5 glass-card rounded-2xl shadow-2xl z-10"
            style={{
              x: useTransform(springX, (x) => (x - 500) * -0.03),
              y: useTransform(springY, (y) => (y - 500) * -0.03),
            }}
          >
            <div className="text-xs text-muted-foreground mb-3">Organic Traffic</div>
            <div className="text-white font-medium text-lg mb-4 flex items-center">
              <ArrowUpRight className="w-4 h-4 text-[#00FF66] mr-1" />
              340%
            </div>
            <div className="space-y-2">
              {[
                { k: 'web design agency', r: 1 },
                { k: 'premium websites', r: 2 },
                { k: 'react development', r: 3 }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center bg-white/5 rounded px-2 py-1.5">
                  <span className="text-[10px] text-white/70 truncate w-24">{item.k}</span>
                  <span className="text-xs font-bold text-primary">#{item.r}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Card 4: Design (Middle Right) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: isLoading ? 0 : 1, scale: isLoading ? 0.9 : 1 }}
            transition={{ duration: 0.8, delay: 3.0 }}
            className="absolute bottom-20 right-10 w-40 p-4 glass-card rounded-2xl shadow-2xl z-20"
            style={{
              x: useTransform(springX, (x) => (x - 500) * -0.06),
              y: useTransform(springY, (y) => (y - 500) * -0.06),
            }}
          >
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Design System</div>
            <div className="flex space-x-2 mb-4">
              <div className="w-6 h-6 rounded bg-[#050505] border border-white/20" />
              <div className="w-6 h-6 rounded bg-[#111111] border border-white/20" />
              <div className="w-6 h-6 rounded bg-primary" />
            </div>
            <div className="space-y-1">
              <div className="font-display font-bold text-white text-sm">Space Grotesk</div>
              <div className="font-sans text-muted-foreground text-xs">Aa Bb Cc</div>
            </div>
          </motion.div>

          {/* Card 5: AI (Top Right) */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? -20 : 0 }}
            transition={{ duration: 0.8, delay: 2.7 }}
            className="absolute top-0 right-[15%] px-4 py-2 glass-card rounded-full shadow-2xl z-40 flex items-center space-x-2"
            style={{
              x: useTransform(springX, (x) => (x - 500) * -0.04),
              y: useTransform(springY, (y) => (y - 500) * -0.04),
            }}
          >
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-purple-500 animate-pulse" />
            <span className="text-xs font-medium text-white">AI Powered</span>
          </motion.div>
          
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 1, delay: 3.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center z-20"
      >
        <span className="text-[10px] font-sans tracking-[0.3em] text-muted-foreground mb-4 uppercase">Scroll</span>
        <div className="w-px h-12 bg-white/10 relative overflow-hidden">
          <motion.div 
            animate={{ y: [-48, 48] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-0 w-full h-full bg-primary"
          />
        </div>
      </motion.div>
    </div>
  );
}
