import { Suspense, useMemo, useRef, useState, useEffect, Component } from 'react';
import type { ReactNode } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { RoomType } from '@/lib/types';

const TARGET_ROOM_SIZE = 6;

/* ---------------- procedural textures ---------------- */

function makeWoodTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#b3926f';
  ctx.fillRect(0, 0, 512, 512);
  const plankH = 85;
  for (let y = 0; y < 512; y += plankH) {
    ctx.fillStyle = `rgba(125,92,58,${0.08 + Math.random() * 0.12})`;
    ctx.fillRect(0, y, 512, plankH);
    for (let i = 0; i < 9; i++) {
      const gx = Math.random() * 512;
      ctx.strokeStyle = 'rgba(96,66,38,0.28)';
      ctx.lineWidth = 1 + Math.random() * 1.6;
      ctx.beginPath();
      ctx.moveTo(gx, y);
      ctx.bezierCurveTo(gx + 22, y + plankH / 3, gx - 22, y + plankH * (2 / 3), gx + 12, y + plankH);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(58,40,24,0.55)';
    ctx.fillRect(0, y, 512, 2);
    let seam = Math.random() * 120;
    while (seam < 512) {
      ctx.fillRect(seam, y, 2, plankH);
      seam += 110 + Math.random() * 90;
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  return tex;
}

function makePlasterTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#f0ead9';
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 5000; i++) {
    const g = 226 + Math.random() * 28;
    ctx.fillStyle = `rgba(${g},${g - 5},${g - 16},0.05)`;
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

function makeLinenTexture(base: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 900; i++) {
    const d = Math.random() > 0.5 ? 1 : 0;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.025)' : 'rgba(255,255,255,0.02)';
    ctx.fillRect(Math.random() * 256, Math.random() * 256, d ? 1 : 26, d ? 26 : 1);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

function makeRugTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#d8c9ac';
  ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = '#a97e4a';
  ctx.lineWidth = 14;
  ctx.strokeRect(30, 30, 452, 452);
  ctx.lineWidth = 4;
  ctx.strokeRect(56, 56, 400, 400);
  for (let i = 0; i < 1200; i++) {
    ctx.fillStyle = `rgba(60,50,35,${0.02 + Math.random() * 0.04})`;
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 3, 3);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function useWood() {
  return useMemo(() => {
    const t = makeWoodTexture();
    t.repeat.set(3, 3);
    return t;
  }, []);
}

function usePlaster() {
  return useMemo(() => makePlasterTexture(), []);
}

/* ---------------- building blocks ---------------- */

const WOOD = '#8a6a4a';
const WOOD_DARK = '#5e4630';
const LINEN_WHITE = '#f5f0e4';
const BRASS = '#b98a4e';
const FABRIC_PINE = '#31584c';
const FABRIC_TERRA = '#a5533a';
const FABRIC_SAND = '#cbb896';

function Floor() {
  const wood = useWood();
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial map={wood} roughness={0.55} metalness={0.02} />
    </mesh>
  );
}

function Ceiling({ texture }: { texture: THREE.Texture }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.2, 0]}>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial map={texture} roughness={0.95} />
    </mesh>
  );
}

function Wall({ position, rotation, size, texture }: { position: [number, number, number]; rotation: [number, number, number]; size: [number, number]; texture: THREE.Texture }) {
  return (
    <mesh position={position} rotation={rotation} receiveShadow>
      <planeGeometry args={size} />
      <meshStandardMaterial map={texture} roughness={0.9} />
    </mesh>
  );
}

function Baseboard({ position, rotation, width }: { position: [number, number, number]; rotation: [number, number, number]; width: number }) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={[width, 0.14, 0.03]} />
      <meshStandardMaterial color={WOOD_DARK} roughness={0.6} />
    </mesh>
  );
}

function RoundedBox({ size, radius = 0.03, color, map, roughness = 0.5, metalness = 0, ...rest }: {
  size: [number, number, number];
  radius?: number;
  color?: string;
  map?: THREE.Texture;
  roughness?: number;
  metalness?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}) {
  const geo = useMemo(() => new RoundedBoxGeometry(size[0], size[1], size[2], 4, radius), [size, radius]);
  return (
    <mesh geometry={geo} castShadow receiveShadow {...rest}>
      <meshStandardMaterial color={color} map={map} roughness={roughness} metalness={metalness} />
    </mesh>
  );
}

