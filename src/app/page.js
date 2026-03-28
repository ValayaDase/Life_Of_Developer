'use client';

import dynamic from 'next/dynamic';
import { useHeroStore } from '../store/heroStore';

const Hero = dynamic(() => import('../components/sections/Hero'), { 
  ssr: false,
  loading: () => <div className="h-screen bg-[#050508]" />
});

export default function HomePage() {
  const isLoaded = useHeroStore((s) => s.isLoaded);

  return (
    <main className="relative bg-[#050508]">
      {/* 400vh 3D Story Section */}
      <Hero />

      {/* Section 2: Projects Reveal */}
      <section
        id="projects"
        className="relative min-h-screen flex items-center justify-center z-20"
        style={{ background: '#020409' }}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(#00f0ff 1px, transparent 1px), linear-gradient(90deg, #00f0ff 1px, transparent 1px)', backgroundSize: '50px 50px' }}
        />
        <div className="relative text-center z-10">
          <h2 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter">
            Digital <span className="text-cyan-400 text-outline">Projects</span>
          </h2>
          <p className="text-white/30 font-mono mt-4">Exploring the architecture of code.</p>
        </div>
      </section>
    </main>
  );
}