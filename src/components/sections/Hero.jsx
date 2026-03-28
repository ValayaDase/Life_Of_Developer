'use client';

import { useRef, useEffect, useState } from 'react';
import { useScroll, useTransform, useMotionValue, useSpring, motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useHeroStore } from '@/store/heroStore';

/* Lazy-load canvas to avoid SSR issues */
const HeroScene = dynamic(() => import('@/components/canvas/HeroScene'), {
  ssr: false,
  loading: () => null,
});

/* ─── Phase definitions ──────────────────────────────────────────── */
const PHASES = [
  {
    id: '01',
    tag: 'THE ARCHITECT',
    sub: 'Watumull Institute of Electronics Engineering & Computer Science',
    body: 'Computer Engineering · 3rd Year · Mumbai University',
    range: [0, 0.28],
    align: 'left',
  },
  {
    id: '02',
    tag: 'THE GRIND',
    sub: 'Technical Head @ CSI · MERN Stack Architect',
    body: 'React · Node.js · MongoDB · Express · REST APIs',
    range: [0.25, 0.53],
    align: 'right',
  },
  {
    id: '03',
    tag: 'THE PERSISTENCE',
    sub: 'AI / ML Enthusiast · Bug Slayer',
    body: 'TensorFlow · Python · Hugging Face · Neural Nets',
    range: [0.50, 0.78],
    align: 'left',
  },
  {
    id: '04',
    tag: 'THE PORTAL',
    sub: 'Entering the Digital Realm',
    body: 'Scroll to continue the journey →',
    range: [0.75, 1.00],
    align: 'center',
  },
];

/* ─── Glassmorphism text panel ───────────────────────────────────── */
function PhasePanel({ phase, scrollYProgress }) {
  const [start, end] = phase.range;
  const midpoint = (start + end) / 2;

  const rawOpacity = useTransform(
    scrollYProgress,
    [start, start + 0.07, midpoint, end - 0.07, end],
    [0, 1, 1, 1, 0]
  );
  const opacity = useSpring(rawOpacity, { stiffness: 80, damping: 20 });

  const y = useTransform(scrollYProgress, [start, end], ['2rem', '-2rem']);
  const smoothY = useSpring(y, { stiffness: 60, damping: 18 });

  const alignClass =
    phase.align === 'right'
      ? 'items-end text-right ml-auto mr-8 md:mr-16'
      : phase.align === 'center'
      ? 'items-center text-center mx-auto'
      : 'items-start text-left ml-8 md:ml-16';

  return (
    <motion.div
      style={{ opacity, y: smoothY }}
      className={`absolute bottom-[15%] flex flex-col gap-2 max-w-sm md:max-w-md ${alignClass} pointer-events-none`}
    >
      {/* Phase badge */}
      <div className="flex items-center gap-2">
        <span
          className="text-[10px] md:text-xs font-mono tracking-[0.3em] text-cyan-400 uppercase"
          style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
        >
          {phase.id} // {phase.tag}
        </span>
        <div className="h-px w-8 bg-cyan-400/60" />
      </div>

      {/* Glass card */}
      <div
        className="rounded-xl border border-white/10 px-5 py-4 md:px-6 md:py-5"
        style={{
          background: 'rgba(5, 5, 20, 0.65)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 0 30px rgba(0,230,255,0.08), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        <h3
          className="text-white text-lg md:text-2xl font-bold leading-tight mb-1"
          style={{ fontFamily: "'Syne', 'Space Grotesk', sans-serif" }}
        >
          {phase.sub}
        </h3>
        <p
          className="text-cyan-300/70 text-xs md:text-sm font-mono tracking-wide"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {phase.body}
        </p>
      </div>
    </motion.div>
  );
}

/* ─── Scroll progress bar ────────────────────────────────────────── */
function ScrollBar({ scrollYProgress }) {
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  return (
    <motion.div
      className="fixed bottom-0 left-0 h-[2px] w-full origin-left z-50"
      style={{
        scaleX,
        background: 'linear-gradient(90deg, #00f0ff, #7b2fff)',
      }}
    />
  );
}

/* ─── Corner HUD ─────────────────────────────────────────────────── */
function CornerHUD({ scrollYProgress }) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    return scrollYProgress.on('change', (v) => setPct(Math.round(v * 100)));
  }, [scrollYProgress]);

  const activePhase = PHASES.find(
    (p) => pct / 100 >= p.range[0] && pct / 100 < p.range[1]
  ) ?? PHASES[0];

  return (
    <div
      className="fixed top-6 right-6 z-50 flex flex-col items-end gap-1 select-none pointer-events-none"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      <span className="text-[10px] text-cyan-500/70 tracking-widest uppercase">
        Developer-Life
      </span>
      <span className="text-xs text-white/40 font-mono">{String(pct).padStart(3, '0')}%</span>
      <div className="h-px w-10 bg-cyan-500/30" />
      <span className="text-[9px] text-cyan-400/50 tracking-[0.2em] uppercase">
        {activePhase.id} // {activePhase.tag}
      </span>
    </div>
  );
}

