'use client';

import { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, PerspectiveCamera, Environment, Float, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

/* ══════════════════════════════════════════════════════════════════
   CAMERA KEYFRAMES
   Defines the dolly-in path from floor → desk → screen portal.
   Each entry: [scrollT, posX, posY, posZ, lookX, lookY, lookZ]
   ══════════════════════════════════════════════════════════════════ */
const CAM_PATH = [
    [0.00, 0, 0.55, 2.2, 0, 0.3, 0],  // Floor — coffee puddle view
    [0.20, 0, 0.55, 2.2, 0, 0.3, 0],  // Hold at floor
    [0.45, 0, 2.6, 3.8, 0, 2.2, 0],  // Rising — desk comes into view
    [0.68, 0, 2.55, 2.0, 0, 2.35, -0.2],  // Front of desk, slight down-look
    [0.82, 0, 2.48, 1.0, 0, 2.42, -0.48],  // Moving into screen
    [1.00, 0, 2.51, 0.28, 0, 2.49, -0.48],  // Server screen perfectly framed
];

function lerpKeyframe(frames, t) {
    if (t <= frames[0][0]) return frames[0];
    if (t >= frames[frames.length - 1][0]) return frames[frames.length - 1];
    for (let i = 0; i < frames.length - 1; i++) {
        const a = frames[i], b = frames[i + 1];
        if (t >= a[0] && t <= b[0]) {
            const u = (t - a[0]) / (b[0] - a[0]);
            const e = u * u * (3 - 2 * u); // smooth-step
            return a.map((v, idx) => idx === 0 ? t : v + (b[idx] - v) * e);
        }
    }
}

/* ══════════════════════════════════════════════════════════════════
   SPILLED COFFEE PUDDLE  — wet, glossy, dark brown
   ══════════════════════════════════════════════════════════════════ */
function CoffeePuddle() {
    return (
        <group position={[0.15, 0.001, 0.3]}>
            {/* Main puddle shape — custom irregular blob via scale */}
            <mesh rotation={[-Math.PI / 2, 0, 0.3]}>
                <circleGeometry args={[0.38, 48]} />
                <meshStandardMaterial
                    color="#2a1208"
                    roughness={0.08}
                    metalness={0.55}
                    envMapIntensity={1.2}
                />
            </mesh>
            {/* Outer thin edge */}
            <mesh rotation={[-Math.PI / 2, 0, 0.3]} scale={[1.15, 1.0, 1]}>
                <circleGeometry args={[0.38, 48]} />
                <meshStandardMaterial
                    color="#1a0a04"
                    roughness={0.04}
                    metalness={0.6}
                    transparent
                    opacity={0.65}
                />
            </mesh>
            {/* Warm highlight light from puddle */}
            <pointLight position={[0, 0.08, 0]} color="#a05020" intensity={0.8} distance={2.5} decay={2} />
        </group>
    );
}

/* ══════════════════════════════════════════════════════════════════
   SPLIT COFFEE MUG  — tilted, broken, dramatic
   ══════════════════════════════════════════════════════════════════ */
function SplitCoffeeMug() {
    return (
        <>
            <group position={[0.15, 0.12, 0.3]} rotation={[0.5, 0.4, 1.35]}>
                {/* Main cylinder body */}
                <mesh castShadow>
                    <cylinderGeometry args={[0.095, 0.082, 0.21, 32]} />
                    <meshPhysicalMaterial 
                        color="#f0f0f5" 
                        roughness={0.12} 
                        metalness={0.05} 
                        clearcoat={1.0}
                        clearcoatRoughness={0.1}
                    />
                </mesh>
                {/* Inner ceramic (shows slightly because of tilt) */}
                <mesh position={[0, 0.001, 0]}>
                    <cylinderGeometry args={[0.088, 0.076, 0.208, 32]} />
                    <meshPhysicalMaterial color="#f0f0f5" roughness={0.15} clearcoat={1.0} />
                </mesh>
                {/* Mug rim */}
                <mesh position={[0, 0.106, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[0.088, 0.006, 16, 32]} />
                    <meshPhysicalMaterial color="#e0e0e5" roughness={0.1} clearcoat={1.0} />
                </mesh>
                {/* Handle */}
                <mesh position={[0.1, 0.02, 0]} rotation={[0, 0, -0.2]}>
                    <torusGeometry args={[0.055, 0.015, 16, 32, Math.PI * 1.2]} />
                    <meshPhysicalMaterial color="#f0f0f5" roughness={0.15} clearcoat={1.0} />
                </mesh>
                {/* Coffee inside (wet reflective dark surface) */}
                <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <circleGeometry args={[0.085, 32]} />
                    <meshStandardMaterial color="#1a0802" roughness={0.02} metalness={0.2} envMapIntensity={2.0} />
                </mesh>
                {/* Crack - glowing broken core */}
                <mesh position={[0.07, 0, 0.07]} rotation={[0, 0.5, 0.2]}>
                    <boxGeometry args={[0.006, 0.22, 0.01]} />
                    <meshPhysicalMaterial color="#ff4400" emissive="#ff2200" emissiveIntensity={3} />
                </mesh>
            </group>
            {/* Shards on the floor nearby */}
            <group position={[0.15, 0.005, 0.3]}>
                <mesh position={[-0.1, 0, 0.15]} rotation={[0.4, 0.1, 0]} castShadow>
                    <boxGeometry args={[0.03, 0.005, 0.02]} />
                    <meshPhysicalMaterial color="#f0f0f5" roughness={0.1} clearcoat={1.0} />
                </mesh>
                <mesh position={[0.12, 0, 0.22]} rotation={[0.1, 0.8, 0.2]} castShadow>
                    <boxGeometry args={[0.015, 0.005, 0.04]} />
                    <meshPhysicalMaterial color="#f0f0f5" roughness={0.1} clearcoat={1.0} />
                </mesh>
                <mesh position={[0.05, 0, 0.25]} rotation={[0, 0.3, 0]} castShadow>
                    <boxGeometry args={[0.02, 0.004, 0.02]} />
                    <meshPhysicalMaterial color="#f0f0f5" roughness={0.1} clearcoat={1.0} />
                </mesh>
            </group>
        </>
    );
}

/* ══════════════════════════════════════════════════════════════════
   FLOOR  — dark textured base
   ══════════════════════════════════════════════════════════════════ */
function Floor() {
    return (
        <>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                <planeGeometry args={[18, 18, 1, 1]} />
                <meshStandardMaterial color="#050810" roughness={0.95} metalness={0.05} />
            </mesh>
            {/* Subtle grid lines on floor */}
            <gridHelper args={[18, 18, '#0a0f20', '#0a0f20']} position={[0, 0.001, 0]} />
        </>
    );
}

/* ══════════════════════════════════════════════════════════════════
   DESK  — minimalist dark steel slab
   ══════════════════════════════════════════════════════════════════ */
function Desk() {
    return (
        <group position={[0, 2, 0]}>
            {/* Tabletop */}
            <mesh castShadow receiveShadow position={[0, 0, 0]}>
                <boxGeometry args={[2.8, 0.06, 1.4]} />
                <meshStandardMaterial color="#0c0a12" roughness={0.35} metalness={0.72} />
            </mesh>
            {/* Front edge glow strip */}
            <mesh position={[0, -0.028, 0.702]}>
                <boxGeometry args={[2.8, 0.006, 0.005]} />
                <meshStandardMaterial color="#00ffaa" emissive="#00ffaa" emissiveIntensity={3} />
            </mesh>
            {/* Legs */}
            {[[-1.25, -0.6], [1.25, -0.6], [-1.25, 0.6], [1.25, 0.6]].map(([x, z], i) => (
                <mesh key={i} position={[x, -0.58, z]} castShadow>
                    <boxGeometry args={[0.06, 1.1, 0.06]} />
                    <meshStandardMaterial color="#080810" roughness={0.2} metalness={0.9} />
                </mesh>
            ))}
        </group>
    );
}

/* ══════════════════════════════════════════════════════════════════
   LAPTOP SCREEN CONTENT
   The terminal animation. Phases drive the deploy sequence.
   phase 0: idle
   phase 1: typing command
   phase 2: processing
   phase 3: success reveal
   ══════════════════════════════════════════════════════════════════ */
const DEPLOY_LINES = [
    { text: '> sudo deploy --final --env=production', delay: 0, color: '#00ffaa' },
    { text: '> Optimizing assets...', delay: 800, color: '#88ffcc' },
    { text: '> Bundle size: 142kb ✓', delay: 1600, color: '#88ffcc' },
    { text: '> Uploading to production...', delay: 2400, color: '#88ffcc' },
    { text: '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  100%', delay: 3200, color: '#00ffaa' },
    { text: '> Flushing CDN cache... Done.', delay: 4000, color: '#88ffcc' },
    { text: '> Health check... ✓ All systems nominal.', delay: 4800, color: '#88ffcc' },
];

function ScreenContent({ visible }) {
    const [visibleLines, setVisibleLines] = useState([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [typingLine, setTypingLine] = useState('');
    const [cursor, setCursor] = useState(true);
    const hasStarted = useRef(false);

    // Blinking cursor
    useEffect(() => {
        const t = setInterval(() => setCursor(c => !c), 530);
        return () => clearInterval(t);
    }, []);

    // Trigger sequence when visible
    useEffect(() => {
        if (!visible || hasStarted.current) return;
        hasStarted.current = true;

        DEPLOY_LINES.forEach((line, i) => {
            // Typing effect for first line
            if (i === 0) {
                let charIdx = 0;
                const typeTimer = setInterval(() => {
                    charIdx++;
                    setTypingLine(line.text.slice(0, charIdx));
                    if (charIdx >= line.text.length) {
                        clearInterval(typeTimer);
                        setTimeout(() => {
                            setVisibleLines(v => [...v, { text: line.text, color: line.color }]);
                            setTypingLine('');
                        }, 200);
                    }
                }, 45);
            } else {
                setTimeout(() => {
                    setVisibleLines(v => [...v, { text: line.text, color: line.color }]);
                }, line.delay);
            }
        });

        // Success reveal
        setTimeout(() => setShowSuccess(true), 5800);
    }, [visible]);

    return (
        <div style={{
            width: '480px',
            height: '300px',
            background: '#010a06',
            border: '1.5px solid rgba(0,255,120,0.3)',
            borderRadius: '4px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: '"JetBrains Mono","Fira Code","Courier New",monospace',
            position: 'relative',
            boxShadow: 'inset 0 0 40px rgba(0,255,100,0.06)',
        }}>

            {/* Title bar */}
            <div style={{
                height: '26px', background: '#020e08',
                borderBottom: '1px solid rgba(0,255,120,0.18)',
                display: 'flex', alignItems: 'center', padding: '0 12px', gap: '6px', flexShrink: 0,
            }}>
                {['#ff5f57', '#febc2e', '#28c840'].map((c, i) => (
                    <span key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: c, opacity: 0.8 }} />
                ))}
                <span style={{ marginLeft: 'auto', fontSize: '9px', color: 'rgba(0,255,120,0.4)', letterSpacing: '0.12em' }}>
                    deploy@production — bash
                </span>
            </div>

            {/* Terminal body */}
            <div style={{ flex: 1, padding: '10px 14px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '3px' }}>

                {!visible && (
                    <p style={{ fontSize: '10px', color: 'rgba(0,255,120,0.25)', margin: 0 }}>
                        Awaiting deployment...
                    </p>
                )}

                {/* Completed lines */}
                {visibleLines.map((line, i) => (
                    <p key={i} style={{
                        margin: 0, fontSize: '10px',
                        color: line.color,
                        lineHeight: 1.5,
                        animation: 'lineIn 0.3s ease',
                        letterSpacing: '0.02em',
                        fontWeight: i === 4 ? 700 : 400,
                    }}>
                        {line.text}
                    </p>
                ))}

                {/* Currently typing line */}
                {typingLine && (
                    <p style={{ margin: 0, fontSize: '10px', color: '#00ffaa', lineHeight: 1.5 }}>
                        {typingLine}
                        <span style={{ opacity: cursor ? 1 : 0, marginLeft: '1px' }}>▋</span>
                    </p>
                )}

                {/* Idle cursor */}
                {visibleLines.length === 0 && !typingLine && visible && (
                    <span style={{ fontSize: '10px', color: '#00ffaa', opacity: cursor ? 1 : 0 }}>▋</span>
                )}

                {/* SUCCESS REVEAL */}
                {showSuccess && (
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(1,10,6,0.92)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'successReveal 0.6s ease forwards, successPulse 2s ease-in-out infinite',
                        zIndex: 20,
                    }}>
                        <p style={{
                            fontSize: '42px',
                            fontWeight: 900,
                            color: '#00ff88',
                            margin: 0,
                            letterSpacing: '0.05em',
                            textShadow: '0 0 20px #00ff88, 0 0 50px #00ff44',
                            lineHeight: 1.1,
                        }}>
                            DEPLOYED
                        </p>
                        <p style={{
                            fontSize: '28px',
                            fontWeight: 700,
                            color: '#00ffaa',
                            margin: '4px 0 0',
                            letterSpacing: '0.15em',
                            textShadow: '0 0 15px #00ffaa',
                        }}>
                            SUCCESSFULLY
                        </p>
                        <p style={{
                            fontSize: '11px',
                            color: 'rgba(0,255,150,0.6)',
                            margin: '20px 0 0',
                            letterSpacing: '0.3em',
                            textTransform: 'uppercase',
                        }}>
                            All systems operational · Vercel Production
                        </p>
                    </div>
                )}
            </div>

            {/* Scanline overlay */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.15) 2px,rgba(0,0,0,0.15) 3px)',
                pointerEvents: 'none',
                zIndex: 30,
            }} />

            <style>{`
        @keyframes lineIn { from{opacity:0;transform:translateX(-4px)} to{opacity:1;transform:translateX(0)} }
        @keyframes successPulse {
          0%,100%{ filter: brightness(1); }
          50%{ filter: brightness(1.35) drop-shadow(0 0 12px #00ff88); }
        }
        @keyframes successReveal {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════
   LAPTOP  — procedural, screen hosts the Html portal
   ══════════════════════════════════════════════════════════════════ */
function Laptop({ scrollProgress }) {
    const screenRef = useRef();
    const screenGlowRef = useRef();
    const [screenVisible, setScreenVisible] = useState(false);
    const visibleRef = useRef(false);

    useFrame(() => {
        const t = scrollProgress.get();
        // Screen becomes "active" at 82%
        const active = t > 0.82;
        if (active !== visibleRef.current) {
            visibleRef.current = active;
            setScreenVisible(active);
        }
        // Screen emissive scales with proximity
        if (screenRef.current) {
            const glow = t > 0.65 ? Math.min(1, (t - 0.65) / 0.2) : 0;
            screenRef.current.emissiveIntensity = glow * 1.8;
        }
        if (screenGlowRef.current) {
            const brightness = t > 0.65 ? Math.min(1, (t - 0.65) / 0.2) : 0;
            screenGlowRef.current.intensity = brightness * 5;
        }
    });

    return (
        <group position={[0, 2.035, -0.1]}>
            {/* Base */}
            <mesh castShadow receiveShadow>
                <boxGeometry args={[1.28, 0.028, 0.86]} />
                <meshStandardMaterial color="#0e0e18" roughness={0.18} metalness={0.92} />
            </mesh>
            {/* Keyboard deck */}
            <mesh position={[0, 0.016, 0]}>
                <boxGeometry args={[1.22, 0.004, 0.8]} />
                <meshStandardMaterial color="#080810" roughness={0.5} />
            </mesh>
            {/* Key row accents */}
            {[-0.18, -0.04, 0.1, 0.21].map((z, i) => (
                <mesh key={i} position={[0, 0.019, z]}>
                    <boxGeometry args={[1.05, 0.002, 0.022]} />
                    <meshStandardMaterial color="#00ffaa" emissive="#00ffaa" emissiveIntensity={0.4} />
                </mesh>
            ))}
            {/* Hinge */}
            <mesh position={[0, 0.024, -0.432]}>
                <boxGeometry args={[1.1, 0.036, 0.018]} />
                <meshStandardMaterial color="#111" metalness={0.95} roughness={0.08} />
            </mesh>

            {/* LID — open at -1.48 rad */}
            <group rotation={[-1.48, 0, 0]} position={[0, 0.024, -0.432]}>
                <group position={[0, 0, 0.432]}>
                    {/* Shell */}
                    <mesh castShadow position={[0, 0.012, 0]}>
                        <boxGeometry args={[1.28, 0.022, 0.86]} />
                        <meshStandardMaterial color="#0e0e18" roughness={0.18} metalness={0.92} />
                    </mesh>
                    {/* Bezel */}
                    <mesh position={[0, -0.005, 0]}>
                        <boxGeometry args={[1.18, 0.013, 0.76]} />
                        <meshStandardMaterial color="#050508" roughness={0.45} />
                    </mesh>
                    {/* Screen surface */}
                    <mesh ref={screenRef} position={[0, -0.01, 0]}>
                        <boxGeometry args={[1.08, 0.004, 0.66]} />
                        <meshStandardMaterial
                            color="#010a04"
                            emissive="#00ff88"
                            emissiveIntensity={0}
                            roughness={0.8}
                            metalness={0.04}
                        />
                        {/* Html portal — rotated +90deg on X to lay flat on the -Y inner screen face */}
                        <Html
                            transform
                            distanceFactor={0.33}
                            position={[0, -0.004, 0]}
                            rotation={[Math.PI / 2, 0, 0]}
                            style={{ pointerEvents: 'none' }}
                        >
                            <ScreenContent visible={screenVisible} />
                        </Html>
                    </mesh>
                    {/* Green screen glow */}
                    <pointLight
                        ref={screenGlowRef}
                        position={[0, -0.2, 0.08]}
                        color="#00ff88"
                        intensity={0}
                        distance={4}
                        decay={1.8}
                    />
                </group>
            </group>
        </group>
    );
}

/* ══════════════════════════════════════════════════════════════════
   SUCCESS CONFETTI PARTICLES
   Bursts from screen centre when deployed
   ══════════════════════════════════════════════════════════════════ */
function ConfettiBurst({ active }) {
    const COUNT = 80;
    const ref = useRef();
    const time = useRef(0);

    const { positions, velocities, colors } = useMemo(() => {
        const positions = new Float32Array(COUNT * 3);
        const velocities = new Float32Array(COUNT * 3);
        const colors = new Float32Array(COUNT * 3);
        const palette = [
            [0, 1, 0.53], [0, 0.9, 1], [1, 0.84, 0],
            [0, 1, 0.4], [0.5, 1, 0.5],
        ];
        for (let i = 0; i < COUNT; i++) {
            positions[i * 3] = positions[i * 3 + 1] = positions[i * 3 + 2] = 0;
            const angle = Math.random() * Math.PI * 2;
            const elevation = Math.random() * Math.PI;
            const speed = 0.8 + Math.random() * 1.2;
            velocities[i * 3 + 0] = Math.sin(elevation) * Math.cos(angle) * speed;
            velocities[i * 3 + 1] = Math.cos(elevation) * speed;
            velocities[i * 3 + 2] = Math.sin(elevation) * Math.sin(angle) * speed;
            const c = palette[Math.floor(Math.random() * palette.length)];
            colors[i * 3 + 0] = c[0]; colors[i * 3 + 1] = c[1]; colors[i * 3 + 2] = c[2];
        }
        return { positions, velocities, colors };
    }, []);

    const currentPos = useMemo(() => new Float32Array(positions), [positions]);

    useFrame((_, delta) => {
        if (!ref.current || !active) return;
        time.current += delta;
        const posAttr = ref.current.geometry.attributes.position;
        for (let i = 0; i < COUNT; i++) {
            currentPos[i * 3 + 0] = positions[i * 3 + 0] + velocities[i * 3 + 0] * time.current;
            currentPos[i * 3 + 1] = positions[i * 3 + 1] + velocities[i * 3 + 1] * time.current - 0.5 * 0.4 * time.current * time.current;
            currentPos[i * 3 + 2] = positions[i * 3 + 2] + velocities[i * 3 + 2] * time.current;
        }
        posAttr.array.set(currentPos);
        posAttr.needsUpdate = true;
    });

    if (!active) return null;

    return (
        <group position={[0, 2.6, -0.8]}>
            <points ref={ref}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={COUNT} array={new Float32Array(COUNT * 3)} itemSize={3} />
                    <bufferAttribute attach="attributes-color" count={COUNT} array={colors} itemSize={3} />
                </bufferGeometry>
                <pointsMaterial size={0.055} vertexColors transparent opacity={0.9} sizeAttenuation depthWrite={false} />
            </points>
        </group>
    );
}

/* ══════════════════════════════════════════════════════════════════
   AMBIENT FLOATING DUST  — slow drift in the scene volume
   ══════════════════════════════════════════════════════════════════ */
function AmbientDust() {
    const COUNT = 300;
    const geomRef = useRef();

    const { positions, speeds } = useMemo(() => {
        const positions = new Float32Array(COUNT * 3);
        const speeds = new Float32Array(COUNT);
        for (let i = 0; i < COUNT; i++) {
            positions[i * 3 + 0] = (Math.random() - 0.5) * 12;
            positions[i * 3 + 1] = Math.random() * 5;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
            speeds[i] = 0.04 + Math.random() * 0.08;
        }
        return { positions, speeds };
    }, []);

    useFrame((_, delta) => {
        if (!geomRef.current) return;
        const posAttr = geomRef.current.attributes.position;
        for (let i = 0; i < COUNT; i++) {
            posAttr.array[i * 3 + 1] += speeds[i] * delta;
            if (posAttr.array[i * 3 + 1] > 5.5) posAttr.array[i * 3 + 1] = 0;
        }
        posAttr.needsUpdate = true;
    });

    return (
        <points>
            <bufferGeometry ref={geomRef}>
                <bufferAttribute attach="attributes-position" count={COUNT} array={positions} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial size={0.022} color="#1a3a5c" transparent opacity={0.5} sizeAttenuation depthWrite={false} />
        </points>
    );
}

/* ══════════════════════════════════════════════════════════════════
   BACK WALL  — subtle depth
   ══════════════════════════════════════════════════════════════════ */
function BackWall() {
    return (
        <mesh position={[0, 2.5, -4]} receiveShadow>
            <planeGeometry args={[14, 8]} />
            <meshStandardMaterial color="#020510" roughness={0.98} />
        </mesh>
    );
}

/* ══════════════════════════════════════════════════════════════════
   CAMERA CONTROLLER
   Reads scrollProgress every frame, lerps camera to target keyframe.
   Entirely imperative — zero React state, zero re-renders.
   ══════════════════════════════════════════════════════════════════ */
function CameraController({ scrollProgress }) {
    const { camera } = useThree();

    const currentPos = useMemo(() => new THREE.Vector3(0, 0.55, 2.2), []);
    const currentTarget = useMemo(() => new THREE.Vector3(0, 0.3, 0), []);
    const tmpPos = useMemo(() => new THREE.Vector3(), []);
    const tmpTarget = useMemo(() => new THREE.Vector3(), []);

    useFrame((_, delta) => {
        const t = Math.max(0, Math.min(1, scrollProgress.get()));
        const kf = lerpKeyframe(CAM_PATH, t);

        tmpPos.set(kf[1], kf[2], kf[3]);
        tmpTarget.set(kf[4], kf[5], kf[6]);

        // Frame-rate independent exponential lerp — butter smooth
        const damp = 1 - Math.pow(0.025, delta * 60);
        currentPos.lerp(tmpPos, damp);
        currentTarget.lerp(tmpTarget, damp);

        camera.position.copy(currentPos);
        camera.lookAt(currentTarget);
    });

    return null;
}

/* ══════════════════════════════════════════════════════════════════
   SCENE ROOT
   ══════════════════════════════════════════════════════════════════ */
function Scene({ scrollProgress }) {
    const [confettiActive, setConfettiActive] = useState(false);
    const confettiRef = useRef(false);

    useFrame(() => {
        const t = scrollProgress.get();
        if (t > 0.88 && !confettiRef.current) {
            confettiRef.current = true;
            setConfettiActive(true);
        }
        if (t < 0.80 && confettiRef.current) {
            confettiRef.current = false;
            setConfettiActive(false);
        }
    });

    return (
        <>
            <CameraController scrollProgress={scrollProgress} />

            {/* Lighting */}
            <ambientLight intensity={0.08} color="#060820" />
            <pointLight position={[0.15, 0.5, 0.5]} color="#a05020" intensity={1.0} distance={3.5} decay={2} />
            <pointLight position={[0, 3.2, 0.4]} color="#00ff88" intensity={0.4} distance={5} decay={2} />

            <Environment preset="night" />

            {/* Scene geometry */}
            <Floor />
            <BackWall />
            <CoffeePuddle />
            <SplitCoffeeMug />
            <Desk />
            <Laptop scrollProgress={scrollProgress} />
            <AmbientDust />
            <ConfettiBurst active={confettiActive} />
        </>
    );
}

/* ══════════════════════════════════════════════════════════════════
   DEPLOYMENT SCENE  — exported canvas wrapper
   ══════════════════════════════════════════════════════════════════ */
export default function DeploymentScene({ scrollProgress, isMobile }) {
    return (
        <Canvas
            dpr={isMobile ? 1 : [1, 1.5]}
            gl={{
                antialias: !isMobile,
                alpha: false,
                powerPreference: 'high-performance',
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.25,
            }}
            shadows="soft"
            style={{ background: '#020617' }}
        >
            <PerspectiveCamera makeDefault fov={52} near={0.05} far={80} position={[0, 0.55, 2.2]} />

            <Suspense fallback={null}>
                <Scene scrollProgress={scrollProgress} />
            </Suspense>

            {/* Post-processing — disable multisampling for huge performance gain */}
            <EffectComposer disableNormalPass multisampling={0}>
                <Bloom
                    intensity={0.65}
                    luminanceThreshold={0.45}
                    luminanceSmoothing={0.85}
                    mipmapBlur
                    radius={0.7}
                />
                <Noise
                    blendFunction={BlendFunction.SOFT_LIGHT}
                    opacity={0.12}
                />
                <Vignette eskil={false} offset={0.12} darkness={0.8} />
            </EffectComposer>

            <fog attach="fog" args={['#020617', 12, 28]} />
        </Canvas>
    );
}