function Bed({ variant = 'queen' }: { variant?: 'queen' | 'king' | 'deluxe' }) {
  const w = variant === 'king' ? 1.9 : variant === 'deluxe' ? 1.7 : 1.55;
  const linen = useMemo(() => makeLinenTexture(LINEN_WHITE), []);
  const throwTex = useMemo(() => makeLinenTexture(FABRIC_PINE), []);
  const headboardH = variant === 'deluxe' ? 1.5 : 1.3;

  return (
    <group position={[-1.6, 0, -1.6]}>
      {/* headboard */}
      <RoundedBox size={[w + 0.25, headboardH, 0.1]} color={WOOD_DARK} position={[0, headboardH / 2, -1.2]} />
      {/* frame */}
      <RoundedBox size={[w + 0.1, 0.22, 2.3]} color={WOOD} position={[0, 0.22, 0]} />
      {/* box spring */}
      <RoundedBox size={[w - 0.05, 0.16, 2.15]} color="#ddd2ba" position={[0, 0.4, 0]} />
      {/* mattress */}
      <RoundedBox size={[w - 0.1, 0.2, 2.1]} map={linen} roughness={0.95} position={[0, 0.57, 0]} />
      {/* duvet */}
      <RoundedBox size={[w - 0.08, 0.14, 1.7]} color={LINEN_WHITE} roughness={0.9} position={[0, 0.7, 0.45]} />
      {/* pillows */}
      <RoundedBox size={[w * 0.42, 0.12, 0.42]} color="#fdfaf3" roughness={0.95} position={[-w * 0.27, 0.76, -0.72]} />
      <RoundedBox size={[w * 0.42, 0.12, 0.42]} color="#fdfaf3" roughness={0.95} position={[w * 0.27, 0.76, -0.72]} />
      {/* throw blanket */}
      <RoundedBox size={[0.85, 0.03, 0.6]} map={throwTex} roughness={0.9} position={[w * 0.32, 0.78, 0.5]} rotation={[0, 0, 0.35]} />
    </group>
  );
}

function Nightstand({ side }: { side: 1 | -1 }) {
  const wood = useMemo(() => makeWoodTexture(), []);
  return (
    <group position={[side * 2.4, 0, -2.2]}>
      <RoundedBox size={[0.45, 0.55, 0.4]} map={wood} position={[0, 0.28, 0]} />
      {/* lamp */}
      <mesh position={[0, 0.62, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.05, 0.2, 16]} />
        <meshStandardMaterial color={BRASS} roughness={0.35} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.11, 0.16, 0.16, 16, 1, false, 0, Math.PI * 2]} />
        <meshStandardMaterial color="#f1e3c8" roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[0, 0.95, 0.35]} intensity={0.5} color="#ffd9a0" distance={2.5} decay={2} />
    </group>
  );
}

function WindowCasement({ position, width = 1.6, height = 1.9 }: { position: [number, number, number]; width?: number; height?: number }) {
  return (
    <group position={position}>
      {/* frame */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[width + 0.12, height + 0.12, 0.1]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.6} />
      </mesh>
      {/* glass */}
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#dcecf4" roughness={0.08} metalness={0.1} transparent opacity={0.65} />
      </mesh>
      {/* mullions */}
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[0.04, height, 0.03]} />
        <meshStandardMaterial color={WOOD_DARK} />
      </mesh>
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[width, 0.04, 0.03]} />
        <meshStandardMaterial color={WOOD_DARK} />
      </mesh>
      {/* sill */}
      <mesh position={[0, -height / 2 - 0.03, 0.1]}>
        <boxGeometry args={[width + 0.18, 0.06, 0.22]} />
        <meshStandardMaterial color={WOOD} />
      </mesh>
    </group>
  );
}

function FrenchDoors({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[3, 2, 0.12]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.6} />
      </mesh>
      <mesh position={[-0.78, 0.95, 0.04]}>
        <planeGeometry args={[1.5, 1.9]} />
        <meshStandardMaterial color="#d5e6f0" roughness={0.08} metalness={0.1} transparent opacity={0.7} />
      </mesh>
      <mesh position={[0.78, 0.95, 0.04]}>
        <planeGeometry args={[1.5, 1.9]} />
        <meshStandardMaterial color="#d5e6f0" roughness={0.08} metalness={0.1} transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, 0.95, 0.06]}>
        <boxGeometry args={[0.06, 1.9, 0.03]} />
        <meshStandardMaterial color={WOOD_DARK} />
      </mesh>
      <mesh position={[0, 1.3, 0.06]}>
        <boxGeometry args={[3, 0.05, 0.03]} />
        <meshStandardMaterial color={WOOD_DARK} />
      </mesh>
    </group>
  );
}

