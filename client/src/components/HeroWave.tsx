import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const OCEAN_deep = '#0e4a6e';
const OCEAN_mid = '#1a6e8e';
const OCEAN_light = '#2a8eaa';
const OCEAN_foam = '#7ac4d8';
const SUN_COLOR = '#f0c060';
const SUN_GLOW = '#e8a030';
const SKY_top = '#1a2e50';
const SKY_horizon = '#c87040';

function OceanMesh({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(30, 18, 80, 48);
    const count = g.attributes.position.count;
    const pos = g.attributes.position;
    const arr = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      arr[i * 2] = pos.getX(i);
      arr[i * 2 + 1] = pos.getY(i);
    }
    return g;
  }, []);

  const orig = useMemo(() => {
    const pos = geo.attributes.position;
    const arr = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i++) {
      arr[i * 2] = pos.getX(i);
      arr[i * 2 + 1] = pos.getY(i);
    }
    return arr;
  }, [geo]);

  useEffect(() => {
    const count = geo.attributes.position.count;
    const arr = new Float32Array(count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const y = orig[i * 2 + 1];
      const t = (y + 9) / 18;
      if (t < 0.35) {
        c.set(OCEAN_deep);
      } else if (t < 0.6) {
        c.lerpColors(new THREE.Color(OCEAN_deep), new THREE.Color(OCEAN_mid), (t - 0.35) / 0.25);
      } else if (t < 0.85) {
        c.lerpColors(new THREE.Color(OCEAN_mid), new THREE.Color(OCEAN_light), (t - 0.6) / 0.25);
      } else {
        c.lerpColors(new THREE.Color(OCEAN_light), new THREE.Color(OCEAN_foam), (t - 0.85) / 0.15);
      }
      arr[i * 3] = c.r;
      arr[i * 3 + 1] = c.g;
      arr[i * 3 + 2] = c.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  }, [geo, orig]);

  useFrame(({ clock }) => {
    if (reduced || !ref.current) return;
    const t = clock.getElapsedTime() * 0.35;
    const pos = ref.current.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = orig[i * 2];
      const y = orig[i * 2 + 1];
      const dist = Math.sqrt(x * x + y * y);
      const wave =
        Math.sin(x * 0.35 + t * 1.1) * 0.45 +
        Math.sin(y * 0.5 + t * 0.7) * 0.3 +
        Math.sin((x * 0.2 + y * 0.3) + t * 1.4) * 0.2 +
        Math.sin(dist * 0.15 - t * 0.9) * 0.15;
      pos.setZ(i, wave);
    }
    pos.needsUpdate = true;
    ref.current.geometry.computeVertexNormals();
  });

  return (
    <mesh ref={ref} geometry={geo} rotation={[-Math.PI / 2.15, 0, 0]} position={[0, -2.5, -2]}>
      <meshStandardMaterial
        vertexColors
        flatShading
        roughness={0.55}
        metalness={0.2}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function Sun({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (reduced || !ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.y = 2.8 + Math.sin(t * 0.15) * 0.06;
    if (glowRef.current) {
      const s = 1 + Math.sin(t * 0.5) * 0.04;
      glowRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group ref={ref} position={[7, 2.8, -10]}>
      {/* sun core */}
      <mesh>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial color={SUN_COLOR} />
      </mesh>
      {/* inner glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.8, 32, 32]} />
        <meshBasicMaterial color={SUN_GLOW} transparent opacity={0.35} />
      </mesh>
      {/* outer glow */}
      <mesh>
        <sphereGeometry args={[3, 32, 32]} />
        <meshBasicMaterial color={SUN_GLOW} transparent opacity={0.1} />
      </mesh>
      <pointLight color={SUN_COLOR} intensity={2} distance={25} decay={1.5} />
    </group>
  );
}

function Sky() {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(60, 30, 1, 1);
    const colors = new Float32Array(4 * 3);
    const c = new THREE.Color();
    const top = new THREE.Color(SKY_top);
    const hor = new THREE.Color(SKY_horizon);

    const positions = g.attributes.position;
    for (let i = 0; i < 4; i++) {
      const y = positions.getY(i);
      const t = (y + 15) / 30;
      c.lerpColors(top, hor, 1 - t);
      if (i < 2) c.lerp(new THREE.Color(SKY_horizon), 0.3);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  }, []);

  return (
    <mesh geometry={geo} position={[0, 5, -15]}>
      <meshBasicMaterial vertexColors />
    </mesh>
  );
}

function HorizonGlow() {
  return (
    <mesh position={[0, -0.5, -14]} rotation={[0, 0, 0]}>
      <planeGeometry args={[60, 4]} />
      <meshBasicMaterial color={SKY_horizon} transparent opacity={0.5} />
    </mesh>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.4} color="#8ec8e0" />
      <directionalLight position={[7, 6, -5]} intensity={1.2} color={SUN_COLOR} />
      <directionalLight position={[-3, 2, 2]} intensity={0.15} color="#6090b0" />
    </>
  );
}

function CameraRig({ reduced }: { reduced: boolean }) {
  const { camera, pointer } = useThree();
  const lookTarget = useRef(new THREE.Vector3(0, 0.5, -8));

  useFrame(() => {
    if (reduced) return;
    const tx = pointer.x * 0.8;
    const ty = 2.2 + pointer.y * 0.4;
    camera.position.x += (tx - camera.position.x) * 0.015;
    camera.position.y += (ty - camera.position.y) * 0.015;
    camera.lookAt(lookTarget.current);
  });

  return null;
}

export function HeroWave() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const dpr = useMemo(() => Math.min(window.devicePixelRatio, 1.5), []);

  return (
    <div className="absolute inset-0 z-0" aria-hidden="true">
      <Canvas
        dpr={dpr}
        camera={{ position: [0, 2.2, 6], fov: 55, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: SKY_top }}
      >
        <Sky />
        <HorizonGlow />
        <Sun reduced={reduced} />
        <Lights />
        <CameraRig reduced={reduced} />
        <OceanMesh reduced={reduced} />
      </Canvas>
    </div>
  );
}
