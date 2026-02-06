'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
}

/**
 * Progress компонент для отображения прогресса
 * Используется для показа процента выполнения (например, загрузка файла)
 */
const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, ...props }, ref) => {
    const isOverLimit = (value || 0) > 90;
     
    return (
      <div
        ref={ref}
        className={cn(
          'relative h-2 w-full overflow-hidden rounded-full bg-secondary',
          className
        )}
        {...props}
      > 
        <div
          className={cn(
            'h-full w-full flex-1 transition-all duration-300 ease-in-out',
            isOverLimit ? 'bg-destructive' : 'bg-accent'
          )}
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </div>
    );
  }
);
Progress.displayName = 'Progress';

export { Progress };
