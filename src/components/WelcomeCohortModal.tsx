'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  X,
  Sparkles,
  Clock,
  ShieldCheck,
  Award,
  Video,
  ArrowRight,
  BookOpen,
  Users,
  Compass
} from 'lucide-react';
import { ViarStore } from '@/lib/store';
import { Course, Cohort } from '@/lib/types';
import { formatInTimezone, getUserLocalTimezone } from '@/lib/timezones';

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
  const [userTz, setUserTz] = useState<string>('Asia/Kolkata');

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleDismissForever = useCallback(() => {
    try {
      localStorage.setItem(dismissKey, 'true');
    } catch {
      // Storage unavailable or quota exceeded
    }
    setIsOpen(false);
  }, [dismissKey]);

  useEffect(() => {
    // 1. Route Suppression: Never show on instructor or admin routes
    if (!pathname || pathname.startsWith('/instructor') || pathname.startsWith('/admin')) {
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

    const tz = ViarStore.getTimezone() || getUserLocalTimezone();
    setUserTz(tz);

    const timer = setTimeout(() => {
      // Mark as shown for this session
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

  // Real, genuine remaining seats calculated directly from live Cohort capacity and enrolled count
  const cohortCapacity = targetCohort?.capacity || targetCohort?.maxSeats || 50;
  const cohortEnrolled = targetCohort?.enrolledCount ?? 0;
  const seatsRemaining = Math.max(0, cohortCapacity - cohortEnrolled);

  const formattedClassTime = targetCohort
    ? formatInTimezone(targetCohort.startDate, userTz, 'timeOnly')
    : '8:00 PM IST';
  const formattedDate = targetCohort
    ? formatInTimezone(targetCohort.startDate, userTz, 'dateOnly')
    : 'October 3, 2026';

  // Dynamic pricing and discount pulled directly from Course / Cohort data
  const currentPriceFormatted = `₹${course.priceInr.toLocaleString('en-IN')}`;
  const originalPriceFormatted = `₹${course.originalPriceInr.toLocaleString('en-IN')}`;
  const discountPercentage =
    course.originalPriceInr > course.priceInr
      ? Math.round(((course.originalPriceInr - course.priceInr) / course.originalPriceInr) * 100)
      : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
    >
      {/* Click-outside backdrop */}
      <div className="absolute inset-0" onClick={handleClose} />

      {/* Modal Container: Styled with Aapka Astro & Viar Brand Design System */}
      {/* Deep Maroon (#7B2D26), Marigold Gold (#E8A33D), Warm Ivory (#FBF3E7) */}
      <div className="relative w-full max-w-xl rounded-2xl bg-[#FBF3E7] text-[#3B2A1E] border-2 border-[#E8A33D]/60 shadow-2xl shadow-[#7B2D26]/30 overflow-hidden z-10 animate-in zoom-in-95 duration-200 font-sans">
        
        {/* Top Decorative Header Accent Bar in Brand Maroon & Gold */}
        <div className="h-2 w-full bg-gradient-to-r from-[#7B2D26] via-[#E8A33D] to-[#7B2D26]" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          aria-label="Close promotion dialog"
          className="absolute top-4 right-4 z-20 p-2 rounded-full text-[#7B2D26]/70 hover:text-[#7B2D26] bg-[#7B2D26]/10 hover:bg-[#7B2D26]/20 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-5 sm:p-7 max-h-[90vh] overflow-y-auto">
          
          {/* Header Badges: Batch Name & Live Database Remaining Seats */}
          <div className="flex items-center gap-2 flex-wrap mb-3.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#7B2D26]/10 text-[#7B2D26] border border-[#7B2D26]/25">
              <Sparkles className="w-3.5 h-3.5 text-[#E8A33D]" />
              <span>{targetCohort?.batchName || 'Batch 1 — Enrolling Now'}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#6B8E5A]/15 text-[#425b36] border border-[#6B8E5A]/30">
              <Users className="w-3.5 h-3.5 text-[#6B8E5A]" />
              <span>Only {seatsRemaining} {seatsRemaining === 1 ? 'seat' : 'seats'} left in {targetCohort?.batchName ? targetCohort.batchName.split('—')[0].trim() : 'Batch 1'}</span>
            </span>
          </div>

          {/* Headline in Brand Heading Font (Cinzel / Yatra One) */}
          <h2
            id="welcome-modal-title"
            className="text-xl sm:text-2xl font-black text-[#7B2D26] font-serif tracking-tight leading-snug"
          >
            Enroll in &lsquo;{course.title.split('—')[0].trim()}&rsquo; — Launch Price {currentPriceFormatted}
          </h2>

          <p className="text-xs sm:text-sm text-[#3B2A1E]/80 mt-2 leading-relaxed font-sans">
            Welcome to <strong className="text-[#7B2D26]">Viar.in</strong> — the live academic academy by <strong className="text-[#7B2D26]">Acharya Niraj Kumar</strong>. Master authentic Vedic Jyotish through an interactive 9-week live cohort with fellow seekers.
          </p>

          {/* Flagship Course Box with Live Pricing & Differentiators */}
          <div className="mt-4 p-4 rounded-xl bg-white/80 border border-[#E8A33D]/30 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 border-[#E8A33D]/60 shadow-sm">
                <Image
                  src={course.instructor.avatarUrl || '/images/Acharya_Niraj_Kumar.jpg'}
                  alt={course.instructor.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-[#3B2A1E] truncate font-serif">
                    {course.title}
                  </h3>
                  <div className="text-right shrink-0">
                    <span className="text-base font-black text-[#7B2D26]">
                      {currentPriceFormatted}
                    </span>
                    {course.originalPriceInr > course.priceInr && (
                      <span className="text-[11px] text-[#3B2A1E]/50 line-through ml-1.5">
                        {originalPriceFormatted}
                      </span>
                    )}
                    {discountPercentage && (
                      <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#6B8E5A]/20 text-[#425b36] border border-[#6B8E5A]/30">
                        {discountPercentage}% OFF
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-[#3B2A1E]/70 mt-0.5">
                  Instructor: <span className="text-[#7B2D26] font-semibold">{course.instructor.name}</span> (20+ yrs experience)
                </p>
              </div>
            </div>

            {/* Confirmed Real Course Structure Differentiators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 mt-3 border-t border-[#E8A33D]/20 text-xs text-[#3B2A1E]">
              <div className="flex items-start gap-2">
                <Video className="w-3.5 h-3.5 text-[#7B2D26] shrink-0 mt-0.5" />
                <span><strong className="text-[#7B2D26]">18 Live Classes over 9 Weeks</strong> (interactive on Zoom)</span>
              </div>
              <div className="flex items-start gap-2">
                <BookOpen className="w-3.5 h-3.5 text-[#6B8E5A] shrink-0 mt-0.5" />
                <span><strong className="text-[#425b36]">Recordings Count Identically</strong> to live attendance</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-[#7B2D26] shrink-0 mt-0.5" />
                <span>Starts {formattedDate} ({formattedClassTime})</span>
              </div>
              <div className="flex items-start gap-2">
                <Award className="w-3.5 h-3.5 text-[#E8A33D] shrink-0 mt-0.5" />
                <span><strong className="text-[#7B2D26]">Verifiable Certificate</strong> on passing final exam</span>
              </div>
            </div>
          </div>

          {/* 100% Risk-Free Guarantee Callout */}
          <div className="mt-3.5 px-3.5 py-2.5 rounded-xl bg-[#6B8E5A]/15 border border-[#6B8E5A]/30 flex items-center gap-2.5 text-xs text-[#425b36]">
            <ShieldCheck className="w-4 h-4 shrink-0 text-[#6B8E5A]" />
            <span>
              <strong>100% Risk-Free:</strong> Attend the first 2 classes. Full refund anytime before class 3 if it’s not right for you.
            </span>
          </div>

          {/* Action CTAs */}
          <div className="mt-5 space-y-2.5">
            <Link
              href={`/checkout/${targetCohort?.id || 'cohort-wia-batch-1'}`}
              onClick={handleClose}
              className="w-full py-3.5 rounded-xl font-bold text-sm shadow-md shadow-[#7B2D26]/20 flex items-center justify-center gap-2 bg-gradient-to-r from-[#7B2D26] via-[#8c332b] to-[#7B2D26] text-white hover:brightness-110 active:scale-[0.99] transition"
            >
              <span>Enroll Now — Claim Your Seat</span>
              <ArrowRight className="w-4 h-4 text-[#E8A33D]" />
            </Link>

            <div className="flex items-center justify-between gap-2 pt-1 text-xs">
              <Link
                href="/courses/what-is-astrology"
                onClick={handleClose}
                className="text-[#7B2D26] hover:text-[#521d18] font-medium underline underline-offset-2 transition"
              >
                View Full 18-Class Syllabus & Schedule
              </Link>

              <button
                type="button"
                onClick={handleDismissForever}
                className="text-[#3B2A1E]/60 hover:text-[#3B2A1E] transition text-[11px]"
              >
                Don&apos;t show again
              </button>
            </div>

            {/* Subordinate Secondary Line for Personal Consultation */}
            <div className="pt-2 text-center border-t border-[#E8A33D]/25">
              <a
                href="https://aapkaastro.com"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClose}
                className="inline-flex items-center gap-1.5 text-xs text-[#3B2A1E]/70 hover:text-[#7B2D26] transition group"
              >
                <Compass className="w-3.5 h-3.5 text-[#7B2D26]/70 group-hover:text-[#7B2D26] transition" />
                <span>Want a personal consultation instead? <span className="underline underline-offset-2 font-medium">Visit Aapka Astro &rarr;</span></span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
