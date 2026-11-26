/**
 * GPU point cloud with per-point colour and soft round sprites (additive blending).
 * One draw call regardless of point count; buffers are disposed on change/unmount.
 */
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

const vertex = /* glsl */ `
  attribute vec3 color;
  varying vec3 vColor;
  uniform float uSize;
  uniform float uScale;
  void main() {
    vColor = color;
    vec4 mv = modelViewMatrix * vec4(position * uScale, 1.0);
    gl_PointSize = uSize * (300.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }`;
const fragment = /* glsl */ `
  varying vec3 vColor;
  uniform float uOpacity;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = dot(c, c);
    if (d > 0.25) discard;
    float a = smoothstep(0.25, 0.0, d);
    gl_FragColor = vec4(vColor, a * uOpacity);
  }`;

export function PointCloud({ positions, colors, size = 0.06, opacity = 0.6, scale = 1 }: { positions: Float32Array; colors: Float32Array; size?: number; opacity?: number; scale?: number }) {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    g.computeBoundingSphere();
    return g;
  }, [positions, colors]);
  const material = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: vertex, fragmentShader: fragment, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uSize: { value: size }, uOpacity: { value: opacity }, uScale: { value: scale } },
  }), []); // eslint-disable-line react-hooks/exhaustive-deps
  material.uniforms.uSize.value = size;
  material.uniforms.uOpacity.value = opacity;
  material.uniforms.uScale.value = scale;
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  return <points geometry={geometry} material={material} frustumCulled={false} />;
}
