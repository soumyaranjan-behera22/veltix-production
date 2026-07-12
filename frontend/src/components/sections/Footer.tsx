import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#030303] pt-24 pb-12 border-t border-white/5 relative z-10">
      <div className="container mx-auto px-6 md:px-12">
        
        {/* Top Area */}
        <div className="flex flex-col lg:flex-row justify-between mb-20">
          <div className="mb-12 lg:mb-0 max-w-md">
            <Link href="/" className="inline-block mb-6 group interactive">
              <span className="font-display font-bold text-5xl tracking-[0.15em] text-white flex">
                {"VELTIX".split('').map((letter, i) => (
                  <span key={i} className="inline-block transition-transform duration-300 group-hover:-translate-y-1" style={{ transitionDelay: `${i * 0.03}s` }}>
                    {letter}
                  </span>
                ))}
              </span>
            </Link>
            <p className="text-muted-foreground font-sans text-lg">
              Crafting the web's most extraordinary digital experiences.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 lg:gap-24">
            <div>
              <h4 className="text-white font-display font-bold mb-6">Services</h4>
              <ul className="space-y-4">
                {['Web Design', 'Web Development', 'Landing Pages', 'E-Commerce', 'SEO', 'Brand Identity'].map(item => (
                  <li key={item}>
                    <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm font-sans interactive">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-display font-bold mb-6">Company</h4>
              <ul className="space-y-4">
                {['About', 'Work', 'Process', 'Pricing', 'Careers', 'Blog'].map(item => (
                  <li key={item}>
                    <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm font-sans interactive">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="col-span-2 md:col-span-1 mt-8 md:mt-0">
              <h4 className="text-white font-display font-bold mb-6">Contact</h4>
              <ul className="space-y-4">
                {['Email', 'WhatsApp', 'Twitter', 'LinkedIn', 'Dribbble'].map(item => (
                  <li key={item}>
                    <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm font-sans interactive">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Area */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-muted-foreground text-sm mb-4 md:mb-0">
            © {currentYear} VELTIX. All rights reserved.
          </p>
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-white">Made with obsession.</span>
          </div>
          <div className="flex space-x-6 text-sm mt-4 md:mt-0">
            <a href="#" className="text-muted-foreground hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-muted-foreground hover:text-white transition-colors">Terms</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
