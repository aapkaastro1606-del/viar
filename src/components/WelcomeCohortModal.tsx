'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  X,
  Sparkles,
  Clock,
  ShieldCheck,
  Award,
  Video,
  ArrowRight,
  BookOpen,
  Users
} from 'lucide-react';
import { ViarStore } from '@/lib/store';
import { Course, Cohort } from '@/lib/types';
import { formatInTimezone, getUserLocalTimezone } from '@/lib/timezones';

interface WelcomeCohortModalProps {
  /** Override storage key for preview or testing */
  storageKey?: string;
  /** Milliseconds delay before modal automatically appears */
  delayMs?: number;
}

export default function WelcomeCohortModal({
  storageKey = 'viar_welcome_modal_dismissed_v1',
  delayMs = 2200,
}: WelcomeCohortModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [userTz, setUserTz] = useState<string>('Asia/Kolkata');

  useEffect(() => {
    // Check if dismissed previously
    try {
      const dismissed = localStorage.getItem(storageKey);
      if (dismissed === 'true') {
        return;
      }
    } catch {
      // Storage unavailable or disabled
    }

    const flagship = ViarStore.getCourseBySlug('what-is-astrology');
    if (flagship) setCourse(flagship);

    const cohorts = ViarStore.getCohorts('course-what-is-astrology');
    if (cohorts.length > 0) setCohort(cohorts[0]);

    const tz = ViarStore.getTimezone() || getUserLocalTimezone();
    setUserTz(tz);

    const timer = setTimeout(() => {
      setIsOpen(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [storageKey, delayMs]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleDismissForever = () => {
    try {
      localStorage.setItem(storageKey, 'true');
    } catch {
      // Ignore
    }
    setIsOpen(false);
  };

  if (!isOpen || !course) return null;

  const targetCohort = cohort || ViarStore.getCohorts()[0];
  const seatsRemaining = targetCohort ? Math.max(0, targetCohort.maxSeats - targetCohort.enrolledCount) : 12;
  const formattedClassTime = targetCohort
    ? formatInTimezone(targetCohort.startDate, userTz, 'timeOnly')
    : '8:00 PM IST';
  const formattedDate = targetCohort
    ? formatInTimezone(targetCohort.startDate, userTz, 'dateOnly')
    : 'October 3, 2026';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300"
    >
      {/* Click-outside backdrop */}
      <div className="absolute inset-0" onClick={handleClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-xl rounded-2xl bg-gradient-to-b from-[#131b2e] via-[#0f172a] to-[#0a0f1d] border border-amber-500/30 shadow-2xl shadow-amber-950/40 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        
        {/* Decorative Top Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          aria-label="Close welcome banner"
          className="absolute top-4 right-4 z-20 p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-5 sm:p-7 max-h-[90vh] overflow-y-auto">
          
          {/* Badge & Urgency Pill */}
          <div className="flex items-center gap-2 flex-wrap mb-3.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{targetCohort?.batchName || 'Batch 1 — Enrolling Now'}</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <Users className="w-3 h-3 text-emerald-400" />
              <span>Only {seatsRemaining} of {targetCohort?.maxSeats || 50} Seats Open</span>
            </span>
          </div>

          {/* Headline */}
          <h2
            id="welcome-modal-title"
            className="text-xl sm:text-2xl font-black text-white leading-snug"
          >
            Master Sacred Vedic Jyotish from First Principles
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Welcome to <strong className="text-amber-300">Viar.in</strong> — the live academic academy by <strong className="text-white">Acharya Niraj Kumar</strong>. We do not provide quick automated horoscopes or per-minute chat. We teach authentic, rigorous chart analysis through an interactive 9-week live cohort.
          </p>

          {/* Flagship Course Box */}
          <div className="mt-4 p-4 rounded-xl bg-white/[0.03] border border-white/10">
            <div className="flex items-start gap-3">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-amber-500/30">
                <Image
                  src={course.instructor.avatarUrl || '/images/Acharya_Niraj_Kumar.jpg'}
                  alt={course.instructor.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-white truncate">
                    {course.title}
                  </h3>
                  <div className="text-right shrink-0">
                    <span className="text-base font-black text-amber-400">
                      ₹{course.priceInr.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-slate-500 line-through ml-1.5">
                      ₹{course.originalPriceInr.toLocaleString()}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Instructor: <span className="text-amber-200 font-medium">{course.instructor.name}</span> (20+ yrs experience)
                </p>
              </div>
            </div>

            {/* Core Value Pillars of Viar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 mt-3 border-t border-white/10 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Video className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>18 Live Zoom Classes (2 / week)</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Starts {formattedDate} ({formattedClassTime})</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>HD Recordings & Full Study Handouts</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Verifiable Academy Certification</span>
              </div>
            </div>
          </div>

          {/* Risk-Free Guarantee Callout */}
          <div className="mt-3.5 px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2.5 text-xs text-emerald-300">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>
              <strong>100% Risk-Free:</strong> Attend the first 2 classes. Full refund anytime before class 3 if it’s not right for you.
            </span>
          </div>

          {/* Action CTAs */}
          <div className="mt-5 space-y-2.5">
            <Link
              href={`/checkout/${targetCohort?.id || 'cohort-wia-batch-1'}`}
              onClick={handleClose}
              className="gold-button w-full py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 text-slate-950 transition"
            >
              <span>Enroll in Batch 1 Now (One-Time Tuition)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="flex items-center justify-between gap-2 pt-1 text-xs">
              <Link
                href="/courses/what-is-astrology"
                onClick={handleClose}
                className="text-slate-400 hover:text-amber-300 underline underline-offset-2 transition"
              >
                View Full 18-Class Syllabus & Schedule
              </Link>

              <button
                type="button"
                onClick={handleDismissForever}
                className="text-slate-500 hover:text-slate-300 transition text-[11px]"
              >
                Don&apos;t show again
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
