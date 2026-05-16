'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Eye, EyeOff, UserPlus, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';
import Nav from '@/components/Nav';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/my-projects';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Try to sign in immediately (works if email confirmation is disabled)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (!signInError) {
      router.push(redirect);
      router.refresh();
    } else {
      // Email confirmation required
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="rounded-[1.5rem] border border-hairline bg-white p-10 shadow-lift">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-mint/40 to-mint/20">
            <CheckCircle className="h-7 w-7 text-[#5BA88C]" />
          </div>
          <h2 className="font-display text-2xl tracking-tight text-ink">Check your email</h2>
          <p className="mt-3 text-ink-600">
            We sent a confirmation link to <strong className="text-ink">{email}</strong>. Click it to activate your account.
          </p>
          <Link href="/auth/login" className="btn-primary mt-8 inline-flex">
            Back to sign in <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sand/30 to-sand/10 shadow-soft">
          <UserPlus className="h-6 w-6 text-sand-dark" />
        </div>
        <h1 className="font-display text-3xl tracking-tight text-ink">Create your account</h1>
        <p className="mt-2 text-ink-600">Save your designs and access them from anywhere.</p>
      </div>

      {/* Form Card */}
      <div className="rounded-[1.5rem] border border-hairline bg-white p-8 shadow-lift">
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/80 p-3.5">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full rounded-xl border border-hairline bg-canvas-50 px-4 py-3 text-ink placeholder:text-ink-400 transition focus:border-sand focus:outline-none focus:ring-2 focus:ring-sand/20"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                className="w-full rounded-xl border border-hairline bg-canvas-50 px-4 py-3 pr-11 text-ink placeholder:text-ink-400 transition focus:border-sand focus:outline-none focus:ring-2 focus:ring-sand/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-ink">
              Confirm password
            </label>
            <input
              id="confirm-password"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              className="w-full rounded-xl border border-hairline bg-canvas-50 px-4 py-3 text-ink placeholder:text-ink-400 transition focus:border-sand focus:outline-none focus:ring-2 focus:ring-sand/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating account...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Create account <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-ink-500">
            Already have an account?{' '}
            <Link
              href={`/auth/login${redirect !== '/my-projects' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
              className="font-medium text-sand-dark hover:text-sand transition"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Benefits */}
      <div className="mt-6 rounded-xl bg-canvas-200/50 p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-500">What you get</p>
        <ul className="space-y-2 text-sm text-ink-600">
          <li className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-[#5BA88C]" />
            Save unlimited renovation designs
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-[#5BA88C]" />
            Access your projects from any device
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-[#5BA88C]" />
            Share plans with contractors instantly
          </li>
        </ul>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-canvas">
      <Nav />
      <section className="flex items-center justify-center px-4 pb-16 pt-28 sm:px-6 md:pt-32">
        <Suspense fallback={
          <div className="w-full max-w-md text-center py-16">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-sand border-t-transparent" />
          </div>
        }>
          <SignupForm />
        </Suspense>
      </section>
    </main>
  );
}
