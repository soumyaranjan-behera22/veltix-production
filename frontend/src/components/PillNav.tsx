// React Bits: PillNav (https://reactbits.dev/components/pill-nav)
// Copied into the project so we own it. Veltix edits are marked
// "Added for Veltix". The original's own phone menu was removed, because
// NavbarPill.tsx draws a custom one.
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export type PillNavItem = {
  label: string;
  href: string;
  ariaLabel?: string;
};

export interface PillNavProps {
  logo: string;
  logoAlt?: string;
  items: PillNavItem[];
  activeHref?: string;
  className?: string;
  ease?: string;
  baseColor?: string;
  pillColor?: string;
  hoveredPillTextColor?: string;
  pillTextColor?: string;
  initialLoadAnimation?: boolean;
  // Added for Veltix: let the navbar handle clicks (smooth scroll)
  onItemClick?: (href: string, e: React.MouseEvent<HTMLAnchorElement>) => void;
  onLogoClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

const PillNav: React.FC<PillNavProps> = ({
  logo,
  logoAlt = 'Logo',
  items,
  activeHref,
  className = '',
  ease = 'power3.easeOut',
  baseColor = '#fff',
  pillColor = '#120F17',
  hoveredPillTextColor = '#120F17',
  pillTextColor,
  initialLoadAnimation = true,
  onItemClick,
  onLogoClick
}) => {
  const resolvedPillTextColor = pillTextColor ?? baseColor;
  const circleRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const tlRefs = useRef<Array<gsap.core.Timeline | null>>([]);
  const activeTweenRefs = useRef<Array<gsap.core.Tween | null>>([]);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const logoTweenRef = useRef<gsap.core.Tween | null>(null);
  const navItemsRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach(circle => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement as HTMLElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        // Added for Veltix: skip while hidden (width 0 would give NaN sizes)
        if (!w || !h) return;
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`
        });

        const label = pill.querySelector<HTMLElement>('.pill-label');
        const white = pill.querySelector<HTMLElement>('.pill-label-hover');

        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        const index = circleRefs.current.indexOf(circle);
        if (index === -1) return;

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: 'auto' }, 0);

        if (label) {
          tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: 'auto' }, 0);
        }

        if (white) {
          gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(white, { y: 0, opacity: 1, duration: 2, ease, overwrite: 'auto' }, 0);
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();

    const onResize = () => layout();
    window.addEventListener('resize', onResize);

    if (document.fonts) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    if (initialLoadAnimation) {
      const logo = logoRef.current;
      const navItems = navItemsRef.current;

      if (logo) {
        gsap.set(logo, { scale: 0 });
        gsap.to(logo, { scale: 1, duration: 0.6, ease });
      }

      if (navItems) {
        gsap.set(navItems, { width: 0, overflow: 'hidden' });
        gsap.to(navItems, { width: 'auto', duration: 0.6, ease });
      }
    }

    return () => window.removeEventListener('resize', onResize);
  }, [items, ease, initialLoadAnimation]);

  const handleEnter = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), { duration: 0.3, ease, overwrite: 'auto' });
  };

  const handleLeave = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, { duration: 0.2, ease, overwrite: 'auto' });
  };

  const handleLogoEnter = () => {
    const img = logoImgRef.current;
    if (!img) return;
    logoTweenRef.current?.kill();
    gsap.set(img, { rotate: 0 });
    logoTweenRef.current = gsap.to(img, { rotate: 360, duration: 0.2, ease, overwrite: 'auto' });
  };

  const cssVars = {
    ['--base']: baseColor,
    ['--pill-bg']: pillColor,
    ['--hover-text']: hoveredPillTextColor,
    ['--pill-text']: resolvedPillTextColor,
    ['--nav-h']: '46px', // Added for Veltix: slightly taller than the default 42px
    ['--logo']: '36px',
    ['--pill-pad-x']: '18px',
    ['--pill-gap']: '3px'
  } as React.CSSProperties;

  return (
    // Added for Veltix: positioning is left to the navbar, so no absolute wrapper
    <nav className={`flex w-max items-center ${className}`} aria-label="Main" style={cssVars}>
      <a
        href="#top"
        aria-label="Veltix, back to top"
        onMouseEnter={handleLogoEnter}
        onClick={onLogoClick}
        ref={logoRef}
        className="interactive inline-flex items-center justify-center overflow-hidden rounded-full p-2.5"
        style={{ width: 'var(--nav-h)', height: 'var(--nav-h)', background: 'var(--base, #000)' }}
      >
        <img src={logo} alt={logoAlt} ref={logoImgRef} className="block h-full w-full object-contain" />
      </a>

      <div
        ref={navItemsRef}
        className="relative ml-2 flex items-center rounded-full"
        style={{ height: 'var(--nav-h)', background: 'var(--base, #000)' }}
      >
        <ul className="m-0 flex h-full list-none items-stretch p-[3px]" style={{ gap: 'var(--pill-gap)' }}>
          {items.map((item, i) => {
            const isActive = activeHref === item.href;
            return (
              <li key={item.href} className="flex h-full">
                <a
                  href={item.href}
                  aria-label={item.ariaLabel || item.label}
                  aria-current={isActive ? 'true' : undefined}
                  onMouseEnter={() => handleEnter(i)}
                  onMouseLeave={() => handleLeave(i)}
                  onClick={e => onItemClick?.(item.href, e)}
                  // Added for Veltix: sentence case in the site's font instead of bold uppercase
                  className="interactive relative box-border inline-flex h-full cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap rounded-full font-sans text-[14px] font-medium leading-[0] no-underline"
                  style={{
                    background: 'var(--pill-bg, #fff)',
                    color: 'var(--pill-text, var(--base, #000))',
                    paddingLeft: 'var(--pill-pad-x)',
                    paddingRight: 'var(--pill-pad-x)'
                  }}
                >
                  <span
                    className="pointer-events-none absolute bottom-0 left-1/2 z-[1] block rounded-full"
                    style={{ background: 'var(--base, #000)', willChange: 'transform' }}
                    aria-hidden="true"
                    ref={el => {
                      circleRefs.current[i] = el;
                    }}
                  />
                  <span className="relative z-[2] inline-block leading-[1]">
                    <span className="pill-label relative z-[2] inline-block leading-[1]" style={{ willChange: 'transform' }}>
                      {item.label}
                    </span>
                    <span
                      className="pill-label-hover absolute left-0 top-0 z-[3] inline-block"
                      style={{ color: 'var(--hover-text, #fff)', willChange: 'transform, opacity' }}
                      aria-hidden="true"
                    >
                      {item.label}
                    </span>
                  </span>
                  {isActive && (
                    <span
                      className="absolute -bottom-[6px] left-1/2 z-[4] h-3 w-3 -translate-x-1/2 rounded-full"
                      style={{ background: 'var(--base, #000)' }}
                      aria-hidden="true"
                    />
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default PillNav;
