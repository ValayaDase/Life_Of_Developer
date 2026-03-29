'use client';

import { useRef, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const CARDS = [
    { id: 1, title: 'The Denial Phase', body: "It worked on my machine 5 minutes ago. I haven't changed anything. The compiler is lying to me." },
    { id: 2, title: 'The Google Rabbit Hole', body: "Searching for the error on Stack Overflow. Post found: 'Nevermind, I fixed it.' (Posted 8 years ago, 0 replies)." },
    { id: 3, title: 'The Semicolon Savior', body: 'Spent 3 hours refactoring the entire backend. Realized I just missed a semicolon on line 42. I am a professional.' },
];

const ERRORS = [
    { text: 'CORS Error', left: '10%', top: '75%' },
    { text: 'Missing ;', left: '80%', top: '85%' },
    { text: '404 Not Found', left: '15%', top: '105%' },
    { text: 'Unexpected Token <', left: '75%', top: '125%' },
    { text: 'Null Pointer Exception', left: '20%', top: '145%' },
    { text: 'undefined is not a function', left: '60%', top: '165%' },
    { text: 'Maximum Call Stack', left: '80%', top: '70%' },
];

export default function DebuggingDescent() {
    const wrapperRef = useRef(null);
    const containerRef = useRef(null);
    const cardsRef = useRef([]);

    // 1. NEW: Add a ref to control the character's final fall
    const charRef = useRef(null);

    useLayoutEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        let ctx = gsap.context(() => {
            if (cardsRef.current.length !== 3) return;

            // Securely push Cards 2 and 3 down out of view before scroll starts
            gsap.set(cardsRef.current[1], { y: 600, opacity: 0 });
            gsap.set(cardsRef.current[2], { y: 600, opacity: 0 });

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: wrapperRef.current,
                    pin: containerRef.current,
                    start: 'top top',
                    end: '+=400%',
                    scrub: 1,
                },
            });

            // Errors float up endlessly over the whole scroll distance
            tl.to('.ambient-error', { y: -1200, duration: 4, ease: 'none' }, 0);

            // SCROLL PHASE 1: Card 2 comes up.
            tl.to(cardsRef.current[0], { scale: 0.95, y: -25, opacity: 0.5, duration: 1 }, 0)
                .to(cardsRef.current[1], { y: 0, opacity: 1, duration: 1, ease: 'power2.out' }, 0);

            // A tiny pause so the user can read Card 2
            tl.to({}, { duration: 0.5 });

            // SCROLL PHASE 2: Card 3 comes up.
            tl.to(cardsRef.current[0], { scale: 0.90, y: -50, opacity: 0.2, duration: 1 }, 1.5)
                .to(cardsRef.current[1], { scale: 0.95, y: -25, opacity: 0.5, duration: 1 }, 1.5)
                .to(cardsRef.current[2], { y: 0, opacity: 1, duration: 1, ease: 'power2.out' }, 1.5);

            // SCROLL PHASE 3 (THE FIX): Add empty buffer time at the end! 
            tl.to({}, { duration: 1.5 });

            // 2. NEW: The Final Drop! 
            // Plunge the character off the bottom of the screen just before the section unpins
            tl.to(charRef.current, {
                y: window.innerHeight + 800,
                duration: 1.5,
                ease: 'power3.in'
            }, "-=1"); // The '-=1' makes the fall start during the buffer time

        }, wrapperRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={wrapperRef} className="relative w-full bg-[#020617]">
            <section
                ref={containerRef}
                className="relative h-screen w-full overflow-hidden flex items-center"
            >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#0f172a_0%,_#020617_100%)] pointer-events-none" />

                <div className="absolute top-8 left-8 md:top-12 md:left-12 z-50 pointer-events-none">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] md:text-xs font-mono tracking-[0.4em] text-cyan-400 uppercase">
                            PHASE // 02
                        </span>
                        <div className="h-px w-10 bg-gradient-to-r from-cyan-500/50 to-transparent" />
                    </div>
                    <h2
                        className="text-3xl md:text-5xl lg:text-6xl font-black text-white/95 tracking-tighter mt-3"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                        DEBUGGING
                    </h2>
                </div>

                <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 h-full w-full max-w-7xl pt-[100px] lg:pt-0">

                    <div className="relative h-full w-full flex items-center justify-center">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

                        {ERRORS.map((err, i) => (
                            <div
                                key={i}
                                className="ambient-error absolute text-red-500/60 font-mono text-[10px] md:text-xs whitespace-nowrap pointer-events-none z-0 will-change-transform"
                                style={{ left: err.left, top: err.top }}
                            >
                                <span className="bg-red-950/40 px-3 py-1.5 rounded border border-red-500/20">
                                    {err.text}
                                </span>
                            </div>
                        ))}

                        {/* 3. NEW: Wrap the motion.div in a standard div to receive the GSAP charRef */}
                        <div ref={charRef} className="relative z-10 w-80 md:w-[28rem] lg:w-[35rem] flex justify-center items-center will-change-transform">
                            <motion.div
                                className="w-full h-auto"
                                animate={{ y: [0, -25, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                <img
                                    src="/image_c51503.png"
                                    alt="Falling Developer"
                                    className="w-full h-auto object-contain"
                                />
                            </motion.div>
                        </div>
                    </div>

                    <div className="relative h-[60vh] lg:h-full w-full flex items-center justify-center">
                        <div className="relative w-full max-w-sm md:max-w-md h-[280px]">
                            {CARDS.map((card, index) => (
                                <div
                                    key={card.id}
                                    ref={(el) => { if (el) cardsRef.current[index] = el; }}
                                    className="absolute inset-0 flex flex-col justify-center p-8 rounded-2xl shadow-2xl origin-top will-change-transform"
                                    style={{
                                        backgroundColor: '#090D1A',
                                        border: '1px solid rgba(0, 240, 255, 0.2)',
                                        boxShadow: '0 -20px 40px -10px rgba(0,0,0,0.8)',
                                        zIndex: index,
                                    }}
                                >
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-10 h-10 rounded-lg bg-cyan-950 flex items-center justify-center border border-cyan-500/50 text-cyan-400 font-mono text-sm">
                                            0{card.id}
                                        </div>
                                        <h3
                                            className="text-white text-xl md:text-2xl font-bold tracking-tight"
                                            style={{ fontFamily: "'Syne', sans-serif" }}
                                        >
                                            {card.title}
                                        </h3>
                                    </div>

                                    <div className="w-full h-px bg-cyan-900/50 mb-6" />

                                    <p
                                        className="text-slate-300 text-sm md:text-base leading-relaxed font-mono"
                                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                    >
                                        {card.body}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}