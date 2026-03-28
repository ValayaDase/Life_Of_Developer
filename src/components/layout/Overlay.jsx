'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Globe, User, Mail, Code2, Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Sanctuary', href: '#hero' },
  { label: 'Projects', href: '#projects' },
  { label: 'Stack',    href: '#stack' },
  { label: 'Contact',  href: '#contact' },
];

const SOCIAL = [
  { Icon: Globe,   href: 'https://github.com/',   label: 'GitHub' },
  { Icon: User, href: 'https://linkedin.com/',  label: 'LinkedIn' },
  { Icon: Mail,     href: 'mailto:hello@dev.io',    label: 'Email' },
];

export default function Overlay({ isLoaded }) {
  const [menuOpen, setMenuOpen] = useState(false);
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

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 pointer-events-auto">
            {NAV_ITEMS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-white/40 hover:text-cyan-400 transition-colors duration-200 text-xs tracking-widest uppercase font-mono"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Social + mobile menu */}
          <div className="pointer-events-auto flex items-center gap-3">
            {SOCIAL.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-white/30 hover:text-cyan-400 hover:border-cyan-400/40 transition-all duration-200 hidden md:flex"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <Icon size={13} />
              </a>
            ))}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="md:hidden w-8 h-8 flex flex-col items-center justify-center gap-1"
              aria-label="Toggle menu"
            >
              <motion.span
                className="block w-5 h-px bg-cyan-400"
                animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 4 : 0 }}
                transition={{ duration: 0.2 }}
              />
              <motion.span
                className="block w-5 h-px bg-cyan-400"
                animate={{ opacity: menuOpen ? 0 : 1 }}
                transition={{ duration: 0.2 }}
              />
              <motion.span
                className="block w-5 h-px bg-cyan-400"
                animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -4 : 0 }}
                transition={{ duration: 0.2 }}
              />
            </button>
          </div>
        </motion.header>
      )}

      {/* Mobile drawer */}
      {menuOpen && isLoaded && (
        <motion.div
          key="mobile-menu"
          className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            background: 'rgba(5,5,20,0.96)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {NAV_ITEMS.map(({ label, href }, i) => (
            <motion.a
              key={label}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="text-white text-3xl font-bold tracking-tight"
              style={{ fontFamily: "'Syne', sans-serif" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <span className="text-cyan-500 text-sm font-mono mr-2">{String(i + 1).padStart(2, '0')}.</span>
              {label}
            </motion.a>
          ))}
          <div className="flex gap-4 mt-4">
            {SOCIAL.map(({ Icon, href, label }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                className="text-white/40 hover:text-cyan-400 transition-colors"
              >
                <Icon size={20} />
              </a>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}