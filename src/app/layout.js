// src/app/layout.js
// ─────────────────────────────────────────────────────────────────
// SERVER COMPONENT — do NOT add 'use client' here.
// Keeping it server-side allows:
//   1. export const metadata (SEO, OG tags)
//   2. next/font optimisation (zero layout shift)
//
// All client-side logic (Lenis, Zustand, Three.js) lives inside
// page.js and its dynamic() imports, which are always 'use client'.
// ─────────────────────────────────────────────────────────────────

import { Syne, JetBrains_Mono } from 'next/font/google';
import './globals.css';

/* ── Google Fonts ────────────────────────────────────────────────── */
const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['300', '400', '500', '700'],
  display: 'swap',
});

/* ── SEO Metadata ───────────────────────────────────────────────── */
export const metadata = {
  title: 'Developer Life — Portfolio',
  description:
    'An immersive 3D storytelling portfolio by a Computer Engineering student, ' +
    'Technical Head @ CSI, MERN Stack & AI/ML enthusiast.',
  keywords: [
    'portfolio', 'developer', 'MERN stack', 'Three.js', 'React',
    'Next.js', 'AI', 'ML', 'CSI', 'Watumull Institute',
  ],
  openGraph: {
    title: 'Developer Life — Portfolio',
    description: 'Scroll through the story of a developer: from sanctuary to chaos.',
    type: 'website',
  },
};

/* ── Root Layout ────────────────────────────────────────────────── */
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${syne.variable} ${jetbrains.variable}`}>
      {/*
        overflow-x-hidden — prevents horizontal scroll from 3D canvas overflow
        antialiased       — font smoothing
        The actual background colour is set per-section; body is near-black
        as a safe fallback.
      */}
      <body className="bg-[#050508] text-white antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}