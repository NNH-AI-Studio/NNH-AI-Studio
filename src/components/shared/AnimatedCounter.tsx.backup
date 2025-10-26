import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface AnimatedCounterProps {
  value: string;
  className?: string;
  duration?: number;
}

export default function AnimatedCounter({
  value,
  className = '',
  duration = 2,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));
  const suffix = value.replace(/[0-9.]/g, '');

  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    stiffness: 50,
    damping: 20,
  });

  useEffect(() => {
    if (isInView && !isNaN(numericValue)) {
      motionValue.set(numericValue);
    }
  }, [isInView, numericValue, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      if (ref.current) {
        const displayValue = latest.toFixed(suffix.includes('.') ? 1 : 0);
        ref.current.textContent = displayValue + suffix;
      }
    });

    return () => unsubscribe();
  }, [springValue, suffix]);

  if (isNaN(numericValue)) {
    return <div className={className}>{value}</div>;
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
      transition={{
        duration: 0.5,
        type: 'spring',
        stiffness: 100,
        damping: 15,
      }}
      className={className}
    >
      0{suffix}
    </motion.div>
  );
}
