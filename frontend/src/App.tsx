import { useEffect } from 'react';
import Lenis from "lenis";
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Section components
import Cursor from '@/components/Cursor';
import Navbar from '@/components/Navbar';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Services from '@/components/sections/Services';
import WhyVeltix from '@/components/sections/WhyVeltix';
import Process from '@/components/sections/Process';
import Projects from '@/components/sections/Projects';
import Testimonials from '@/components/sections/Testimonials';
import Pricing from '@/components/sections/Pricing';
import FAQ from '@/components/sections/FAQ';
import Contact from '@/components/sections/Contact';
import Footer from '@/components/sections/Footer';

const queryClient = new QueryClient();

function Home() {
  return (
        <div className="relative w-full overflow-x-clip bg-background">
      <Cursor />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <WhyVeltix />
        <Process />
        <Projects />
        <Testimonials />
        <Pricing />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Force dark mode
    document.documentElement.classList.add('dark');

    // Lenis smooth scroll
   const lenis = new Lenis({
  duration: 1.2,
  lerp: 0.08,
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 1.5,
});
// Make Lenis globally available
(window as any).lenis = lenis;

    gsap.registerPlugin(ScrollTrigger);

    // Bridge Lenis into GSAP's ticker — store the reference for clean removal
    lenis.on('scroll', ScrollTrigger.update);
    const tickerCallback = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
  gsap.ticker.remove(tickerCallback);
  lenis.off("scroll", ScrollTrigger.update);

  delete (window as any).lenis;

  lenis.destroy();
};
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
