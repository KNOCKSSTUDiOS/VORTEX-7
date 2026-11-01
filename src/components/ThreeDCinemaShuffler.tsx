import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Play,
  Pause,
  Repeat,
  Shuffle,
  Eye,
  Maximize2,
  Minimize2,
  Sparkles,
  Layers,
  Film,
  Camera,
  RotateCcw,
} from 'lucide-react';

interface ThreeDCinemaShufflerProps {
  isImmersiveActive: boolean;
  onToggleImmersive: () => void;
  onSelectScene?: (sceneTitle: string) => void;
}

const SHUFFLE_SCENES = [
  {
    id: 'cyber_highway',
    title: 'CYBERPUNK HIGHWAY 2099',
    aspect: '2.39:1 CINEMASCOPE',
    primaryColor: 0xfc8eac,
    secondaryColor: 0xe0ffff,
    tag: 'ANAMORPHIC MASTER · 60 FPS',
  },
  {
    id: 'orbital_megastructure',
    title: 'ORBITAL MEGASTRUCTURE TITAN',
    aspect: '1.43:1 IMAX',
    primaryColor: 0xffdab9,
    secondaryColor: 0x8a2be2,
    tag: 'VOLUMETRIC FOG · 128K VERTICES',
  },
  {
    id: 'mech_lifemesh',
    title: 'MECH INFANTRY RIG // LIFE-MESH',
    aspect: 'PBR MODERN WARFARE',
    primaryColor: 0xe0ffff,
    secondaryColor: 0xffdab9,
    tag: 'BIOMETRIC TRACKING · 4K HDR',
  },
  {
    id: 'neon_rain',
    title: 'NEO-TOKYO VOLUMETRIC RAIN & BLOOM',
    aspect: 'DCI 4K MASTER',
    primaryColor: 0xff007f,
    secondaryColor: 0x2ec4b6,
    tag: 'RAY-MARCHED REFLECTIONS',
  },
];

