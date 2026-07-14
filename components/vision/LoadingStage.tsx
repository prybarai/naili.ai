'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Sparkles,
  ShoppingBag,
  ClipboardList,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Stage = 'concepts' | 'materials' | 'brief' | 'intelligence';

interface LoadingStageProps {
  stage: Stage;
  customMessage?: string;
}

interface StageConfig {
  icon: typeof Sparkles;
  accent: string;
  bgGradient: string;
  iconBg: string;
  messages: string[];
  tips: string[];
}

const STAGE_CONFIGS: Record<Stage, StageConfig> = {
  concepts: {
    icon: Sparkles,
    accent: 'text-amber-500',
    bgGradient: 'from-amber-50/80 via-white to-indigo-50/60',
    iconBg: 'bg-amber-50',
    messages: [
      'Generating concepts...',
      'AI is creating your before & after visual',
    ],
    tips: [
      'Our AI is analyzing every pixel of your photo to create the perfect renovation concept.',
      'Did you know? Well-planned renovations can increase home value by up to 15%.',
      'Professional design concepts help you visualize your space before spending a dollar.',
      'AI-generated concepts consider your room layout, lighting, and existing features.',
      'The average homeowner saves 3-5 redesigns by using AI visualizations first.',
      'Natural light orientation affects material recommendations — our AI accounts for this!',
    ],
  },
  materials: {
    icon: ShoppingBag,
    accent: 'text-blue-500',
    bgGradient: 'from-blue-50/80 via-white to-cyan-50/60',
    iconBg: 'bg-blue-50',
    messages: [
      'Loading materials list...',
      'Curating your materials & supplies',
    ],
    tips: [
      'We\'re calculating exactly what materials you\'ll need for your renovation.',
      'Professional-grade materials can increase project longevity by up to 3x.',
      'Buying materials in bulk can save you 10–20% on total project costs.',
      'Modern alternatives to traditional materials often cost less and last longer.',
      'Energy-efficient materials can pay for themselves within 3–5 years.',
      'Local sourcing of materials reduces both cost and environmental impact.',
    ],
  },
  brief: {
    icon: ClipboardList,
    accent: 'text-emerald-500',
    bgGradient: 'from-emerald-50/80 via-white to-teal-50/60',
    iconBg: 'bg-emerald-50',
    messages: [
      'Loading project brief...',
      'Assembling your complete project plan',
    ],
    tips: [
      'Synthesizing your complete project plan with every detail.',
      'A thorough project brief can save you up to 20% on unexpected costs.',
      'Good planning reduces renovation timelines by an average of 30%.',
      'Detailed scopes of work help contractors bid more accurately.',
      'Your project brief includes timeline estimates and phasing recommendations.',
      'Permit requirements vary by location — your brief covers local regulations.',
    ],
  },
  intelligence: {
    icon: TrendingUp,
    accent: 'text-purple-500',
    bgGradient: 'from-purple-50/80 via-white to-pink-50/60',
    iconBg: 'bg-purple-50',
    messages: [
      'Loading market intelligence...',
      'Gathering local market data & insights',
    ],
    tips: [
      'Pulling market data specific to your area for accurate comparisons.',
      'Home renovation costs vary by up to 40% depending on your region.',
      'Seasonal trends affect contractor availability and material pricing.',
      'Homes with recent renovations sell 30% faster than unrenovated comparables.',
      'Property values in your ZIP code directly influence renovation ROI.',
      'Local building codes and permit fees are factored into your report.',
    ],
  },
};

function LoadingDots() {
  return (
    <div className="flex items-center gap-1.5 mt-2">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-current opacity-40"
          style={{
            animation: `pulse-dot 1.4s ease-in-out ${i * 0.16}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

export default function LoadingStage({ stage, customMessage }: LoadingStageProps) {
  const config = STAGE_CONFIGS[stage];
  const Icon = config.icon;
  const [tipIndex, setTipIndex] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  // Rotate tips every 6 seconds
  useEffect(() => {
    const tipTimer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % config.tips.length);
    }, 6000);
    return () => clearInterval(tipTimer);
  }, [config.tips.length]);

  // Rotate messages every 15 seconds
  useEffect(() => {
    const msgTimer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % config.messages.length);
    }, 15000);
    return () => clearInterval(msgTimer);
  }, [config.messages.length]);

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br p-8 text-center shadow-soft',
        config.bgGradient,
      )}
    >
      {/* Subtle shimmer bar at top */}
      <div className="absolute left-0 right-0 top-0 h-1 animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent bg-[length:200%_100%]" />

      {/* Animated icon */}
      <div
        className={cn(
          'mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-[2000ms] ease-in-out',
          config.iconBg,
        )}
        style={{ animation: 'breathe 3s ease-in-out infinite' }}
      >
        <Icon className={cn('h-7 w-7', config.accent)} />
      </div>

      {/* Message */}
      <p className="text-base font-bold text-ink transition-all duration-500">
        {customMessage || config.messages[messageIndex]}
      </p>

      {/* Pulsing dots indicator */}
      <div className={cn('mt-3', config.accent)}>
        <LoadingDots />
      </div>

      {/* Rotating tip */}
      <div className="mt-4 mx-auto max-w-md">
        <p
          key={tipIndex}
          className="text-xs text-ink-400 leading-relaxed animate-reveal-up"
        >
          {config.tips[tipIndex]}
        </p>
      </div>
    </div>
  );
}