function PanoramicWindow({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[6, 2.4, 0.12]} />
        <meshStandardMaterial color="#27434f" roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.2, 0.04]}>
        <planeGeometry args={[5.8, 2.2]} />
        <meshStandardMaterial color="#bfe3f0" roughness={0.06} metalness={0.15} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, 1.2, 0.07]}>
        <boxGeometry args={[0.08, 2.2, 0.03]} />
        <meshStandardMaterial color="#27434f" />
      </mesh>
      <mesh position={[0, 1.2, 0.07]}>
        <boxGeometry args={[5.8, 0.08, 0.03]} />
        <meshStandardMaterial color="#27434f" />
      </mesh>
    </group>
  );
}

function Curtains({ position, width = 2, side = 1 }: { position: [number, number, number]; width?: number; side?: 1 | -1 }) {
  const ref = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 2, 12, 12);
    return g;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const pos = ref.current.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const sway = Math.sin(y * 2.2 + t * 0.7) * 0.02 * (1 + y);
      pos.setZ(i, sway + x * x * 0.25 * side);
    }
    pos.needsUpdate = true;
  });

  return (
    <mesh ref={ref} geometry={geo} position={position} scale={[width / 1.8, 1, 1]}>
      <meshStandardMaterial color="#e8e0cc" roughness={0.95} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Desk({ position }: { position: [number, number, number] }) {
  const wood = useMemo(() => makeWoodTexture(), []);
  return (
    <group position={position}>
      <RoundedBox size={[1.2, 0.04, 0.6]} map={wood} position={[0, 0.74, 0]} />
      <RoundedBox size={[0.06, 0.74, 0.5]} map={wood} position={[-0.54, 0.37, 0]} />
      <RoundedBox size={[0.06, 0.74, 0.5]} map={wood} position={[0.54, 0.37, 0]} />
    </group>
  );
}

function DeskChair({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <RoundedBox size={[0.4, 0.06, 0.42]} color={WOOD_DARK} position={[0, 0.45, 0]} />
      <RoundedBox size={[0.4, 0.55, 0.05]} color={WOOD_DARK} position={[0, 0.72, -0.18]} />
      <RoundedBox size={[0.04, 0.45, 0.4]} color={WOOD_DARK} position={[0, 0.22, 0]} />
    </group>
  );
}

function Armchair({ position, rotation = 0, color = FABRIC_TERRA }: { position: [number, number, number]; rotation?: number; color?: string }) {
  const fabric = useMemo(() => makeLinenTexture(color), [color]);
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <RoundedBox size={[0.85, 0.36, 0.8]} map={fabric} radius={0.06} position={[0, 0.34, 0]} />
      <RoundedBox size={[0.85, 0.6, 0.14]} map={fabric} radius={0.05} position={[0, 0.68, -0.36]} />
      <RoundedBox size={[0.14, 0.6, 0.76]} map={fabric} radius={0.05} position={[-0.38, 0.68, 0]} />
      <RoundedBox size={[0.14, 0.6, 0.76]} map={fabric} radius={0.05} position={[0.38, 0.68, 0]} />
      <RoundedBox size={[0.04, 0.34, 0.72]} color={WOOD_DARK} position={[0, 0.15, 0]} />
    </group>
  );
}

