'use client';

import { motion } from 'framer-motion';

interface CommonLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  text?: string;
  fullScreen?: boolean;
  pageCenter?: boolean;
  className?: string;
}

export default function CommonLoader({
  size = 'md',
  color = '#3D1126', // Dark grey/black to match current theme
  text,
  fullScreen = false,
  pageCenter = false,
  className = ''
}: CommonLoaderProps) {

  const sizeMap = {
    sm: { container: 'w-6 h-6', border: 'border-2', inner: 'w-4 h-4' },
    md: { container: 'w-10 h-10', border: 'border-[3px]', inner: 'w-7 h-7' },
    lg: { container: 'w-16 h-16', border: 'border-4', inner: 'w-11 h-11' },
    xl: { container: 'w-24 h-24', border: 'border-[6px]', inner: 'w-16 h-16' }
  };

  const loader = (
    <div className={`flex flex-col items-center justify-center w-full ${className}`}>
      <div className="relative">
        {/* Outer Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className={`${sizeMap[size].container} ${sizeMap[size].border} rounded-full border-gray-100 border-t-transparent`}
          style={{ borderTopColor: color }}
        />

        {/* Inner Ring - subtle counter-rotation */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className={`absolute inset-0 m-auto ${sizeMap[size].inner} ${sizeMap[size].border} rounded-full border-gray-50 border-b-transparent opacity-40`}
          style={{ borderBottomColor: color }}
        />
      </div>

      {text && (
        <motion.p
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
          className="mt-4 text-sm font-medium text-gray-600 font-poppins tracking-wide text-center"
        >
          {text}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {loader}
      </div>
    );
  }

  if (pageCenter) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px] w-full">
        {loader}
      </div>
    );
  }

  return loader;
}
