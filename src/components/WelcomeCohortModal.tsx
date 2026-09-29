'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { X, ArrowRight } from 'lucide-react';
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
    // 1. Route Suppression: Never show on instructor, admin, dashboard, checkout, or auth routes
    if (
      !pathname ||
      pathname.startsWith('/instructor') ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/checkout') ||
      pathname.startsWith('/login') ||
      pathname.startsWith('/signup') ||
      pathname.startsWith('/sso-callback')
    ) {
      setIsOpen(false);
      return;
    }

    // 2. Persistent Dismissal Check
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

    // 4. Student Enrollment Suppression Check:
    // Do not show to a student who is already enrolled in the flagship cohort.
    const currentUser = ViarStore.getCurrentUser();
    const flagshipSlug = 'what-is-astrology';
    const flagship = ViarStore.getCourseBySlug(flagshipSlug);
    const flagshipCohort = flagship ? ViarStore.getCohorts(flagship.id)[0] : null;

    if (currentUser && flagshipCohort) {
      const userCohorts = currentUser.enrolledCohortIds || [];
      const isEnrolledInCohort = userCohorts.includes(flagshipCohort.id);

      // Also check enrollments list in store for current user's email or ID
      const allEnrollments = ViarStore.getEnrollments();
      const hasActiveEnrollment = allEnrollments.some(
        (e) =>
          (e.studentEmail?.toLowerCase() === currentUser.email?.toLowerCase() ||
            e.studentId === currentUser.id) &&
          (e.cohortId === flagshipCohort.id || (flagship && e.courseId === flagship.id))
      );

      if (isEnrolledInCohort || hasActiveEnrollment) {
        return; // Suppress modal for already enrolled students
      }
    }

    if (flagship) {
      setCourse(flagship);
      if (flagshipCohort) {
        setCohort(flagshipCohort);
      }
    }

    // Query live database/API endpoint to ensure real-time capacity and pricing sync
    fetch(`/api/courses?slug=${flagshipSlug}`)
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

  // 5. Dismissible via Escape key
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

  // Dynamic pricing pulled directly from Course data
  const currentPriceFormatted = `₹${course.priceInr.toLocaleString('en-IN')}`;
  const shortCourseTitle = course.title.split('—')[0].trim();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
      data-testid="viar-welcome-cohort-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
    >
      {/* Click-outside backdrop */}
      <div className="absolute inset-0 cursor-pointer" onClick={handleClose} />

      {/* Compact Single-Screen Modal Card in Viar & Aapka Astro Brand Design System */}
      <div
        data-testid="viar-welcome-modal-card"
        className="relative w-full max-w-md rounded-2xl bg-[#FBF3E7] text-[#3B2A1E] border-2 border-[#E8A33D]/60 shadow-2xl shadow-[#7B2D26]/30 overflow-hidden z-10 animate-in zoom-in-95 duration-200 font-sans"
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

        <div className="px-6 py-5 sm:px-7 sm:py-6 text-center space-y-3">
          {/* 1. Small Logo / Brand Mark */}
          <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold bg-[#7B2D26]/10 text-[#7B2D26] border border-[#7B2D26]/25">
            <Image
              src="/images/logo-icon.png"
              alt="VIAR Logo"
              width={16}
              height={16}
              className="w-4 h-4 object-contain inline-block"
            />
            <span className="tracking-widest uppercase">Vihangam Institute (VIAR)</span>
          </div>

          {/* 2. Headline Naming Course and Price */}
          <h2
            id="welcome-modal-title"
            data-testid="viar-welcome-modal-title"
            className="text-xl sm:text-2xl font-black text-[#7B2D26] font-serif tracking-tight leading-snug"
          >
            Enroll in &lsquo;{shortCourseTitle}&rsquo; — {currentPriceFormatted}
          </h2>

          {/* 3. One Short Line of Subtext (Self-Paced Benefits) */}
          <p className="text-xs sm:text-sm text-[#3B2A1E]/85 leading-snug font-sans">
            Instant lifetime access to 23 video modules, 2 bonus chart masterclasses, and verifiable certification by Acharya Niraj Kumar.
          </p>

          {/* 4. One Primary CTA */}
          <div className="pt-1">
            <Link
              href={`/checkout/${targetCohort?.id || 'cohort-wia-batch-1'}`}
              onClick={handleClose}
              className="w-full py-3 px-5 rounded-xl font-bold text-sm shadow-md shadow-[#7B2D26]/20 flex items-center justify-center gap-2 bg-gradient-to-r from-[#7B2D26] via-[#8c332b] to-[#7B2D26] text-white hover:brightness-110 active:scale-[0.99] transition"
            >
              <span>Get Instant Lifetime Access</span>
              <ArrowRight className="w-4 h-4 text-[#E8A33D]" />
            </Link>
          </div>

          {/* 5. One Small Dismiss Link */}
          <div>
            <button
              type="button"
              onClick={handleDismissForever}
              className="text-xs text-[#3B2A1E]/70 hover:text-[#7B2D26] underline underline-offset-4 font-medium transition cursor-pointer"
            >
              No thanks, continue browsing
            </button>
          </div>

          {/* 6. Small Cross-Link to Aapka Astro as the Very Last Line in Small Subdued Text */}
          <p
            data-testid="viar-welcome-modal-astro-link"
            className="pt-1 text-[11px] text-[#3B2A1E]/70"
          >
            Want a personal consultation instead?{' '}
            <a
              href="https://aapkaastro.com"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClose}
              className="font-semibold text-[#7B2D26] hover:text-[#521d18] underline decoration-[#E8A33D] underline-offset-2 transition"
            >
              Visit Aapka Astro &rarr;
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
