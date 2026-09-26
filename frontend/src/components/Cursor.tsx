import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * Custom cursor — uses motion values directly (no React state updates on
 * mousemove) to avoid re-rendering the component on every frame. Only
 * the boolean hover state triggers a re-render, which happens infrequently.
 */
export default function Cursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [hoverText, setHoverText] = useState('');

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const springCfg = { damping: 28, stiffness: 320, mass: 0.5 };
  const ringX = useSpring(rawX, springCfg);
  const ringY = useSpring(rawY, springCfg);

  useEffect(() => {
    const touch =
    window.matchMedia("(pointer: coarse)").matches ||
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0;

  setIsTouchDevice(touch);

  if (touch) return;
    const onMove = (e: MouseEvent) => {
      rawX.set(e.clientX);
      rawY.set(e.clientY);
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive =
        target.closest('a') ||
        target.closest('button') ||
        target.closest('.interactive') ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('select');

      const projectCard = target.closest('[data-cursor="view"]');
      const marquee = target.closest('[data-cursor="drag"]');

      if (projectCard) {
        setIsHovering(true);
        setHoverText('VIEW');
      } else if (marquee) {
        setIsHovering(true);
        setHoverText('DRAG');
      } else if (isInteractive) {
        setIsHovering(true);
        setHoverText('');
      } else {
        setIsHovering(false);
        setHoverText('');
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseover', onOver, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
    };
  }, [rawX, rawY]);
  if (isTouchDevice) return null;
  return (
     <div className="hidden lg:block">
      {/* Inner dot — follows cursor with near-zero lag */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-white rounded-full pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: rawX,
          y: rawY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{ opacity: isHovering && hoverText ? 0 : 1 }}
        transition={{ duration: 0.15 }}
      />

      {/* Outer ring — springs behind with pleasant lag */}
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[9998] flex items-center justify-center overflow-hidden"
        style={{
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: isHovering ? (hoverText ? 80 : 64) : 32,
          height: isHovering ? (hoverText ? 80 : 64) : 32,
          backgroundColor: isHovering
            ? hoverText
              ? 'rgba(79, 140, 255, 0.9)'
              : 'rgba(79, 140, 255, 0.15)'
            : 'transparent',
          borderColor: isHovering && !hoverText
            ? 'rgba(79, 140, 255, 0.5)'
            : 'rgba(255, 255, 255, 0.2)',
          borderWidth: 1,
          borderStyle: 'solid',
        }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {hoverText && (
          <motion.span
            key={hoverText}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[10px] font-display font-bold tracking-widest text-black select-none"
          >
            {hoverText}
          </motion.span>
        )}
      </motion.div>
        </div>
  );
}
