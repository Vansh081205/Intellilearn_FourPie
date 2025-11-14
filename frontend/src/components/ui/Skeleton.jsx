export default function Skeleton({ className = '', variant = 'rectangular' }) {
  const baseStyles = 'skeleton animate-pulse bg-gray-200 dark:bg-gray-700';
  
  const variants = {
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
    text: 'rounded h-4',
  };

  return <div className={`${baseStyles} ${variants[variant]} ${className}`} />;
}