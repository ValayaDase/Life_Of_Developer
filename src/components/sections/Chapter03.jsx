'use client';

import { useRef, useEffect, useState } from 'react';
import {
    useScroll, useMotionValue, useTransform, useSpring,
    motion, AnimatePresence,
} from 'framer-motion';
import dynamic from 'next/dynamic';
import { useHeroStore } from '@/store/heroStore';

const DeploymentScene = dynamic(() => import('@/components/canvas/Deploymentscene'), {
    ssr: false,
    loading: () => null,
});

/* ─────────────────────────────────────────────────────────────────
   PHASE NARRATIVES — text cards that fade in/out per scroll phase
───────────────────────────────────────────────────────────────── */
const NARRATIVE_PHASES = [
    {
        id: 'phase-floor',
        range: [0, 0.22],
        badge: '03 // THE GRAVEYARD SHIFT',
        title: 'Coffee: Cold.\nCode: Hot.',
        body: '3 AM. Another mug bites the dust. The diff is one line. The context is six months.',
        align: 'left',
    },
    {
        id: 'phase-rise',
        range: [0.28, 0.55],
        badge: '04 // THE ASCENT',
        title: 'One last\npush.',
        body: 'The desk materialises. git commit -m "please work". The universe holds its breath.',
        align: 'right',
    },
    {
        id: 'phase-screen',
        range: [0.60, 0.82],
        badge: '05 // THE PORTAL',
        title: 'Entering\nproduction.',
        body: 'The screen swells. Deployment pipeline spinning. Heart rate: undefined.',
        align: 'center',
    },
];

/* ─────────────────────────────────────────────────────────────────
   NARRATIVE PANEL
───────────────────────────────────────────────────────────────── */
function NarrativePanel({ phase, scrollYProgress }) {
    const [start, end] = phase.range;
    const mid = (start + end) / 2;

    const rawOpacity = useTransform(
        scrollYProgress,
        [start, start + 0.05, mid, end - 0.05, end],
        [0, 1, 1, 1, 0]
    );
    const opacity = useSpring(rawOpacity, { stiffness: 75, damping: 20 });
    const rawY = useTransform(scrollYProgress, [start, end], ['1.8rem', '-1.8rem']);
    const y = useSpring(rawY, { stiffness: 60, damping: 18 });

    const alignClass =
        phase.align === 'right'
            ? 'items-end text-right ml-auto mr-8 md:mr-16'
            : phase.align === 'center'
                ? 'items-center text-center mx-auto'
                : 'items-start text-left ml-8 md:ml-16';

    return (
        <motion.div
            style={{ opacity, y }}
            className={`absolute bottom-[14%] flex flex-col gap-2 max-w-xs md:max-w-sm ${alignClass} pointer-events-none`}
        >
            <div className="flex items-center gap-2">
                <span style={{
                    fontFamily: '"JetBrains Mono",monospace',
                    fontSize: '10px',
                    color: '#00ffaa',
                    letterSpacing: '0.28em',
                    textTransform: 'uppercase',
                }}>
                    {phase.badge}
                </span>
                <div style={{ height: '1px', width: '28px', background: 'rgba(0,255,170,0.45)' }} />
            </div>

            <div style={{
                background: 'rgba(2,6,24,0.72)',
                border: '1px solid rgba(0,255,170,0.12)',
                borderRadius: '10px',
                padding: '14px 18px',
                backdropFilter: 'blur(14px)',
                boxShadow: '0 0 24px rgba(0,255,100,0.06), inset 0 1px 0 rgba(255,255,255,0.04)',
            }}>
                <h3 style={{
                    fontFamily: "'Syne',sans-serif",
                    fontSize: '1.35rem',
                    color: '#ffffff',
                    fontWeight: 800,
                    margin: '0 0 6px',
                    lineHeight: 1.25,
                    whiteSpace: 'pre-line',
                }}>
                    {phase.title}
                </h3>
                <p style={{
                    fontFamily: '"JetBrains Mono",monospace',
                    fontSize: '11px',
                    color: 'rgba(0,255,170,0.6)',
                    margin: 0,
                    lineHeight: 1.6,
                    letterSpacing: '0.02em',
                }}>
                    {phase.body}
                </p>
            </div>
        </motion.div>
    );
}



/* ─────────────────────────────────────────────────────────────────
   SCROLL PROGRESS BAR  — green theme for Chapter 03
───────────────────────────────────────────────────────────────── */
function GreenScrollBar({ scrollYProgress }) {
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
    return (
        <motion.div
            className="fixed bottom-0 left-0 h-[2px] w-full origin-left z-50"
            style={{
                scaleX,
                background: 'linear-gradient(90deg,#00ff88,#00ffcc)',
                boxShadow: '0 0 10px rgba(0,255,136,0.7)',
            }}
        />
    );
}

