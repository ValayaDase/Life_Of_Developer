'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Globe, User, Mail, Code2, Menu, X } from 'lucide-react';



export default function Overlay({ isLoaded }) {
  const [tick, setTick] = useState(0);

  /* blinking clock */
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 500);
    return () => clearInterval(id);
  }, []);

  const time = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  });

  return (
    <AnimatePresence>
      {isLoaded && (
        <motion.header
          className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex items-center justify-between pointer-events-none"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
        >
          {/* Logo */}
          <div className="pointer-events-auto flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-cyan-500/30"
              style={{
                background: 'rgba(0,240,255,0.08)',
                boxShadow: '0 0 12px rgba(0,240,255,0.15)',
              }}
            >
              <Terminal size={14} className="text-cyan-400" />
            </div>
            <div>
              <span
                className="text-white text-sm font-bold leading-none"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Dev.Life
              </span>
              <p
                className="text-cyan-400/50 text-[9px] font-mono tracking-widest uppercase leading-none mt-0.5"
              >
                {time}
              </p>
            </div>
          </div>


        </motion.header>
      )}
    </AnimatePresence>
  );
}