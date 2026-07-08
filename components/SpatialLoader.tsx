"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Icosahedron, MeshDistortMaterial } from "@react-three/drei";
import { motion, useReducedMotion } from "framer-motion";
import { Cpu } from "lucide-react";

export default function SpatialLoader({ onComplete }: { onComplete: () => void }) {
  const prefersReducedMotion = useReducedMotion();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 1.8s max loading budget
    const duration = 1800;
    const interval = 20;
    let current = 0;

    const timer = setInterval(() => {
      current += interval;
      setProgress((current / duration) * 100);
      if (current >= duration) {
        clearInterval(timer);
        onComplete();
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  // Fallback for Accessibility / Performance Constraints
  if (prefersReducedMotion) {
    return (
      <motion.div exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-[#0B0E14] flex flex-col items-center justify-center p-6">
        <Cpu className="text-[#5B6CFF] w-8 h-8 mb-6" />
        <div className="w-full max-w-md h-1 bg-[#141922] rounded-full overflow-hidden">
          <motion.div className="h-full bg-[#5B6CFF]" style={{ width: `${progress}%` }} />
        </div>
        <p className="font-mono text-xs text-[#8A93A6] tracking-widest mt-4 uppercase">Initializing Spatial Matrices...</p>
      </motion.div>
    );
  }

  // High-Fidelity 3D Loader
  return (
    <motion.div exit={{ opacity: 0, filter: "blur(10px)" }} transition={{ duration: 0.4 }} className="fixed inset-0 z-[100] bg-[#0B0E14] flex flex-col items-center justify-center">
      <div className="w-64 h-64 relative">
        <Canvas camera={{ position: [0, 0, 3] }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[2, 2, 5]} intensity={1} />
          <Icosahedron args={[1, 1]} speed={2}>
            <MeshDistortMaterial color="#5B6CFF" wireframe distort={0.3} speed={2} />
          </Icosahedron>
          <OrbitControls autoRotate autoRotateSpeed={4} enableZoom={false} />
        </Canvas>
      </div>
      <div className="mt-8 text-center space-y-2">
        <h2 className="font-display font-bold text-text-primary tracking-widest uppercase">MahaPoly Engine</h2>
        <p className="font-mono text-xs text-text-muted tracking-[0.2em] uppercase">Indexing DTE Data {Math.round(progress)}%</p>
      </div>
    </motion.div>
  );
}