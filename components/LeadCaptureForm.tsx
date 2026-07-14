"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  DollarSign,
  Sparkles,
  ShieldCheck,
  User,
  Phone,
  Mail,
  MapPin,
  Home,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  projectId?: string;
  zip?: string;
  category?: string;
  estimate?: string;
}

const TIMING_OPTIONS = [
  { value: "asap", label: "As soon as possible", icon: "⚡" },
  { value: "within_month", label: "Within the next month", icon: "📅" },
  { value: "planning_ahead", label: "Just planning ahead", icon: "🗓️" },
] as const;

const PRIORITY_OPTIONS = [
  { value: "budget", label: "Best price", desc: "Most competitive quote" },
  { value: "speed", label: "Fastest timeline", desc: "Need this done quickly" },
  { value: "quality", label: "Highest quality", desc: "Premium craftsmanship" },
] as const;

function formatCategory(cat?: string): string {
  if (!cat) return "Home Project";
  const map: Record<string, string> = {
    bathroom: "Bathroom Remodel",
    kitchen: "Kitchen Remodel",
    flooring: "Flooring",
    roofing: "Roofing",
    deck_patio: "Deck & Patio",
    interior_paint: "Interior Painting",
    exterior_paint: "Exterior Painting",
    landscaping: "Landscaping",
    custom_project: "Home Project",
  };
  return map[cat] || cat.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ── Shared input style ── */
function FormInput({
  icon: Icon,
  ...props
}: {
  icon?: typeof User;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
      )}
      <input
        {...props}
        className={cn(
          "w-full rounded-xl border border-hairline bg-canvas-50 text-ink placeholder:text-ink-400",
          "focus:outline-none focus:ring-2 focus:ring-ink/10 focus:border-ink/30 transition-all",
          "py-3.5 text-base",
          Icon ? "pl-10 pr-4" : "px-4"
        )}
      />
    </div>
  );
}

/* ── Selectable option ── */
function SelectOption({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all duration-200 active:scale-[0.98]",
        selected
          ? "border-ink bg-canvas-50 shadow-soft"
          : "border-hairline bg-canvas-50 hover:border-panel"
      )}
    >
      {children}
      {selected && <CheckCircle className="w-4 h-4 ml-auto text-ink flex-shrink-0" />}
    </button>
  );
}

