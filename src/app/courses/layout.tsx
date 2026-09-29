import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Course Catalog | Vihangam Institute of Astrology and Research (VIAR)',
  description:
    'Explore authentic Vedic astrology courses by Acharya Niraj Kumar (Jyotish Acharya, BVB New Delhi). Structured 23-module self-paced curriculum, bonus case studies, final examination, and recognized VIAR certification.',
  keywords: [
    'vedic astrology courses',
    'jyotish curriculum',
    'what is astrology course',
    'astrology certification courses',
    'vihangam institute of astrology and research',
    'aapka astro classes',
  ],
  openGraph: {
    title: 'Astrology Course Catalog — Vihangam Institute of Astrology and Research',
    description:
      'Explore self-paced masterclasses in Vedic Astrology. Enroll in our flagship 23-module curriculum.',
    url: 'https://viar.in/courses',
    siteName: 'VIAR.in',
    type: 'website',
  },
};

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