function Sofa() {
  const fabric = useMemo(() => makeLinenTexture(FABRIC_SAND), []);
  return (
    <group position={[2.1, 0, 1.2]} rotation={[0, -0.4, 0]}>
      <RoundedBox size={[1.9, 0.34, 0.85]} map={fabric} radius={0.06} position={[0, 0.32, 0]} />
      <RoundedBox size={[1.9, 0.55, 0.16]} map={fabric} radius={0.05} position={[0, 0.66, -0.34]} />
      <RoundedBox size={[0.16, 0.55, 0.8]} map={fabric} radius={0.05} position={[-0.88, 0.66, 0]} />
      <RoundedBox size={[0.16, 0.55, 0.8]} map={fabric} radius={0.05} position={[0.88, 0.66, 0]} />
      {/* cushions */}
      <RoundedBox size={[0.55, 0.14, 0.5]} color={FABRIC_TERRA} radius={0.05} position={[-0.42, 0.55, 0.08]} rotation={[0, 0, 0.05]} />
      <RoundedBox size={[0.55, 0.14, 0.5]} color={FABRIC_PINE} radius={0.05} position={[0.42, 0.55, 0.08]} rotation={[0, 0, -0.05]} />
      <RoundedBox size={[0.04, 0.3, 0.76]} color={WOOD_DARK} position={[0, 0.13, 0]} />
    </group>
  );
}

function CoffeeTable({ position }: { position: [number, number, number] }) {
  const wood = useMemo(() => makeWoodTexture(), []);
  return (
    <group position={position}>
      <RoundedBox size={[1, 0.04, 0.55]} map={wood} position={[0, 0.42, 0]} />
      <RoundedBox size={[0.05, 0.42, 0.45]} map={wood} position={[-0.44, 0.21, 0]} />
      <RoundedBox size={[0.05, 0.42, 0.45]} map={wood} position={[0.44, 0.21, 0]} />
    </group>
  );
}

function FloorLamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.02, 0.03, 1.3, 12]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.45, 0]} castShadow>
        <coneGeometry args={[0.28, 0.4, 16, 1, true]} />
        <meshStandardMaterial color="#efe3c9" roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[0, 1.4, 0.3]} intensity={0.5} color="#ffd9a0" distance={3.5} decay={2} />
    </group>
  );
}

function Plant({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.18, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.12, 0.36, 16]} />
        <meshStandardMaterial color="#9a6a3a" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.62, 0]} castShadow>
        <sphereGeometry args={[0.32, 10, 8]} />
        <meshStandardMaterial color="#3c6b45" roughness={0.9} />
      </mesh>
      <mesh position={[0.18, 0.5, 0.1]} castShadow>
        <sphereGeometry args={[0.2, 8, 6]} />
        <meshStandardMaterial color="#4c7d54" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Pendant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 1, 8]} />
        <meshStandardMaterial color={WOOD_DARK} />
      </mesh>
      <mesh position={[0, -0.9, 0]} castShadow>
        <sphereGeometry args={[0.22, 16, 12]} />
        <meshStandardMaterial color="#f3e7cc" roughness={0.7} emissive="#ffe6b3" emissiveIntensity={0.25} />
      </mesh>
    </group>
  );
}

function Rug({ position, scale = 1, color = '#c9b490' }: { position: [number, number, number]; scale?: number; color?: string }) {
  const tex = useMemo(() => makeRugTexture(), []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={position} scale={scale} receiveShadow>
      <planeGeometry args={[3.2, 2.4]} />
      <meshStandardMaterial map={tex} color={color} roughness={0.9} />
    </mesh>
  );
}

function OceanScape() {
  const ref = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => new THREE.PlaneGeometry(8, 3, 40, 20), []);
  const orig = useMemo(() => {
    const pos = geo.attributes.position;
    const arr = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i++) {
      arr[i * 2] = pos.getX(i);
      arr[i * 2 + 1] = pos.getY(i);
    }
    return arr;
  }, [geo]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const pos = ref.current.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = orig[i * 2];
      const y = orig[i * 2 + 1];
      pos.setZ(i, Math.sin(x * 1.2 + t * 1.1) * 0.1 + Math.sin(y * 1.8 + t * 0.7) * 0.06);
    }
    pos.needsUpdate = true;
  });

  return (
    <group position={[0, 1.1, -2.9]}>
      <mesh ref={ref} geometry={geo} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#1a6e8e" roughness={0.3} metalness={0.35} />
      </mesh>
      {/* sky through window */}
      <mesh position={[0, 2.6, -2.9]}>
        <planeGeometry args={[8, 1.6]} />
        <meshStandardMaterial color="#bcd9ea" roughness={0.2} />
      </mesh>
    </group>
  );
}

function GardenScape() {
  return (
    <group position={[0, 0.6, -2.9]}>
      <mesh position={[0, 0.4, 0]}>
        <planeGeometry args={[5, 2.4]} />
        <meshStandardMaterial color="#8fbf7a" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.9, 0]}>
        <planeGeometry args={[5, 1]} />
        <meshStandardMaterial color="#cfe8f2" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.25, 0.15]}>
        <boxGeometry args={[5, 0.5, 0.2]} />
        <meshStandardMaterial color="#3c6b45" roughness={0.9} />
      </mesh>
    </group>
  );
}

