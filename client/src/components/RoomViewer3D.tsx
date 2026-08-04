import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { RoomType } from '@/lib/types';

const PALETTE = {
  floor: '#e7dcc8',
  wall: '#fbf7ef',
  accentWall: '#12342c',
  ink: '#1b1712',
  brass: '#a97e4a',
  brassSoft: '#e8d8be',
  cream: '#f2ead9',
  sand: '#d8c9ac',
  pine: '#12342c',
  ocean: '#1a4a5c',
  sky: '#c9d4e0',
  plant: '#2d5a3e',
} as const;

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[8, 6]} />
      <meshStandardMaterial color={PALETTE.floor} roughness={0.9} />
    </mesh>
  );
}

function Walls({ type }: { type: RoomType }) {
  const isOcean = type === 'ocean';
  const isGarden = type === 'garden';
  const backColor = isOcean || isGarden ? PALETTE.wall : PALETTE.accentWall;

  return (
    <group>
      {/* back wall */}
      <mesh position={[0, 1.5, -3]} receiveShadow>
        <planeGeometry args={[8, 3]} />
        <meshStandardMaterial color={backColor} roughness={0.85} />
      </mesh>
      {/* left wall */}
      <mesh position={[-4, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[6, 3]} />
        <meshStandardMaterial color={PALETTE.wall} roughness={0.85} />
      </mesh>
      {/* right wall */}
      <mesh position={[4, 1.5, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[6, 3]} />
        <meshStandardMaterial color={PALETTE.wall} roughness={0.85} />
      </mesh>
    </group>
  );
}

function Bed({ large }: { large?: boolean }) {
  const w = large ? 2.2 : 1.8;
  return (
    <group position={[-1.5, 0, -1.8]}>
      {/* frame */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[w, 0.4, 2.4]} />
        <meshStandardMaterial color={PALETTE.ink} roughness={0.7} />
      </mesh>
      {/* mattress */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[w - 0.1, 0.25, 2.2]} />
        <meshStandardMaterial color={PALETTE.cream} roughness={0.95} />
      </mesh>
      {/* pillows */}
      <mesh position={[-0.35, 0.7, -0.8]} castShadow>
        <boxGeometry args={[0.5, 0.15, 0.35]} />
        <meshStandardMaterial color={PALETTE.wall} roughness={0.95} />
      </mesh>
      <mesh position={[0.35, 0.7, -0.8]} castShadow>
        <boxGeometry args={[0.5, 0.15, 0.35]} />
        <meshStandardMaterial color={PALETTE.wall} roughness={0.95} />
      </mesh>
      {/* brass throw */}
      <mesh position={[0, 0.65, 0.6]} castShadow>
        <boxGeometry args={[w - 0.15, 0.04, 0.6]} />
        <meshStandardMaterial color={PALETTE.brass} roughness={0.6} metalness={0.1} />
      </mesh>
    </group>
  );
}

function Nightstand() {
  return (
    <group position={[0.4, 0, -2]}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[0.5, 0.7, 0.4]} />
        <meshStandardMaterial color={PALETTE.ink} roughness={0.7} />
      </mesh>
      {/* lamp base */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.25, 12]} />
        <meshStandardMaterial color={PALETTE.brass} roughness={0.4} metalness={0.3} />
      </mesh>
      {/* lamp shade */}
      <mesh position={[0, 0.98, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 0.2, 12]} />
        <meshStandardMaterial color={PALETTE.brassSoft} roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[0, 1.1, 0.3]} intensity={0.4} color="#c9995f" distance={3} decay={2} />
    </group>
  );
}

function WindowFrame({ wide, showView }: { wide?: boolean; showView?: boolean }) {
  const w = wide ? 3.5 : 2;
  return (
    <group position={[2.5, 1.5, -2.98]}>
      {/* frame */}
      <mesh>
        <boxGeometry args={[w, 2, 0.08]} />
        <meshStandardMaterial color={PALETTE.ink} roughness={0.7} />
      </mesh>
      {/* glass */}
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[w - 0.15, 1.85]} />
        <meshStandardMaterial
          color={showView ? PALETTE.sky : PALETTE.brassSoft}
          transparent
          opacity={0.5}
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>
      {/* mullion */}
      <mesh position={[0, 0, 0.04]}>
        <boxGeometry args={[0.04, 1.85, 0.02]} />
        <meshStandardMaterial color={PALETTE.ink} />
      </mesh>
      <mesh position={[0, 0, 0.04]}>
        <boxGeometry args={[w - 0.15, 0.04, 0.02]} />
        <meshStandardMaterial color={PALETTE.ink} />
      </mesh>
    </group>
  );
}

