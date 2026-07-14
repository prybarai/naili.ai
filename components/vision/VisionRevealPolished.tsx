'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Scan, Zap, Clock, Target, Sparkles, Maximize2 } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useProject } from '@/lib/ProjectContext';
import confetti from 'canvas-confetti';

interface VisionRevealPolishedProps {
  className?: string;
}

export default function VisionRevealPolished({ className }: VisionRevealPolishedProps) {
  const { state } = useProject();
  const [scanProgress, setScanProgress] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderX = useMotionValue(50);
  
  // Transform slider position to percentage (0-100)
  const sliderPercentage = useTransform(sliderX, [0, 100], [0, 100]);

  // Original and concept images from context
  const originalImageUrl = state.uploadedImage || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80';
  const conceptImageUrl = state.conceptImageUrl || `https://placehold.co/600x400/1f7cf7/ffffff?text=${encodeURIComponent(
    (state.userDescription || 'Your Naili Concept').substring(0, 30) + '...'
  )}`;

  // Handle confetti effect when slider reaches 100%
  useEffect(() => {
    const unsubscribe = sliderPercentage.onChange((value) => {
      if (value >= 95 && !hasTriggeredConfetti) {
        triggerConfetti();
        setShowConfetti(true);
        setHasTriggeredConfetti(true);
        
        // Hide confetti after animation
        setTimeout(() => setShowConfetti(false), 2000);
      }
    });
    
    return unsubscribe;
  }, [sliderPercentage, hasTriggeredConfetti]);

  const triggerConfetti = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      
      confetti({
        particleCount: 30,
        spread: 70,
        origin: { x, y },
        colors: ['#0066D6', '#10b981', '#8b5cf6', '#f59e0b'],
        disableForReducedMotion: true,
      });
    }
  };

  // Draw LIDAR scan effect
  useEffect(() => {
    const drawScan = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw scan lines
      const scanY = (scanProgress / 100) * height;
      const gradient = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
      gradient.addColorStop(0, 'rgba(0, 102, 214, 0)');
      gradient.addColorStop(0.5, 'rgba(0, 102, 214, 0.6)');
      gradient.addColorStop(1, 'rgba(0, 102, 214, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, scanY - 20, width, 40);

      // Draw scan dots
      for (let i = 0; i < 20; i++) {
        const x = (i / 20) * width;
        const y = scanY + Math.sin(Date.now() / 200 + i) * 10;
        
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#0066D6';
        ctx.fill();
      }
    };

    const interval = setInterval(() => {
      setScanProgress((prev) => (prev >= 100 ? 0 : prev + 1));
      drawScan();
    }, 50);

    return () => clearInterval(interval);
  }, [scanProgress]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Stats from context
  const stats = [
    { icon: <Target className="h-4 w-4" />, label: 'Accuracy', value: `${(state.estimateRange?.confidence || 0.94) * 100}%` },
    { icon: <Clock className="h-4 w-4" />, label: 'Time Saved', value: '12-24h' },
    { icon: <Zap className="h-4 w-4" />, label: 'Cost Efficiency', value: '15-30%' },
  ];

  return (
    <div className={cn('relative', className)} ref={containerRef}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-semibold text-text-dark">
            Your Vision Revealed
          </h2>
          <p className="text-text-medium">
            Slide to compare your original space with the Naili concept
          </p>
        </div>
        <button
          onClick={toggleFullscreen}
          className="flex items-center gap-2 rounded-card border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-text-medium hover:bg-gray-50 focus-ring btn-polish"
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          <Maximize2 className="h-4 w-4" />
          {isFullscreen ? 'Exit' : 'Fullscreen'}
        </button>
      </div>

      {/* Main comparison container */}
      <div className="relative overflow-hidden rounded-2xl bg-gray-900 shadow-xl">
        {/* Images container */}
        <div className="relative aspect-video w-full">
          {/* Original image */}
          <div className="absolute inset-0">
            <div className="relative h-full w-full">
              <img
                src={originalImageUrl}
                alt="Original space"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
            </div>
            <div className="absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1.5">
              <span className="text-sm font-medium text-white">Original</span>
            </div>
          </div>

          {/* Concept image with clip-path based on slider */}
          <motion.div
            className="absolute inset-0"
            style={{
              clipPath: `inset(0 0 0 ${sliderPercentage.get()}%)`,
            }}
          >
            <div className="relative h-full w-full">
              <img
                src={conceptImageUrl}
                alt="Naili concept"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-primary-500/10 to-transparent" />
            </div>
            <div className="absolute right-4 top-4 rounded-full bg-primary-500/90 px-3 py-1.5">
              <span className="text-sm font-medium text-white">Naili Concept</span>
            </div>
          </motion.div>

          {/* Scan canvas */}
          <canvas
            ref={canvasRef}
            className="pointer-events-none absolute inset-0"
          />

          {/* Slider handle */}
          <motion.div
            className="absolute top-0 bottom-0 z-20 w-1 bg-primary-500"
            style={{ x: sliderX }}
            aria-label="Comparison slider"
          >
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              drag="x"
              dragConstraints={{ left: 0, right: 100 }}
              dragElastic={0}
              dragMomentum={false}
              onDrag={(_, info) => {
                sliderX.set(Math.max(0, Math.min(100, info.point.x)));
              }}
              style={{ x: sliderX }}
            >
              <div className="flex h-12 w-12 cursor-grab items-center justify-center rounded-full bg-white shadow-lg ring-2 ring-primary-500 active:cursor-grabbing focus-ring">
                <div className="flex space-x-1">
                  <div className="h-1 w-1 rounded-full bg-primary-500" />
                  <div className="h-1 w-1 rounded-full bg-primary-500" />
                  <div className="h-1 w-1 rounded-full bg-primary-500" />
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Instructions */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-4 py-2 backdrop-blur-sm">
            <p className="text-sm text-white">
              ← Drag to compare →
            </p>
          </div>
        </div>

        {/* Stats panel */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-4 right-4 z-10"
            >
              <div className="rounded-card bg-white/95 p-4 backdrop-blur-sm shadow-lg">
                <div className="grid grid-cols-3 gap-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary-500/10 text-primary-500">
                        {stat.icon}
                      </div>
                      <div className="text-2xl font-bold tabular-nums text-text-dark">
                        {stat.value}
                      </div>
                      <div className="text-xs text-text-medium">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls and info */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-card bg-blue-50 p-4">
          <div className="flex items-center gap-2">
            <Scan className="h-5 w-5 text-primary-500" />
            <h3 className="font-semibold text-text-dark">How it works</h3>
          </div>
          <p className="mt-2 text-sm text-text-medium">
            Naili analyzes your photo using computer vision to understand room dimensions,
            materials, and lighting, then generates concepts based on your style preferences.
          </p>
        </div>

        <div className="rounded-card bg-green-50 p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent-green" />
            <h3 className="font-semibold text-text-dark">Pro tip</h3>
          </div>
          <p className="mt-2 text-sm text-text-medium">
            Drag the slider all the way to the right to see the full concept and unlock a
            celebratory animation!
          </p>
        </div>
      </div>

      {/* Confetti celebration */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 z-50"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-full bg-white/90 p-8 backdrop-blur-sm shadow-2xl">
                <div className="text-center">
                  <Sparkles className="mx-auto h-12 w-12 text-primary-500 animate-bounce" />
                  <h3 className="mt-4 text-xl font-bold text-text-dark">Amazing vision!</h3>
                  <p className="mt-2 text-text-medium">
                    Your concept is ready. Time to make it real.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}