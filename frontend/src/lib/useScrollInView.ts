import { useRef } from 'react';
import { useInView } from 'framer-motion';

/**
 * Bridge hook: wraps Framer Motion's useInView(ref, options) so components
 * can use the { ref, inView } destructuring pattern.
 * Generic so callers get a correctly-typed ref for any HTML element.
 */
export function useScrollInView<T extends HTMLElement = HTMLDivElement>(options?: {
  threshold?: number;
  triggerOnce?: boolean;
}) {
  const ref = useRef<T | null>(null);
  const inView = useInView(ref, {
    once: options?.triggerOnce ?? true,
    amount: options?.threshold ?? 0.1,
  });
  return { ref, inView };
}
