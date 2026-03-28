import { create } from 'zustand';

/**
 * heroStore
 * ─────────
 * Single source of truth shared between:
 *  - Preloader (sets isLoaded)
 *  - HeroScene / RoomModel (reads isLoaded, isMobile)
 *  - Overlay (reads isLoaded)
 */
export const useHeroStore = create((set) => ({
  /* Loading state */
  isLoaded: false,
  progress: 0,
  setProgress: (progress) => set({ progress }),
  setLoaded: () => set({ isLoaded: true }),

  /* Responsive */
  isMobile: false,
  setIsMobile: (isMobile) => set({ isMobile }),
}));