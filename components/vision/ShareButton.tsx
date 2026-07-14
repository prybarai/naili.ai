'use client';

import { useState, useRef, useEffect } from 'react';
import { Share2, Check, Copy, Mail, MessageSquare, Users, X } from 'lucide-react';
import posthog from 'posthog-js';

interface Props {
  shareUrl: string;
  variant?: 'light' | 'dark';
  projectTitle?: string;
}

export default function ShareButton({ shareUrl, variant = 'light', projectTitle }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const title = projectTitle || 'My Naili renovation plan';
  const body = `Check out my renovation plan on Naili:\n\n${shareUrl}`;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const el = document.createElement('input');
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    posthog.capture('naili_share_created', { method: 'copy' });
    setCopied(true);
    setTimeout(() => { setCopied(false); setOpen(false); }, 1500);
  };

  const emailSpouse = () => {
    posthog.capture('naili_share_created', { method: 'email_spouse' });
    const subject = encodeURIComponent(`Take a look at this renovation plan`);
    const emailBody = encodeURIComponent(`Hey!\n\nI put together a renovation plan using Naili. Can you take a look and let me know what you think?\n\n${shareUrl}\n\nIt has the cost estimate, materials list, and design concepts all in one place.`);
    window.open(`mailto:?subject=${subject}&body=${emailBody}`, '_self');
    setOpen(false);
  };

  const emailContractor = () => {
    posthog.capture('naili_share_created', { method: 'email_contractor' });
    const subject = encodeURIComponent(`Project scope and estimate for review`);
    const emailBody = encodeURIComponent(`Hi,\n\nI'm planning a renovation and put together a detailed scope using Naili. It includes a cost estimate, materials list, and project brief.\n\nCould you take a look and let me know if you'd be interested in quoting this project?\n\n${shareUrl}\n\nThank you!`);
    window.open(`mailto:?subject=${subject}&body=${emailBody}`, '_self');
    setOpen(false);
  };

  const textMessage = () => {
    posthog.capture('naili_share_created', { method: 'sms' });
    const smsBody = encodeURIComponent(`Check out this renovation plan I put together: ${shareUrl}`);
    window.open(`sms:?body=${smsBody}`, '_self');
    setOpen(false);
  };

  const nativeShare = async () => {
    if (navigator.share) {
      posthog.capture('naili_share_created', { method: 'native' });
      try {
        await navigator.share({ title, text: body, url: shareUrl });
      } catch { /* user cancelled */ }
      setOpen(false);
    }
  };

  const isDark = variant === 'dark';
  const btnBase = isDark
    ? 'inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/15'
    : 'inline-flex w-full items-center justify-center gap-2 rounded-xl border border-hairline bg-canvas-50 px-4 py-3 text-sm font-semibold text-ink-600 transition-colors hover:bg-canvas-100';

  return (
    <div className="relative w-full" ref={menuRef}>
      <button onClick={() => setOpen(!open)} className={btnBase}>
        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Share2 className="h-4 w-4" />}
        {copied ? 'Link copied!' : 'Share this plan'}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 right-0 z-50 mb-2 overflow-hidden rounded-2xl border border-hairline bg-canvas-50 shadow-[0_16px_48px_rgba(0,0,0,0.12)]">
          <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
            <span className="text-sm font-semibold text-ink">Share your plan</span>
            <button onClick={() => setOpen(false)} className="rounded-full p-1 text-ink-400 hover:bg-canvas-50 hover:text-ink">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-2">
            <button onClick={copyLink} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors hover:bg-canvas-50">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-canvas-200">
                <Copy className="h-4 w-4 text-ink-600" />
              </div>
              <div>
                <div className="font-semibold text-ink">Copy link</div>
                <div className="text-xs text-ink-500">Anyone with the link can view</div>
              </div>
            </button>
            <button onClick={emailSpouse} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors hover:bg-canvas-50">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FDE68A]/30">
                <Users className="h-4 w-4 text-[#B45309]" />
              </div>
              <div>
                <div className="font-semibold text-ink">Email to spouse / partner</div>
                <div className="text-xs text-ink-500">Pre-written email to get their input</div>
              </div>
            </button>
            <button onClick={emailContractor} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors hover:bg-canvas-50">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-mint/20">
                <Mail className="h-4 w-4 text-[#5BA88C]" />
              </div>
              <div>
                <div className="font-semibold text-ink">Email to contractor</div>
                <div className="text-xs text-ink-500">Professional scope email ready to send</div>
              </div>
            </button>
            <button onClick={textMessage} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors hover:bg-canvas-50">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#93C5FD]/20">
                <MessageSquare className="h-4 w-4 text-[#2563EB]" />
              </div>
              <div>
                <div className="font-semibold text-ink">Send via text</div>
                <div className="text-xs text-ink-500">Quick share via SMS</div>
              </div>
            </button>
            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
              <button onClick={nativeShare} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors hover:bg-canvas-50">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C4B5FD]/20">
                  <Share2 className="h-4 w-4 text-[#7C3AED]" />
                </div>
                <div>
                  <div className="font-semibold text-ink">More options...</div>
                  <div className="text-xs text-ink-500">AirDrop, WhatsApp, and more</div>
                </div>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