/* ---------------- room compositions ---------------- */

function StandardRoom({ walls }: { walls: THREE.Texture }) {
  return (
    <group>
      <Floor />
      <Ceiling texture={walls} />
      <Wall position={[0, 1.6, -4]} rotation={[0, 0, 0]} size={[10, 3.2]} texture={walls} />
      <Wall position={[-4, 1.6, 0]} rotation={[0, Math.PI / 2, 0]} size={[8, 3.2]} texture={walls} />
      <Wall position={[4, 1.6, 0]} rotation={[0, -Math.PI / 2, 0]} size={[8, 3.2]} texture={walls} />
      <Baseboard position={[0, 0.07, -4.015]} rotation={[0, 0, 0]} width={10} />
      <Baseboard position={[-4.015, 0.07, 0]} rotation={[0, Math.PI / 2, 0]} width={8} />
      <Baseboard position={[4.015, 0.07, 0]} rotation={[0, -Math.PI / 2, 0]} width={8} />

      <Bed variant="queen" />
      <Nightstand side={1} />
      <Nightstand side={-1} />
      <WindowCasement position={[3, 1.6, -3.95]} />
      <Curtains position={[3, 1.6, -3.78]} width={1.6} side={1} />
      <Curtains position={[3, 1.6, -3.78]} width={1.6} side={-1} />
      <Desk position={[2.8, 0, 0.6]} />
      <DeskChair position={[2.8, 0, 1.5]} />
      <Rug position={[-0.6, 0.015, -0.4]} />
      <Pendant position={[0, 3.2, 0]} />
    </group>
  );
}

function DeluxeRoom({ walls }: { walls: THREE.Texture }) {
  return (
    <group>
      <Floor />
      <Ceiling texture={walls} />
      <Wall position={[0, 1.6, -4]} rotation={[0, 0, 0]} size={[10, 3.2]} texture={walls} />
      <Wall position={[-4, 1.6, 0]} rotation={[0, Math.PI / 2, 0]} size={[8, 3.2]} texture={walls} />
      <Wall position={[4, 1.6, 0]} rotation={[0, -Math.PI / 2, 0]} size={[8, 3.2]} texture={walls} />
      <Baseboard position={[0, 0.07, -4.015]} rotation={[0, 0, 0]} width={10} />
      <Baseboard position={[-4.015, 0.07, 0]} rotation={[0, Math.PI / 2, 0]} width={8} />
      <Baseboard position={[4.015, 0.07, 0]} rotation={[0, -Math.PI / 2, 0]} width={8} />

      <Bed variant="king" />
      <Nightstand side={1} />
      <Nightstand side={-1} />
      <WindowCasement position={[3, 1.6, -3.95]} width={2.2} />
      <Curtains position={[3, 1.6, -3.78]} width={2.2} side={1} />
      <Curtains position={[3, 1.6, -3.78]} width={2.2} side={-1} />
      <Armchair position={[2.7, 0, 1.3]} rotation={-0.6} />
      <Desk position={[-2.9, 0, 1.6]} />
      <DeskChair position={[-2.9, 0, 2.6]} />
      <Rug position={[-0.4, 0.015, -0.2]} scale={1.15} />
      <Pendant position={[-0.3, 3.2, 0]} />
      <Plant position={[3.5, 0, -0.8]} />
    </group>
  );
}

