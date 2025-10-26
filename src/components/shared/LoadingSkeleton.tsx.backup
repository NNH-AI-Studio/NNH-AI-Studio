import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
  variant?: 'card' | 'table' | 'list' | 'text' | 'stat';
  count?: number;
}

function LoadingSkeleton({ variant = 'card', count = 1 }: LoadingSkeletonProps) {
  const shimmer = {
    animate: {
      backgroundPosition: ['200% 0', '-200% 0'],
    },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear' as const,
    },
  };

  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
            <motion.div
              {...shimmer}
              className="h-12 w-12 bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded-lg"
            />
            <motion.div
              {...shimmer}
              className="h-6 bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded w-3/4"
            />
            <motion.div
              {...shimmer}
              className="h-4 bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded w-full"
            />
            <motion.div
              {...shimmer}
              className="h-4 bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded w-2/3"
            />
          </div>
        );

      case 'stat':
        return (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-3">
            <motion.div
              {...shimmer}
              className="h-8 w-8 bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded"
            />
            <motion.div
              {...shimmer}
              className="h-8 bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded w-1/2"
            />
            <motion.div
              {...shimmer}
              className="h-4 bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded w-3/4"
            />
          </div>
        );

      case 'table':
        return (
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    {...shimmer}
                    className="h-4 bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded"
                  />
                ))}
              </div>
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 border-b border-white/10 last:border-b-0">
                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((j) => (
                    <motion.div
                      key={j}
                      {...shimmer}
                      className="h-4 bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded"
                      style={{ animationDelay: `${(i * 4 + j) * 0.05}s` }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      case 'list':
        return (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 bg-white/5 border border-white/10 rounded-lg p-4">
                <motion.div
                  {...shimmer}
                  className="w-12 h-12 bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded-full flex-shrink-0"
                />
                <div className="flex-1 space-y-2">
                  <motion.div
                    {...shimmer}
                    className="h-4 bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded w-3/4"
                  />
                  <motion.div
                    {...shimmer}
                    className="h-3 bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded w-1/2"
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case 'text':
        return (
          <div className="space-y-2">
            <motion.div
              {...shimmer}
              className="h-4 bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded w-full"
            />
            <motion.div
              {...shimmer}
              className="h-4 bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded w-5/6"
            />
            <motion.div
              {...shimmer}
              className="h-4 bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded w-4/5"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>{renderSkeleton()}</div>
      ))}
    </div>
  );
}

export default LoadingSkeleton;
