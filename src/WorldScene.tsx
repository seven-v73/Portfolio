import { useEffect, useRef, useState, useMemo, useLayoutEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Sparkles, Stars, ContactShadows } from "@react-three/drei";
import { Bloom, EffectComposer, DepthOfField, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

// ============================================================
// UTILITAIRES
// ============================================================
function usePulsatingLight(intensity: number, speed: number, reducedMotion: boolean) {
  const ref = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (!ref.current || reducedMotion) return;
    ref.current.intensity = intensity + Math.sin(clock.getElapsedTime() * speed) * intensity * 0.3;
  });
  return ref;
}

// ============================================================
// 1. GRILLE SACRÉE AU SOL (Manuscrit ancien)
// ============================================================
function SacredGrid() {
  const gridConfig = useMemo(() => {
    const size = 12;
    const divisions = 24;
    const step = size / divisions;
    const points: number[] = [];
    for (let i = 0; i <= divisions; i++) {
      const pos = -size / 2 + i * step;
      points.push(pos, 0, -size / 2, pos, 0, size / 2);
      points.push(-size / 2, 0, pos, size / 2, 0, pos);
    }
    return new Float32Array(points);
  }, []);

  return (
    <lineSegments position={[0, -2.4, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[gridConfig, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color="#0cc0df" transparent opacity={0.04} blending={THREE.AdditiveBlending} />
    </lineSegments>
  );
}

// ============================================================
// 2. PILIERS DE CRISTAL (Dualité Sagesse/Connaissance)
// ============================================================
function CrystalPillars({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const light1 = usePulsatingLight(8, 1.2, reducedMotion);
  const light2 = usePulsatingLight(6, 0.9, reducedMotion);

  useFrame(({ clock }) => {
    if (!group.current || reducedMotion) return;
    const t = clock.getElapsedTime();
    group.current.rotation.y = Math.sin(t * 0.08) * 0.05;
  });

  return (
    <group ref={group}>
      {/* Pilier Cyan — Connaissance, clarté */}
      <group position={[-2.2, -0.5, -0.5]}>
        <mesh>
          <octahedronGeometry args={[0.25, 0]} />
          <meshStandardMaterial
            color="#12d8ee"
            emissive="#12d8ee"
            emissiveIntensity={0.8}
            roughness={0.05}
            metalness={0.9}
            transparent
            opacity={0.9}
          />
        </mesh>
        <mesh position={[0, -0.6, 0]} rotation={[0, 0, 0.1]}>
          <cylinderGeometry args={[0.08, 0.12, 1.2, 6]} />
          <meshStandardMaterial
            color="#12d8ee"
            emissive="#0a8a9e"
            emissiveIntensity={0.4}
            roughness={0.1}
            metalness={0.8}
            transparent
            opacity={0.7}
          />
        </mesh>
        <pointLight ref={light1} position={[0, 0.5, 0]} distance={5} color="#12d8ee" />
        {/* Anneau tournant */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.45, 0.006, 8, 48]} />
          <meshBasicMaterial color="#12d8ee" transparent opacity={0.25} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>

      {/* Pilier Or — Sagesse, chaleur */}
      <group position={[2.2, -0.5, -0.5]}>
        <mesh>
          <octahedronGeometry args={[0.25, 0]} />
          <meshStandardMaterial
            color="#f0bd55"
            emissive="#f0bd55"
            emissiveIntensity={0.8}
            roughness={0.05}
            metalness={0.9}
            transparent
            opacity={0.9}
          />
        </mesh>
        <mesh position={[0, -0.6, 0]} rotation={[0, 0, -0.1]}>
          <cylinderGeometry args={[0.08, 0.12, 1.2, 6]} />
          <meshStandardMaterial
            color="#f0bd55"
            emissive="#8a6a20"
            emissiveIntensity={0.4}
            roughness={0.1}
            metalness={0.8}
            transparent
            opacity={0.7}
          />
        </mesh>
        <pointLight ref={light2} position={[0, 0.5, 0]} distance={5} color="#f0bd55" />
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.45, 0.006, 8, 48]} />
          <meshBasicMaterial color="#f0bd55" transparent opacity={0.25} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>
    </group>
  );
}

// ============================================================
// 3. ARBRE SACRÉ (Arbre de vie géométrique)
// ============================================================
function SacredTree({ reducedMotion }: { reducedMotion: boolean }) {
  const treeRef = useRef<THREE.Group>(null);
  const { mouse } = useThree();

  // Structure de l'arbre : lignes + nœuds
  const treeData = useMemo(() => {
    const branches: { start: THREE.Vector3; end: THREE.Vector3; width: number }[] = [];
    const nodes: THREE.Vector3[] = [];

    const grow = (start: THREE.Vector3, dir: THREE.Vector3, len: number, depth: number) => {
      if (depth <= 0) {
        nodes.push(start.clone());
        return;
      }
      const end = start.clone().add(dir.clone().multiplyScalar(len));
      branches.push({ start: start.clone(), end: end.clone(), width: depth * 0.012 });
      const angleY = 0.6;
      const angleX = 0.4;
      grow(
        end,
        dir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), angleY).applyAxisAngle(new THREE.Vector3(1, 0, 0), angleX),
        len * 0.75,
        depth - 1
      );
      grow(
        end,
        dir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), -angleY).applyAxisAngle(new THREE.Vector3(1, 0, 0), -angleX * 0.7),
        len * 0.75,
        depth - 1
      );
    };

    grow(new THREE.Vector3(0, -2, -2), new THREE.Vector3(0, 1, 0.15), 1.0, 5);
    return { branches, nodes };
  }, []);

  // Feuilles instanciées pour performance
  const leafCount = 32;
  const leafMesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const leafData = useMemo(() => {
    return Array.from({ length: leafCount }).map((_, i) => ({
      nodeIndex: Math.floor(Math.random() * treeData.nodes.length),
      offset: new THREE.Vector3((Math.random() - 0.5) * 0.4, Math.random() * 0.3, (Math.random() - 0.5) * 0.4),
      phase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.5 ? new THREE.Color("#f0bd55") : new THREE.Color("#12d8ee"),
      scale: 0.04 + Math.random() * 0.04,
    }));
  }, [treeData.nodes.length]);

  useFrame(({ clock }) => {
    if (!treeRef.current || reducedMotion) return;
    const t = clock.getElapsedTime();
    treeRef.current.rotation.y += (mouse.x * 0.08 - treeRef.current.rotation.y) * 0.008;
    treeRef.current.scale.setScalar(1 + Math.sin(t * 0.4) * 0.003);

    if (leafMesh.current) {
      leafData.forEach((leaf, i) => {
        const node = treeData.nodes[leaf.nodeIndex];
        if (!node) return;
        const pos = node.clone().add(leaf.offset).add(new THREE.Vector3(0, Math.sin(t + leaf.phase) * 0.05, 0));
        dummy.position.copy(pos);
        dummy.scale.setScalar(leaf.scale * (1 + Math.sin(t * 2 + leaf.phase) * 0.2));
        dummy.updateMatrix();
        leafMesh.current!.setMatrixAt(i, dummy.matrix);
        leafMesh.current!.setColorAt(i, leaf.color);
      });
      leafMesh.current.instanceMatrix.needsUpdate = true;
      if (leafMesh.current.instanceColor) leafMesh.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <group ref={treeRef} position={[0, 0, 0]} scale={0.9}>
      {/* Branches */}
      {treeData.branches.map((b, i) => {
        const dir = b.end.clone().sub(b.start);
        const length = dir.length();
        const mid = b.start.clone().add(dir.multiplyScalar(0.5));
        const branchRef = useRef<THREE.Mesh>(null);
        useLayoutEffect(() => {
          if (branchRef.current) {
            branchRef.current.lookAt(b.end);
          }
        }, [b.end, mid.x, mid.y, mid.z]);
        return (
          <mesh key={i} ref={branchRef} position={mid}>
            <cylinderGeometry args={[b.width, b.width * 0.5, length, 5]} />
            <meshStandardMaterial color="#4a3018" emissive="#2a1805" emissiveIntensity={0.4} roughness={0.95} />
          </mesh>
        );
      })}

      {/* Nœuds lumineux */}
      {treeData.nodes.map((node, i) => (
        <mesh key={`node-${i}`} position={node}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshStandardMaterial color="#f0bd55" emissive="#f0bd55" emissiveIntensity={2} />
        </mesh>
      ))}

      {/* Feuilles instanciées */}
      <instancedMesh ref={leafMesh} args={[undefined, undefined, leafCount]}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshStandardMaterial emissiveIntensity={1.5} transparent opacity={0.9} />
      </instancedMesh>
    </group>
  );
}

// ============================================================
// 4. SPHÈRES DE CONNAISSANCE (Constellations vivantes)
// ============================================================
function GlassSpheres({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const { mouse } = useThree();

  const spheresData = useMemo(
    () => [
      { pos: [-1.6, 1.4, -0.2], color: "#12d8ee", radius: 0.45 },
      { pos: [1.6, 1.4, 0.2], color: "#f0bd55", radius: 0.45 },
      { pos: [0, 2.4, -0.6], color: "#12d8ee", radius: 0.55 },
      { pos: [-1.0, 2.0, 0.8], color: "#f0bd55", radius: 0.4 },
      { pos: [0.9, 2.2, 0.6], color: "#12d8ee", radius: 0.4 },
      { pos: [0, 1.2, 1.0], color: "#f0bd55", radius: 0.35 },
    ],
    []
  );

  const edgesData = useMemo(() => {
    const edges: [number, number][] = [];
    const maxDist = 2.2;
    for (let i = 0; i < spheresData.length; i++) {
      for (let j = i + 1; j < spheresData.length; j++) {
        const d = new THREE.Vector3(...spheresData[i].pos).distanceTo(new THREE.Vector3(...spheresData[j].pos));
        if (d < maxDist) edges.push([i, j]);
      }
    }
    return edges;
  }, [spheresData]);

  useFrame(({ clock }) => {
    if (!group.current || reducedMotion) return;
    const t = clock.getElapsedTime();
    group.current.rotation.y += (mouse.x * 0.04 - group.current.rotation.y) * 0.01;
    group.current.position.y = Math.sin(t * 0.3) * 0.03;
  });

  return (
    <group ref={group} position={[0, 0.5, 0]}>
      {/* Constellations */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array(
                edgesData.flatMap(([i, j]) => [...spheresData[i].pos, ...spheresData[j].pos])
              ),
              3,
            ]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#0cc0df" transparent opacity={0.18} blending={THREE.AdditiveBlending} />
      </lineSegments>

      {spheresData.map((sphere, idx) => (
        <Float
          key={idx}
          speed={reducedMotion ? 0 : 0.5 + idx * 0.1}
          floatIntensity={reducedMotion ? 0 : 0.3}
          rotationIntensity={reducedMotion ? 0 : 0.15}
        >
          <mesh position={new THREE.Vector3(...sphere.pos)}>
            <sphereGeometry args={[sphere.radius, 32, 32]} />
            <meshStandardMaterial
              color={sphere.color}
              emissive={sphere.color}
              emissiveIntensity={0.7}
              roughness={0.08}
              metalness={0.3}
            />
            {/* Halo */}
            <mesh scale={1.5}>
              <sphereGeometry args={[sphere.radius, 16, 16]} />
              <meshBasicMaterial
                color={sphere.color}
                transparent
                opacity={0.06}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
            {/* Anneau */}
            {idx % 2 === 0 && (
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[sphere.radius * 1.35, 0.008, 8, 64]} />
                <meshBasicMaterial
                  color={sphere.color}
                  transparent
                  opacity={0.25}
                  blending={THREE.AdditiveBlending}
                />
              </mesh>
            )}
          </mesh>
        </Float>
      ))}
    </group>
  );
}

// ============================================================
// 5. FLUX DE CONNAISSANCE (Particules le long des constellations)
// ============================================================
function KnowledgeStream({ reducedMotion }: { reducedMotion: boolean }) {
  const count = reducedMotion ? 10 : 40;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const streamData = useMemo(() => {
    const spheresData = [
      [-1.6, 1.4, -0.2], [1.6, 1.4, 0.2], [0, 2.4, -0.6],
      [-1.0, 2.0, 0.8], [0.9, 2.2, 0.6], [0, 1.2, 1.0],
    ] as [number, number, number][];
    const edges: [number, number][] = [];
    const maxDist = 2.2;
    for (let i = 0; i < spheresData.length; i++) {
      for (let j = i + 1; j < spheresData.length; j++) {
        const d = new THREE.Vector3(...spheresData[i]).distanceTo(new THREE.Vector3(...spheresData[j]));
        if (d < maxDist) edges.push([i, j]);
      }
    }
    return Array.from({ length: count }).map(() => {
      const edge = edges[Math.floor(Math.random() * edges.length)];
      const color = Math.random() > 0.5 ? new THREE.Color("#12d8ee") : new THREE.Color("#f0bd55");
      return { edge, color, speed: 0.2 + Math.random() * 0.6, offset: Math.random() };
    });
  }, [count]);

  useFrame(({ clock }) => {
    if (!mesh.current || reducedMotion) return;
    const t = clock.getElapsedTime();
    streamData.forEach((s, i) => {
      const a = new THREE.Vector3(...(s.edge ? [[-1.6, 1.4, -0.2], [1.6, 1.4, 0.2], [0, 2.4, -0.6], [-1.0, 2.0, 0.8], [0.9, 2.2, 0.6], [0, 1.2, 1.0]][s.edge[0]] : [0,0,0]));
      const b = new THREE.Vector3(...(s.edge ? [[-1.6, 1.4, -0.2], [1.6, 1.4, 0.2], [0, 2.4, -0.6], [-1.0, 2.0, 0.8], [0.9, 2.2, 0.6], [0, 1.2, 1.0]][s.edge[1]] : [0,0,0]));
      const progress = ((t * s.speed + s.offset) % 1);
      const pos = a.clone().lerp(b, progress);
      dummy.position.copy(pos);
      dummy.scale.setScalar(0.03 * (1 - Math.abs(progress - 0.5) * 2));
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
      mesh.current!.setColorAt(i, s.color);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial transparent opacity={0.9} blending={THREE.AdditiveBlending} />
    </instancedMesh>
  );
}

// ============================================================
// 6. ANNEAUX ORBITAUX (Cycles du savoir)
// ============================================================
function OrbitalRings({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const rings = useMemo(() => [2.2, 3.0, 3.8], []);

  useFrame(({ clock }) => {
    if (!group.current || reducedMotion) return;
    const t = clock.getElapsedTime();
    group.current.rotation.x = Math.sin(t * 0.04) * 0.08;
    group.current.rotation.y = t * 0.015;
  });

  return (
    <group ref={group} position={[0, 0.5, 0]}>
      {rings.map((radius, i) => (
        <group key={i} rotation={[Math.PI / 2.2, i * 1.3, 0]}>
          <mesh>
            <torusGeometry args={[radius, 0.006, 8, 100]} />
            <meshBasicMaterial
              color={i % 2 === 0 ? "#12d8ee" : "#f0bd55"}
              transparent
              opacity={0.12}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          {Array.from({ length: 3 + i }).map((_, j) => {
            const angle = (j / (3 + i)) * Math.PI * 2;
            return (
              <mesh key={j} position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}>
                <sphereGeometry args={[0.035, 8, 8]} />
                <meshStandardMaterial
                  color={i % 2 === 0 ? "#12d8ee" : "#f0bd55"}
                  emissive={i % 2 === 0 ? "#12d8ee" : "#f0bd55"}
                  emissiveIntensity={1.5}
                />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
}

// ============================================================
// 7. LIVRE OUVERT (Source du savoir)
// ============================================================
function OpenBook({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const { mouse } = useThree();
  const targetRot = useRef({ x: 0, y: 0 });

  useFrame(({ clock }) => {
    if (!group.current || reducedMotion) return;
    const t = clock.getElapsedTime();
    targetRot.current.x += (mouse.y * 0.025 - targetRot.current.x) * 0.03;
    targetRot.current.y += (mouse.x * 0.04 - targetRot.current.y) * 0.03;
    group.current.rotation.x = targetRot.current.x;
    group.current.rotation.z = targetRot.current.y * 0.015;
    group.current.position.y = -1.2 + Math.sin(t * 0.5) * 0.012;
  });

  return (
    <group ref={group} position={[0, -1.2, 0]}>
      {/* Reliure dorée */}
      <mesh position={[0, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.3, 0.3, 2.4, 16]} />
        <meshStandardMaterial color="#f0bd55" roughness={0.3} metalness={0.8} emissive="#7a4d08" emissiveIntensity={0.3} />
      </mesh>

      {/* Pages */}
      {Array.from({ length: 5 }).map((_, i) => {
        const yOffset = 0.02 + i * 0.01;
        return (
          <group key={i} position={[0, yOffset, 0]}>
            <mesh rotation={[0, 0.55, 0]}>
              <boxGeometry args={[1.4, 0.008, 2.0]} />
              <meshStandardMaterial color="#0a1a2a" roughness={0.9} metalness={0.1} />
            </mesh>
            <mesh rotation={[0, -0.55, 0]}>
              <boxGeometry args={[1.4, 0.008, 2.0]} />
              <meshStandardMaterial color="#0a1a2a" roughness={0.9} metalness={0.1} />
            </mesh>
          </group>
        );
      })}

      {/* Couvertures */}
      <mesh position={[0, 0.08, 0]} rotation={[0, 0.55, 0]}>
        <boxGeometry args={[1.5, 0.04, 2.2]} />
        <meshStandardMaterial color="#061214" roughness={0.8} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.08, 0]} rotation={[0, -0.55, 0]}>
        <boxGeometry args={[1.5, 0.04, 2.2]} />
        <meshStandardMaterial color="#061214" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Lueur sur les bords des pages */}
      <mesh rotation={[0, 0.55, 0]} position={[0, 0.06, 0]}>
        <boxGeometry args={[1.42, 0.005, 2.1]} />
        <meshBasicMaterial color="#0cc0df" transparent opacity={0.12} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh rotation={[0, -0.55, 0]} position={[0, 0.06, 0]}>
        <boxGeometry args={[1.42, 0.005, 2.1]} />
        <meshBasicMaterial color="#0cc0df" transparent opacity={0.12} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Lumière interne sacrée */}
      <pointLight position={[0, 0.5, 0]} intensity={4} distance={4} color="#f0bd55" />
      <pointLight position={[0, 0.3, 0.5]} intensity={2} distance={3} color="#12d8ee" />
    </group>
  );
}

// ============================================================
// 8. PARTICULES D'ÉVEIL (Idées qui s'élèvent)
// ============================================================
function AwakeningParticles({ reducedMotion }: { reducedMotion: boolean }) {
  const count = reducedMotion ? 12 : 50;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      x: (Math.random() - 0.5) * 2.5,
      z: (Math.random() - 0.5) * 2,
      speed: 0.2 + Math.random() * 0.5,
      offset: Math.random() * Math.PI * 2,
      color: Math.random() > 0.5 ? new THREE.Color("#12d8ee") : new THREE.Color("#f0bd55"),
    }));
  }, [count]);

  useFrame(({ clock }) => {
    if (!mesh.current || reducedMotion) return;
    const t = clock.getElapsedTime();
    particles.forEach((p, i) => {
      const y = ((t * p.speed + p.offset) % 5) - 2.5;
      const x = p.x + Math.sin(t * 0.7 + p.offset) * 0.15;
      const z = p.z + Math.cos(t * 0.4 + p.offset) * 0.15;
      const scale = Math.max(0, 1 - (y + 2.5) / 5) * 0.06;
      dummy.position.set(x, y, z);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
      mesh.current!.setColorAt(i, p.color);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial transparent opacity={0.7} blending={THREE.AdditiveBlending} />
    </instancedMesh>
  );
}

// ============================================================
// 9. NOYAU DE NÉBULEUSE (Cœur lumineux)
// ============================================================
function NebulaCore({ reducedMotion }: { reducedMotion: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = usePulsatingLight(3, 0.8, reducedMotion);

  useFrame(({ clock }) => {
    if (!meshRef.current || reducedMotion) return;
    const t = clock.getElapsedTime();
    meshRef.current.rotation.z = t * 0.05;
    meshRef.current.scale.setScalar(1 + Math.sin(t * 0.8) * 0.05);
  });

  return (
    <group position={[0, 1.5, -1]}>
      <mesh ref={meshRef}>
        <torusKnotGeometry args={[0.3, 0.08, 64, 16]} />
        <meshStandardMaterial
          color="#12d8ee"
          emissive="#0a5a6a"
          emissiveIntensity={0.6}
          roughness={0.3}
          metalness={0.6}
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          wireframe
        />
      </mesh>
      <pointLight ref={lightRef} position={[0, 0, 0]} distance={6} color="#12d8ee" />
    </group>
  );
}

// ============================================================
// SCÈNE PRINCIPALE
// ============================================================
export default function WorldScene() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return (
    <div
      className="world-scene"
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        pointerEvents: "none",
        background: "#010508",
      }}
    >
      <Canvas
        dpr={[1, Math.min(window.devicePixelRatio, 2)]}
        camera={{ position: [0, 0.3, 5.5], fov: 30 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#010508"]} />
        <fog attach="fog" args={["#010508", 5, 16]} />

        {/* Éclairage dramatique */}
        <ambientLight intensity={0.3} color="#a4dce8" />
        <directionalLight position={[4, 6, 4]} intensity={1.5} color="#e2c681" castShadow />
        <pointLight position={[-3, 4, 2]} intensity={12} distance={10} color="#12d8ee" />
        <pointLight position={[3, 4, 2]} intensity={10} distance={10} color="#f0bd55" />
        <pointLight position={[0, 5, -3]} intensity={6} distance={10} color="#ffffff" />
        <spotLight
          position={[0, 6, 1]}
          angle={0.4}
          penumbra={1}
          intensity={12}
          color="#f0bd55"
          target-position={[0, -1, 0]}
        />

        {/* Éléments de la scène */}
        <SacredGrid />
        <OpenBook reducedMotion={reducedMotion} />
        <GlassSpheres reducedMotion={reducedMotion} />
        <KnowledgeStream reducedMotion={reducedMotion} />
        <SacredTree reducedMotion={reducedMotion} />
        <CrystalPillars reducedMotion={reducedMotion} />
        <OrbitalRings reducedMotion={reducedMotion} />
        <NebulaCore reducedMotion={reducedMotion} />
        <AwakeningParticles reducedMotion={reducedMotion} />

        {/* Ciel étoilé */}
        <Stars
          radius={25}
          depth={60}
          count={reducedMotion ? 400 : 1500}
          factor={3}
          saturation={0.1}
          fade
          speed={reducedMotion ? 0 : 0.3}
        />

        {/* Poussières magiques */}
        <Sparkles
          count={reducedMotion ? 15 : 100}
          scale={[7, 7, 5]}
          size={reducedMotion ? 0.4 : 1.0}
          speed={reducedMotion ? 0 : 0.15}
          color="#b0ecf5"
          opacity={reducedMotion ? 0.15 : 0.35}
        />
        <Sparkles
          count={reducedMotion ? 8 : 30}
          scale={[6, 6, 5]}
          size={reducedMotion ? 0.4 : 1.3}
          speed={reducedMotion ? 0 : 0.08}
          color="#f0bd55"
          opacity={reducedMotion ? 0.08 : 0.25}
        />

        {/* Ancrage au sol */}
        <ContactShadows
          position={[0, -2.5, 0]}
          opacity={0.35}
          scale={14}
          blur={2.5}
          far={5}
          color="#020a10"
        />

        {/* Post-processing cinématographique */}
        <EffectComposer multisampling={0} enabled={!reducedMotion}>
          <Bloom luminanceThreshold={0.12} intensity={1.0} mipmapBlur />
          <DepthOfField target={[0, 0, 2]} focalLength={0.6} bokehScale={2.5} height={480} />
          <Vignette eskil={false} offset={0.1} darkness={0.7} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}