export const ThreeDCinemaShuffler: React.FC<ThreeDCinemaShufflerProps> = ({
  isImmersiveActive,
  onToggleImmersive,
  onSelectScene,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [sceneTime, setSceneTime] = useState(0);

  const sceneData = SHUFFLE_SCENES[currentSceneIdx];

  // Auto 24/7 shuffle timer: transitions every 8 seconds
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentSceneIdx((prev) => (prev + 1) % SHUFFLE_SCENES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Three.js Render Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060709);

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 1.5, 4.5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x12141c, 2.0);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(sceneData.primaryColor, 3.5);
    keyLight.position.set(5, 10, 5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(sceneData.secondaryColor, 3.0);
    rimLight.position.set(-6, 3, -4);
    scene.add(rimLight);

    // Grid Floor
    const grid = new THREE.GridHelper(16, 32, sceneData.primaryColor, 0x1f2430);
    grid.position.y = -1.2;
    scene.add(grid);

    // Dynamic 3D Geometry based on active scene
    let centralMesh: THREE.Object3D;

    if (currentSceneIdx === 0) {
      // Cyber Highway Torus Knot
      const geo = new THREE.TorusKnotGeometry(0.9, 0.25, 120, 24);
      const mat = new THREE.MeshPhysicalMaterial({
        color: 0x141822,
        roughness: 0.2,
        metalness: 0.9,
        emissive: new THREE.Color(sceneData.primaryColor),
        emissiveIntensity: 0.5,
        clearcoat: 1.0,
      });
      centralMesh = new THREE.Mesh(geo, mat);
    } else if (currentSceneIdx === 1) {
      // Orbital Megastructure Octahedron Rings
      const group = new THREE.Group();
      const coreGeo = new THREE.OctahedronGeometry(1.0, 2);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0x181c26,
        roughness: 0.3,
        metalness: 0.8,
        wireframe: true,
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      group.add(core);

      const ringGeo = new THREE.RingGeometry(1.4, 1.6, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: sceneData.primaryColor,
        side: THREE.DoubleSide,
        wireframe: true,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2.5;
      group.add(ring);
      centralMesh = group;
    } else if (currentSceneIdx === 2) {
      // Mech Drone Rig
      const group = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.7, 0.4, 8),
        new THREE.MeshStandardMaterial({ color: 0x242834, metalness: 0.9, roughness: 0.2 })
      );
      group.add(body);

      const cross = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.08, 0.08),
        new THREE.MeshBasicMaterial({ color: sceneData.primaryColor })
      );
      cross.rotation.y = Math.PI / 4;
      group.add(cross);
      centralMesh = group;
    } else {
      // Volumetric Icosahedron
      const geo = new THREE.IcosahedronGeometry(1.1, 3);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x11131a,
        wireframe: true,
        emissive: new THREE.Color(sceneData.secondaryColor),
        emissiveIntensity: 0.8,
      });
      centralMesh = new THREE.Mesh(geo, mat);
    }

    scene.add(centralMesh);

    // Animate
    let animId: number;
    let t = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += 0.015;
      setSceneTime(t);

      if (centralMesh) {
        centralMesh.rotation.y = t * 0.8;
        centralMesh.rotation.x = Math.sin(t * 0.5) * 0.2;
      }

      camera.position.x = Math.sin(t * 0.2) * 0.5;
      camera.position.y = 1.5 + Math.cos(t * 0.3) * 0.2;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
    };
  }, [currentSceneIdx]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#050608] flex items-center justify-center">
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* 24/7 Shuffler Cinema Overlay Watermark & Crop Marks */}
      <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between font-mono text-xs">
        {/* Top Header Information */}
        <div className="flex items-start justify-between">
          <div className="bg-[#0A0B0E]/70 border border-[#2D3342] p-2.5 rounded-xs space-y-1 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E0FFFF] animate-ping" />
              <span className="font-extrabold text-[#F5FFFA] tracking-wide">
                24/7 SHUFFLE CINEMA ENGINE
              </span>
              <span className="text-[10px] text-[#FFDAB9] border border-[#FFDAB9]/40 px-1 py-0.2 rounded-xs">
                {sceneData.aspect}
              </span>
            </div>
            <div className="text-[11px] text-[#FFDAB9] font-bold">{sceneData.title}</div>
            <div className="text-[10px] text-[#8E99A8]">{sceneData.tag}</div>
          </div>

          <div className="bg-[#0A0B0E]/70 border border-[#2D3342] px-3 py-1.5 rounded-xs text-right backdrop-blur-md">
            <span className="text-[10px] text-[#6D7787] block">PIPELINE NODE</span>
            <span className="text-[#E0FFFF] font-bold">THREE.JS WGPU ACTIVE</span>
          </div>
        </div>

        {/* Central Safe Frame Crosshairs */}
        <div className="self-center flex flex-col items-center">
          <div className="w-36 h-36 border border-[#E0FFFF]/20 rounded-full flex items-center justify-center">
            <div className="w-16 h-16 border border-[#FC8EAC]/30 rounded-xs flex items-center justify-center">
              <div className="w-2 h-2 bg-[#FFDAB9] rounded-full" />
            </div>
          </div>
          <span className="text-[#8E99A8] text-[9px] mt-1 tracking-widest uppercase">
            FULL TILE SHUFFLE // HOVER TO REVEAL CONTROLS
          </span>
        </div>

        {/* Bottom Shuffler Navigation Strip */}
        <div className="flex items-center justify-between text-[#8E99A8]">
          <div className="flex items-center gap-2 pointer-events-auto">
            {SHUFFLE_SCENES.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => {
                  setCurrentSceneIdx(idx);
                  onSelectScene?.(s.title);
                }}
                className={`px-2 py-0.5 text-[10px] rounded-xs border cursor-pointer transition-all ${
                  idx === currentSceneIdx
                    ? 'bg-[#FFDAB9] text-[#0A0A0A] font-bold border-[#FFDAB9]'
                    : 'bg-[#0E1015]/80 border-[#262B38] text-[#A6B0BE] hover:text-[#F5FFFA]'
                }`}
              >
                0{idx + 1} {s.id.split('_')[0].toUpperCase()}
              </button>
            ))}
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-2.5 py-1 bg-[#141720]/80 border border-[#2A3142] text-[#E0FFFF] rounded-xs cursor-pointer text-[10px] hover:bg-[#1E2535]"
            >
              {isPlaying ? 'PAUSE ROTATION' : 'RESUME 24/7 ROTATION'}
            </button>

            <button
              onClick={onToggleImmersive}
              className="px-3 py-1 bg-gradient-to-r from-[#FFDAB9] to-[#FC8EAC] text-[#0A0A0A] font-bold rounded-xs cursor-pointer text-[10px] shadow-[0_0_10px_rgba(255,218,185,0.3)]"
            >
              {isImmersiveActive ? 'EXIT FULL TILE VIEW' : 'FULL TILE (HIDE TO HOVER)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
