'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MeshDistortMaterial, Float, Trail, Text } from '@react-three/drei';
import * as THREE from 'three';

/**
 * RoomModel
 * ─────────
 * Procedural desk / room built from primitives (no .glb required).
 * Camera is animated inside useFrame by reading scrollProgress.get().
 *
 * SCROLL PHASES
 *  0.00 – 0.25  Phase 1 – camera drops from ceiling → wide desk shot
 *  0.25 – 0.50  Phase 2 – dolly into laptop screen
 *  0.50 – 0.75  Phase 3 – pivot toward coffee mug, bug icons orbit
 *  0.75 – 1.00  Phase 4 – extreme zoom into portal, room fades out
 */

/* ─── Camera keyframes ─────────────────────────────────────────────── */
const CAM_KEYFRAMES = [
  // [progress, posX, posY, posZ, targetX, targetY, targetZ]
  [0.00, 0, 8, 6, 0, 0.8, 0],  // top-down drop start
  [0.25, 0, 2.5, 5, 0, 0.8, 0],  // wide desk view
  [0.50, 0, 1.4, 2.2, 0, 1.1, -0.3], // close to laptop screen
  [0.75, 1.6, 1.0, 2.0, 0.5, 0.5, -0.2], // pivot → mug
  [1.00, 0, 1.15, 0.3, 0, 1.1, -1.2], // into portal
];

/* ─── helpers ─────────────────────────────────────────────────────── */
function lerpKeyframe(frames, t) {
  // clamp
  if (t <= frames[0][0]) return frames[0];
  if (t >= frames[frames.length - 1][0]) return frames[frames.length - 1];
  for (let i = 0; i < frames.length - 1; i++) {
    const a = frames[i], b = frames[i + 1];
    if (t >= a[0] && t <= b[0]) {
      const u = (t - a[0]) / (b[0] - a[0]);
      // smooth-step easing
      const e = u * u * (3 - 2 * u);
      return a.map((v, idx) => (idx === 0 ? t : v + (b[idx] - v) * e));
    }
  }
}

/* ─── sub-components ──────────────────────────────────────────────── */
function Desk() {
  return (
    <group position={[0, 0, 0]}>
      {/* desk top */}
      <mesh receiveShadow castShadow position={[0, 0.72, 0]}>
        <boxGeometry args={[3.8, 0.06, 1.8]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* legs */}
      {[[-1.7, -0.8], [1.7, -0.8], [-1.7, 0.8], [1.7, 0.8]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.36, z]} castShadow>
          <boxGeometry args={[0.07, 0.72, 0.07]} />
          <meshStandardMaterial color="#111122" roughness={0.4} metalness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Laptop
 * ──────
 * lidAngle  — a ref whose `.current` is updated every frame by the
 *             parent RoomModel based on scrollProgress. We read it
 *             imperatively inside useFrame so no React re-renders occur.
 *
 * Lid open range:  0 (fully closed, flat)  →  -1.15 rad (fully open)
 * Opening happens: scroll 0.00 → 0.25  (Phase 1 → Phase 2 transition)
 */
function Laptop({ screenGlow, lidAngle }) {
  const lidRef = useRef();
  const screenRef = useRef();
  const glowRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // ── Lid rotation driven by parent ref ──
    if (lidRef.current) {
      lidRef.current.rotation.x = lidAngle.current;
    }

    // ── Screen flicker (only when lid is meaningfully open) ──
    if (screenRef.current) {
      // openness 0→1 maps to a 0→1 scalar so the screen only glows once open
      const openness = Math.min(1, Math.abs(lidAngle.current) / 1.15);
      screenRef.current.emissiveIntensity =
        openness * (0.3 + Math.sin(t * 3) * 0.04);
    }

    // ── Cyan point-light driven by parent screenGlow ref ──
    if (glowRef.current) {
      glowRef.current.intensity = screenGlow.current * 1.5 + 0.2;
    }
  });

  return (
    <group position={[0, 0.75, -0.2]}>
      {/* base */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.03, 0.88]} />
        <meshStandardMaterial color="#1c1c2e" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* keyboard surface */}
      <mesh position={[0, 0.018, 0]}>
        <boxGeometry args={[1.24, 0.005, 0.82]} />
        <meshStandardMaterial color="#0d0d1a" roughness={0.5} />
      </mesh>

      {/* hinge bar */}
      <mesh position={[0, 0.025, -0.43]}>
        <boxGeometry args={[1.1, 0.04, 0.02]} />
        <meshStandardMaterial color="#2a2a3e" metalness={0.95} roughness={0.1} />
      </mesh>

      {/*
        ── Lid group ──
        Pivot point is at the hinge (z = -0.43).
        rotation.x starts at 0 (closed / lying flat on the base)
        and animates to -1.15 (fully open).
        We set rotation={[0, 0, 0]} here; the actual value is written
        imperatively via lidRef every frame.
      */}
      <group ref={lidRef} rotation={[0, 0, 0]} position={[0, 0.025, -0.43]}>
        {/*
          We place all lid contents inside a group that is shifted forward by 0.43 
          so that it aligns with the base when closed.
        */}
        <group position={[0, 0, 0.43]}>
          {/* lid shell */}
          <mesh castShadow position={[0, 0.01, 0]}>
            <boxGeometry args={[1.3, 0.02, 0.88]} />
            <meshStandardMaterial color="#1c1c2e" roughness={0.2} metalness={0.9} />
          </mesh>

          {/* screen bezel */}
          <mesh position={[0, -0.001, 0]}>
            <boxGeometry args={[1.2, 0.01, 0.78]} />
            <meshStandardMaterial color="#0a0a12" roughness={0.4} />
          </mesh>

          {/* SCREEN PORTAL — emissive surface */}
          <mesh ref={screenRef} position={[0, -0.006, 0]}>
            <boxGeometry args={[1.1, 0.002, 0.68]} />
            <meshStandardMaterial
              color="#001a33"
              emissive="#00e5ff"
              emissiveIntensity={0}   /* starts dark; ramped up in useFrame */
              roughness={0.8}
              metalness={0.1}
            />
          </mesh>

          {/* cyan point-light behind screen */}
          <pointLight
            ref={glowRef}
            position={[0, -0.1, 0]}
            color="#00e5ff"
            intensity={0}             /* starts off; ramped up in useFrame */
            distance={0}
            decay={0}
          />

          {/* Hello World code text snippet */}
          <group position={[0, -0.008, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <Text
              position={[0, 0, 0]}
              rotation={[0, 0, 0]} // No extra twirl needed anymore, geometry fixes orientations naturally!
              fontSize={0.05}
              color="#00ffcc"
              anchorX="center"
              anchorY="middle"
              maxWidth={1.0}
            >
              {`function animate() {\n  requestGreet();\n  console.log("Hello World");\n}`}
            </Text>
          </group>
        </group>
      </group>
    </group>
  );
}

