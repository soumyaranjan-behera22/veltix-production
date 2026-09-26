import { useReducedMotion } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";

// One heading component for every section, so the scroll reveal is
// identical everywhere and tuned in one place.
// className styles the heading text itself (size, weight, colour, spacing).
export default function SectionHeading({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  // People who turn on "reduce motion" get a plain, sharp heading.
  if (reduceMotion) {
    return <h2 className={className}>{children}</h2>;
  }

  return (
    <ScrollReveal
      baseOpacity={0.1}
      baseRotation={3}
      blurStrength={4}
      rotationEnd="bottom 60%"
      wordAnimationEnd="bottom 60%"
      textClassName={className}
    >
      {children}
    </ScrollReveal>
  );
}