import { cn } from '@/lib/utils';
import Link from 'next/link';

interface LogoProps {
  name: string;
  icon?: React.ReactNode;
  variant?: 'full' | 'mark';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: { mark: 'w-6 h-6 text-sm', name: 'text-base' },
  md: { mark: 'w-8 h-8 text-base', name: 'text-xl' },
  lg: { mark: 'w-10 h-10 text-lg', name: 'text-2xl' },
};

export function Logo({ name, icon, variant = 'full', size = 'md', className }: LogoProps) {
  const sizes = sizeClasses[size];
  const initial = name.charAt(0).toUpperCase();

  const words = name.trim().split(' ')
  const hasTwoWords = words.length === 2
  
  return (
    <Link href='/'>
      <div className={cn('flex items-center gap-2', className)}>
      <div className={cn(
        'flex items-center justify-center rounded-lg border font-semibold text-primary-foreground',
        sizes.mark
      )}>
        {icon || initial}
      </div>
      {variant === 'full' && (
        <span className={cn('font-serif font-extrabold', sizes.name)}>
          {hasTwoWords ? (
            <>
              {words[0]} <span className="text-primary">{words[1]}</span>
            </>
          ) : (
            name
          )}
        </span>
      )}
    </div>
    </Link>
  );
}