function SuiteRoom({ walls }: { walls: THREE.Texture }) {
  return (
    <group>
      <Floor />
      <Ceiling texture={walls} />
      <Wall position={[0, 1.6, -4]} rotation={[0, 0, 0]} size={[10, 3.2]} texture={walls} />
      <Wall position={[-4, 1.6, 0]} rotation={[0, Math.PI / 2, 0]} size={[8, 3.2]} texture={walls} />
      <Wall position={[4, 1.6, 0]} rotation={[0, -Math.PI / 2, 0]} size={[8, 3.2]} texture={walls} />
      <Baseboard position={[0, 0.07, -4.015]} rotation={[0, 0, 0]} width={10} />
      <Baseboard position={[-4.015, 0.07, 0]} rotation={[0, Math.PI / 2, 0]} width={8} />
      <Baseboard position={[4.015, 0.07, 0]} rotation={[0, -Math.PI / 2, 0]} width={8} />

      <Bed variant="deluxe" />
      <Nightstand side={1} />
      <Nightstand side={-1} />
      <WindowCasement position={[3, 1.6, -3.95]} width={2.2} />
      <Curtains position={[3, 1.6, -3.78]} width={2.2} side={1} />
      <Curtains position={[3, 1.6, -3.78]} width={2.2} side={-1} />
      <Sofa />
      <CoffeeTable position={[2.1, 0, 2.3]} />
      <Armchair position={[0.9, 0, 2.7]} rotation={0.5} color={FABRIC_PINE} />
      <FloorLamp position={[3.6, 0, 2.9]} />
      <Rug position={[1.6, 0.015, 1.8]} scale={1.2} color="#a97e4a" />
      <Pendant position={[2.1, 3.2, 1.8]} />
      <Pendant position={[-0.3, 3.2, -0.2]} />
    </group>
  );
}

function GardenRoom({ walls }: { walls: THREE.Texture }) {
  return (
    <group>
      <Floor />
      <Ceiling texture={walls} />
      <Wall position={[0, 1.6, -4]} rotation={[0, 0, 0]} size={[10, 3.2]} texture={walls} />
      <Wall position={[-4, 1.6, 0]} rotation={[0, Math.PI / 2, 0]} size={[8, 3.2]} texture={walls} />
      <Wall position={[4, 1.6, 0]} rotation={[0, -Math.PI / 2, 0]} size={[8, 3.2]} texture={walls} />
      <Baseboard position={[0, 0.07, -4.015]} rotation={[0, 0, 0]} width={10} />
      <Baseboard position={[-4.015, 0.07, 0]} rotation={[0, Math.PI / 2, 0]} width={8} />
      <Baseboard position={[4.015, 0.07, 0]} rotation={[0, -Math.PI / 2, 0]} width={8} />

      <Bed variant="queen" />
      <Nightstand side={1} />
      <Nightstand side={-1} />
      <FrenchDoors position={[3, 0, -3.94]} />
      <GardenScape />
      <Armchair position={[1.6, 0, 2.5]} rotation={0.4} color={FABRIC_SAND} />
      <Plant position={[3.4, 0, -0.5]} scale={1.3} />
      <Plant position={[3.5, 0, 1.6]} scale={0.9} />
      <Plant position={[-3.4, 0, -1.2]} scale={1.1} />
      <Rug position={[-0.5, 0.015, -0.4]} color="#8a9a5f" />
      <Pendant position={[0, 3.2, 0]} />
    </group>
  );
}

function OceanRoom({ walls }: { walls: THREE.Texture }) {
  return (
    <group>
      <Floor />
      <Ceiling texture={walls} />
      <Wall position={[0, 1.6, -4]} rotation={[0, 0, 0]} size={[10, 3.2]} texture={walls} />
      <Wall position={[-4, 1.6, 0]} rotation={[0, Math.PI / 2, 0]} size={[8, 3.2]} texture={walls} />
      <Wall position={[4, 1.6, 0]} rotation={[0, -Math.PI / 2, 0]} size={[8, 3.2]} texture={walls} />
      <Baseboard position={[0, 0.07, -4.015]} rotation={[0, 0, 0]} width={10} />
      <Baseboard position={[-4.015, 0.07, 0]} rotation={[0, Math.PI / 2, 0]} width={8} />
      <Baseboard position={[4.015, 0.07, 0]} rotation={[0, -Math.PI / 2, 0]} width={8} />

      <Bed variant="deluxe" />
      <Nightstand side={1} />
      <Nightstand side={-1} />
      <PanoramicWindow position={[0, 0, -3.94]} />
      <OceanScape />
      <Armchair position={[2.7, 0, 1.4]} rotation={-0.5} color={FABRIC_PINE} />
      <Rug position={[-0.3, 0.015, 0.1]} scale={1.15} color="#5b8fa3" />
      <Pendant position={[0, 3.2, -0.4]} />
      <Plant position={[-3.5, 0, 1.6]} scale={1.1} />
    </group>
  );
}

/* ---------------- lights / shell ---------------- */

