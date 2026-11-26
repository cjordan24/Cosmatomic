/**
 * Shared 3D viewport. Wraps the R3F Canvas with:
 *  - adaptive render resolution (drops DPR when frame rate falls),
 *  - optional logarithmic depth buffer for scenes spanning many orders of magnitude,
 *  - preserveDrawingBuffer so screenshots/PNG export capture the frame.
 * R3F disposes geometries/materials of unmounted objects automatically.
 */
import { Canvas, type CanvasProps } from '@react-three/fiber';
import { PerformanceMonitor, AdaptiveDpr } from '@react-three/drei';
import { useState, type ReactNode } from 'react';
import * as THREE from 'three';

export function Viewport({ children, logDepth = false, camera, className = 'viewport', ...rest }: { children: ReactNode; logDepth?: boolean; className?: string } & Omit<CanvasProps, 'children'>) {
  const [dpr, setDpr] = useState(Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio : 1));
  return (
    <div className={className}>
      <Canvas
        dpr={dpr}
        camera={camera}
        gl={{ antialias: true, logarithmicDepthBuffer: logDepth, preserveDrawingBuffer: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.outputColorSpace = THREE.SRGBColorSpace; }}
        {...rest}
      >
        <PerformanceMonitor onDecline={() => setDpr((d) => Math.max(0.75, d - 0.25))} onIncline={() => setDpr((d) => Math.min(2, d + 0.25))} />
        <AdaptiveDpr pixelated={false} />
        {children}
      </Canvas>
    </div>
  );
}
