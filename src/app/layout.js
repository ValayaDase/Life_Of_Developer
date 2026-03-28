// // src/app/layout.js
// "use client";
// import { useStore } from "@/store/appStore"; // Adjust based on your new filename
// import Preloader from "@/components/layout/Preloader";
// import { useLenis } from "@/hooks/useLenis";
// import "./globals.css";

// export default function RootLayout({ children }) {
//   const isLoaded = useStore((state) => state.isLoaded);
  
//   // Initialize Lenis only when loader is finished
//   useLenis(isLoaded);

//   return (
//     <html lang="en">
//       <body className="bg-[#050505] text-white antialiased">
//         {!isLoaded && <Preloader />}
//         <main className={`${isLoaded ? "opacity-100" : "opacity-0 invisible"} transition-opacity duration-1000`}>
//           {children}
//         </main>
//       </body>
//     </html>
//   );
// }

'use client';

import { Syne, JetBrains_Mono } from 'next/font/google';
import dynamic from 'next/dynamic';
import { useHeroStore } from '@/store/heroStore';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';
import './globals.css';

/* ── Fonts Configuration ── */
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

/* ── Dynamic Imports (SSR: false for Browser APIs) ── */
const Preloader = dynamic(() => import('@/components/layout/Preloader'), { ssr: false });
const Overlay   = dynamic(() => import('@/components/layout/Overlay'), { ssr: false });

// Metadata note: App Router mein 'use client' ke saath metadata export nahi hota.
// Agar metadata chahiye toh usse ek separate 'layout.js' (server side) 
// ya 'metadata.js' mein rakhna padega. Yahan hum layout logic par focus kar rahe hain.

export default function RootLayout({ children }) {
  const isLoaded = useHeroStore((s) => s.isLoaded);

  return (
    <html lang="en" className={`${syne.variable} ${jetbrains.variable}`}>
      <body className="bg-[#050508] text-white antialiased overflow-x-hidden">
        {/* 1. Smooth Scroll Wrapper (Lenis) */}
        <SmoothScrollProvider>
          
          {/* 2. Global Preloader (Always on top) */}
          <Preloader />

          {/* 3. Persistent HUD Overlay (Visible only after isLoaded) */}
          <Overlay isLoaded={isLoaded} />

          {/* 4. Page Content */}
          {children}
          
        </SmoothScrollProvider>
      </body>
    </html>
  );
}