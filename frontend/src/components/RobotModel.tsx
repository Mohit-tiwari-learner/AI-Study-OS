import { useRef, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

const MODEL_PATH = "/futuristic_flying_animated_robot_-_low_poly.glb";

/* ── Inner scene: the robot mesh that tracks the cursor ──────── */
function Robot({ mouse }: { mouse: React.RefObject<{ x: number; y: number }> }) {
  const group = useRef<THREE.Group>(null!);
  const { scene, animations } = useGLTF(MODEL_PATH);
  const { actions } = useAnimations(animations, group);
  const { viewport } = useThree();
  const prevPos = useRef({ x: 0, y: 0 });

  // Play the first animation (idle / flying loop)
  useEffect(() => {
    const first = Object.values(actions)[0];
    if (first) {
      first.reset().fadeIn(0.5).play();
    }
  }, [actions]);

  // Smoothly follow cursor every frame
  useFrame(() => {
    if (!group.current || !mouse.current) return;

    // Map normalised mouse (-1..1) to world units
    const targetX = (mouse.current.x * viewport.width) / 2.5;
    const targetY = (mouse.current.y * viewport.height) / 2.5;

    const posX = group.current.position.x;
    const posY = group.current.position.y;

    // Spring-like lerp for organic feel
    group.current.position.x += (targetX - posX) * 0.06;
    group.current.position.y += (targetY - posY) * 0.06;

    // Compute velocity (how fast it's actually moving)
    const vx = group.current.position.x - prevPos.current.x;
    const vy = group.current.position.y - prevPos.current.y;
    prevPos.current.x = group.current.position.x;
    prevPos.current.y = group.current.position.y;

    // Roll (Z-axis) — bank into the turn like an aircraft
    const targetRollZ = -vx * 8;
    // Pitch (X-axis) — nose dives down when moving down, lifts when up
    const targetPitchX = vy * 6;
    // Yaw (Y-axis) — turns to face the movement direction
    const targetYawY = vx * 4 + Math.PI * 0.15;

    const lerpSpeed = 0.08;
    group.current.rotation.z = THREE.MathUtils.lerp(
      group.current.rotation.z,
      THREE.MathUtils.clamp(targetRollZ, -0.6, 0.6),
      lerpSpeed,
    );
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      THREE.MathUtils.clamp(targetPitchX, -0.5, 0.5),
      lerpSpeed,
    );
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      THREE.MathUtils.clamp(targetYawY, -0.8, 1.2),
      lerpSpeed,
    );
  });

  return (
    <group ref={group} scale={1.8} rotation={[0, Math.PI * 0.15, 0]}>
      <primitive object={scene} />
    </group>
  );
}

/* ── Wrapper: full canvas + mouse tracking ───────────────────── */
export default function RobotCanvas() {
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      // Normalise to -1..1
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-20">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        style={{ pointerEvents: "none" }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 1.5]}
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <pointLight position={[-4, 3, 2]} intensity={0.8} color="#a78bfa" />
        <pointLight position={[3, -2, 4]} intensity={0.5} color="#6366f1" />

        <Suspense fallback={null}>
          <Robot mouse={mouse} />
        </Suspense>
      </Canvas>
    </div>
  );
}

// Preload the model
useGLTF.preload(MODEL_PATH);
