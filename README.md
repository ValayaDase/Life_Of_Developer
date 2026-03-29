# 🚀 Developer Life: A Cinematic 3D Odyssey

A high-end, immersive portfolio experience built with **Next.js**, **Three.js**, and **GSAP**. This project tells the "story" of a developer's journey—from the initial confidence of a "Hello World" to the chaotic sleepless nights of deployment.

**Live Demo:** https://life-of-developer-mu.vercel.app/ 🌐

---

## 📖 Introduction
"Developer Life" is not just a portfolio; it's an interactive 3D narrative. Using scroll-driven animations, the user travels through a 3D workspace. 
- **The Surface:** The early "God-mode" phase.
- **The Abyss:** Deep debugging and reality checks.
- **The Climax:** A cinematic dolly-in shot into a laptop screen, revealing the final "DEPLOYED SUCCESS!!" message.

---

## 🛠️ Tech Stack & Versions
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Next.js** | 14.x / 15.x | Framework & Routing |
| **React** | 18.x / 19.x | UI Library |
| **Three.js** | ^0.160.0 | 3D Engine |
| **GSAP** | ^3.12.0 | Cinematic Camera Paths |
| **Framer Motion** | ^11.0.0 | UI Transitions & Text Fades |
| **Zustand** | ^4.5.0 | Global State (Loading/Mobile) |
| **Tailwind CSS** | ^3.4.0 | Styling & Layout |

---

📂 Project Structure
```
🚀 developer-life/
├── 📦 public/               # 3D Models (.glb), Favicons, and Static Assets
├── 📂 src/
│   ├── 📂 app/              # Next.js App Router (Page & Layout)
│   │   ├── 📂 ui/           # Shared UI Components
│   │   ├── 📄 layout.js
│   │   └── 📄 page.js
│   ├── 📂 components/
│   │   ├── 📂 canvas/       # Three.js Scene & R3F Components
│   │   │   ├── 🧊 HeroScene.jsx
│   │   │   └── 🏠 RoomModel.jsx
│   │   ├── 📂 layout/       # Overlay and Preloader logic
│   │   └── 📂 sections/     # Modular Page Sections (Hero, etc.)
│   ├── 📂 hooks/            # Custom Hooks (useLenis, etc.)
│   └── 📂 store/            # Zustand Store (heroStore.js)
├── 📜 tailwind.config.js    # Styling configuration
├── 📄 package.json          # Project dependencies & scripts
└── 📘 README.md             # Project documentation
```

## 📦 Libraries Installed
To run this project, the following dependencies are used:
```bash
# Core 3D & Animation
npm install three @types/three @react-three/fiber @react-three/drei gsap framer-motion

# Utilities & Post-processing
npm install maath @react-three/postprocessing zustand lucide-react
```
