// src/hooks/useAnimatedCounter.js
import { useEffect } from 'react';
import { useMotionValue, useSpring, animate } from 'framer-motion';

export function useAnimatedCounter(value) {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 20,
    stiffness: 100,
  });

  useEffect(() => {
    const animation = animate(motionValue, value, {
      duration: 0.8,
    });
    return animation.stop;
  }, [value]);

  return springValue;
}