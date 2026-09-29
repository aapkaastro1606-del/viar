import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About the Institute & Acharya Niraj Kumar | Vihangam Institute of Astrology and Research (VIAR)',
  description:
    'Learn about Vihangam Institute of Astrology and Research (VIAR) and founder Acharya Niraj Kumar (Jyotish Acharya, Bhartiya Vidya Bhavan) — bridging ancient Vedic wisdom with contemporary inquiry, self-paced masterclasses, and corporate leadership insight.',
  openGraph: {
    title: 'About Vihangam Institute of Astrology and Research (VIAR)',
    description:
      'Learn about Vihangam Institute of Astrology and Research (VIAR) and lead instructor Acharya Niraj Kumar.',
    url: 'https://viar.in/about',
    siteName: 'Vihangam Institute of Astrology and Research (VIAR)',
    type: 'profile',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