function CoffeeMug() {
  const steamRef = useRef();
  useFrame(({ clock }) => {
    if (steamRef.current) {
      steamRef.current.position.y = 1.15 + Math.sin(clock.getElapsedTime() * 1.2) * 0.04;
      steamRef.current.rotation.y += 0.01;
    }
  });
  return (
    <group position={[1.4, 0.75, 0.3]}>
      {/* body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.1, 0.09, 0.18, 24]} />
        <meshStandardMaterial color="#1e1e3a" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* handle */}
      <mesh position={[0.13, 0, 0]}>
        <torusGeometry args={[0.06, 0.012, 10, 20, Math.PI]} />
        <meshStandardMaterial color="#1e1e3a" roughness={0.4} />
      </mesh>
      {/* coffee surface */}
      <mesh position={[0, 0.09, 0]}>
        <circleGeometry args={[0.088, 24]} />
        <meshStandardMaterial color="#3d1a00" roughness={0.9} />
      </mesh>
      {/* steam wisps */}
      <group ref={steamRef} position={[0, 0.38, 0]}>
        {[0, 0.08, -0.06].map((x, i) => (
          <mesh key={i} position={[x, i * 0.06, 0]}>
            <sphereGeometry args={[0.015 + i * 0.005, 6, 6]} />
            <meshStandardMaterial
              color="#aaddff"
              transparent
              opacity={0.18 - i * 0.04}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* Floating bug icons (Phase 3) */
function BugOrbit({ count = 5, visible }) {
  const groupRef = useRef();
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = clock.getElapsedTime() * 0.4;
    groupRef.current.children.forEach((child, i) => {
      child.rotation.z = clock.getElapsedTime() * 0.8 + (i * Math.PI * 2) / count;
    });
  });
  return (
    <group ref={groupRef} position={[0, 1.4, 0]} visible={visible}>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const r = 0.9;
        return (
          <mesh key={i} position={[Math.cos(angle) * r, 0, Math.sin(angle) * r]}>
            <octahedronGeometry args={[0.045, 0]} />
            <meshStandardMaterial
              color="#ff4466"
              emissive="#ff1133"
              emissiveIntensity={1.2}
              roughness={0.3}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/* Digital grid floor (Phase 4 reveal) */
function DigitalGrid({ opacity }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.material.opacity = opacity.current;
      ref.current.material.emissiveIntensity = 0.5 + Math.sin(clock.getElapsedTime() * 2) * 0.2;
    }
  });
  return (
    <mesh ref={ref} position={[0, -0.5, -2]} rotation={[-0.1, 0, 0]}>
      <planeGeometry args={[20, 20, 20, 20]} />
      <meshStandardMaterial
        color="#001122"
        emissive="#00ffcc"
        emissiveIntensity={0.5}
        wireframe
        transparent
        opacity={0}
      />
    </mesh>
  );
}

/* ─── Main export ─────────────────────────────────────────────────── */
export default function RoomModel({ scrollProgress, isMobile }) {
  const { camera } = useThree();

  // mutable refs to avoid recreating vectors every frame
  const camPos = useMemo(() => new THREE.Vector3(), []);
  const camTarget = useMemo(() => new THREE.Vector3(), []);
  const tmpPos = useMemo(() => new THREE.Vector3(), []);
  const tmpTarget = useMemo(() => new THREE.Vector3(), []);

  // refs for dynamic values passed to sub-components
  const screenGlow = useRef(0);
  const gridOpacity = useRef(0);

  /**
   * lidAngle
   * Drives the laptop lid opening animation.
   * 0 = closed (flat/shut), -1.15 = fully open.
   * Opens during scroll 0.00 → 0.25 (Phase 1).
   * Screen cyan glow ramps up in sync with lid openness.
   */
  const lidAngle = useRef(0);

  useFrame((_, delta) => {
    const t = scrollProgress.get();

    // ── Camera ──────────────────────────────────────────────────────
    const kf = lerpKeyframe(CAM_KEYFRAMES, t);
    tmpPos.set(kf[1], kf[2], kf[3]);
    tmpTarget.set(kf[4], kf[5], kf[6]);

    const damp = isMobile ? 0.06 : 0.04;
    camPos.lerp(tmpPos, 1 - Math.pow(damp, delta * 60));
    camTarget.lerp(tmpTarget, 1 - Math.pow(damp, delta * 60));

    camera.position.copy(camPos);
    camera.lookAt(camTarget);

    // ── Lid opening (scroll 0.85 → 1.0 → angle 0 → -1.15) ────────────
    const LID_OPEN_START = 0.85;
    const LID_OPEN_ANGLE = -1.15;
    let targetLid = 0;
    if (t > LID_OPEN_START) {
      const rawT = Math.min(1, (t - LID_OPEN_START) / (1 - LID_OPEN_START));
      const easedT = rawT * rawT * (3 - 2 * rawT); // smooth-step
      targetLid = LID_OPEN_ANGLE * easedT;
    }
    lidAngle.current = THREE.MathUtils.lerp(lidAngle.current, targetLid, 0.1);

    // ── Screen glow tied to lid openness ────────────────────────────
    const openness = Math.min(1, Math.abs(lidAngle.current) / 1.15);
    screenGlow.current = THREE.MathUtils.lerp(screenGlow.current, openness, 0.04);

    // ── Phase 4 digital grid ─────────────────────────────────────────
    gridOpacity.current = THREE.MathUtils.lerp(
      gridOpacity.current,
      t > 0.75 ? (t - 0.75) * 4 : 0,
      0.05
    );
  });

  const bugsVisible = true; // always mounted, visibility via group

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#07070f" roughness={0.9} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 3, -3.5]} receiveShadow>
        <planeGeometry args={[10, 6]} />
        <meshStandardMaterial color="#08081a" roughness={0.95} />
      </mesh>

      {/* Side wall glow strip */}
      <mesh position={[-4.5, 1.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[8, 3]} />
        <meshStandardMaterial
          color="#000011"
          emissive="#00f0ff"
          emissiveIntensity={0.08}
          roughness={1}
        />
      </mesh>

      <Desk />
      <Laptop screenGlow={screenGlow} lidAngle={lidAngle} />
      <CoffeeMug />
      <BugOrbit count={6} visible={bugsVisible} />
      <DigitalGrid opacity={gridOpacity} />

      {/* Neon accent strips on desk edge */}
      <mesh position={[0, 0.73, 0.91]}>
        <boxGeometry args={[3.8, 0.008, 0.006]} />
        <meshStandardMaterial
          color="#00f0ff"
          emissive="#00f0ff"
          emissiveIntensity={3}
        />
      </mesh>
    </group>
  );
}