/* ─── Scroll hint ────────────────────────────────────────────────── */
function ScrollHint({ scrollYProgress }) {
  const opacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);
  return (
    <motion.div
      style={{ opacity }}
      className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 pointer-events-none"
    >
      <span
        className="text-[10px] text-white/40 tracking-[0.3em] uppercase"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        Scroll to explore
      </span>
      <motion.div
        className="w-px h-8 bg-gradient-to-b from-cyan-400/60 to-transparent"
        animate={{ scaleY: [1, 0.3, 1], opacity: [0.6, 0.2, 0.6] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}

/* ─── Hero (main export) ──────────────────────────────────────────── */
export default function Hero() {
  const isLoaded = useHeroStore((s) => s.isLoaded);
  const setIsMobile = useHeroStore((s) => s.setIsMobile);

  /* Pinned scroll container */
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  /* MotionValue passed raw to Three.js (no React re-renders) */
  const scrollMV = useMotionValue(0);
  useEffect(() => {
    return scrollYProgress.on('change', (v) => scrollMV.set(v));
  }, [scrollYProgress, scrollMV]);

  /* Responsive detection */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [setIsMobile]);

  /* Fade-in the whole section once loaded */
  const heroOpacity = useTransform(
    useMotionValue(isLoaded ? 1 : 0),
    [0, 1],
    [0, 1]
  );

  return (
    <>
      {/* 400vh scroll driver */}
      <div ref={containerRef} className="relative h-[400vh]">

        {/* ── Pinned 3D canvas (full viewport) ── */}
        <motion.div
          className="sticky top-0 w-full h-screen overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        >
          <HeroScene scrollProgress={scrollMV} />

          {/* Vignette overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(0,0,0,0.7) 100%)',
            }}
          />

          {/* Phase text panels */}
          <div className="absolute inset-0 pointer-events-none">
            {PHASES.map((phase) => (
              <PhasePanel
                key={phase.id}
                phase={phase}
                scrollYProgress={scrollYProgress}
              />
            ))}
          </div>

          {/* Hero headline (Phase 1 only) */}
          <motion.div
            className="absolute top-[12%] left-1/2 -translate-x-1/2 text-center pointer-events-none w-full px-6"
            style={{
              opacity: useTransform(scrollYProgress, [0, 0.22], [1, 0]),
            }}
          >
            <p
              className="text-[10px] md:text-xs tracking-[0.5em] text-cyan-400/80 mb-3 uppercase"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              [ Portfolio v2.0 ] — Initializing…
            </p>
            <h1
              className="text-4xl md:text-7xl lg:text-8xl font-black text-white leading-none tracking-tight"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Developer
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #00f0ff 0%, #7b2fff 60%, #ff6b2b 100%)',
                }}
              >
                Life
              </span>
            </h1>
            <p
              className="mt-4 text-white/40 text-xs md:text-sm tracking-[0.2em] uppercase"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              The Architect · The Grind · The Persistence
            </p>
          </motion.div>

          {/* Scroll hint */}
          <ScrollHint scrollYProgress={scrollYProgress} />
        </motion.div>
      </div>

      {/* Fixed UI elements */}
      <ScrollBar scrollYProgress={scrollYProgress} />
      <CornerHUD scrollYProgress={scrollYProgress} />
    </>
  );
}