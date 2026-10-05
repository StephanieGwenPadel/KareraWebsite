import { Suspense, useCallback, useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { ContactShadows, OrbitControls, useProgress } from '@react-three/drei';
import { AnimatePresence, motion } from 'framer-motion';
import * as THREE from 'three';
import { Gauge, PenLine, RotateCcw, Play, Pause } from 'lucide-react';
import { vehicles, type Skin, type Vehicle } from '../data/karera';
import { VehicleModel, modelUrl } from './VehicleModel';
import { SectionTitle, StatBar } from './ui';

export const eraLabel: Record<string, string> = {
  Colonial1900s: '1900s · Colonial',
  Postwar1945: '1945 · Post-war',
  Classic1960s: '1960s · Classic',
  Modern2000s: '2000s · Modern',
  Contemporary2020s: '2020s · Contemporary',
};
export const driveLabel: Record<string, string> = {
  ManualGearbox: 'Manual gearbox',
  WhipDrive: 'Whip drive',
  PedalDrive: 'Pedal drive',
  ElectricDrive: 'Hub motor',
};
const ringLabel: Record<string, string> = {
  Tachometer: 'Tachometer',
  Gait: 'Gait arc',
  Cadence: 'Cadence meter',
  BatteryCharge: 'Battery gauge',
};
const tierColour: Record<string, string> = {
  Basic: '#9aa0a6',
  Elite: '#3b82f6',
  Special: '#7cc242',
  Epic: '#e0393e',
  Legend: '#f6c431',
};

const max = {
  kmh: Math.max(...vehicles.map((v) => v.kmh)),
  accel: Math.max(...vehicles.map((v) => v.accel)),
  grip: Math.max(...vehicles.map((v) => v.grip)),
  steer: Math.max(...vehicles.map((v) => v.steerRate)),
  mass: Math.max(...vehicles.map((v) => v.mass)),
  brake: Math.max(...vehicles.map((v) => v.brake)),
};

function drivetrainLine(v: Vehicle) {
  if (v.drive === 'ManualGearbox')
    return `${v.reverse ? 'R-N-' : 'N-'}${Array.from({ length: v.gears ?? 0 }, (_, i) => i + 1).join('-')} · clutch · ${v.redline} rpm redline`;
  if (v.drive === 'WhipDrive') return 'Five latching whip levels · the horse tires';
  if (v.drive === 'PedalDrive') return 'One fixed gear · cadence band · stamina';
  if (v.drive === 'ElectricDrive') return 'No gears, no clutch · regen on lift-off · 900 m pack';
  return v.drive;
}

function CameraRig({ box }: { box: THREE.Box3 | null }) {
  const { camera, controls, size } = useThree() as unknown as { size: { width: number; height: number }; camera: THREE.PerspectiveCamera; controls: { target: THREE.Vector3; minDistance: number; maxDistance: number; update(): void } | null };
  useEffect(() => {
    if (!box || box.isEmpty()) return;
    const centre = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const radius = size.length() * 0.5;
    // fit whichever field of view is narrower — the canvas can be taller than it is wide
    const vHalf = THREE.MathUtils.degToRad(camera.fov * 0.5);
    const hHalf = Math.atan(Math.tan(vHalf) * camera.aspect);
    const dist = (radius / Math.sin(Math.min(vHalf, hHalf))) * 1.12;
    const dir = new THREE.Vector3(1, 0.42, 1.1).normalize();
    camera.position.copy(centre.clone().addScaledVector(dir, dist));
    camera.near = 0.05;
    camera.far = 200;
    camera.updateProjectionMatrix();
    if (controls) {
      controls.target.copy(centre);
      controls.minDistance = dist * 0.45;
      controls.maxDistance = dist * 2.2;
      controls.update();
    }
  }, [box, camera, controls, size.width, size.height]);
  return null;
}

function Loader() {
  const { active, progress } = useProgress();
  if (!active) return null;
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="font-hud text-neon-yellow text-sm tracking-widest whitespace-nowrap">LOADING {progress.toFixed(0)}%</div>
    </div>
  );
}

