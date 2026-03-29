'use client';

// src/app/page.js
// ─────────────────────────────────────────────────────────────────
// This is the ONLY client entry point for the whole narrative.
// Everything Three.js / browser API is gated behind dynamic() with
// ssr: false so the server never tries to run WebGL code.
// ─────────────────────────────────────────────────────────────────

import dynamic from 'next/dynamic';
import { useHeroStore } from '@/store/heroStore';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';
import DebuggingDescent from '@/components/sections/DebuggingDescent';
import BlueprintAssembly from '@/components/sections/BlueprintAssembly';
// import Preloader from '@/components/layout/Preloader';

/* ── Dynamic imports ─────────────────────────────────────────────── */

const Preloader = dynamic(() => import('@/components/layout/Preloader'), {
  ssr: false,
});

const Overlay = dynamic(() => import('@/components/layout/Overlay'), {
  ssr: false,
});

const Hero = dynamic(() => import('@/components/sections/Hero'), {
  ssr: false,
  loading: () => <div className="h-[400vh] bg-[#050508]" />,
});

const Chapter03 = dynamic(() => import('@/components/sections/Chapter03'), {
  ssr: false,
  loading: () => <div className="h-screen bg-[#020617]" />,
});


/* ── Page ────────────────────────────────────────────────────────── */
export default function HomePage() {
  const isLoaded = useHeroStore((s) => s.isLoaded);

  return (
    /*
      SmoothScrollProvider wraps everything so Lenis controls all
      scrolling — both Hero's 400vh and Chapter02's 400vh get the
      same cinematic ease.
    */
    <SmoothScrollProvider>

      {/* ── Global Preloader (Data Stream concept, z-100) ── */}
      <Preloader />

      {/* ── Persistent Nav / HUD (visible post-load) ── */}
      <Overlay isLoaded={isLoaded} />

      {/* ── Narrative Sections ── */}
      <main className="relative">

        {/*
          ┌─────────────────────────────────┐
          │  Chapter 01 — The Sanctuary     │
          │  Hero section: 400vh pinned     │
          │  Desk scene, laptop opening,    │
          │  GSAP intro dolly               │
          └─────────────────────────────────┘
        */}
        <Hero />

        {/*
          ┌─────────────────────────────────┐
          │  Chapter 02 — The Debugging     │
          │  Paradox: 400vh pinned          │
          │  Chaos desk, red alert, glitch  │
          │  post-processing, jitter cam    │
          └─────────────────────────────────┘
        */}
        <DebuggingDescent />
        <BlueprintAssembly />
        <Chapter03 />

        {/*
          ─────────────────────────────────────────────────────────
          This is the end of the current narrative.
          ─────────────────────────────────────────────────────────
        */}

      </main>
    </SmoothScrollProvider>
  );
}