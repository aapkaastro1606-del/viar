'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  X,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { ViarStore } from '@/lib/store';
import { Course, Cohort } from '@/lib/types';

interface WelcomeCohortModalProps {
  /** Override session key for testing or customization */
  sessionKey?: string;
  /** Persistent dismiss key for "Don't show again" */
  dismissKey?: string;
  /** Milliseconds delay before modal appears */
  delayMs?: number;
}

export default function WelcomeCohortModal({
  sessionKey = 'viar_welcome_modal_shown_session',
  dismissKey = 'viar_welcome_modal_dismissed_v1',
  delayMs = 1800,
}: WelcomeCohortModalProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [cohort, setCohort] = useState<Cohort | null>(null);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    try {
      sessionStorage.setItem(sessionKey, 'true');
    } catch {
      // Ignore storage errors
    }
  }, [sessionKey]);

  const handleDismissForever = useCallback(() => {
    try {
      localStorage.setItem(dismissKey, 'true');
      sessionStorage.setItem(sessionKey, 'true');
    } catch {
      // Storage unavailable or quota exceeded
    }
    setIsOpen(false);
  }, [dismissKey, sessionKey]);

  useEffect(() => {
    // 1. Route Suppression: Never show on dashboard, admin, instructor, checkout, or auth routes
    if (
      !pathname ||
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/instructor') ||
      pathname.startsWith('/checkout') ||
      pathname.startsWith('/login') ||
      pathname.startsWith('/signup') ||
      pathname.startsWith('/sign-in') ||
      pathname.startsWith('/sign-up') ||
      pathname.startsWith('/sso-callback')
    ) {
      setIsOpen(false);
      return;
    }

    // 2. Persistent Dismissal Check (localStorage)
    try {
      if (localStorage.getItem(dismissKey) === 'true') {
        return;
      }
    } catch {
      // Ignore storage errors
    }

    // 3. Once per visitor per session check (sessionStorage)
    try {
      if (sessionStorage.getItem(sessionKey) === 'true') {
        return;
      }
    } catch {
      // Ignore storage errors
    }

    // 4. User Logged-In Suppression Check:
    // Strictly suppressed for logged-in users (same behavioral pattern as Aapaka Astro)
    const currentUser = ViarStore.getCurrentUser();
    if (currentUser) {
      return;
    }

    // Check for active authentication session cookie (Clerk)
    if (
      typeof document !== 'undefined' &&
      (document.cookie.includes('__session') || document.cookie.includes('__client_uat'))
    ) {
      return;
    }

    // 5. Load flagship course and cohort data
    const flagshipSlug = 'what-is-astrology-basics-of-astrology';
    const flagship =
      ViarStore.getCourseBySlug(flagshipSlug) ||
      ViarStore.getCourseBySlug('what-is-astrology') ||
      ViarStore.getCourses()[0];
    const flagshipCohort = flagship ? ViarStore.getCohorts(flagship.id)[0] : null;

    if (flagship) {
      setCourse(flagship);
      if (flagshipCohort) {
        setCohort(flagshipCohort);
      }
    }

    // Query live database/API endpoint to ensure real-time pricing and availability
    fetch(`/api/courses?slug=${flagship?.slug || flagshipSlug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.course) {
          setCourse(data.course);
          if (data.course.cohorts && data.course.cohorts.length > 0) {
            setCohort(data.course.cohorts[0]);
          }
        }
      })
      .catch(() => {
        // Fallback to ViarStore initialized state
      });

    const timer = setTimeout(() => {
      try {
        sessionStorage.setItem(sessionKey, 'true');
      } catch {
        // Ignore
      }
      setIsOpen(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [pathname, sessionKey, dismissKey, delayMs]);

  // 6. Dismissible via Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen || !course) return null;

  const targetCohort = cohort || ViarStore.getCohorts()[0];
  const priceFormatted = `₹${(course.priceInr || 5100).toLocaleString('en-IN')}`;
  const originalPriceFormatted = `₹${(course.originalPriceInr || 11000).toLocaleString('en-IN')}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
      data-testid="viar-welcome-cohort-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      {/* Click-outside backdrop */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Visually Strong Product Showcase Modal Card */}
      <div
        data-testid="viar-welcome-modal-card"
        className="relative w-full max-w-2xl rounded-3xl bg-gradient-to-b from-[#111726] via-[#0D121F] to-[#070A10] text-white border border-amber-500/40 shadow-[0_0_60px_-15px_rgba(232,163,61,0.3)] overflow-hidden z-10 animate-in zoom-in-95 duration-200 font-sans max-h-[92vh] overflow-y-auto"
      >
        {/* Celestial Decorative Watermark (SVG Orbit & Constellation Motif) */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-amber-500/15 blur-3xl pointer-events-none rounded-full" />
        <svg
          className="absolute -right-16 -top-16 w-72 h-72 opacity-10 pointer-events-none text-amber-300"
          viewBox="0 0 200 200"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="100" cy="100" r="65" stroke="currentColor" strokeWidth="1" />
          <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="100" cy="100" r="15" stroke="currentColor" strokeWidth="1" />
        </svg>

        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-7 pt-4 pb-2 border-b border-white/5 relative z-10">
          <div className="flex items-center gap-2.5">
            <Image
              src="/images/logo-icon.png"
              alt="Vihangam Sun Logo"
              width={26}
              height={26}
              className="w-6 h-6 object-contain"
            />
            <div>
              <div className="text-[10px] font-bold tracking-[0.18em] text-amber-400 uppercase">
                Vihangam Institute of Astrology and Research
              </div>
              <div className="text-[9px] text-slate-400">
                VIAR.IN • In Academic Lineage with Aapaka Astro
              </div>
            </div>
          </div>

          {/* Accessible Close Button */}
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close promotion dialog"
            className="p-1.5 rounded-full text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: 2-Column Product Showcase Layout */}
        <div className="p-5 sm:p-7 grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-center relative z-10">
          {/* Left Column: Visual Product Showcase Card */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="w-full rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900/90 to-black border border-amber-500/35 p-4 text-center shadow-xl relative overflow-hidden">
              {/* Subtle Sunburst Radial */}
              <div className="absolute -inset-1 bg-gradient-to-tr from-amber-500/10 to-transparent blur-sm pointer-events-none" />

              {/* Instructor Portrait with Radiant Golden Ring */}
              <div className="relative mb-3 inline-block">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-amber-500 via-amber-300 to-orange-600 shadow-lg shadow-amber-500/25">
                  <Image
                    src="/images/Acharya_Niraj_Kumar.jpg"
                    alt="Acharya Niraj Kumar"
                    width={112}
                    height={112}
                    className="w-full h-full rounded-full object-cover object-top"
                    priority
                  />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#7B2D26] border border-amber-400/70 text-amber-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-md">
                  Jyotish Acharya
                </div>
              </div>

              {/* Instructor Details */}
              <div className="text-white font-bold text-xs sm:text-sm mt-1">
                Acharya Niraj Kumar
              </div>
              <div className="text-[10px] text-amber-300 font-medium">
                Bharatiya Vidya Bhavan, New Delhi
              </div>

              {/* Styled Module-Count Showcase Badges */}
              <div className="w-full mt-3.5 pt-3 border-t border-white/10 space-y-2">
                <div className="bg-gradient-to-r from-amber-500/20 via-amber-400/15 to-amber-500/20 border border-amber-500/40 rounded-xl py-2 px-2.5">
                  <div className="text-xs font-black text-amber-300 tracking-wide uppercase">
                    23 Video Modules
                  </div>
                  <div className="text-[10px] text-amber-200/90 font-semibold mt-0.5">
                    + 2 Bonus Real Chart Workshops
                  </div>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-300 font-medium">
                  <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>100% Self-Paced • Instant Lifetime Access</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Offer, Copy & Enrollment CTA */}
          <div className="md:col-span-7 space-y-3.5">
            {/* Offer Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/35">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="tracking-wide uppercase">Launch Enrollment Open</span>
            </div>

            {/* Course Title Headline */}
            <div>
              <h2
                id="welcome-modal-title"
                data-testid="viar-welcome-modal-title"
                className="text-xl sm:text-2xl font-black text-white font-serif tracking-tight leading-snug"
              >
                The Ultimate Astrology Course
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-amber-400/90 mt-0.5">
                Basics of Vedic Astrology (23 Modules + 2 Bonus)
              </p>
            </div>

            {/* Price Box with Struck-Through Figure */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30">
              <div className="flex items-baseline gap-2.5 flex-wrap">
                <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-400 tracking-tight">
                  {priceFormatted}
                </span>
                <span className="text-base sm:text-lg font-semibold text-slate-400 line-through">
                  {originalPriceFormatted}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  54% OFF Launch
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1">
                Strictly one-time tuition • Zero recurring fees • Lifetime vault access
              </p>
            </div>

            {/* Real Structure Checklist */}
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>23 HD Video Modules:</strong> Grahas, Rashis, Bhavas, Drishti, Combustion &amp; Dashas
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>2 Bonus Masterclasses:</strong> Real Chart Analysis for Career &amp; Marriage
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Graded Exam &amp; Certificate:</strong> Verifiable digital credential upon completion
                </span>
              </li>
            </ul>

            {/* Primary CTA and Dismiss Option */}
            <div className="pt-2 space-y-2">
              <Link
                href={`/checkout/${targetCohort?.id || 'cohort-wia-batch-1'}`}
                onClick={handleClose}
                className="w-full py-3 px-6 rounded-xl font-extrabold text-sm sm:text-base shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 hover:brightness-110 active:scale-[0.99] transition tracking-wide cursor-pointer"
              >
                <span>Enroll Now — Instant Access</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </Link>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleDismissForever}
                  className="text-xs text-slate-400 hover:text-slate-200 underline underline-offset-4 transition cursor-pointer"
                >
                  Maybe later, continue browsing
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Subdued Sister Platform Cross-Link */}
        <div className="px-6 py-2.5 bg-black/40 border-t border-white/5 text-center relative z-10">
          <p
            data-testid="viar-welcome-modal-astro-link"
            className="text-[11px] text-slate-400"
          >
            Looking for a personal 1:1 astrological consultation?{' '}
            <a
              href="https://aapkaastro.com"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClose}
              className="font-semibold text-amber-400 hover:text-amber-300 underline decoration-amber-500/60 underline-offset-2 transition"
            >
              Visit Aapaka Astro &rarr;
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
