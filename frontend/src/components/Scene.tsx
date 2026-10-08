'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

function Particles() {
  const count = 1500;
  const mesh = useRef<THREE.InstancedMesh>(null);
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const xFactor = -50 + Math.random() * 100;
      const yFactor = -50 + Math.random() * 100;
      const zFactor = -50 + Math.random() * 100;
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
      t = particle.t += speed / 2;
      const a = Math.cos(t) + Math.sin(t * 1) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      const s = Math.cos(t);
      
      dummy.position.set(
        (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
        (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
        (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
      );
      dummy.scale.set(s, s, s);
      dummy.rotation.set(s * 5, s * 5, s * 5);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[0.2, 0]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
    </instancedMesh>
  );
}

function MainBall({ activeTab }: { activeTab: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += 0.005;
    meshRef.current.rotation.y += 0.01;
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 1.5;
  });

  let geometry, color, wireframe;
  
  if (activeTab === 'nba') {
    geometry = <sphereGeometry args={[6, 32, 32]} />;
    color = "#f97316"; // Orange
    wireframe = true;
  } else if (activeTab === 'nfl') {
    geometry = <capsuleGeometry args={[4, 8, 4, 16]} />;
    color = "#8b4513"; // Brown
    wireframe = true;
  } else {
    // Premier League (Soccer)
    geometry = <icosahedronGeometry args={[6, 1]} />;
    color = "#ffffff";
    wireframe = true;
  }

  return (
    <mesh ref={meshRef} position={[15, 0, -10]}>
      {geometry}
      <meshStandardMaterial color={color} wireframe={wireframe} transparent opacity={0.3} />
    </mesh>
  );
}

export default function Scene({ activeTab = 'football' }: { activeTab?: string }) {
  return (
    <div className="fixed inset-0 z-[-1] bg-[#0a0a0a]">
      <Canvas camera={{ fov: 75, position: [0, 0, 30] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Particles />
        <MainBall activeTab={activeTab} />
      </Canvas>
    </div>
  );
}