function Lights({ type }: { type: RoomType }) {
  const isOcean = type === 'ocean';
  const isGarden = type === 'garden';
  return (
    <>
      <hemisphereLight args={['#ffffff', '#c9b490', isOcean || isGarden ? 0.85 : 0.55]} />
      <directionalLight
        position={[5, 4, 3]}
        intensity={isOcean || isGarden ? 1.3 : 0.9}
        color="#fff4e0"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <ambientLight intensity={0.25} color="#8a7560" />
    </>
  );
}

function Loader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center text-sm text-muted">
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-brass border-t-transparent" />
        Preparing the room…
      </div>
    </div>
  );
}

function ScannedRoom({ url }: { url: string }) {
  const gltf = useLoader(GLTFLoader, url);
  const scene = gltf.scene;

  useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (!maxDim) return;
    const scale = TARGET_ROOM_SIZE / maxDim;
    scene.scale.setScalar(scale);
    box.setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    scene.position.x -= center.x;
    scene.position.z -= center.z;
    scene.position.y -= box.min.y;
    scene.traverse((o) => {
      o.castShadow = false;
      o.receiveShadow = false;
    });
  }, [scene]);

  const env = useMemo(() => new RoomEnvironment(), []);

  return (
    <>
      <Environment frames={1} resolution={128}>
        <primitive object={env} />
      </Environment>
      <hemisphereLight args={['#ffffff', '#ffffff', 0.55]} />
      <primitive object={scene} />
    </>
  );
}

function ScannedCanvas({ url }: { url: string }) {
  return (
    <Canvas
      dpr={Math.min(window.devicePixelRatio, 1.5)}
      camera={{ position: [0, 2.2, 7.2], fov: 50, near: 0.1, far: 60 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
    >
      <ScannedRoom url={url} />
      <OrbitControls
        autoRotate
        autoRotateSpeed={0.6}
        enableZoom
        enablePan={false}
        minPolarAngle={0.3}
        maxPolarAngle={1.45}
        minDistance={3}
        maxDistance={14}
        target={[0, 1.4, 0]}
      />
    </Canvas>
  );
}

class RoomErrorBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

export function RoomViewer3D({ type }: { type: RoomType }) {
  const plaster = usePlaster();
  const [scanned, setScanned] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    setScanned(null);
    fetch(`/models/${type}.glb`, { method: 'HEAD' })
      .then((r) => {
        if (alive) setScanned(r.ok);
      })
      .catch(() => {
        if (alive) setScanned(false);
      });
    return () => {
      alive = false;
    };
  }, [type]);

  const modelUrl = `/models/${type}.glb`;

  if (scanned === null) {
    return (
      <div className="relative h-[360px] md:h-[520px] w-full" data-room-viewer>
        <Loader />
      </div>
    );
  }

  if (scanned) {
    return (
      <div className="relative h-[360px] md:h-[520px] w-full" data-room-viewer>
        <Suspense fallback={<Loader />}>
          <RoomErrorBoundary onError={() => setScanned(false)}>
            <ScannedCanvas url={modelUrl} />
          </RoomErrorBoundary>
        </Suspense>
        <p className="pointer-events-none absolute bottom-1 right-3 z-10 font-mono text-[0.625rem] tracking-[0.18em] uppercase text-faint">
          Scanned room · CC-BY · credit in models/CREDITS.md
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-[360px] md:h-[520px] w-full" data-room-viewer>
      <Suspense fallback={<Loader />}>
        <Canvas
          dpr={Math.min(window.devicePixelRatio, 1.5)}
          camera={{ position: [0, 1.7, 5.4], fov: 50, near: 0.1, far: 40 }}
          shadows
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        >
          <fog attach="fog" args={['#e9e2d0', 16, 30]} />
          <Lights type={type} />
          {type === 'standard' && <StandardRoom walls={plaster} />}
          {type === 'deluxe' && <DeluxeRoom walls={plaster} />}
          {type === 'suite' && <SuiteRoom walls={plaster} />}
          {type === 'garden' && <GardenRoom walls={plaster} />}
          {type === 'ocean' && <OceanRoom walls={plaster} />}
          <OrbitControls
            autoRotate
            autoRotateSpeed={0.5}
            enableZoom
            enablePan={false}
            minPolarAngle={0.35}
            maxPolarAngle={1.42}
            minDistance={2}
            maxDistance={8}
            target={[0, 1.1, 0]}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}
