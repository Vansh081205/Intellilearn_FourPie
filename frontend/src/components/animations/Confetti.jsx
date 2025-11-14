import { useEffect, useState } from 'react';
import ReactConfetti from 'react-confetti';
import { useWindowSize } from '../../hooks/useWindowSize';

export default function Confetti({ 
  active = false, 
  duration = 3000,
  recycle = false,
  onComplete 
}) {
  const { width, height } = useWindowSize();
  const [show, setShow] = useState(active);

  useEffect(() => {
    setShow(active);

    if (active && !recycle) {
      const timer = setTimeout(() => {
        setShow(false);
        if (onComplete) onComplete();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [active, duration, recycle, onComplete]);

  if (!show) return null;

  return (
    <ReactConfetti
      width={width}
      height={height}
      recycle={recycle}
      numberOfPieces={500}
      gravity={0.3}
      colors={[
        '#3B82F6', // blue
        '#8B5CF6', // purple
        '#EC4899', // pink
        '#10B981', // green
        '#F59E0B', // orange
        '#EF4444', // red
      ]}
    />
  );
}