function Sofa() {
  return (
    <group position={[2, 0, 0.5]}>
      {/* seat */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[1.8, 0.35, 0.8]} />
        <meshStandardMaterial color={PALETTE.accentWall} roughness={0.8} />
      </mesh>
      {/* back */}
      <mesh position={[0, 0.65, -0.3]} castShadow>
        <boxGeometry args={[1.8, 0.5, 0.2]} />
        <meshStandardMaterial color={PALETTE.accentWall} roughness={0.8} />
      </mesh>
      {/* cushions */}
      <mesh position={[-0.4, 0.55, 0.05]} castShadow>
        <boxGeometry args={[0.6, 0.12, 0.5]} />
        <meshStandardMaterial color={PALETTE.brass} roughness={0.7} />
      </mesh>
      <mesh position={[0.4, 0.55, 0.05]} castShadow>
        <boxGeometry args={[0.6, 0.12, 0.5]} />
        <meshStandardMaterial color={PALETTE.brassSoft} roughness={0.7} />
      </mesh>
    </group>
  );
}

function Plant({ scale = 1, position = [-3.2, 0, -1] }: { scale?: number; position?: [number, number, number] }) {
  return (
    <group position={position} scale={scale}>
      {/* pot */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.12, 0.4, 8]} />
        <meshStandardMaterial color={PALETTE.sand} roughness={0.9} />
      </mesh>
      {/* foliage */}
      <mesh position={[0, 0.65, 0]} castShadow>
        <sphereGeometry args={[0.3, 8, 6]} />
        <meshStandardMaterial color={PALETTE.plant} roughness={0.9} />
      </mesh>
    </group>
  );
}

function OceanView() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const pos = ref.current.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      pos.setZ(i, Math.sin(x * 1.5 + t * 0.8) * 0.08);
    }
    pos.needsUpdate = true;
  });

  return (
    <group position={[2.5, 0.3, -2.5]}>
      <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.2, 1.5, 20, 10]} />
        <meshStandardMaterial color={PALETTE.ocean} roughness={0.6} metalness={0.1} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function RoomScene({ type }: { type: RoomType }) {
  const isLarge = type === 'suite' || type === 'deluxe';
  const isOcean = type === 'ocean';
  const isGarden = type === 'garden';

  return (
    <group>
      <Floor />
      <Walls type={type} />
      <Bed large={isLarge} />
      <Nightstand />
      <WindowFrame wide={isLarge} showView={isOcean || isGarden} />

      {isOcean && <OceanView />}

      {isGarden && (
        <group>
          <Plant scale={1.2} />
          <Plant scale={0.9} position={[-2.5, 0, 0.5]} />
        </group>
      )}

      {type === 'suite' && <Sofa />}
    </group>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.5} color="#f5eee0" />
      <directionalLight position={[4, 5, 3]} intensity={0.6} color="#f5eee0" castShadow />
      <directionalLight position={[-2, 3, 1]} intensity={0.2} color="#c9995f" />
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

export function RoomViewer3D({ type }: { type: RoomType }) {
  return (
    <div className="relative h-[320px] md:h-[480px] w-full">
      <Suspense fallback={<Loader />}>
        <Canvas
          dpr={Math.min(window.devicePixelRatio, 1.5)}
          camera={{ position: [5, 3.5, 5], fov: 45 }}
          shadows
          gl={{ antialias: true }}
        >
          <fog attach="fog" args={['#f5eee0', 10, 22]} />
          <Lights />
          <RoomScene type={type} />
          <OrbitControls
            autoRotate
            autoRotateSpeed={0.6}
            enableZoom
            enablePan={false}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.2}
            minDistance={4}
            maxDistance={12}
            target={[0, 0.8, 0]}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}
