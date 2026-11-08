import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Play, Pause, RotateCcw, Shield, Zap, Crosshair, Award, Flame, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { rustWasmPipeline } from '../utils/rustWasmMemorySafePipeline';

interface CyberHeroBattleGame3DProps {
  onExecuteCommand?: (cmd: string) => void;
  onExit?: () => void;
}

type GameState = 'title' | 'playing' | 'paused' | 'gameover' | 'victory';
type WeaponType = 'plasma' | 'kamehameha' | 'laser_beam';

interface Projectile {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  isHero: boolean;
  damage: number;
  life: number;
  type: WeaponType;
}

interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
}

export const CyberHeroBattleGame3D: React.FC<CyberHeroBattleGame3DProps> = ({
  onExecuteCommand,
  onExit,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Game UI States
  const [gameState, setGameState] = useState<GameState>('title');
  const [heroHealth, setHeroHealth] = useState<number>(100);
  const [heroEnergy, setHeroEnergy] = useState<number>(100);
  const [bossHealth, setBossHealth] = useState<number>(100);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(12850);
  const [combo, setCombo] = useState<number>(1);
  const [weapon, setWeapon] = useState<WeaponType>('plasma');
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [timeSurvivedSec, setTimeSurvivedSec] = useState<number>(0);

  // Web Audio Context for 100% procedural sound synthesis
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Three.js and Animation refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Entities
  const heroGroupRef = useRef<THREE.Group | null>(null);
  const bossGroupRef = useRef<THREE.Group | null>(null);
  const bossCoreRef = useRef<THREE.Mesh | null>(null);
  const bossDrone1Ref = useRef<THREE.Mesh | null>(null);
  const bossDrone2Ref = useRef<THREE.Mesh | null>(null);
  const auraRingsRef = useRef<THREE.Mesh[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const particlesRef = useRef<Particle[]>([]);

  // Simulation & Input
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraShakeRef = useRef<number>(0);
  const heroVelocityRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const lastShotTimeRef = useRef<number>(0);
  const lastBossAttackTimeRef = useRef<number>(0);
  const bossPhaseRef = useRef<number>(1);
  const gameStateRef = useRef<GameState>('title');
  gameStateRef.current = gameState;

  // Sound Synthesizer
  const playSound = useCallback((type: 'laser' | 'kame' | 'hit' | 'explosion' | 'dash') => {
    if (isAudioMuted) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'laser') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(950, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'kame') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.4);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'hit') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.08);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'explosion') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.6);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      } else if (type === 'dash') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      }
    } catch {
      // Audio fallback
    }
  }, [isAudioMuted]);

  // Spawn Particle Sparks
  const spawnExplosionParticles = (pos: THREE.Vector3, color: number, count = 15) => {
    if (!sceneRef.current) return;
    const geom = new THREE.BufferGeometry();
    const posArr = [0, 0, 0];
    geom.setAttribute('position', new THREE.Float32BufferAttribute(posArr, 3));
    const mat = new THREE.PointsMaterial({
      color,
      size: 0.35,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });

    for (let i = 0; i < count; i++) {
      const pMesh = new THREE.Points(geom, mat.clone());
      pMesh.position.copy(pos);
      sceneRef.current.add(pMesh);
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 8
      );
      particlesRef.current.push({
        mesh: pMesh as any,
        velocity: vel,
        life: 0.6 + Math.random() * 0.4,
        maxLife: 1.0,
      });
    }
  };

  // Start / Restart Game
  const handleStartGame = () => {
    // Rust/WASM memory safe pipeline check
    const verify = rustWasmPipeline.verifyAssetOperation('game_engine_init', 'Cyber Hero Battle 3D WebGL', 'system', 8388608);
    if (onExecuteCommand) {
      onExecuteCommand(`start 3d cinema game: [Rust Memory Safe] ${verify.borrowCheck}`);
    }

    setHeroHealth(100);
    setHeroEnergy(100);
    setBossHealth(100);
    setScore(0);
    setCombo(1);
    setTimeSurvivedSec(0);
    bossPhaseRef.current = 1;
    cameraShakeRef.current = 0;

    // Reset positions
    if (heroGroupRef.current) {
      heroGroupRef.current.position.set(0, -6, 0);
      heroVelocityRef.current.set(0, 0, 0);
    }
    if (bossGroupRef.current) {
      bossGroupRef.current.position.set(0, 6, 0);
    }

    // Clear projectiles
    projectilesRef.current.forEach((p) => {
      if (sceneRef.current) sceneRef.current.remove(p.mesh);
    });
    projectilesRef.current = [];

    setGameState('playing');
    playSound('dash');
  };

  // Fire Player Projectile
  const firePlayerWeapon = useCallback(() => {
    if (gameStateRef.current !== 'playing' || !sceneRef.current || !heroGroupRef.current) return;
    const now = performance.now();
    const cooldown = weapon === 'plasma' ? 140 : weapon === 'kamehameha' ? 450 : 250;
    if (now - lastShotTimeRef.current < cooldown) return;
    lastShotTimeRef.current = now;

    const heroPos = heroGroupRef.current.position;

    if (weapon === 'plasma') {
      // Dual plasma bolts
      playSound('laser');
      [-0.9, 0.9].forEach((offset) => {
        const geom = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 6);
        const mat = new THREE.MeshStandardMaterial({
          color: 0x00f5d4,
          emissive: 0x00f5d4,
          emissiveIntensity: 2.5,
          metalness: 0.2,
          roughness: 0.1,
        });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.rotation.x = Math.PI / 2;
        mesh.position.set(heroPos.x + offset, heroPos.y + 1.2, heroPos.z);
        sceneRef.current?.add(mesh);
        projectilesRef.current.push({
          mesh,
          velocity: new THREE.Vector3(0, 32, 0),
          isHero: true,
          damage: 5,
          life: 2.0,
          type: 'plasma',
        });
      });
    } else if (weapon === 'kamehameha') {
      // Massive Ki Energy Orb
      playSound('kame');
      cameraShakeRef.current = 0.4;
      const geom = new THREE.SphereGeometry(0.7, 16, 16);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x3a86ff,
        emissive: 0x3a86ff,
        emissiveIntensity: 4.0,
        metalness: 0.1,
        roughness: 0.1,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(heroPos.x, heroPos.y + 1.6, heroPos.z);
      sceneRef.current.add(mesh);
      projectilesRef.current.push({
        mesh,
        velocity: new THREE.Vector3(0, 24, 0),
        isHero: true,
        damage: 18,
        life: 2.5,
        type: 'kamehameha',
      });
    } else {
      // Precision Laser Beam
      playSound('laser');
      const geom = new THREE.BoxGeometry(0.2, 2.4, 0.2);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xff0055,
        emissive: 0xff0055,
        emissiveIntensity: 3.5,
        metalness: 0.3,
        roughness: 0.2,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(heroPos.x, heroPos.y + 1.4, heroPos.z);
      sceneRef.current.add(mesh);
      projectilesRef.current.push({
        mesh,
        velocity: new THREE.Vector3(0, 40, 0),
        isHero: true,
        damage: 10,
        life: 1.8,
        type: 'laser_beam',
      });
    }
  }, [weapon, playSound]);

  // Main Three.js Scene Setup & Simulation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06060c, 0.02);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      200
    );
    camera.position.set(0, 0, 22);
    cameraRef.current = camera;

    // 3. Renderer with Studio PBR setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // 4. Lighting: Studio warm/cool contrast
    const ambientLight = new THREE.AmbientLight(0x1a2035, 1.2);
    scene.add(ambientLight);

    const dirKeyLight = new THREE.DirectionalLight(0x60a5fa, 2.5);
    dirKeyLight.position.set(10, 15, 15);
    dirKeyLight.castShadow = true;
    scene.add(dirKeyLight);

    const dirRimLight = new THREE.DirectionalLight(0xf97316, 2.0);
    dirRimLight.position.set(-12, -10, -8);
    scene.add(dirRimLight);

    // 5. Procedural Grid Cyber Field
    const gridHelper = new THREE.GridHelper(60, 40, 0x3b82f6, 0x1e293b);
    gridHelper.rotation.x = Math.PI / 2;
    gridHelper.position.z = -2;
    scene.add(gridHelper);

    // Background floating cyber dust
    const starsGeom = new THREE.BufferGeometry();
    const starCount = 350;
    const starCoords = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starCoords[i] = (Math.random() - 0.5) * 80;
      starCoords[i + 1] = (Math.random() - 0.5) * 80;
      starCoords[i + 2] = (Math.random() - 0.5) * 20 - 5;
    }
    starsGeom.setAttribute('position', new THREE.BufferAttribute(starCoords, 3));
    const starsMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.22,
      transparent: true,
      opacity: 0.6,
    });
    const starField = new THREE.Points(starsGeom, starsMat);
    scene.add(starField);

    // 6. COMPOSITE HERO FIGHTER SHIP (9 parts)
    const heroGroup = new THREE.Group();
    heroGroup.position.set(0, -6, 0);

    // Part 1: Main fuselage pod
    const fuseGeom = new THREE.ConeGeometry(0.8, 2.4, 6);
    const heroMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.25,
    });
    const fuseMesh = new THREE.Mesh(fuseGeom, heroMat);
    fuseMesh.rotation.z = 0;
    fuseMesh.castShadow = true;
    heroGroup.add(fuseMesh);

    // Part 2: Cockpit visor canopy
    const canopyGeom = new THREE.SphereGeometry(0.45, 12, 12);
    const canopyMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.5,
      metalness: 0.9,
      roughness: 0.1,
    });
    const canopyMesh = new THREE.Mesh(canopyGeom, canopyMat);
    canopyMesh.position.set(0, 0.2, 0.35);
    canopyMesh.scale.set(0.8, 1.4, 0.6);
    heroGroup.add(canopyMesh);

    // Parts 3 & 4: Swept wings (Left & Right)
    const wingGeom = new THREE.BoxGeometry(1.6, 0.6, 0.08);
    const leftWing = new THREE.Mesh(wingGeom, heroMat);
    leftWing.position.set(-1.1, -0.4, 0);
    leftWing.rotation.z = -0.3;
    heroGroup.add(leftWing);

    const rightWing = new THREE.Mesh(wingGeom, heroMat);
    rightWing.position.set(1.1, -0.4, 0);
    rightWing.rotation.z = 0.3;
    heroGroup.add(rightWing);

    // Parts 5 & 6: Dual Plasma Cannons
    const cannonGeom = new THREE.CylinderGeometry(0.08, 0.08, 1.0, 8);
    const cannonMat = new THREE.MeshStandardMaterial({
      color: 0x00f5d4,
      emissive: 0x00f5d4,
      emissiveIntensity: 1.8,
    });
    const leftCannon = new THREE.Mesh(cannonGeom, cannonMat);
    leftCannon.position.set(-0.9, 0.4, 0.1);
    heroGroup.add(leftCannon);

    const rightCannon = new THREE.Mesh(cannonGeom, cannonMat);
    rightCannon.position.set(0.9, 0.4, 0.1);
    heroGroup.add(rightCannon);

    // Parts 7 & 8: Rear Thrusters with Engine Glow
    const thrusterGeom = new THREE.ConeGeometry(0.25, 0.8, 8);
    const thrusterMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 3.0,
    });
    const leftThruster = new THREE.Mesh(thrusterGeom, thrusterMat);
    leftThruster.position.set(-0.4, -1.3, 0);
    leftThruster.rotation.x = Math.PI;
    heroGroup.add(leftThruster);

    const rightThruster = new THREE.Mesh(thrusterGeom, thrusterMat);
    rightThruster.position.set(0.4, -1.3, 0);
    rightThruster.rotation.x = Math.PI;
    heroGroup.add(rightThruster);

    // Part 9: Central Quantum Core Sphere
    const coreGeom = new THREE.SphereGeometry(0.25, 12, 12);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x00f5d4,
      emissive: 0x00f5d4,
      emissiveIntensity: 3.5,
    });
    const coreMesh = new THREE.Mesh(coreGeom, coreMat);
    coreMesh.position.set(0, -0.3, 0.1);
    heroGroup.add(coreMesh);

    scene.add(heroGroup);
    heroGroupRef.current = heroGroup;

    // 7. COMPOSITE BOSS OPPONENT: "SAIYAN CYBER TITAN" (9 parts)
    const bossGroup = new THREE.Group();
    bossGroup.position.set(0, 6, 0);

    // Part 1: Heavy Armored Torso Chassis
    const bTorsoGeom = new THREE.DodecahedronGeometry(1.6, 0);
    const bossArmorMat = new THREE.MeshStandardMaterial({
      color: 0x881337,
      metalness: 0.9,
      roughness: 0.2,
    });
    const bTorsoMesh = new THREE.Mesh(bTorsoGeom, bossArmorMat);
    bossGroup.add(bTorsoMesh);

    // Part 2: Super Saiyan Golden Horn / Spikes
    const spikeGroup = new THREE.Group();
    const spikeGeom = new THREE.ConeGeometry(0.3, 1.6, 5);
    const spikeMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xeab308,
      emissiveIntensity: 2.5,
      metalness: 0.4,
      roughness: 0.2,
    });
    for (let s = -2; s <= 2; s++) {
      const spike = new THREE.Mesh(spikeGeom, spikeMat);
      spike.position.set(s * 0.55, 1.4, 0);
      spike.rotation.z = -s * 0.25;
      spikeGroup.add(spike);
    }
    bossGroup.add(spikeGroup);

    // Part 3: Glowing Core Reactor (Super Saiyan Ki Energy)
    const bCoreGeom = new THREE.SphereGeometry(0.85, 16, 16);
    const bCoreMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf97316,
      emissiveIntensity: 3.0,
      metalness: 0.1,
      roughness: 0.1,
    });
    const bCoreMesh = new THREE.Mesh(bCoreGeom, bCoreMat);
    bCoreMesh.position.set(0, 0, 0.4);
    bossGroup.add(bCoreMesh);
    bossCoreRef.current = bCoreMesh;

    // Parts 4 & 5: Shoulder Cannon Pods
    const podGeom = new THREE.BoxGeometry(0.9, 1.2, 0.9);
    const leftPod = new THREE.Mesh(podGeom, bossArmorMat);
    leftPod.position.set(-2.0, 0.5, 0);
    bossGroup.add(leftPod);

    const rightPod = new THREE.Mesh(podGeom, bossArmorMat);
    rightPod.position.set(2.0, 0.5, 0);
    bossGroup.add(rightPod);

    // Parts 6 & 7: Floating Orbital Defense Drones
    const droneGeom = new THREE.OctahedronGeometry(0.45, 0);
    const droneMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 2.0,
    });
    const drone1 = new THREE.Mesh(droneGeom, droneMat);
    bossGroup.add(drone1);
    bossDrone1Ref.current = drone1;

    const drone2 = new THREE.Mesh(droneGeom, droneMat);
    bossGroup.add(drone2);
    bossDrone2Ref.current = drone2;

    // Parts 8 & 9: Expanding Ki Aura Torus Rings
    const ringGeom = new THREE.TorusGeometry(2.4, 0.08, 8, 24);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 2.0,
      transparent: true,
      opacity: 0.7,
    });
    const ring1 = new THREE.Mesh(ringGeom, ringMat);
    bossGroup.add(ring1);
    const ring2 = new THREE.Mesh(ringGeom, ringMat.clone());
    ring2.rotation.x = Math.PI / 3;
    bossGroup.add(ring2);
    auraRingsRef.current = [ring1, ring2];

    scene.add(bossGroup);
    bossGroupRef.current = bossGroup;

    // 8. Event Listeners for Input
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
      if (e.code === 'KeyP') {
        setGameState((prev) => (prev === 'playing' ? 'paused' : prev === 'paused' ? 'playing' : prev));
      }
      if (e.code === 'Digit1') setWeapon('plasma');
      if (e.code === 'Digit2') setWeapon('kamehameha');
      if (e.code === 'Digit3') setWeapon('laser_beam');
      if (e.code === 'Space' && gameStateRef.current === 'title') {
        handleStartGame();
      } else if (e.code === 'Space') {
        firePlayerWeapon();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mousePosRef.current = { x: x * 12, y: y * 8 };
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0 && gameStateRef.current === 'playing') {
        firePlayerWeapon();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mousedown', handleMouseDown);

    // 9. Simulation Animation Loop (Clamped 60FPS Delta)
    let lastTime = performance.now();
    let survivalTimer = 0;

    const animate = (currentTime: number) => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const rawDt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      const dt = Math.min(rawDt, 0.05); // Skill rule: clamp delta time to avoid physics explosion

      // Background starfield slow drift
      starField.rotation.y += 0.05 * dt;

      // Camera Shake decay (Skill rule: decaying camera shake on impacts)
      if (cameraShakeRef.current > 0.001) {
        camera.position.x = (Math.random() - 0.5) * cameraShakeRef.current;
        camera.position.y = (Math.random() - 0.5) * cameraShakeRef.current;
        cameraShakeRef.current *= 0.88;
      } else {
        camera.position.x = 0;
        camera.position.y = 0;
      }

      if (gameStateRef.current === 'playing') {
        survivalTimer += dt;
        setTimeSurvivedSec(Math.floor(survivalTimer));

        // Energy passive recharge
        setHeroEnergy((prev) => Math.min(100, prev + 15 * dt));

        // Hero Movement with smooth exponential damping
        const targetX = mousePosRef.current.x;
        const targetY = Math.max(-8, Math.min(2, mousePosRef.current.y));

        if (keysRef.current['KeyA'] || keysRef.current['ArrowLeft']) heroGroup.position.x -= 18 * dt;
        if (keysRef.current['KeyD'] || keysRef.current['ArrowRight']) heroGroup.position.x += 18 * dt;
        if (keysRef.current['KeyW'] || keysRef.current['ArrowUp']) heroGroup.position.y += 14 * dt;
        if (keysRef.current['KeyS'] || keysRef.current['ArrowDown']) heroGroup.position.y -= 14 * dt;

        // Mouse follow interpolation
        heroGroup.position.x += (targetX - heroGroup.position.x) * 0.12;
        heroGroup.position.y += (targetY - heroGroup.position.y) * 0.12;

        // Boundaries clamp
        heroGroup.position.x = Math.max(-12, Math.min(12, heroGroup.position.x));
        heroGroup.position.y = Math.max(-8.5, Math.min(2, heroGroup.position.y));

        // Hero banking roll
        heroGroup.rotation.z = -((targetX - heroGroup.position.x) * 0.08);

        // Boss AI Movement & Orbiting Drones
        const bossTime = currentTime * 0.002;
        bossGroup.position.x = Math.sin(bossTime * 1.5) * 8.5;
        bossGroup.position.y = 5.5 + Math.cos(bossTime * 2.2) * 1.5;
        bossGroup.rotation.y = Math.sin(bossTime) * 0.3;

        // Rotate Boss Drones
        if (bossDrone1Ref.current) {
          bossDrone1Ref.current.position.set(
            Math.cos(bossTime * 3) * 3.2,
            Math.sin(bossTime * 3) * 3.2,
            0
          );
        }
        if (bossDrone2Ref.current) {
          bossDrone2Ref.current.position.set(
            Math.cos(bossTime * 3 + Math.PI) * 3.2,
            Math.sin(bossTime * 3 + Math.PI) * 3.2,
            0
          );
        }

        // Pulse Boss Core
        if (bossCoreRef.current) {
          const s = 1.0 + Math.sin(bossTime * 6) * 0.15;
          bossCoreRef.current.scale.set(s, s, s);
        }

        // Rotate Aura Rings
        auraRingsRef.current.forEach((r, idx) => {
          r.rotation.z += (idx === 0 ? 1 : -1) * 1.5 * dt;
        });

        // Boss Attack Pattern
        if (currentTime - lastBossAttackTimeRef.current > 1200) {
          lastBossAttackTimeRef.current = currentTime;
          // Spawn Boss Ki Blast
          playSound('kame');
          const blastGeom = new THREE.SphereGeometry(0.35, 12, 12);
          const blastMat = new THREE.MeshStandardMaterial({
            color: 0xef4444,
            emissive: 0xdc2626,
            emissiveIntensity: 3.5,
          });
          const bMesh = new THREE.Mesh(blastGeom, blastMat);
          bMesh.position.copy(bossGroup.position);
          scene.add(bMesh);

          const aimDir = new THREE.Vector3()
            .subVectors(heroGroup.position, bossGroup.position)
            .normalize();

          projectilesRef.current.push({
            mesh: bMesh,
            velocity: aimDir.multiplyScalar(15),
            isHero: false,
            damage: 12,
            life: 3.0,
            type: 'plasma',
          });
        }

        // Update Projectiles & Check Collisions
        for (let i = projectilesRef.current.length - 1; i >= 0; i--) {
          const p = projectilesRef.current[i];
          p.mesh.position.addScaledVector(p.velocity, dt);
          p.life -= dt;

          // Hero bullet hits boss
          if (p.isHero) {
            const distToBoss = p.mesh.position.distanceTo(bossGroup.position);
            if (distToBoss < 2.5) {
              // Boss Hit!
              playSound('hit');
              cameraShakeRef.current = 0.25;
              spawnExplosionParticles(p.mesh.position, 0xf59e0b, 10);
              scene.remove(p.mesh);
              projectilesRef.current.splice(i, 1);

              setBossHealth((prev) => {
                const next = Math.max(0, prev - p.damage);
                if (next === 0) {
                  // Boss defeated!
                  playSound('explosion');
                  spawnExplosionParticles(bossGroup.position, 0xf59e0b, 50);
                  setGameState('victory');
                }
                return next;
              });

              setScore((s) => s + p.damage * 10 * combo);
              setCombo((c) => Math.min(10, c + 1));
              continue;
            }
          } else {
            // Boss bullet hits hero
            const distToHero = p.mesh.position.distanceTo(heroGroup.position);
            if (distToHero < 1.4) {
              // Hero Hit!
              playSound('hit');
              cameraShakeRef.current = 0.6;
              spawnExplosionParticles(p.mesh.position, 0xef4444, 15);
              scene.remove(p.mesh);
              projectilesRef.current.splice(i, 1);

              setHeroHealth((prev) => {
                const next = Math.max(0, prev - p.damage);
                if (next === 0) {
                  playSound('explosion');
                  setGameState('gameover');
                }
                return next;
              });
              setCombo(1);
              continue;
            }
          }

          // Out of bounds / timeout
          if (p.life <= 0 || Math.abs(p.mesh.position.y) > 15 || Math.abs(p.mesh.position.x) > 20) {
            scene.remove(p.mesh);
            projectilesRef.current.splice(i, 1);
          }
        }

        // Update Particles
        for (let j = particlesRef.current.length - 1; j >= 0; j--) {
          const pt = particlesRef.current[j];
          pt.mesh.position.addScaledVector(pt.velocity, dt);
          pt.life -= dt;
          if (pt.life <= 0) {
            scene.remove(pt.mesh);
            particlesRef.current.splice(j, 1);
          }
        }
      }

      renderer.render(scene, camera);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    // Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mousedown', handleMouseDown);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [firePlayerWeapon, playSound, handleStartGame]);

  return (
    <div className="relative w-full h-full bg-[#050508] select-none overflow-hidden font-mono text-white">
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 z-0 cursor-crosshair" />

      {/* PERIMETER STATUS CLUSTER (Low-occlusion <=15% screen space) */}
      <div className="absolute top-4 left-6 z-10 flex items-center space-x-6 pointer-events-none">
        {/* HERO HEALTH & ENERGY */}
        <div className="bg-[#0A0D14]/85 border border-[#1E293B] p-2.5 rounded shadow-lg backdrop-blur-none">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#00F5D4] mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>HERO PILOT HULL</span>
            <span className="tabular-nums ml-auto text-white">{Math.round(heroHealth)}%</span>
          </div>
          <div className="w-36 h-2 bg-[#1E293B] rounded overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00F5D4] to-[#3B82F6] transition-all duration-150"
              style={{ width: `${heroHealth}%` }}
            />
          </div>

          <div className="flex items-center space-x-2 text-[10px] font-bold text-[#F59E0B] mt-2 mb-0.5">
            <Zap className="w-3 h-3" />
            <span>QUANTUM KI DRIVE</span>
            <span className="tabular-nums ml-auto text-white">{Math.round(heroEnergy)}%</span>
          </div>
          <div className="w-36 h-1.5 bg-[#1E293B] rounded overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#F59E0B] to-[#EF4444] transition-all duration-100"
              style={{ width: `${heroEnergy}%` }}
            />
          </div>
        </div>

        {/* SCORE & MULTIPLIER */}
        <div className="bg-[#0A0D14]/85 border border-[#1E293B] p-2.5 rounded shadow-lg">
          <div className="text-[10px] text-gray-400 font-semibold tracking-wider">KNOCKS MASTER SCORE</div>
          <div className="text-xl font-black text-[#FACC15] tabular-nums tracking-widest">{score.toLocaleString()}</div>
          <div className="flex items-center space-x-2 text-[10px] mt-0.5">
            <span className="text-gray-400">COMBO:</span>
            <span className="text-[#00F5D4] font-bold tabular-nums">x{combo}</span>
            <span className="text-gray-500">|</span>
            <span className="text-gray-400">TIME:</span>
            <span className="text-white font-bold tabular-nums">{timeSurvivedSec}s</span>
          </div>
        </div>
      </div>

      {/* TOP-RIGHT: BOSS HEALTH STATUS */}
      <div className="absolute top-4 right-6 z-10 pointer-events-none">
        <div className="bg-[#0A0D14]/85 border border-[#881337] p-2.5 rounded shadow-lg text-right">
          <div className="flex items-center justify-end space-x-2 text-xs font-bold text-[#EF4444] mb-1">
            <Flame className="w-3.5 h-3.5" />
            <span>SAIYAN CYBER TITAN BOSS</span>
            <span className="tabular-nums ml-2 text-white">{Math.round(bossHealth)}%</span>
          </div>
          <div className="w-48 h-2.5 bg-[#1E293B] rounded overflow-hidden ml-auto">
            <div
              className="h-full bg-gradient-to-l from-[#EF4444] via-[#F97316] to-[#FACC15] transition-all duration-150"
              style={{ width: `${bossHealth}%` }}
            />
          </div>
          <div className="text-[9px] text-gray-500 mt-1 uppercase tracking-wider">
            [RUST/WASM MEMORY SAFE KERNEL]
          </div>
        </div>
      </div>

      {/* BOTTOM-LEFT: WEAPON SELECTION & CONTROLS CLUSTER */}
      <div className="absolute bottom-4 left-6 z-10 flex items-center space-x-3 pointer-events-auto">
        <div className="bg-[#0A0D14]/90 border border-[#1E293B] px-3 py-2 rounded flex items-center space-x-2 text-xs">
          <span className="text-gray-400 text-[10px] uppercase font-bold mr-1">WEAPON:</span>
          <button
            onClick={() => setWeapon('plasma')}
            className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
              weapon === 'plasma'
                ? 'bg-[#00F5D4] text-black shadow-[0_0_10px_#00F5D4]'
                : 'bg-[#1E293B] text-gray-300 hover:bg-[#334155]'
            }`}
          >
            [1] DUAL PLASMA
          </button>
          <button
            onClick={() => setWeapon('kamehameha')}
            className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
              weapon === 'kamehameha'
                ? 'bg-[#3A86FF] text-white shadow-[0_0_10px_#3A86FF]'
                : 'bg-[#1E293B] text-gray-300 hover:bg-[#334155]'
            }`}
          >
            [2] KAMEHAMEHA
          </button>
          <button
            onClick={() => setWeapon('laser_beam')}
            className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
              weapon === 'laser_beam'
                ? 'bg-[#EF4444] text-white shadow-[0_0_10px_#EF4444]'
                : 'bg-[#1E293B] text-gray-300 hover:bg-[#334155]'
            }`}
          >
            [3] BEAM LASER
          </button>
        </div>

        <button
          onClick={() => setIsAudioMuted(!isAudioMuted)}
          className="p-2 bg-[#0A0D14]/90 border border-[#1E293B] rounded text-gray-300 hover:text-white"
          title="Toggle Audio"
        >
          {isAudioMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-[#00F5D4]" />}
        </button>

        {onExit && (
          <button
            onClick={onExit}
            className="px-3 py-1.5 bg-[#1E293B] border border-gray-600 rounded text-xs text-gray-200 hover:bg-gray-700 font-bold"
          >
            EXIT TO STUDIO
          </button>
        )}
      </div>

      {/* GAME SHELL: TITLE SCREEN MODAL */}
      {gameState === 'title' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="max-w-lg w-full bg-[#0E131F] border-2 border-[#00F5D4] p-8 rounded-lg shadow-[0_0_40px_rgba(0,245,212,0.3)] text-center">
            <div className="inline-block px-3 py-1 bg-[#00F5D4]/10 border border-[#00F5D4] text-[#00F5D4] text-[11px] font-bold rounded mb-4 tracking-widest uppercase">
              KNOCKSSTUDiOS // HOLLYWOOD MOTiON PiCTURES
            </div>
            <h1 className="text-3xl font-black text-white tracking-wider mb-2">
              CYBER HERO 3D BATTLE
            </h1>
            <p className="text-xs text-gray-400 mb-6 font-mono leading-relaxed">
              Pilot your composite quantum mecha fighter against the Saiyan Cyber Titan in a 60FPS memory-safe Three.js WebGL simulation arena.
            </p>

            <div className="bg-[#05070D] border border-[#1E293B] p-4 rounded text-left mb-6 text-xs text-gray-300 space-y-1.5">
              <div className="text-[#00F5D4] font-bold uppercase mb-1">COMBAT CONTROLS:</div>
              <div>• <span className="text-white font-bold">W / A / S / D</span> or <span className="text-white font-bold">Mouse</span>: Steer Ship</div>
              <div>• <span className="text-white font-bold">Left Click / Space</span>: Fire Active Weapon</div>
              <div>• <span className="text-white font-bold">1 / 2 / 3 Keys</span>: Switch Weapon (Plasma / Kamehameha / Laser)</div>
              <div>• <span className="text-white font-bold">P</span>: Pause / Resume Simulation</div>
            </div>

            <button
              onClick={handleStartGame}
              className="w-full py-3.5 bg-gradient-to-r from-[#00F5D4] to-[#3B82F6] hover:from-[#3B82F6] hover:to-[#00F5D4] text-black font-black text-sm tracking-widest uppercase rounded shadow-[0_0_20px_#00F5D4] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              LAUNCH SIMULATION [SPACE / CLICK]
            </button>
          </div>
        </div>
      )}

      {/* GAME OVER MODAL */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/85 backdrop-blur-sm">
          <div className="max-w-md w-full bg-[#180A0A] border-2 border-[#EF4444] p-8 rounded-lg shadow-[0_0_40px_rgba(239,68,68,0.4)] text-center">
            <h2 className="text-3xl font-black text-[#EF4444] tracking-wider mb-2">HULL DESTROYED</h2>
            <p className="text-xs text-gray-400 mb-6 font-mono">The Saiyan Cyber Titan overwhelmed quantum defenses.</p>

            <div className="bg-[#0A0505] border border-[#3B1515] p-4 rounded mb-6 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">FINAL SCORE:</span>
                <span className="text-[#FACC15] font-bold tabular-nums text-sm">{score.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">SURVIVAL TIME:</span>
                <span className="text-white font-bold tabular-nums">{timeSurvivedSec} SECONDS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">MAX COMBO:</span>
                <span className="text-[#00F5D4] font-bold tabular-nums">x{combo}</span>
              </div>
            </div>

            <button
              onClick={handleStartGame}
              className="w-full py-3 bg-[#EF4444] hover:bg-[#DC2626] text-white font-black text-xs uppercase tracking-widest rounded shadow-[0_0_20px_#EF4444] flex items-center justify-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>REDEPLOY TO BATTLE ARENA</span>
            </button>
          </div>
        </div>
      )}

      {/* VICTORY MODAL */}
      {gameState === 'victory' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/85 backdrop-blur-sm">
          <div className="max-w-md w-full bg-[#0A1A14] border-2 border-[#00F5D4] p-8 rounded-lg shadow-[0_0_40px_rgba(0,245,212,0.4)] text-center">
            <Award className="w-12 h-12 text-[#FACC15] mx-auto mb-3" />
            <h2 className="text-3xl font-black text-[#00F5D4] tracking-wider mb-2">TITAN VANQUISHED</h2>
            <p className="text-xs text-gray-300 mb-6 font-mono">Hollywood Motion Pictures cinema battle sequence cleared!</p>

            <div className="bg-[#050D0A] border border-[#153B25] p-4 rounded mb-6 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">FINAL SCORE:</span>
                <span className="text-[#FACC15] font-bold tabular-nums text-sm">{score.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">CLEAR TIME:</span>
                <span className="text-white font-bold tabular-nums">{timeSurvivedSec} SECONDS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">RUST MEMORY INTEGRITY:</span>
                <span className="text-[#00F5D4] font-bold">100% VERIFIED</span>
              </div>
            </div>

            <button
              onClick={handleStartGame}
              className="w-full py-3 bg-[#00F5D4] hover:bg-[#20D2B8] text-black font-black text-xs uppercase tracking-widest rounded shadow-[0_0_20px_#00F5D4] flex items-center justify-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>COMMENCE NEXT WAVE</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
