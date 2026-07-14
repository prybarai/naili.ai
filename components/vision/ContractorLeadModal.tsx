'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  Loader2,
  UserPlus,
  X,
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import posthog from 'posthog-js';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  estimateMid: number;
}

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  prefer_real_estimate: boolean;
  timing: string;
  notes: string;
}

const TIMING_OPTIONS = [
  { value: 'ASAP', label: 'ASAP' },
  { value: 'Within a month', label: 'Within a month' },
  { value: 'Just exploring', label: 'Just exploring' },
];

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10;
}

function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export default function ContractorLeadModal({ isOpen, onClose, projectId, estimateMid }: Props) {
  const [form, setForm] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    prefer_real_estimate: false,
    timing: 'ASAP',
    notes: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setErrors({});
    }
  }, [isOpen]);

  const validate = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!form.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!form.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!validateEmail(form.email)) newErrors.email = 'Please enter a valid email';
    if (!form.phone.trim()) newErrors.phone = 'Phone is required';
    else if (!validatePhone(form.phone)) newErrors.phone = 'Please enter a valid 10-digit phone number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/vision/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          prefer_real_estimate: form.prefer_real_estimate,
          timing: form.timing,
          notes: form.notes.trim() || undefined,
        }),
      });

      if (!res.ok) throw new Error('Submission failed');

      posthog.capture('naili_lead_submitted', {
        project_id: projectId,
        prefer_real_estimate: form.prefer_real_estimate,
        timing: form.timing,
      });

      setIsSuccess(true);
    } catch (err) {
      console.error('[ContractorLeadModal] submit error:', err);
      setErrors({ email: 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [form, projectId, validate]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !mounted) return null;

  // Success state
  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center">
        <div
          onClick={handleOverlayClick}
          className="flex min-h-full w-full items-end sm:items-center sm:justify-center"
        >
          <div className="relative w-full max-w-md rounded-t-2xl bg-canvas-50 p-8 shadow-[0_32px_80px_rgba(0,0,0,0.2)] sm:rounded-2xl sm:mx-4 animate-in slide-in-from-bottom">
            <div className="flex flex-col items-center py-8 text-center">
              {/* Success animation */}
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-ink">Request Submitted!</h2>
              <p className="mt-2 text-sm text-ink-500">
                A Naili advisor will connect you with qualified contractors in your area.
                You&apos;ll hear from us within 24 hours.
              </p>
              <div className="mt-6 rounded-xl bg-canvas-50 px-6 py-3">
                <p className="text-xs text-ink-400">
                  Estimated project value: {formatCurrency(estimateMid)}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-ink px-8 py-3 text-sm font-bold text-white shadow-soft transition-all hover:opacity-90"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center">
      <div
        onClick={handleOverlayClick}
        className="flex min-h-full w-full items-end sm:items-center sm:justify-center"
      >
        <div className="relative w-full max-w-md rounded-t-2xl bg-canvas-50 shadow-[0_32px_80px_rgba(0,0,0,0.2)] sm:rounded-2xl sm:mx-4 animate-in slide-in-from-bottom">
          {/* Gradient header */}
          <div className="rounded-t-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-6 pb-6 pt-8 sm:rounded-t-2xl">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="absolute right-4 top-4 rounded-full bg-white/20 p-1.5 text-white transition-colors hover:bg-white/30 disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Connect with Contractors</h2>
                <p className="text-sm text-white/70">Your project scope, ready for quotes</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4 px-6 py-6">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="lead-first" className="mb-1 block text-xs font-semibold text-ink-500">
                  First Name *
                </label>
                <input
                  id="lead-first"
                  type="text"
                  value={form.first_name}
                  onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                  className={cn(
                    'w-full rounded-xl border px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-400 focus:outline-none focus:ring-2',
                    errors.first_name
                      ? 'border-red-300 focus:ring-red-200 bg-red-50'
                      : 'border-hairline bg-canvas-50 focus:border-ink/30 focus:ring-ink/10'
                  )}
                  placeholder="John"
                />
                {errors.first_name && <p className="mt-0.5 text-xs text-red-600">{errors.first_name}</p>}
              </div>
              <div>
                <label htmlFor="lead-last" className="mb-1 block text-xs font-semibold text-ink-500">
                  Last Name *
                </label>
                <input
                  id="lead-last"
                  type="text"
                  value={form.last_name}
                  onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                  className={cn(
                    'w-full rounded-xl border px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-400 focus:outline-none focus:ring-2',
                    errors.last_name
                      ? 'border-red-300 focus:ring-red-200 bg-red-50'
                      : 'border-hairline bg-canvas-50 focus:border-ink/30 focus:ring-ink/10'
                  )}
                  placeholder="Doe"
                />
                {errors.last_name && <p className="mt-0.5 text-xs text-red-600">{errors.last_name}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="lead-email" className="mb-1 block text-xs font-semibold text-ink-500">
                Email *
              </label>
              <input
                id="lead-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className={cn(
                  'w-full rounded-xl border px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-400 focus:outline-none focus:ring-2',
                  errors.email
                    ? 'border-red-300 focus:ring-red-200 bg-red-50'
                    : 'border-hairline bg-canvas-50 focus:border-ink/30 focus:ring-ink/10'
                )}
                placeholder="john@example.com"
              />
              {errors.email && <p className="mt-0.5 text-xs text-red-600">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="lead-phone" className="mb-1 block text-xs font-semibold text-ink-500">
                Phone *
              </label>
              <input
                id="lead-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: formatPhoneInput(e.target.value) }))}
                className={cn(
                  'w-full rounded-xl border px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-400 focus:outline-none focus:ring-2',
                  errors.phone
                    ? 'border-red-300 focus:ring-red-200 bg-red-50'
                    : 'border-hairline bg-canvas-50 focus:border-ink/30 focus:ring-ink/10'
                )}
                placeholder="(555) 123-4567"
              />
              {errors.phone && <p className="mt-0.5 text-xs text-red-600">{errors.phone}</p>}
            </div>

            {/* Timing */}
            <div>
              <label htmlFor="lead-timing" className="mb-1 block text-xs font-semibold text-ink-500">
                When do you want to start?
              </label>
              <div className="relative">
                <select
                  id="lead-timing"
                  value={form.timing}
                  onChange={(e) => setForm((f) => ({ ...f, timing: e.target.value }))}
                  className="w-full appearance-none rounded-xl border border-hairline bg-canvas-50 px-3.5 py-2.5 pr-10 text-sm text-ink focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10"
                >
                  {TIMING_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              </div>
            </div>

            {/* Real estimate checkbox */}
            <label className="flex items-start gap-3 rounded-xl border border-hairline bg-canvas-50 p-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.prefer_real_estimate}
                onChange={(e) => setForm((f) => ({ ...f, prefer_real_estimate: e.target.checked }))}
                className="mt-0.5 h-4 w-4 rounded border-hairline text-ink focus:ring-ink"
              />
              <div>
                <span className="text-sm font-semibold text-ink">I want a real estimate, not a lead</span>
                <p className="text-xs text-ink-400 mt-0.5">
                  We connect you with local contractors who provide genuine quotes for your project scope.
                  This is a free service — no obligation to hire.
                </p>
              </div>
            </label>

            {/* Notes */}
            <div>
              <label htmlFor="lead-notes" className="mb-1 block text-xs font-semibold text-ink-500">
                Anything else? (optional)
              </label>
              <textarea
                id="lead-notes"
                rows={2}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Preferred materials, specific requirements, HOA rules..."
                className="w-full resize-none rounded-xl border border-hairline bg-canvas-50 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-400 focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10"
              />
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 px-6 py-3.5 text-sm font-bold text-white shadow-soft transition-all duration-200 hover:opacity-90 hover:shadow-lift disabled:opacity-60"
            >
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
              ) : (
                <><UserPlus className="h-4 w-4" /> Get Connected with Contractors</>
              )}
            </button>

            <p className="text-center text-[10px] text-ink-400">
              By submitting, you agree to be contacted by Naili and our contractor partners.
              Your project scope will be shared to help contractors provide accurate quotes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
