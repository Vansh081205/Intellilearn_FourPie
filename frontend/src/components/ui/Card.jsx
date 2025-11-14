import { motion } from 'framer-motion';

export default function Card({ 
  children, 
  className = '', 
  hoverable = false,
  gradient = false,
  ...props 
}) {
  const baseStyles = 'glass rounded-2xl p-6 transition-all duration-300';
  const hoverStyles = hoverable ? 'hover:shadow-2xl hover:-translate-y-1 cursor-pointer' : '';
  const gradientStyles = gradient ? 'bg-gradient-to-br from-white/80 to-blue-50/80 dark:from-gray-800/80 dark:to-gray-900/80' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${baseStyles} ${hoverStyles} ${gradientStyles} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}