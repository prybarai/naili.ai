'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import posthog from 'posthog-js';

interface ProgressStep {
  label: string;
  key: string;
  estimatedDuration: number; // seconds
}

const STEPS: ProgressStep[] = [
  { label: 'Analyzing photo dimensions...', key: 'photo', estimatedDuration: 4 },
  { label: 'Detecting materials and finishes...', key: 'materials', estimatedDuration: 6 },
  { label: 'Cross-referencing local market data...', key: 'market', estimatedDuration: 5 },
  { label: 'Computing estimate range...', key: 'estimate', estimatedDuration: 8 },
  { label: 'Generating design concepts...', key: 'concepts', estimatedDuration: 10 },
  { label: 'Preparing contractor brief...', key: 'brief', estimatedDuration: 7 },
];

interface Props {
  projectId: string;
}

export default function ForensicAnalysisView({ projectId }: Props) {
  const router = useRouter();
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [elapsedTimes, setElapsedTimes] = useState<Record<string, number>>({});
  const [startTime] = useState(Date.now());
  const [redirected, setRedirected] = useState(false);
  const stepStartTimes = useRef<Record<string, number>>({});
  const pollCountRef = useRef(0);
  const redirectingRef = useRef(false);

  // Animate steps based on timing
  useEffect(() => {
    stepStartTimes.current[STEPS[0].key] = Date.now();

    STEPS.forEach((step, index) => {
      const cumulativeTime = STEPS.slice(0, index + 1).reduce(
        (sum, s) => sum + s.estimatedDuration * 1000,
        0
      );

      const timer = setTimeout(
        () => {
          setCurrentStepIndex((prev) => Math.max(prev, index + 1));
          setCompletedSteps((prev) => new Set(prev).add(step.key));

          if (index + 1 < STEPS.length) {
            stepStartTimes.current[STEPS[index + 1].key] = Date.now();
          }
        },
        cumulativeTime * 0.85 // Speed up slightly for feel
      );

      return () => clearTimeout(timer);
    });
  }, []);

  // Update elapsed times
  useEffect(() => {
    const interval = setInterval(() => {
      const times: Record<string, number> = {};
      for (const step of STEPS) {
        if (completedSteps.has(step.key)) {
          const start = stepStartTimes.current[step.key];
          if (start) {
            times[step.key] = Math.round((Date.now() - start) / 1000);
          }
        } else if (!completedSteps.has(step.key) && stepStartTimes.current[step.key]) {
          // Still running — show current elapsed
          const start = stepStartTimes.current[step.key];
          times[step.key] = Math.round((Date.now() - start) / 1000);
        }
      }
      setElapsedTimes(times);
    }, 500);
    return () => clearInterval(interval);
  }, [completedSteps]);

  // Poll for results readiness
  useEffect(() => {
    if (redirected || redirectingRef.current) return;

    const interval = setInterval(async () => {
      pollCountRef.current += 1;

      // Start checking after all steps have "completed" visually
      if (pollCountRef.current < 10) return;

      try {
        const res = await fetch(`/api/projects/get?id=${projectId}`);
        if (!res.ok) return;
        const { project } = await res.json() as { project: { status: string; generated_image_urls?: string[] } };

        const hasEstimate = project.status === 'estimated' || project.status === 'materials_generated' || project.status === 'brief_generated' || project.status === 'lead_submitted';
        const hasConcepts = Array.isArray(project.generated_image_urls) && project.generated_image_urls.length > 0;

        // Once we have at least the estimate, navigate
        if (hasEstimate || hasConcepts || pollCountRef.current > 25) {
          redirectingRef.current = true;
          setRedirected(true);
          posthog.capture('naili_analysis_complete', { project_id: projectId });
          clearInterval(interval);
          router.push(`/vision/results/${projectId}`);
        }
      } catch {
        // Silent
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [projectId, redirected, router]);

  const totalElapsed = Math.round((Date.now() - startTime) / 1000);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#1b1d22]">
      {/* Pulse rings */}
      <div className="relative mb-12 flex items-center justify-center">
        <motion.div
          className="absolute h-32 w-32 rounded-full border border-[rgba(216,185,138,0.15)]"
          animate={{
            scale: [1, 1.8, 1],
            opacity: [0.4, 0.1, 0.4],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute h-24 w-24 rounded-full border border-[rgba(216,185,138,0.25)]"
          animate={{
            scale: [1, 1.6, 1],
            opacity: [0.5, 0.15, 0.5],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.3,
          }}
        />
        <motion.div
          className="absolute h-16 w-16 rounded-full border border-[rgba(216,185,138,0.35)]"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.6, 0.2, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.6,
          }}
        />
        <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(216,185,138,0.12)]">
          <Loader2 className="h-8 w-8 animate-spin text-sand" />
        </div>
      </div>

      {/* Headline */}
      <h2 className="mb-8 text-center text-2xl font-bold text-white sm:text-3xl">
        Running your forensic analysis
      </h2>

      {/* Progress steps */}
      <div className="mx-auto w-full max-w-md space-y-3 px-6">
        <AnimatePresence mode="popLayout">
          {STEPS.map((step, index) => {
            const isCompleted = completedSteps.has(step.key);
            const isCurrent = index === currentStepIndex && !isCompleted;
            const isPending = index > currentStepIndex;
            const elapsed = elapsedTimes[step.key] ?? 0;

            return (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: isPending ? 0.35 : 1,
                  y: 0,
                }}
                transition={{ duration: 0.3 }}
                className={cn(
                  'flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-500',
                  isCompleted
                    ? 'bg-[rgba(184,216,200,0.1)] text-white'
                    : isCurrent
                      ? 'bg-[rgba(216,185,138,0.08)] text-white'
                      : 'bg-transparent text-white/50'
                )}
              >
                {isCompleted ? (
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-mint/20">
                    <CheckCircle2 className="h-4 w-4 text-mint" />
                  </div>
                ) : (
                  <div
                    className={cn(
                      'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border transition-all',
                      isCurrent
                        ? 'border-sand/60'
                        : 'border-white/15'
                    )}
                  >
                    {isCurrent && (
                      <motion.div
                        className="h-2 w-2 rounded-full bg-sand"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    )}
                  </div>
                )}
                <span
                  className={cn(
                    'flex-1 text-sm font-medium transition-colors',
                    isCompleted
                      ? 'text-white'
                      : isCurrent
                        ? 'text-white/90'
                        : 'text-white/40'
                  )}
                >
                  {step.label}
                </span>
                {isCompleted && elapsed > 0 && (
                  <span className="text-xs text-white/50">{elapsed}s</span>
                )}
                {isCurrent && (
                  <span className="text-xs text-sand/70">{elapsed}s</span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Total elapsed */}
      <p className="mt-8 text-sm text-white/40">
        Elapsed: {totalElapsed}s
      </p>
    </div>
  );
}
