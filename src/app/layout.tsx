import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';
import WelcomeCohortModal from '@/components/WelcomeCohortModal';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://viar.in'),
  title: 'Viar.in | Online Vedic Astrology Education Academy',
  description:
    'Viar.in is a premier online astrology academy by Acharya Niraj Kumar (Aapka Astro). Live cohort classes on Zoom/Meet, recordings, final test, and verifiable certification.',
  icons: {
    icon: '/images/favicon.png',
    shortcut: '/images/favicon.png',
    apple: '/images/logo-icon.png',
  },
  keywords: [
    'astrology courses',
    'vedic astrology classes',
    'jyotish academy',
    'acharya niraj kumar',
    'what is astrology course',
    'aapka astro',
    'learn astrology online',
  ],
  openGraph: {
    title: 'Viar.in — Live Vedic Astrology Academy by Acharya Niraj Kumar',
    description:
      'Learn authentic Vedic astrology in live interactive cohorts with Acharya Niraj Kumar. 18 classes, recordings, and certification.',
    url: 'https://viar.in',
    siteName: 'Viar.in — Vihangam Institute of Astrology and Research',
    images: [
      {
        url: '/images/logo.png',
        width: 1024,
        height: 1024,
        alt: 'VIAR - Vihangam Institute of Astrology and Research',
      },
    ],
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" data-theme="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('viar_theme');
                  // Default to 'light' mode unless user explicitly selected 'dark'
                  var theme = (saved === 'dark' || saved === 'light') ? saved : 'light';
                  document.documentElement.classList.remove('light', 'dark');
                  document.documentElement.classList.add(theme);
                  document.documentElement.setAttribute('data-theme', theme);
                  document.documentElement.style.colorScheme = theme;
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased cosmic-bg flex flex-col min-h-screen selection:bg-amber-500 selection:text-black`}
      >
        {/* // TODO: SWITCH BACK TO LIVE CLERK KEYS ONCE viar.in DNS IS VERIFIED */}
        {/* Keys must be supplied via Vercel / environment variables (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY). Zero code fallbacks. */}
        {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? (
          <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
            <ThemeProvider>
              <Navbar />
              <main className="flex-grow">{children}</main>
              <Footer />
              <WelcomeCohortModal />
            </ThemeProvider>
          </ClerkProvider>
        ) : (
          <ThemeProvider>
            <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 text-center text-xs font-mono text-amber-300">
              ⚠️ <strong>Authentication Misconfigured:</strong> <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> is missing from environment variables.
            </div>
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
            <WelcomeCohortModal />
          </ThemeProvider>
        )}
      </body>
    </html>
  );
}