export default function LeadCaptureForm({ projectId, zip, category, estimate }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [zipCode, setZipCode] = useState(zip || "");
  const [timing, setTiming] = useState<string>("within_month");
  const [priority, setPriority] = useState<string>("quality");
  const [notes, setNotes] = useState("");

  function handlePhoneChange(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length >= 7) {
      setPhone(`(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`);
    } else if (digits.length >= 4) {
      setPhone(`(${digits.slice(0, 3)}) ${digits.slice(3)}`);
    } else {
      setPhone(digits);
    }
  }

  function canAdvance(): boolean {
    if (step === 1) return firstName.trim().length > 0 && lastName.trim().length > 0;
    if (step === 2) {
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const phoneDigits = phone.replace(/\D/g, "");
      return emailValid && phoneDigits.length === 10;
    }
    if (step === 3) return zipCode.replace(/\D/g, "").length === 5;
    return true;
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/leads/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId || null,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.replace(/\D/g, ""),
          address: address.trim() || null,
          zip_code: zipCode.replace(/\D/g, "").slice(0, 5),
          preferred_timing: timing,
          priority,
          project_type: category || null,
          notes: notes.trim() || null,
          estimate_mid: estimate ? parseFloat(estimate) : null,
          source: "naili_get_quotes",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data.error || "Something went wrong. Please try again.";
        const detail = data.detail ? ` (${data.detail})` : "";
        throw new Error(msg + detail);
      }
      router.push(`/get-quotes/success?name=${encodeURIComponent(firstName)}&category=${encodeURIComponent(category || "")}`);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  const estimateNum = estimate ? parseFloat(estimate) : null;
  const categoryLabel = formatCategory(category);
  const STEP_LABELS = ["Name", "Contact", "Location", "Preferences"];

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:py-16">
      {/* ── Header ── */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-canvas-100 text-xs font-medium text-ink-500 mb-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          Free &middot; No obligation
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
          Get matched with local pros
        </h1>
        <p className="mt-2 text-sm sm:text-base text-ink-500 max-w-sm mx-auto">
          Tell us about yourself and we&apos;ll connect you with vetted contractors.
        </p>
      </div>

      {/* ── Project context ── */}
      {(category || estimateNum) && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-hairline bg-canvas-50 p-3.5">
          <div className="w-10 h-10 rounded-lg bg-canvas-50 border border-hairline flex items-center justify-center flex-shrink-0">
            <Home className="w-5 h-5 text-ink-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-ink text-sm">{categoryLabel}</p>
            {estimateNum && (
              <p className="text-xs text-ink-500">Budget: ${estimateNum.toLocaleString()}</p>
            )}
          </div>
          {zip && (
            <div className="text-xs text-ink-400 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {zip}
            </div>
          )}
        </div>
      )}

      {/* ── Step progress ── */}
      <div className="flex items-center justify-center gap-0 mb-8">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
                  i + 1 < step
                    ? "bg-emerald-500 text-white"
                    : i + 1 === step
                    ? "bg-ink text-canvas-50 ring-[3px] ring-amber-200/40"
                    : "bg-canvas-200 text-ink-400"
                )}
              >
                {i + 1 < step ? <CheckCircle className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={cn(
                "text-[10px] font-medium",
                i + 1 <= step ? "text-ink-600" : "text-ink-400"
              )}>
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={cn(
                "mx-1.5 h-0.5 w-6 sm:w-8 rounded-full transition-colors",
                i + 1 < step ? "bg-emerald-400" : "bg-canvas-200"
              )} />
            )}
          </div>
        ))}
      </div>

      {/* ── Step 1: Name ── */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-ink">What&apos;s your name?</h2>
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              icon={User}
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoFocus
            />
            <FormInput
              type="text"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* ── Step 2: Contact ── */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-ink">How should contractors reach you?</h2>
          <FormInput
            icon={Mail}
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
          <FormInput
            icon={Phone}
            type="tel"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
          />
        </div>
      )}

      {/* ── Step 3: Location ── */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-ink">Where is the project?</h2>
          <FormInput
            icon={Home}
            type="text"
            placeholder="Street address (optional)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            autoFocus
          />
          <FormInput
            icon={MapPin}
            type="text"
            inputMode="numeric"
            placeholder="ZIP code"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value.replace(/\D/g, "").slice(0, 5))}
          />
        </div>
      )}

      {/* ── Step 4: Timing & Priority ── */}
      {step === 4 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-ink mb-3">When do you want to start?</h2>
            <div className="space-y-2">
              {TIMING_OPTIONS.map((opt) => (
                <SelectOption key={opt.value} selected={timing === opt.value} onClick={() => setTiming(opt.value)}>
                  <span className="text-lg">{opt.icon}</span>
                  <span className={cn("text-sm", timing === opt.value ? "font-medium text-ink" : "text-ink-600")}>
                    {opt.label}
                  </span>
                </SelectOption>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-ink mb-3">What matters most?</h2>
            <div className="space-y-2">
              {PRIORITY_OPTIONS.map((opt) => (
                <SelectOption key={opt.value} selected={priority === opt.value} onClick={() => setPriority(opt.value)}>
                  <div className="flex-1">
                    <p className={cn("text-sm", priority === opt.value ? "font-medium text-ink" : "text-ink-600")}>
                      {opt.label}
                    </p>
                    <p className="text-xs text-ink-400">{opt.desc}</p>
                  </div>
                </SelectOption>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-600 mb-1.5">
              Anything else? <span className="text-ink-400">(optional)</span>
            </label>
            <textarea
              placeholder="e.g., I'd like to keep the existing layout but upgrade all fixtures..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-hairline bg-canvas-50 text-ink placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-ink/10 focus:border-ink/30 transition-all resize-none text-base"
            />
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── Navigation ── */}
      <div className="mt-8 flex gap-3">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="flex items-center justify-center gap-1.5 px-5 py-3.5 rounded-xl border border-hairline text-ink-600 font-medium hover:bg-canvas-100 transition-all active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}
        {step < 4 ? (
          <button
            type="button"
            onClick={() => canAdvance() && setStep(step + 1)}
            disabled={!canAdvance()}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all duration-200 text-base",
              canAdvance()
                ? "bg-ink text-canvas-50 hover:opacity-90 active:scale-[0.98] shadow-lg shadow-ink/20"
                : "bg-canvas-200 text-ink-400 cursor-not-allowed"
            )}
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !canAdvance()}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all duration-200 text-base",
              submitting || !canAdvance()
                ? "bg-canvas-200 text-ink-400 cursor-not-allowed"
                : "bg-ink text-canvas-50 hover:opacity-90 active:scale-[0.98] shadow-lg shadow-ink/20"
            )}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Get my free quotes
              </>
            )}
          </button>
        )}
      </div>

      {/* ── Trust signals ── */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-ink-400">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> Info never sold
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> Response within 24 hrs
        </span>
        <span className="flex items-center gap-1">
          <DollarSign className="w-3.5 h-3.5" /> 100% free
        </span>
      </div>
    </div>
  );
}