export function Showroom() {
  const [index, setIndex] = useState(0);
  const [skinIndex, setSkinIndex] = useState(-1);
  const [spin, setSpin] = useState(true);
  const [outline, setOutline] = useState(true);
  const [box, setBox] = useState<THREE.Box3 | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const v = vehicles[index];
  const skin: Skin | null = skinIndex >= 0 ? v.skins[skinIndex] : null;
  const url = modelUrl(skin?.model ?? v.id);
  const onBounds = useCallback((b: THREE.Box3) => setBox(b.clone()), []);

  return (
    <section id="garage" className="relative py-12 md:py-16 lg:pt-20 lg:pb-5 lg:h-[100svh] lg:min-h-[660px] lg:max-h-[1100px] bg-black z-10 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.07] bg-[url('/images/M_Bustos_Concrete_Albedo.png')] bg-[length:420px]" />
      <div className="max-w-7xl mx-auto px-4 md:px-6 relative lg:h-full lg:flex lg:flex-col">
        <SectionTitle compact kicker="The garage · every model is the one in the game" color="text-neon-yellow">
          Seven Vehicles
        </SectionTitle>

        <div className="grid grid-cols-1 lg:grid-cols-[1.45fr_1fr] gap-4 lg:gap-5 lg:flex-1 lg:min-h-0">
          {/* the turntable */}
          <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-0 bg-gradient-to-b from-[#1a1d2e] to-[#07070b] border-2 border-white/10 overflow-hidden">
            <div
              className="absolute inset-x-0 top-4 text-center font-display italic uppercase text-[18vw] lg:text-[7rem] leading-none select-none pointer-events-none"
              style={{ color: v.accent, opacity: 0.16 }}
            >
              {v.name}
            </div>
            <Canvas shadows dpr={[1, 2]} camera={{ fov: 32, position: [5, 2.5, 5] }} gl={{ antialias: true }}>
              <hemisphereLight args={['#dfe8ff', '#3a2f48', 1.1]} />
              <directionalLight position={[4, 7, 3]} intensity={2.2} castShadow shadow-mapSize={[1024, 1024]} />
              <directionalLight position={[-5, 2, -4]} intensity={0.6} color="#9fb4ff" />
              <Suspense fallback={null}>
                <VehicleModel key={url} url={url} skin={skin} spin={spin} outline={outline} onBounds={onBounds} />
              </Suspense>
              {/* the showroom podium with its sun ring, as on the menu stage */}
              <mesh rotation-x={-Math.PI / 2} position-y={-0.005} receiveShadow>
                <circleGeometry args={[box ? Math.max(1.6, box.getSize(new THREE.Vector3()).length() * 0.62) : 2, 64]} />
                <meshStandardMaterial color="#141418" roughness={0.9} />
              </mesh>
              <mesh rotation-x={-Math.PI / 2} position-y={0}>
                <ringGeometry
                  args={[
                    box ? Math.max(1.6, box.getSize(new THREE.Vector3()).length() * 0.62) - 0.05 : 1.95,
                    box ? Math.max(1.6, box.getSize(new THREE.Vector3()).length() * 0.62) : 2,
                    96,
                  ]}
                />
                <meshBasicMaterial color="#f6c431" />
              </mesh>
              <ContactShadows position={[0, 0.002, 0]} opacity={0.65} scale={10} blur={2.2} far={3} />
              <OrbitControls key={resetKey} makeDefault autoRotate autoRotateSpeed={1.1} enablePan={false} maxPolarAngle={Math.PI * 0.49} />
              <CameraRig key={`${url}-${resetKey}`} box={box} />
            </Canvas>
            <Loader />

            <div className="absolute left-3 bottom-3 flex gap-2">
              <button
                onClick={() => setSpin((s) => !s)}
                className="flex items-center gap-1.5 px-3 py-2 bg-black/70 border border-white/20 font-hud text-xs uppercase tracking-wider hover:border-neon-yellow"
              >
                {spin ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />} Wheels
              </button>
              <button
                onClick={() => setOutline((s) => !s)}
                className={`flex items-center gap-1.5 px-3 py-2 bg-black/70 border font-hud text-xs uppercase tracking-wider hover:border-neon-yellow ${outline ? 'border-neon-yellow text-neon-yellow' : 'border-white/20'}`}
              >
                <PenLine className="w-3.5 h-3.5" /> Ink
              </button>
              <button
                onClick={() => setResetKey((k) => k + 1)}
                className="flex items-center gap-1.5 px-3 py-2 bg-black/70 border border-white/20 font-hud text-xs uppercase tracking-wider hover:border-neon-yellow"
              >
                <RotateCcw className="w-3.5 h-3.5" /> View
              </button>
            </div>
            <div className="absolute right-3 bottom-3 font-hud text-[10px] text-white/40 uppercase tracking-widest hidden sm:block">Drag to orbit · scroll to zoom</div>
          </div>

          {/* the spec sheet */}
          <AnimatePresence mode="wait">
            <motion.div
              key={v.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="bg-asphalt-light/90 border-l-4 p-4 md:p-5 flex flex-col gap-3 lg:h-full lg:min-h-0 overflow-hidden"
              style={{ borderColor: v.accent }}
            >
              <div>
                <div className="font-hud text-[10px] md:text-xs tracking-[0.25em] uppercase text-gray-400 truncate">
                  {v.english} · {v.cls} class · {eraLabel[v.era]}
                </div>
                <h3 className="font-display italic uppercase text-3xl md:text-4xl mt-0.5 leading-none" style={{ color: v.accent === '#2f6b4a' ? '#5fb07f' : v.accent }}>
                  {v.name}
                </h3>
                <p className="text-gray-300 mt-2 text-xs md:text-sm leading-snug line-clamp-3 lg:[@media(max-height:760px)]:hidden" title={v.flavour}>{v.flavour}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center lg:[@media(max-height:700px)]:hidden">
                <div className="bg-black/40 py-1.5">
                  <div className="font-display text-2xl text-neon-yellow">{v.kmh}</div>
                  <div className="font-hud text-[10px] tracking-widest text-gray-400 uppercase">km/h top</div>
                </div>
                <div className="bg-black/40 py-1.5">
                  <div className="font-display text-2xl">{v.mass}</div>
                  <div className="font-hud text-[10px] tracking-widest text-gray-400 uppercase">kg</div>
                </div>
                <div className="bg-black/40 py-1.5">
                  <div className="font-display text-2xl text-electric-blue">{v.steerRate}°</div>
                  <div className="font-hud text-[10px] tracking-widest text-gray-400 uppercase">steer / s</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-5 gap-y-2">
                <StatBar label="Top speed" value={v.topSpeed.toFixed(1)} unit="m/s" fraction={v.kmh / max.kmh} color="#ccff00" />
                <StatBar label="Acceleration" value={v.accel} unit="m/s²" fraction={v.accel / max.accel} color="#ff0055" />
                <StatBar label="Grip" value={v.grip.toFixed(2)} fraction={v.grip / max.grip} color="#00f0ff" />
                <StatBar label="Braking" value={v.brake} unit="m/s²" fraction={v.brake / max.brake} color="#f6c431" />
                <StatBar label="Weight" value={v.mass} unit="kg" fraction={v.mass / max.mass} color="#a78bfa" />
              </div>

              <div className="flex items-start gap-3 bg-black/40 px-3 py-2">
                <Gauge className="w-5 h-5 text-sun shrink-0 mt-0.5" />
                <div>
                  <div className="font-hud font-bold uppercase tracking-wider text-xs md:text-sm">{driveLabel[v.drive]}</div>
                  <div className="text-gray-400 text-xs">{drivetrainLine(v)}</div>
                  <div className="text-gray-500 text-[11px] mt-0.5 lg:[@media(max-height:700px)]:hidden">HUD ring: {ringLabel[v.ring]} · steering: {v.steering === 'SteeringWheel' ? 'wheel' : v.steering.toLowerCase()}</div>
                </div>
              </div>

              <div>
                <div className="font-hud text-[10px] md:text-xs tracking-[0.3em] uppercase text-gray-400 mb-1.5">Skins</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSkinIndex(-1)}
                    className={`px-2.5 py-1 font-hud text-[11px] uppercase tracking-wider border ${skinIndex === -1 ? 'border-white bg-white text-black' : 'border-white/20 hover:border-white/60'}`}
                  >
                    Standard
                  </button>
                  {v.skins.map((s, i) => (
                    <button
                      key={s.id}
                      onClick={() => setSkinIndex(i)}
                      className={`px-2.5 py-1 font-hud text-[11px] uppercase tracking-wider border flex items-center gap-2 ${skinIndex === i ? 'bg-white text-black border-white' : 'border-white/20 hover:border-white/60'}`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: tierColour[s.tier] }} />
                      {s.name}
                    </button>
                  ))}
                </div>
                {skin && (
                  <div className="flex items-center gap-3 mt-1.5">
                    {skin.model === 'habalhabal-threeup' && (
                      <div className="flex -space-x-2 shrink-0">
                        {['Photo_Driver', 'Photo_Front', 'Photo_Back'].map((p) => (
                          <img key={p} src={`/images/${p}.png`} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-sun" />
                        ))}
                      </div>
                    )}
                    <p className="text-gray-400 text-xs line-clamp-2">
                      <span className="font-bold" style={{ color: tierColour[skin.tier] }}>
                        {skin.tier}.
                      </span>{' '}
                      {skin.desc}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* the roster strip */}
        <div className="mt-3 lg:mt-4 grid grid-cols-7 gap-1.5 md:gap-2 shrink-0">
          {vehicles.map((veh, i) => (
            <button
              key={veh.id}
              onClick={() => {
                setIndex(i);
                setSkinIndex(-1);
              }}
              className={`group relative bg-asphalt-light border-b-4 pt-1.5 pb-1 px-1 transition-colors ${i === index ? 'bg-white/10' : 'hover:bg-white/5'}`}
              style={{ borderColor: i === index ? veh.accent : 'transparent' }}
            >
              <img src={`/vehicles/${veh.id}-hero.webp`} alt={veh.name} className="w-full h-10 sm:h-12 lg:h-14 object-contain transition-transform group-hover:scale-110" loading="lazy" />
              <div className={`font-display italic uppercase text-[9px] sm:text-xs md:text-sm mt-0.5 truncate ${i === index ? 'text-white' : 'text-gray-400'}`}>{veh.name}</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