/* ─────────────────────────────────────────────────────────────────
   CORNER HUD
───────────────────────────────────────────────────────────────── */
function CornerHUD({ scrollYProgress }) {
    const [pct, setPct] = useState(0);
    useEffect(() => scrollYProgress.on('change', v => setPct(Math.round(v * 100))), [scrollYProgress]);

    const op = useTransform(scrollYProgress, [0.02, 0.08], [0, 1]);
    const label = pct < 25 ? 'Floor Level' : pct < 55 ? 'Ascending…' : pct < 83 ? 'Approaching Screen' : 'Deployed ✓';

    return (
        <motion.div
            style={{ opacity: op }}
            className="fixed top-6 right-6 z-50 flex flex-col items-end gap-1 select-none pointer-events-none"
        >
            <span style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '10px', color: 'rgba(0,255,170,0.55)', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
                Chapter-03
            </span>
            <span style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '12px', color: 'rgba(255,255,255,0.32)' }}>
                {String(pct).padStart(3, '0')}%
            </span>
            <div style={{ height: '1px', width: '36px', background: 'rgba(0,255,170,0.22)' }} />
            <span style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '9px', color: 'rgba(0,255,170,0.42)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                {label}
            </span>
        </motion.div>
    );
}

/* ─────────────────────────────────────────────────────────────────
   CHAPTER 03 ENTRY BADGE  — fades in then out
───────────────────────────────────────────────────────────────── */
function EntryBadge({ scrollYProgress }) {
    const opacity = useTransform(scrollYProgress, [0, 0.05, 0.18, 0.28], [0, 1, 1, 0]);
    const rawY = useTransform(scrollYProgress, [0, 0.05], ['1.2rem', '0rem']);
    const y = useSpring(rawY, { stiffness: 90, damping: 22 });

    return (
        <motion.div
            style={{ opacity, y }}
            className="absolute top-[10%] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-3 pointer-events-none w-full px-6"
        >
            <span style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '9px', color: 'rgba(0,255,170,0.5)', letterSpacing: '0.5em', textTransform: 'uppercase' }}>
                [ Chapter 03 ]
            </span>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(2.2rem,5.5vw,4.5rem)', fontWeight: 900, color: '#fff', textAlign: 'center', lineHeight: 1, margin: 0 }}>
                The Sleepless{' '}
                <span style={{ background: 'linear-gradient(135deg,#00ff88,#00ffcc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 0 14px rgba(0,255,136,0.5))' }}>
                    Deployment
                </span>
            </h2>
            <p style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '11px', color: 'rgba(255,255,255,0.28)', letterSpacing: '0.22em', textTransform: 'uppercase', textAlign: 'center', margin: 0 }}>
                From floor to production · 400vh of pure adrenaline
            </p>
        </motion.div>
    );
}

/* ─────────────────────────────────────────────────────────────────
   CHAPTER 03 — main export
───────────────────────────────────────────────────────────────── */
export default function Chapter03() {
    const isMobile = useHeroStore(s => s.isMobile);

    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end'],
    });

    const scrollMV = useMotionValue(0);
    useEffect(() => scrollYProgress.on('change', v => scrollMV.set(v)), [scrollYProgress, scrollMV]);

    return (
        <>
            {/* 400vh scroll driver */}
            <section
                ref={containerRef}
                id="chapter-03"
                className="relative h-[400vh]"
                style={{ background: '#020617' }}
            >
                {/* Sticky viewport */}
                <div className="sticky top-0 w-full h-screen overflow-hidden">

                    {/* 3-D scene */}
                    <DeploymentScene scrollProgress={scrollMV} isMobile={isMobile} />

                    {/* Gradient bridge from Chapter02 */}
                    <div
                        className="absolute inset-x-0 top-0 h-28 pointer-events-none z-20"
                        style={{ background: 'linear-gradient(to bottom,#0a0005 0%,transparent 100%)' }}
                    />

                    {/* Soft vignette — edges only */}
                    <div
                        className="absolute inset-0 pointer-events-none z-10"
                        style={{ background: 'radial-gradient(ellipse 88% 88% at 50% 48%,transparent 22%,rgba(2,6,23,0.6) 100%)' }}
                    />

                    {/* Entry badge */}
                    <EntryBadge scrollYProgress={scrollYProgress} />

                    {/* Narrative phase panels */}
                    {NARRATIVE_PHASES.map(phase => (
                        <NarrativePanel key={phase.id} phase={phase} scrollYProgress={scrollYProgress} />
                    ))}

                </div>
            </section>

            {/* Fixed chrome */}
            <GreenScrollBar scrollYProgress={scrollYProgress} />
            <CornerHUD scrollYProgress={scrollYProgress} />
        </>
    );
}