import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Skin } from '../data/karera';

// Three cel bands, like Karera/Toon: a cool shade, a mid, and full light.
const gradient = (() => {
  const data = new Uint8Array([70, 70, 90, 255, 160, 156, 170, 255, 255, 255, 255, 255]);
  const t = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
  t.minFilter = THREE.NearestFilter;
  t.magFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  t.needsUpdate = true;
  return t;
})();

// The ink outline is an inverted hull extruded along a smoothed normal, as in the game:
// split flat normals would tear the hull open at every box corner.
const inkMaterial = new THREE.ShaderMaterial({
  side: THREE.BackSide,
  uniforms: { width: { value: 0.012 }, ink: { value: new THREE.Color('#15101c') } },
  vertexShader: /* glsl */ `
    uniform float width;
    void main() {
      vec3 p = position + normal * width;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }`,
  fragmentShader: /* glsl */ `
    uniform vec3 ink;
    void main() { gl_FragColor = vec4(ink, 1.0); }`,
});

const hullCache = new WeakMap<THREE.BufferGeometry, THREE.BufferGeometry>();
function hullFor(geometry: THREE.BufferGeometry) {
  let hull = hullCache.get(geometry);
  if (!hull) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', geometry.getAttribute('position').clone());
    if (geometry.index) g.setIndex(geometry.index.clone());
    hull = mergeVertices(g, 1e-4);
    hull.computeVertexNormals();
    hullCache.set(geometry, hull);
  }
  return hull;
}

type Props = {
  url: string;
  skin: Skin | null;
  spin: boolean;
  outline: boolean;
  onBounds?: (box: THREE.Box3) => void;
};

export function VehicleModel({ url, skin, spin, outline, onBounds }: Props) {
  const { scene } = useGLTF(url);

  // A private, toon-shaded copy per load, so recolours never leak between vehicles.
  const { root, wheels, steers, toon, hulls } = useMemo(() => {
    const root = scene.clone(true);
    const wheels: THREE.Object3D[] = [];
    const steers: THREE.Object3D[] = [];
    const toon: THREE.MeshToonMaterial[] = [];
    const hulls: THREE.Mesh[] = [];
    const meshes: THREE.Mesh[] = [];
    root.traverse((o) => {
      if (o.name === 'Spin') wheels.push(o);
      if (o.name === 'Steer') steers.push(o);
      if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh);
    });
    for (const mesh of meshes) {
      mesh.castShadow = true;
      const swap = (m: THREE.Material) => {
        const src = m as THREE.MeshStandardMaterial;
        if (src.transparent) return src; // glass stays lit, as in the game
        const t = new THREE.MeshToonMaterial({
          name: src.name,
          color: src.color.clone(),
          map: src.map ?? null,
          gradientMap: gradient,
          emissive: src.emissive?.clone() ?? new THREE.Color(0),
          emissiveIntensity: src.emissiveIntensity ?? 1,
        });
        t.userData.base = src.color.clone();
        toon.push(t);
        return t;
      };
      mesh.material = Array.isArray(mesh.material) ? mesh.material.map(swap) : swap(mesh.material);
      const hull = new THREE.Mesh(hullFor(mesh.geometry), inkMaterial);
      hull.raycast = () => {};
      hull.userData.hull = true;
      mesh.add(hull);
      hulls.push(hull);
    }
    return { root, wheels, steers, toon, hulls };
  }, [scene]);

  // A livery skin repaints materials by asset name, exactly like VehicleSkins.Dress.
  useEffect(() => {
    for (const m of toon) {
      const hit = skin?.recolors.find((r) => r.material === m.name);
      m.color.copy(hit ? new THREE.Color(hit.colour) : (m.userData.base as THREE.Color));
    }
  }, [skin, toon]);

  useEffect(() => {
    for (const h of hulls) h.visible = outline;
  }, [outline, hulls]);

  useEffect(() => {
    if (!onBounds) return;
    root.updateMatrixWorld(true);
    const box = new THREE.Box3();
    root.traverse((o) => {
      if ((o as THREE.Mesh).isMesh && !o.userData.hull) box.expandByObject(o, true);
    });
    onBounds(box);
  }, [root, onBounds]);

  const t = useRef(0);
  useFrame((_, dt) => {
    if (!spin) return;
    t.current += dt;
    for (const w of wheels) w.rotation.x += dt * 14;
    const steer = Math.sin(t.current * 0.9) * 0.18;
    for (const s of steers) if (s.parent?.name === 'Wheel_Front') s.rotation.y = steer;
  });

  return <primitive object={root} />;
}

export const modelUrl = (id: string) => `/models/${id}.glb`;
