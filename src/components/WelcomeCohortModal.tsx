'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  X,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  GraduationCap,
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
    // Strictly suppressed for logged-in users (matching Aapaka Astro's welcome popup pattern)
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      {/* Click-outside backdrop */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Warm Ivory / Maroon / Gold Modal Card in Established Site Theme */}
      <div
        data-testid="viar-welcome-modal-card"
        className="relative w-full max-w-lg rounded-3xl bg-[#FBF3E7] text-[#3B2A1E] border-2 border-[#E8A33D]/60 shadow-2xl shadow-[#7B2D26]/25 overflow-hidden z-10 animate-in zoom-in-95 duration-200 font-sans max-h-[92vh] overflow-y-auto"
      >
        {/* Top Decorative Header Accent Bar in Brand Maroon & Gold */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#7B2D26] via-[#E8A33D] to-[#7B2D26]" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close promotion dialog"
          className="absolute top-3.5 right-3.5 z-20 p-1.5 rounded-full text-[#7B2D26]/70 hover:text-[#7B2D26] bg-[#7B2D26]/10 hover:bg-[#7B2D26]/20 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Main Content Container with Generous Spacing */}
        <div className="p-5 sm:p-7 text-center">
          
          {/* 1. Header: Vihangam Real Sun Logo & Academic Brand Mark */}
          <div className="flex flex-col items-center justify-center gap-1.5 mb-3.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#7B2D26]/10 border border-[#7B2D26]/20 text-[#7B2D26]">
              <Image
                src="/images/logo-icon.png"
                alt="VIAR Sun Logo"
                width={20}
                height={20}
                className="w-5 h-5 object-contain"
                priority
              />
              <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.16em] uppercase">
                Vihangam Institute (VIAR)
              </span>
            </div>
            <div className="text-[10px] text-[#3B2A1E]/70 font-medium">
              In Academic Lineage with Aapaka Astro
            </div>
          </div>

          {/* 2. Launch Announcement Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E8A33D]/25 text-[#7B2D26] border border-[#E8A33D]/60 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C1662F]" />
            <span className="tracking-wide uppercase text-[10px] sm:text-[11px]">
              Launch Enrollment Open
            </span>
          </div>

          {/* 3. Headline & Subtitle with Clean Clearance & Line Height */}
          <div className="mb-4">
            <h2
              id="welcome-modal-title"
              data-testid="viar-welcome-modal-title"
              className="text-2xl sm:text-3xl font-black text-[#7B2D26] font-serif tracking-tight leading-tight mb-1.5"
            >
              The Ultimate Astrology Course
            </h2>
            <p className="text-xs sm:text-sm font-bold text-[#C1662F]">
              Basics of Vedic Astrology • 23 Video Modules + 2 Bonus Workshops
            </p>
          </div>

          {/* 4. Instructor Attribution & Credential Badge (Clean Solo Credential) */}
          <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFFDF9] border border-[#E8A33D]/40 text-[#3B2A1E] text-xs font-medium mb-4 shadow-sm">
            <GraduationCap className="w-4 h-4 text-[#7B2D26] shrink-0" />
            <span>
              Taught by <strong>Acharya Niraj Kumar</strong> (Jyotish Acharya, BVB New Delhi)
            </span>
          </div>

          {/* 5. Course Structure Badge Grid */}
          <div className="grid grid-cols-2 gap-2.5 mb-4 text-center">
            <div className="bg-[#FFFDF9] border border-[#E8A33D]/30 rounded-xl p-2.5 shadow-sm">
              <div className="font-extrabold text-[#7B2D26] text-xs sm:text-sm">
                23 Video Modules
              </div>
              <div className="text-[10px] text-[#3B2A1E]/75 font-medium mt-0.5">
                + 2 Bonus Real Chart Labs
              </div>
            </div>
            <div className="bg-[#FFFDF9] border border-[#E8A33D]/30 rounded-xl p-2.5 shadow-sm">
              <div className="font-extrabold text-[#7B2D26] text-xs sm:text-sm">
                100% Self-Paced
              </div>
              <div className="text-[10px] text-[#3B2A1E]/75 font-medium mt-0.5">
                Instant Lifetime Access
              </div>
            </div>
          </div>

          {/* 6. Confirmed Offer Price Box */}
          <div className="p-4 rounded-2xl bg-[#F5EADB] border border-[#E8A33D]/50 mb-4 text-center">
            <div className="flex items-baseline justify-center gap-2.5 flex-wrap">
              <span className="text-3xl sm:text-4xl font-black text-[#7B2D26] font-serif tracking-tight">
                {priceFormatted}
              </span>
              <span className="text-base sm:text-lg font-semibold text-[#3B2A1E]/50 line-through">
                {originalPriceFormatted}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-[#6B8E5A]/20 text-[#355326] border border-[#6B8E5A]/40">
                54% OFF Launch
              </span>
            </div>
            <p className="text-[11px] text-[#3B2A1E]/80 mt-1 font-medium">
              Strictly one-time tuition • Zero recurring fees • Verifiable Certificate included
            </p>
          </div>

          {/* 7. Curriculum Highlights Checklist */}
          <ul className="space-y-1.5 text-xs text-[#3B2A1E]/90 text-left mb-5 max-w-sm mx-auto">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#7B2D26] shrink-0 mt-0.5" />
              <span>
                <strong>23 On-Demand Modules:</strong> 9 Planets, 12 Houses, Rashis, Dashas &amp; Drishti
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#7B2D26] shrink-0 mt-0.5" />
              <span>
                <strong>2 Bonus Clinical Masterclasses:</strong> Real Chart Analysis for Career &amp; Marriage
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#7B2D26] shrink-0 mt-0.5" />
              <span>
                <strong>Verifiable Certificate:</strong> Issued upon passing the 20-question final exam
              </span>
            </li>
          </ul>

          {/* 8. Call to Action & Dismiss Link */}
          <div className="space-y-2.5">
            <Link
              href={`/checkout/${targetCohort?.id || 'cohort-wia-batch-1'}`}
              onClick={handleClose}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base shadow-lg shadow-[#7B2D26]/20 flex items-center justify-center gap-2 bg-gradient-to-r from-[#7B2D26] via-[#8c332b] to-[#7B2D26] text-white hover:brightness-110 active:scale-[0.99] transition cursor-pointer tracking-wide"
            >
              <span>Enroll Now — Instant Access</span>
              <ArrowRight className="w-4 h-4 text-[#E8A33D]" />
            </Link>

            <div>
              <button
                type="button"
                onClick={handleDismissForever}
                className="text-xs text-[#3B2A1E]/70 hover:text-[#7B2D26] underline underline-offset-4 font-medium transition cursor-pointer"
              >
                Maybe later, continue browsing
              </button>
            </div>
          </div>

          {/* 9. Subdued Sister Platform Cross-Link */}
          <div className="mt-4 pt-3 border-t border-[#7B2D26]/10 text-center">
            <p
              data-testid="viar-welcome-modal-astro-link"
              className="text-[11px] text-[#3B2A1E]/75"
            >
              Looking for a personal 1:1 astrological consultation?{' '}
              <a
                href="https://aapkaastro.com"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClose}
                className="font-semibold text-[#7B2D26] hover:text-[#521d18] underline decoration-[#E8A33D] underline-offset-2 transition"
              >
                Visit Aapaka Astro &rarr;
              </a>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
