import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EHY Connect — Omnichannel Contact Center & Social Media Management',
  description: 'Enterprise platform combining MindBehind conversational contact center with Hootsuite multi-platform social media publishing.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-neutral-100 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-100 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
