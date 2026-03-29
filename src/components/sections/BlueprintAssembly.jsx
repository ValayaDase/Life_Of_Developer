'use client';

import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Database, ShieldCheck, Network, LayoutTemplate, Server } from 'lucide-react';

const MODULES = [
    { id: 'db', label: 'DATABASE', startX: -400, startY: -400, finalX: -130, finalY: -130, icon: <Database size={24} /> },
    { id: 'sec', label: 'SECURITY', startX: 400, startY: -400, finalX: 130, finalY: -130, icon: <ShieldCheck size={24} /> },
    { id: 'api', label: 'SERVICE MESH', startX: -400, startY: 400, finalX: -130, finalY: 130, icon: <Network size={24} /> },
    { id: 'ui', label: 'INTERFACE', startX: 400, startY: 400, finalX: 130, finalY: 130, icon: <LayoutTemplate size={24} /> },
];

export default function BlueprintAssembly() {
    const wrapperRef = useRef(null);
    const containerRef = useRef(null);
    const charAreaRef = useRef(null);
    const narrativeRef = useRef(null);
    const modulesRef = useRef([]);

    useLayoutEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        let ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: wrapperRef.current,
                    pin: true,
                    start: 'top top',
                    end: '+=350%',
                    scrub: 1,
                },
            });

            // PHASE 1: Character and Narrative Entrance
            tl.fromTo(charAreaRef.current,
                { y: 600, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
            );

            tl.fromTo(narrativeRef.current,
                { x: -50, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.8 },
                "-=0.5"
            );

            // PHASE 2: Modules Snapping to the Core Hub
            MODULES.forEach((mod, i) => {
                tl.fromTo(modulesRef.current[i],
                    { x: mod.startX, y: mod.startY, opacity: 0, scale: 0.5, rotate: 45 },
                    {
                        x: mod.finalX, y: mod.finalY, opacity: 1, scale: 1, rotate: 0,
                        duration: 1, ease: "back.out(1.4)",
                        force3D: true
                    },
                    "-=0.6"
                );
                // Note: Safely removed boxShadow scrub animations as they cause severe paint lag
            });

            // Extra breathing room at the end
            tl.to({}, { duration: 0.5 });

        }, wrapperRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={wrapperRef} className="relative w-full bg-[#020617] overflow-hidden">
            <section ref={containerRef} className="relative h-screen w-full flex bg-[#020617]">

                {/* 1. BACKGROUND LAYER: Blueprint Grid */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.15]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(0, 240, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.2) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px'
                    }}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#020617_90%)] pointer-events-none" />

                {/* --- TITLE (Top Left) --- */}
                <div className="absolute top-8 left-8 md:top-12 md:left-12 z-50 pointer-events-none">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] md:text-xs font-mono tracking-[0.4em] text-cyan-400 uppercase">
                            PHASE // 03
                        </span>
                        <div className="h-px w-10 bg-gradient-to-r from-cyan-500/50 to-transparent" />
                    </div>
                    <h2
                        className="text-3xl md:text-5xl lg:text-6xl font-black text-white/95 tracking-tighter mt-3"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                        ARCHITECTURE
                    </h2>
                </div>

                {/* 2. LEFT SIDE: CONTENT & CHARACTER */}
                <div className="relative w-[45%] md:w-1/2 h-full flex flex-col justify-start pt-[200px] md:pt-[260px] px-8 md:pl-12 md:pr-0 z-30">
                    
                    {/* Text Narrative */}
                    <div ref={narrativeRef} className="max-w-md relative z-40 will-change-transform">
                        <p className="text-slate-400 font-mono text-sm md:text-base leading-relaxed border-l-2 border-cyan-500/50 pl-6 bg-cyan-500/5 py-4 rounded-r-lg backdrop-blur-sm">
                            The chaos of debugging ends here. We transition from fixing errors to establishing a robust, scalable infrastructure where every byte has a purpose.
                        </p>
                    </div>

                    {/* CHARACTER ANCHOR (Bottom Right of Left Side) */}
                    <div ref={charAreaRef} className="absolute bottom-0 right-0 md:right-6 w-[85%] md:w-[75%] min-w-[300px] z-50 pointer-events-none flex flex-col items-center will-change-transform">
                        <img
                            src="/standing-dev.png"
                            alt="Standing Developer"
                            className="w-full h-auto object-contain drop-shadow-[0_-20px_50px_rgba(0,0,0,0.9)]"
                            onError={(e) => e.target.style.display = 'none'}
                        />

                        {/* The Hover Pad (Energy Disc) */}
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-6 bg-cyan-500/20 blur-2xl rounded-full" />
                        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-[60%] h-1 bg-cyan-400/30 blur-md rounded-full" />
                    </div>
                </div>

                {/* 3. RIGHT SIDE: THE ARCHITECTURE HUB */}
                <div className="relative w-[55%] md:w-1/2 h-full flex items-center justify-center">
                    {/* The Core Server Node */}
                    <div className="relative z-20 w-32 h-32 md:w-40 md:h-40 rounded-full bg-[#050814] border-2 border-cyan-500/60 shadow-[0_0_60px_rgba(0,240,255,0.15)] flex flex-col items-center justify-center group transition-all duration-500">
                        <Server size={44} className="text-cyan-400 mb-2 animate-pulse" />
                        <span className="font-mono text-cyan-400 text-[10px] tracking-[0.3em] font-bold">CORE_SYSTEM</span>

                        {/* Orbiting Ring Decoration */}
                        <div className="absolute -inset-4 border border-cyan-500/20 rounded-full animate-[spin_10s_linear_infinite]" />
                    </div>

                    {/* Animated Connection Modules */}
                    {MODULES.map((mod, i) => (
                        <div key={mod.id} ref={el => modulesRef.current[i] = el}
                            className="absolute z-10 w-24 h-24 md:w-28 md:h-28 bg-[#030712]/95 border border-cyan-500/40 rounded-2xl flex flex-col items-center justify-center p-4 shadow-[0_0_15px_rgba(0,240,255,0.2)] overflow-hidden will-change-transform">
                            <div className="text-cyan-400 mb-2 opacity-80 group-hover:opacity-100">{mod.icon}</div>
                            <span className="font-mono text-cyan-200 text-[9px] font-bold text-center leading-tight">{mod.label}</span>
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
                        </div>
                    ))}
                </div>

            </section>
        </div>
    );
}
