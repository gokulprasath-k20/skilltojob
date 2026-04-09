import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'Skill2Jobs – AI Resume, Portfolio & Job Platform',
  description: 'Build ATS-ready resumes, stunning portfolios, and find AI-matched jobs with Skill2Jobs.',
  keywords: 'resume builder, portfolio generator, job finder, AI resume, career platform',
  openGraph: {
    title: 'Skill2Jobs – AI Career Platform',
    description: 'Build ATS-ready resumes, stunning portfolios, and find AI-matched jobs.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
