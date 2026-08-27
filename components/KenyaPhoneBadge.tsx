// components/KenyaPhoneBadge.tsx
import React from 'react';
import { formatKenyaPhone, getKenyaPhoneLink } from '@/lib/phone';

interface KenyaPhoneBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  phone: string | number | null | undefined;
  showFlag?: boolean;
  spaced?: boolean;
  clickable?: boolean;
  fallback?: string;
}

export function KenyaFlagIcon({ className = 'w-4 h-3 shrink-0' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 900 600"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="900" height="160" fill="#000000" />
      <rect y="160" width="900" height="40" fill="#FFFFFF" />
      <rect y="200" width="900" height="200" fill="#922529" />
      <rect y="400" width="900" height="40" fill="#FFFFFF" />
      <rect y="440" width="900" height="160" fill="#006600" />
      <g transform="translate(450, 300)">
        <path d="M-220,-160 L220,160 M-220,160 L220,-160" stroke="#FFFFFF" strokeWidth="14" strokeLinecap="round" />
        <path d="M-220,-160 L220,160 M-220,160 L220,-160" stroke="#000000" strokeWidth="6" strokeLinecap="round" />
        <ellipse cx="0" cy="0" rx="90" ry="170" fill="#922529" stroke="#000000" strokeWidth="6" />
        <path d="M-90,0 Q-40,-120 0,-170 Q-40,-60 -90,0 Z" fill="#000000" />
        <path d="M90,0 Q40,-120 0,-170 Q40,-60 90,0 Z" fill="#000000" />
        <path d="M-90,0 Q-40,120 0,170 Q-40,60 -90,0 Z" fill="#000000" />
        <path d="M90,0 Q40,120 0,170 Q40,60 90,0 Z" fill="#000000" />
        <circle cx="0" cy="0" r="18" fill="#FFFFFF" />
      </g>
    </svg>
  );
}

export function KenyaPhoneBadge({
  phone,
  showFlag = true,
  spaced = true,
  clickable = false,
  fallback = '—',
  className = '',
  ...props
}: KenyaPhoneBadgeProps) {
  if (!phone) {
    return <span className="text-muted-foreground text-sm">{fallback}</span>;
  }

  const formatted = formatKenyaPhone(phone, { spaced, includePrefix: true });

  const content = (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-sm tracking-tight font-medium ${className}`}
      {...props}
    >
      {showFlag && (
        <span className="inline-flex rounded-xs overflow-hidden shadow-xs ring-1 ring-black/10">
          <KenyaFlagIcon className="w-4 h-3 block" />
        </span>
      )}
      <span>{formatted}</span>
    </span>
  );

  if (clickable) {
    return (
      <a
        href={getKenyaPhoneLink(phone, 'tel')}
        className="inline-flex items-center hover:underline focus:outline-hidden"
      >
        {content}
      </a>
    );
  }

  return content;
}