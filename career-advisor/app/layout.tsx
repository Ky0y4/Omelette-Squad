import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Career Intelligence Advisor',
  description: 'Find your ideal career path with AI-powered recommendations',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
