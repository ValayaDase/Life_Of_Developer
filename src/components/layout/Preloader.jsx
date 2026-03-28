"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHeroStore } from '@/store/heroStore';

const steps = [
  { p: 0, head: "SYSTEM_BOOT", desc: "Initializing neural development engine..." },
  { p: 25, head: "ASSET_LOAD", desc: "Compiling shaders and 3D geometries..." },
  { p: 55, head: "LOGIC_STREAM", desc: "Verifying lifecycle hooks and state..." },
  { p: 85, head: "FINAL_SHAKE", desc: "Tree-shaking unused dependencies..." },
  { p: 100, head: "READY", desc: "Environment stable. Deployment active." }
];

const Preloader = () => {
  const setLoaded = useHeroStore((state) => state.setLoaded);
  const [count, setCount] = useState(0);
  const [activeStep, setActiveStep] = useState(steps[0]);
  const [done, setDone] = useState(false); // Controls the exit animation

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        const increment = prev < 30 ? 0.8 : prev < 70 ? 1.5 : 0.5;
        const next = prev + increment;
        return next > 100 ? 100 : next;
      });
    }, 40);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const current = steps.findLast(s => count >= s.p);
    if (current) setActiveStep(current);
    
    if (count === 100) {
      const timeout = setTimeout(() => {
        setDone(true); // Trigger Exit Animation
        setLoaded();   // Notify HeroStore
        console.log("System Ready: Transitioning to Hero...");
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [count, setLoaded]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div 
          key="preloader-main"
          initial={{ opacity: 1 }}
          exit={{ 
            y: "-100%", // Slide up effect
            opacity: 0,
            transition: { duration: 1.2, ease: [0.8, 0, 0.1, 1] } 
          }}
          className="fixed inset-0 z-[1000] bg-[#030303] flex items-center justify-center font-mono overflow-hidden"
        >
          {/* 1. Background Grid & Scanner */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(to right, #111 1px, transparent 1px), linear-gradient(to bottom, #111 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            <motion.div 
              animate={{ top: ["-10%", "110%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 w-full h-[20vh] bg-gradient-to-b from-transparent via-blue-500/10 to-transparent"
            />
          </div>

          <div className="relative z-10 w-full max-w-5xl px-10 flex flex-col md:flex-row items-center justify-between gap-20">
            
            {/* 2. Left Side: The Visual Counter */}
            <div className="relative order-2 md:order-1 flex flex-col items-start">
                <div className="relative">
                    <motion.span 
                        className="absolute -inset-4 bg-blue-600/10 blur-3xl rounded-full"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    />
                    <h1 className="text-8xl md:text-[12rem] font-black text-white leading-none tracking-tighter tabular-nums italic">
                        {Math.floor(count).toString().padStart(3, '0')}
                    </h1>
                </div>

                {/* Data Pipeline Visualization */}
                <div className="flex gap-2 mt-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <motion.div 
                            key={i}
                            animate={{ 
                                backgroundColor: count > (i * 8) ? "#3b82f6" : "#111",
                                height: count > (i * 8) ? [8, 16, 8] : 8
                            }}
                            transition={{ duration: 0.5 }}
                            className="w-4 rounded-full"
                        />
                    ))}
                </div>
            </div>

            {/* 3. Right Side: Technical Narrative */}
            <div className="flex-1 order-1 md:order-2 space-y-8 border-l border-white/5 pl-10 py-4">
                <div className="space-y-2">
                    <span className="text-[10px] text-blue-500 font-bold tracking-[0.4em] uppercase">Status_Log</span>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeStep.head}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <h2 className="text-white text-3xl font-bold tracking-tight uppercase underline decoration-blue-500 underline-offset-8">
                                {activeStep.head}
                            </h2>
                            <p className="mt-4 text-gray-500 text-sm max-w-sm leading-relaxed uppercase tracking-widest">
                                {activeStep.desc}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Micro-Progress Line */}
                <div className="relative w-full h-[1px] bg-white/5">
                    <motion.div 
                        className="absolute top-0 left-0 h-full bg-blue-500"
                        style={{ width: `${count}%` }}
                    />
                    <motion.div 
                        animate={{ x: `${count}%` }}
                        className="absolute -top-1 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"
                    />
                </div>

                {/* Decorative Build Stats */}
                <div className="grid grid-cols-2 gap-4 text-[9px] text-gray-700 font-bold tracking-tighter uppercase">
                    <div className="flex flex-col gap-1">
                        <span>BUFFER_ALLOC: OK</span>
                        <span>SHADERS_READY: {count > 40 ? "YES" : "WAIT"}</span>
                    </div>
                    <div className="flex flex-col gap-1 text-right">
                        <span>LATENCY: 0.002ms</span>
                        <span>PROCESS_ID: 0x992F</span>
                    </div>
                </div>
            </div>
          </div>

          {/* 4. Bottom Corner Info */}
          <div className="absolute bottom-10 right-10 flex flex-col items-end gap-1 opacity-40">
            <div className="w-12 h-[1px] bg-blue-500 mb-2" />
            <span className="text-[9px] text-white tracking-[0.5em] uppercase">Watumull_Institute_CS</span>
            <span className="text-[8px] text-gray-500 tracking-[0.3em]">MUMBAI_NODE_27.03.26</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;