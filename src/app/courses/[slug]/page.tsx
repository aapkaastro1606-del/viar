import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { INITIAL_COURSES } from '@/lib/data';
import CourseDetailClient from '@/components/CourseDetailClient';

interface Props {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = INITIAL_COURSES.find((c) => c.slug === params.slug);
  if (!course) {
    return {
      title: 'Course Not Found | Viar.in',
    };
  }

  const title = `${course.title} | Vihangam Institute of Astrology and Research`;
  const description = `${course.tagline} 23 self-paced video modules + 2 bonus workshops with Acharya Niraj Kumar (Jyotish Acharya, BVB New Delhi). On-demand access, final exam, and verifiable VIAR certificate.`;

  return {
    title,
    description,
    keywords: [
      course.title,
      'vedic astrology course',
      'learn astrology online',
      'jyotish masterclass',
      'aapka astro',
      'acharya',
      'astrology certification',
    ],
    openGraph: {
      title,
      description,
      url: `https://viar.in/courses/${course.slug}`,
      siteName: 'Vihangam Institute of Astrology and Research (VIAR)',
      type: 'website',
      images: [
        {
          url: course.instructor.avatarUrl,
          width: 800,
          height: 600,
          alt: course.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [course.instructor.avatarUrl],
    },
    alternates: {
      canonical: `https://viar.in/courses/${course.slug}`,
    },
  };
}

export default function CourseDetailPage({ params }: Props) {
  const course = INITIAL_COURSES.find((c) => c.slug === params.slug);

  if (!course) {
    notFound();
  }

  // Schema.org Course Structured Data (JSON-LD)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    provider: {
      '@type': 'EducationalOrganization',
      name: 'Vihangam Institute of Astrology and Research',
      alternateName: 'VIAR',
      url: 'https://viar.in',
      logo: 'https://viar.in/images/logo.png',
      sameAs: 'https://aapkaastro.com',
    },
    instructor: {
      '@type': 'Person',
      name: course.instructor.name,
      jobTitle: course.instructor.title,
      url: 'https://aapkaastro.com',
    },
    educationalCredentialAwarded: 'Certificate of Completion in Vedic Astrology',
    occupationalCredentialAwarded: 'Jyotish Foundations Accredited Certificate',
    coursePrerequisites: 'None. Open to passionate beginners worldwide.',
    offers: [
      {
        '@type': 'Offer',
        price: course.priceInr,
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        category: 'Tuition',
        url: `https://viar.in/courses/${course.slug}`,
      },
      {
        '@type': 'Offer',
        price: course.priceUsd,
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        category: 'Tuition',
        url: `https://viar.in/courses/${course.slug}`,
      },
    ],
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      duration: `P${course.durationWeeks}W`,
      courseWorkload: `PT${course.totalClasses * 1.5}H`,
      instructor: {
        '@type': 'Person',
        name: course.instructor.name,
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CourseDetailClient slug={params.slug} />
    </>
  );
}
