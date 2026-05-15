import { cn } from '@/lib/utils';
import { Info, AlertTriangle } from 'lucide-react';

interface DisclaimerProps {
  text: string;
  className?: string;
  variant?: 'info' | 'warning';
}

export default function Disclaimer({ text, className, variant = 'info' }: DisclaimerProps) {
  const Icon = variant === 'warning' ? AlertTriangle : Info;

  return (
    <div
      className={cn(
        'flex gap-3 rounded-2xl border p-4 text-sm',
        variant === 'info'
          ? 'border-[rgba(216,185,138,0.22)] bg-[linear-gradient(135deg,rgba(251,248,244,0.96),rgba(246,243,238,0.94))] text-ink-600'
          : 'border-[rgba(216,185,138,0.35)] bg-[rgba(251,248,244,0.7)] text-ink-600',
        className
      )}
    >
      <Icon className={cn('h-4 w-4 mt-0.5 flex-shrink-0', variant === 'warning' ? 'text-sand-dark' : 'text-ink-400')} />
      <p className="leading-relaxed">{text}</p>
    </div>
  );
}
