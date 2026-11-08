import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Rotate3d,
  Layers,
  Sparkles,
  Maximize2,
  Crosshair,
  Sliders,
  Eye,
  Activity,
  Cpu,
} from 'lucide-react';
import { ThreeDMeshConfig } from '../types';

interface ThreeDViewportProps {
  config: ThreeDMeshConfig;
  onChangeConfig: (newCfg: Partial<ThreeDMeshConfig>) => void;
}

export const ThreeDViewport: React.FC<ThreeDViewportProps> = ({
  config,
  onChangeConfig,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshRef = useRef<THREE.Mesh | THREE.Group | null>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const rotorsRef = useRef<THREE.Mesh[]>([]);

  // Orbit control states
  const [isDragging, setIsDragging] = useState(false);
  const [previousMousePosition, setPreviousMousePosition] = useState({ x: 0, y: 0 });
  const [rotationAngles, setRotationAngles] = useState({ x: 0.3, y: 0.5 });
  const [zoomLevel, setZoomLevel] = useState(4.2);

  // Initialize Three.js scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0b0e);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, zoomLevel);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    // Clear old canvases
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 4. Lighting Rig (Bioluminescent Pearlescent Industrial setup)
    const ambientLight = new THREE.AmbientLight(0x0e141a, 2.5);
    scene.add(ambientLight);

    // Key Light (Titanium Gold #FFD700)
    const keyLight = new THREE.DirectionalLight(0xffd700, 3.2);
    keyLight.position.set(5, 8, 4);
    scene.add(keyLight);

    // Rim Light (Pearl Cyan #E0FFFF)
    const rimLight = new THREE.DirectionalLight(0xe0ffff, 4.0);
    rimLight.position.set(-6, 4, -5);
    scene.add(rimLight);

    // Fill Light (Flamingo Pink #FC8EAC)
    const fillLight = new THREE.PointLight(0xfc8eac, 2.5, 15);
    fillLight.position.set(0, -2, 3);
    scene.add(fillLight);

    // Ground Grid Helper
    const grid = new THREE.GridHelper(10, 20, 0x323846, 0x181c24);
    grid.position.y = -1.2;
    scene.add(grid);

    // Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Build / update 3D Geometry and PBR Material
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (meshRef.current) {
      scene.remove(meshRef.current);
    }
    rotorsRef.current = [];

    // PBR Material
    const material = new THREE.MeshStandardMaterial({
      color: 0x22262f,
      metalness: config.metalness,
      roughness: config.roughness,
      wireframe: config.wireframe,
      emissive: new THREE.Color(0xe0ffff),
      emissiveIntensity: config.emissiveIntensity * 0.4,
    });
    materialRef.current = material;

    let targetMesh: THREE.Mesh | THREE.Group;

    if (config.modelType === 'cyber_helmet') {
      const geo = new THREE.TorusKnotGeometry(0.8, 0.28, 128, 32);
      targetMesh = new THREE.Mesh(geo, material);
    } else if (config.modelType === 'combat_drone') {
      const group = new THREE.Group();
      // Main Body
      const bodyGeo = new THREE.CylinderGeometry(0.5, 0.6, 0.3, 8);
      const bodyMesh = new THREE.Mesh(bodyGeo, material);
      group.add(bodyMesh);

      // 4 Drone Arms & Rotor Blades
      const armGeo = new THREE.BoxGeometry(1.6, 0.08, 0.08);
      const arm1 = new THREE.Mesh(armGeo, material);
      arm1.rotation.y = Math.PI / 4;
      const arm2 = new THREE.Mesh(armGeo, material);
      arm2.rotation.y = -Math.PI / 4;
      group.add(arm1, arm2);

      // Rotors
      const rotorGeo = new THREE.BoxGeometry(0.6, 0.02, 0.06);
      const rotorMat = new THREE.MeshBasicMaterial({ color: 0xffdab9, wireframe: config.wireframe });
      const offsets = [
        [0.8, 0.1, 0.8],
        [-0.8, 0.1, 0.8],
        [0.8, 0.1, -0.8],
        [-0.8, 0.1, -0.8],
      ];
      offsets.forEach(([x, y, z]) => {
        const rotor = new THREE.Mesh(rotorGeo, rotorMat);
        rotor.position.set(x, y, z);
        group.add(rotor);
        rotorsRef.current.push(rotor);
      });

      targetMesh = group;
    } else if (config.modelType === 'mech_chassis') {
      const group = new THREE.Group();
      const torsoGeo = new THREE.BoxGeometry(1.2, 1.4, 0.8);
      const torso = new THREE.Mesh(torsoGeo, material);
      group.add(torso);

      const headGeo = new THREE.BoxGeometry(0.6, 0.5, 0.6);
      const head = new THREE.Mesh(headGeo, material);
      head.position.y = 1.0;
      group.add(head);

      targetMesh = group;
    } else if (config.modelType === 'viseme_head') {
      // Humanoid Viseme Head
      const headGeo = new THREE.IcosahedronGeometry(0.9, 4);
      targetMesh = new THREE.Mesh(headGeo, material);
    } else {
      // Cyber Blade
      const bladeGeo = new THREE.ConeGeometry(0.4, 2.2, 4);
      bladeGeo.rotateX(Math.PI);
      targetMesh = new THREE.Mesh(bladeGeo, material);
    }

    meshRef.current = targetMesh;
    scene.add(targetMesh);
  }, [config.modelType, config.wireframe, config.metalness, config.roughness, config.emissiveIntensity]);

  // Animation Loop with Interactive Orbit
  useEffect(() => {
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (meshRef.current) {
        // Continuous auto-rotation plus drag rotation
        if (config.rotationSpeed > 0 && !isDragging) {
          meshRef.current.rotation.y += config.rotationSpeed * 0.01;
        } else {
          meshRef.current.rotation.y = rotationAngles.y;
        }
        meshRef.current.rotation.x = rotationAngles.x;

        // Spin drone rotors if active
        rotorsRef.current.forEach((rotor, idx) => {
          rotor.rotation.y += 0.35 * (idx % 2 === 0 ? 1 : -1);
        });
      }

      if (cameraRef.current) {
        cameraRef.current.position.z = zoomLevel;
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    return () => cancelAnimationFrame(animId);
  }, [rotationAngles, zoomLevel, isDragging, config.rotationSpeed]);

  // Mouse drag handlers for rotating 3D model
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setPreviousMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;

    setRotationAngles((prev) => ({
      x: Math.max(-1.2, Math.min(1.2, prev.x + deltaY * 0.008)),
      y: prev.y + deltaX * 0.008,
    }));

    setPreviousMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    setZoomLevel((prev) => Math.max(2.0, Math.min(8.0, prev + e.deltaY * 0.003)));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0A0B0E] border-t border-[#232734] select-none">
      {/* 3D Viewport Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#12141C] border-b border-[#212634] text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="font-bold text-[#E0FFFF] flex items-center gap-1.5">
            <Rotate3d className="w-3.5 h-3.5 text-[#E0FFFF]" />
            3D VIEWPORT EDITOR [THREE.JS / WGPU]
          </span>
          <span className="text-[#2E3444]">|</span>
          <span className="text-[#8E99A8]">MODEL: {config.modelType.toUpperCase()}</span>
          <span className="text-[#2E3444]">·</span>
          <span className="text-[#FFDAB9]">VERTICES: {config.vertexCount.toLocaleString()}</span>
        </div>

        {/* Quick Viewport Toggles */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onChangeConfig({ wireframe: !config.wireframe })}
            className={`px-2.5 py-0.5 border rounded-xs transition-colors cursor-pointer ${
              config.wireframe
                ? 'bg-[#1D2B33] border-[#E0FFFF] text-[#E0FFFF] font-bold'
                : 'bg-[#141720] border-[#2A303F] text-[#8E99A8] hover:text-[#F5FFFA]'
            }`}
          >
            WIREFRAME: {config.wireframe ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => onChangeConfig({ lifeMeshTracking: !config.lifeMeshTracking })}
            className={`flex items-center gap-1 px-2.5 py-0.5 border rounded-xs transition-colors cursor-pointer ${
              config.lifeMeshTracking
                ? 'bg-[#29172B] border-[#FC8EAC] text-[#FC8EAC] font-bold'
                : 'bg-[#141720] border-[#2A303F] text-[#8E99A8] hover:text-[#F5FFFA]'
            }`}
          >
            <Crosshair className="w-3 h-3" />
            <span>MW TRACKING: {config.lifeMeshTracking ? 'LOCKED' : 'IDLE'}</span>
          </button>
        </div>
      </div>

      {/* Main 3D Canvas with Real-Time Modern Warfare Life-Mesh HUD Overlay */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        {/* Three.js canvas container */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        />

        {/* Modern Warfare Game-Engine Biometric Life-Mesh Tracking Overlay */}
        {config.lifeMeshTracking && (
          <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between font-mono text-[10px]">
            {/* Top Targeting Bounding Box */}
            <div className="flex justify-between items-start">
              <div className="border border-[#FC8EAC]/40 bg-[#0A0B0E]/60 p-2 rounded-xs space-y-1">
                <div className="text-[#FC8EAC] font-bold flex items-center gap-1.5">
                  <Crosshair className="w-3 h-3 animate-spin" />
                  <span>TARGET_LOCK: 0x99A_LIFEMESH</span>
                </div>
                <div className="text-[#8E99A8]">X: +0.428 | Y: -1.024 | Z: +4.200</div>
                <div className="text-[#E0FFFF]">SURFACE NORMALS: CALCULATED [100%]</div>
              </div>

              <div className="border border-[#E0FFFF]/40 bg-[#0A0B0E]/60 p-2 rounded-xs space-y-1 text-right">
                <div className="text-[#E0FFFF] font-bold">PHYSICAL PBR ENGINE</div>
                <div className="text-[#FFDAB9]">ROUGHNESS: {config.roughness.toFixed(2)}</div>
                <div className="text-[#FC8EAC]">METALNESS: {config.metalness.toFixed(2)}</div>
              </div>
            </div>

            {/* Central Holographic Crosshairs */}
            <div className="self-center flex flex-col items-center">
              <div className="w-28 h-28 border border-[#E0FFFF]/20 rounded-full flex items-center justify-center">
                <div className="w-14 h-14 border border-[#FFDAB9]/30 rounded-xs flex items-center justify-center">
                  <div className="w-2 h-2 bg-[#FC8EAC] rounded-full" />
                </div>
              </div>
              <span className="text-[#FFDAB9] mt-1 tracking-widest text-[9px]">VERT_DISP: NORMALIZED</span>
            </div>

            {/* Bottom Tracking Coordinates Bar */}
            <div className="flex justify-between items-end text-[#8E99A8]">
              <span>RUST_WASM_EFRAME // 60.0 FPS</span>
              <span className="text-[#E0FFFF]">DRAG TO ROTATE 3D // SCROLL TO ZOOM</span>
            </div>
          </div>
        )}

        {/* Floating PBR Material Sliders Inspector */}
        <div className="absolute top-4 right-4 w-60 bg-[#12151D]/90 backdrop-blur-md border border-[#262C3A] rounded-xs p-3 space-y-2.5 font-mono text-xs z-10">
          <div className="flex items-center justify-between pb-1 border-b border-[#212634] text-[#F5FFFA] font-bold">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3 h-3 text-[#FFDAB9]" />
              PBR SHADERS
            </span>
            <span className="text-[10px] text-[#8E99A8]">PBR-MASTER</span>
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-[#8E99A8] mb-0.5">
              <span>ROUGHNESS</span>
              <span className="text-[#FFDAB9]">{config.roughness.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.roughness}
              onChange={(e) => onChangeConfig({ roughness: Number(e.target.value) })}
              className="w-full accent-[#FFDAB9] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-[#8E99A8] mb-0.5">
              <span>METALNESS</span>
              <span className="text-[#FC8EAC]">{config.metalness.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.metalness}
              onChange={(e) => onChangeConfig({ metalness: Number(e.target.value) })}
              className="w-full accent-[#FC8EAC] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-[#8E99A8] mb-0.5">
              <span>EMISSIVE GLOW</span>
              <span className="text-[#E0FFFF]">{config.emissiveIntensity.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.2"
              value={config.emissiveIntensity}
              onChange={(e) => onChangeConfig({ emissiveIntensity: Number(e.target.value) })}
              className="w-full accent-[#E0FFFF] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-[#8E99A8] mb-0.5">
              <span>ROTATION SPEED</span>
              <span className="text-[#F5FFFA]">{config.rotationSpeed}</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={config.rotationSpeed}
              onChange={(e) => onChangeConfig({ rotationSpeed: Number(e.target.value) })}
              className="w-full accent-[#F5FFFA] cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
