import React, { useEffect, useRef } from 'react';
import { animate } from 'motion/react';

interface AnimatedCounterProps {
  from?: number;
  to: number;
  duration?: number;
  decimals?: number;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ 
  from = 0, 
  to, 
  duration = 0.8,
  decimals = 0 
}) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const controls = animate(from, to, {
      duration,
      ease: "easeOut",
      onUpdate(value) {
        node.textContent = value.toFixed(decimals);
      }
    });

    return () => controls.stop();
  }, [from, to, duration, decimals]);

  return <span ref={ref}>{from.toFixed(decimals)}</span>;
};
