import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";

function SystemTree({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!group.current || reducedMotion) return;
    group.current.rotation.y += delta * 0.075;
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.42) * 0.045;
  });

  const branches = [[-0.46, 0.8, -0.55, 0.22, -0.48], [0.45, 0.98, 0.58, -0.26, 0.5], [-0.3, 1.42, -0.42, 0.16, -0.55], [0.28, 1.63, 0.48, -0.17, 0.5]];
  const nodes = [[-0.72, 1.12, -0.22], [0.67, 1.33, 0.04], [-0.25, 1.98, 0.18], [0.26, 2.13, -0.25], [0, 2.42, 0], [-0.8, 1.74, 0.3]];

  return <group ref={group} position={[0, -1.16, 0]} scale={0.92}>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[1.42, 0.012, 8, 96]} />
      <meshBasicMaterial color="#0cc0df" transparent opacity={0.32} />
    </mesh>
    <mesh rotation={[Math.PI / 2.25, 0.2, -0.42]}>
      <torusGeometry args={[1.95, 0.009, 8, 96]} />
      <meshBasicMaterial color="#c89b3c" transparent opacity={0.18} />
    </mesh>
    <mesh castShadow receiveShadow><cylinderGeometry args={[0.23, 0.38, 2.3, 8]} /><meshStandardMaterial color="#3d3027" roughness={0.87} metalness={0.05} /></mesh>
    <mesh position={[0, 1.06, 0]}><cylinderGeometry args={[0.13, 0.22, 1.35, 8]} /><meshStandardMaterial color="#544033" roughness={0.78} /></mesh>
    {branches.map(([x, y, z, rx, rz], index) => <mesh key={index} position={[x, y, z]} rotation={[rx, 0, rz]}><cylinderGeometry args={[0.06, 0.15, 1.25, 7]} /><meshStandardMaterial color="#4a3a30" roughness={0.82} /></mesh>)}
    {nodes.map(([x, y, z], index) => <Float key={index} speed={reducedMotion ? 0 : 1.1 + index * 0.08} rotationIntensity={reducedMotion ? 0 : 0.22} floatIntensity={reducedMotion ? 0 : 0.35}><mesh position={[x, y, z]}><icosahedronGeometry args={[0.22 + (index % 2) * 0.045, 2]} /><meshStandardMaterial color={index % 3 === 0 ? "#f0bd55" : "#12d8ee"} emissive={index % 3 === 0 ? "#7a4d08" : "#08606b"} emissiveIntensity={2.2} roughness={0.26} metalness={0.42} /></mesh></Float>)}
    {[-0.7, 0.7].map((x) => <mesh key={x} position={[x, -1.07, 0]} rotation={[0, 0, x * -0.66]}><cylinderGeometry args={[0.025, 0.12, 1.45, 6]} /><meshStandardMaterial color="#4a3a30" roughness={0.9} /></mesh>)}
  </group>;
}

export default function WorldScene() {
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return <div className="world-scene" aria-hidden="true"><Canvas dpr={[1, 1.5]} camera={{ position: [0, 0.5, 5.8], fov: 34 }} gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}><color attach="background" args={["#061111"]} /><ambientLight intensity={1.05} color="#c7eef2" /><directionalLight position={[3, 5, 3]} intensity={2.9} color="#e2c681" /><pointLight position={[-2, 1, 2]} intensity={16} distance={6} color="#0cc0df" /><pointLight position={[1.8, 2.5, 1.6]} intensity={8} distance={7} color="#f0bd55" /><SystemTree reducedMotion={reducedMotion} /><Sparkles count={reducedMotion ? 18 : 72} scale={[4.5, 4.8, 2]} size={2} speed={reducedMotion ? 0 : 0.32} color="#d6f5f8" opacity={0.64} /><EffectComposer multisampling={0} enabled={!reducedMotion}><Bloom luminanceThreshold={0.45} intensity={0.85} mipmapBlur /></EffectComposer></Canvas></div>;
}
