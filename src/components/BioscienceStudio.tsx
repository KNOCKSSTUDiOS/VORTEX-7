import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  Dna,
  Search,
  ExternalLink,
  ShieldCheck,
  Activity,
  Layers,
  Atom,
  Database,
  FileText,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';
import { rustWasmPipeline } from '../utils/rustWasmMemorySafePipeline';

interface BioscienceStudioProps {
  onExecuteCommand?: (cmd: string) => void;
}

interface ProteinProfile {
  gene: string;
  name: string;
  uniprotId: string;
  pdbId: string;
  organism: string;
  length: number;
  massDa: number;
  description: string;
  domains: { name: string; start: number; end: number; color: string }[];
  variants: { change: string; consequence: string; status: 'Pathogenic' | 'VUS' | 'Benign'; clinvarId: string }[];
  drugs: { name: string; chemblId: string; phase: string; mechanism: string }[];
  avgPlddt: number;
}

const PRESET_PROTEINS: { [key: string]: ProteinProfile } = {
  TP53: {
    gene: 'TP53',
    name: 'Cellular Tumor Antigen p53',
    uniprotId: 'P04637',
    pdbId: '1TUP',
    organism: 'Homo sapiens (Human)',
    length: 393,
    massDa: 43653,
    description: 'Acts as a tumor suppressor in many tumor types; induces growth arrest or apoptosis depending on physiological circumstances.',
    domains: [
      { name: 'Transactivation Domain 1 (TAD1)', start: 1, end: 40, color: '#65CBF3' },
      { name: 'Proline-Rich Region', start: 61, end: 94, color: '#FFDB13' },
      { name: 'DNA-Binding Domain (DBD)', start: 102, end: 292, color: '#0053D6' },
      { name: 'Tetramerization Domain (OD)', start: 325, end: 356, color: '#0053D6' },
      { name: 'C-Terminal Regulatory Domain', start: 363, end: 393, color: '#FF7D45' },
    ],
    variants: [
      { change: 'R175H', consequence: 'Structural disruption of zinc coordination', status: 'Pathogenic', clinvarId: 'VCV000012354' },
      { change: 'R248Q', consequence: 'Loss of minor groove DNA contact', status: 'Pathogenic', clinvarId: 'VCV000012376' },
      { change: 'R273H', consequence: 'Loss of backbone phosphate contact', status: 'Pathogenic', clinvarId: 'VCV000012398' },
      { change: 'P72R', consequence: 'Common polymorphism affecting apoptosis efficiency', status: 'Benign', clinvarId: 'VCV000014285' },
    ],
    drugs: [
      { name: 'APR-246 (Eprenetapopt)', chemblId: 'CHEMBL3989912', phase: 'Phase III', mechanism: 'Restores wild-type conformation to mutant p53' },
      { name: 'Idasanutlin', chemblId: 'CHEMBL3137313', phase: 'Phase III', mechanism: 'MDM2-p53 interaction antagonist' },
    ],
    avgPlddt: 88.4,
  },
  BRCA1: {
    gene: 'BRCA1',
    name: 'Breast Cancer Type 1 Susceptibility Protein',
    uniprotId: 'P38398',
    pdbId: '1JNX',
    organism: 'Homo sapiens (Human)',
    length: 1863,
    massDa: 207721,
    description: 'E3 ubiquitin-protein ligase that specifically mediates the formation of Lys-6-linked polyubiquitin chains and homologous recombination DNA repair.',
    domains: [
      { name: 'RING Finger Domain', start: 1, end: 109, color: '#0053D6' },
      { name: 'Nuclear Localization Signal', start: 503, end: 508, color: '#65CBF3' },
      { name: 'BRCT Domain 1', start: 1646, end: 1736, color: '#0053D6' },
      { name: 'BRCT Domain 2', start: 1760, end: 1855, color: '#0053D6' },
    ],
    variants: [
      { change: 'C61G', consequence: 'Disrupts RING domain zinc finger fold', status: 'Pathogenic', clinvarId: 'VCV000017642' },
      { change: '185delAG', consequence: 'Frameshift mutation leading to premature truncation', status: 'Pathogenic', clinvarId: 'VCV000017648' },
      { change: 'S1613G', consequence: 'Missense variant in non-critical loop', status: 'Benign', clinvarId: 'VCV000037612' },
    ],
    drugs: [
      { name: 'Olaparib', chemblId: 'CHEMBL513926', phase: 'Approved', mechanism: 'PARP inhibitor exploiting synthetic lethality' },
      { name: 'Talazoparib', chemblId: 'CHEMBL3545300', phase: 'Approved', mechanism: 'Potent dual PARP1/2 trapping agent' },
    ],
    avgPlddt: 74.2,
  },
  EGFR: {
    gene: 'EGFR',
    name: 'Epidermal Growth Factor Receptor',
    uniprotId: 'P00533',
    pdbId: '1M17',
    organism: 'Homo sapiens (Human)',
    length: 1210,
    massDa: 134277,
    description: 'Receptor tyrosine kinase binding ligands of the EGF family and activating several signaling cascades including MAPK, Akt, and JNK.',
    domains: [
      { name: 'Extracellular Ligand-Binding (I-IV)', start: 25, end: 645, color: '#65CBF3' },
      { name: 'Transmembrane Helical Domain', start: 646, end: 668, color: '#FFDB13' },
      { name: 'Protein Kinase Catalytic Domain', start: 712, end: 979, color: '#0053D6' },
    ],
    variants: [
      { change: 'L858R', consequence: 'Activating kinase mutation in exon 21', status: 'Pathogenic', clinvarId: 'VCV000016616' },
      { change: 'T790M', consequence: 'Gatekeeper mutation conferring 1st-gen TKI resistance', status: 'Pathogenic', clinvarId: 'VCV000016620' },
    ],
    drugs: [
      { name: 'Osimertinib', chemblId: 'CHEMBL3353410', phase: 'Approved', mechanism: '3rd-generation covalent EGFR T790M inhibitor' },
      { name: 'Gefitinib', chemblId: 'CHEMBL939', phase: 'Approved', mechanism: '1st-generation ATP-competitive kinase inhibitor' },
    ],
    avgPlddt: 91.6,
  },
  PCSK9: {
    gene: 'PCSK9',
    name: 'Proprotein Convertase Subtilisin/Kexin Type 9',
    uniprotId: 'Q8NBP7',
    pdbId: '2P4E',
    organism: 'Homo sapiens (Human)',
    length: 692,
    massDa: 74291,
    description: 'Crucial player in plasma cholesterol homeostasis by regulating low density lipoprotein receptor (LDLR) degradation.',
    domains: [
      { name: 'Prodomain', start: 31, end: 152, color: '#65CBF3' },
      { name: 'Catalytic Domain', start: 153, end: 425, color: '#0053D6' },
      { name: 'C-Terminal Cysteine-Rich Domain', start: 453, end: 692, color: '#FFDB13' },
    ],
    variants: [
      { change: 'D374Y', consequence: 'Gain-of-function causing familial hypercholesterolemia', status: 'Pathogenic', clinvarId: 'VCV000018501' },
      { change: 'R46L', consequence: 'Loss-of-function conferring cardioprotective LDL reduction', status: 'Benign', clinvarId: 'VCV000018508' },
    ],
    drugs: [
      { name: 'Evolocumab', chemblId: 'CHEMBL2108745', phase: 'Approved', mechanism: 'Monoclonal antibody blocking LDLR binding' },
      { name: 'Inclisiran', chemblId: 'CHEMBL4297833', phase: 'Approved', mechanism: 'GalNAc-conjugated siRNA targeting PCSK9 mRNA' },
    ],
    avgPlddt: 92.1,
  },
};

export const BioscienceStudio: React.FC<BioscienceStudioProps> = ({ onExecuteCommand }) => {
  const [activeProteinKey, setActiveProteinKey] = useState<string>('TP53');
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'3d_fold' | 'variants' | 'pharmacology' | 'sequence'>('3d_fold');
  const [customSearch, setCustomSearch] = useState<string>('');

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const protein = PRESET_PROTEINS[activeProteinKey] || PRESET_PROTEINS.TP53;

  // Three.js Molecular Viewer Setup
  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;

    // Rust/WASM memory safe check for molecular coordinate buffer
    const verify = rustWasmPipeline.verifyAssetOperation(
      'molecular_pbr_buffer_alloc',
      `${protein.gene} (${protein.uniprotId}) mmCIF Coordinates`,
      'system',
      6291456
    );
    if (onExecuteCommand) {
      onExecuteCommand(`load molecular structure [${protein.gene}]: ${verify.borrowCheck}`);
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e17);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 16);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x60a5fa, 2.0);
    dirLight1.position.set(10, 15, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xf97316, 1.2);
    dirLight2.position.set(-10, -10, -10);
    scene.add(dirLight2);

    // Procedural Molecular Ribbon & Alpha Helix Backbone
    const moleculeGroup = new THREE.Group();

    // Create 4-band AlphaFold pLDDT helix segments
    const helixRadius = 2.6;
    const helixTurns = 3.5;
    const helixPoints = 120;
    const curvePoints: THREE.Vector3[] = [];

    for (let i = 0; i <= helixPoints; i++) {
      const t = (i / helixPoints) * Math.PI * 2 * helixTurns;
      const x = Math.cos(t) * (helixRadius + Math.sin(t * 0.5) * 0.5);
      const y = (i / helixPoints - 0.5) * 10;
      const z = Math.sin(t) * (helixRadius + Math.cos(t * 0.5) * 0.5);
      curvePoints.push(new THREE.Vector3(x, y, z));
    }

    const curve = new THREE.CatmullRomCurve3(curvePoints);
    const tubeGeom = new THREE.TubeGeometry(curve, 100, 0.28, 12, false);

    // AlphaFold pLDDT colors: >90 Blue (#0053D6), 70-90 Light Blue (#65CBF3), 50-70 Yellow (#FFDB13), <50 Orange (#FF7D45)
    const ribbonMat = new THREE.MeshStandardMaterial({
      color: 0x0053d6,
      metalness: 0.35,
      roughness: 0.25,
      wireframe: false,
    });
    const tubeMesh = new THREE.Mesh(tubeGeom, ribbonMat);
    moleculeGroup.add(tubeMesh);

    // Add Alpha Helices & Beta Sheets procedural proxies
    for (let h = 0; h < 6; h++) {
      const angle = (h / 6) * Math.PI * 2;
      const cylGeom = new THREE.CylinderGeometry(0.45, 0.45, 2.8, 12);
      const cylMat = new THREE.MeshStandardMaterial({
        color: h % 2 === 0 ? 0x65cbf3 : 0x0053d6,
        metalness: 0.4,
        roughness: 0.2,
      });
      const cylMesh = new THREE.Mesh(cylGeom, cylMat);
      cylMesh.position.set(
        Math.cos(angle) * 3.5,
        (h - 2.5) * 1.4,
        Math.sin(angle) * 3.5
      );
      cylMesh.rotation.set(0.4, angle, 0.3);
      moleculeGroup.add(cylMesh);
    }

    // Add active catalytic ligand sphere cluster (e.g., Zinc ion / small molecule inhibitor)
    const zincGeom = new THREE.SphereGeometry(0.65, 16, 16);
    const zincMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 2.0,
      metalness: 0.8,
      roughness: 0.1,
    });
    const zincMesh = new THREE.Mesh(zincGeom, zincMat);
    zincMesh.position.set(0, 0.5, 0.5);
    moleculeGroup.add(zincMesh);

    scene.add(moleculeGroup);

    // Animation Loop
    let animId: number;
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      moleculeGroup.rotation.y += deltaX * 0.008;
      moleculeGroup.rotation.x += deltaY * 0.008;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isDragging) {
        moleculeGroup.rotation.y += 0.004;
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [protein, onExecuteCommand]);

  return (
    <div className="w-full h-full flex flex-col bg-[#070B12] text-gray-200 font-sans select-none overflow-hidden">
      {/* 1. TOP HEADER & QUICK-TRY EXAMPLE PILL BAR (Science Skill requirement) */}
      <div className="bg-[#0B111E] border-b border-[#1E293B] px-6 py-3 shrink-0 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#0053D6]/20 border border-[#0053D6] rounded text-[#65CBF3]">
            <Dna className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-black text-white tracking-wider">
                KNOCKSSTUDiOS // BIOMOLECULAR & GENOMICS SCOUT
              </span>
              <span className="px-2 py-0.5 bg-[#0053D6]/30 border border-[#0053D6] text-[10px] text-[#65CBF3] font-bold rounded">
                DEEPMIND SCIENCE ENGINE
              </span>
            </div>
            <div className="text-[11px] text-gray-400 font-mono">
              Structural Biology, AlphaFold DB v6, ClinVar Variants, & Target Pharmacophore Explorer
            </div>
          </div>
        </div>

        {/* Quick-Try Example Chips */}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-gray-400 uppercase font-semibold mr-1">QUICK TRY:</span>
          {Object.keys(PRESET_PROTEINS).map((key) => (
            <button
              key={key}
              onClick={() => {
                setActiveProteinKey(key);
                setSelectedDomain(null);
              }}
              className={`px-2.5 py-1 text-xs font-mono font-bold rounded transition-all ${
                activeProteinKey === key
                  ? 'bg-[#0053D6] text-white shadow-[0_0_12px_rgba(0,83,214,0.6)]'
                  : 'bg-[#1E293B] text-gray-300 hover:bg-[#334155]'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* 2. MAIN SPLIT WORKSPACE: 3D MOLECULAR CANVAS + SYNCHRONIZED INSPECTOR */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANE: 3D Molecular PBR Structure Viewer & AlphaFold Confidence Scale */}
        <div className="flex-1 flex flex-col border-r border-[#1E293B] relative min-w-0">
          {/* Top Canvas Bar with Provenance Badges */}
          <div className="bg-[#0B111E]/90 border-b border-[#1E293B] px-4 py-2 flex items-center justify-between text-xs z-10">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white">{protein.gene}</span>
              <span className="text-gray-400">({protein.uniprotId})</span>
              <span className="px-1.5 py-0.5 bg-emerald-950/60 border border-emerald-600/60 text-emerald-400 text-[10px] rounded font-mono">
                [Experimentally determined PDB: {protein.pdbId}]
              </span>
              <span className="px-1.5 py-0.5 bg-blue-950/60 border border-blue-600/60 text-blue-400 text-[10px] rounded font-mono">
                [AlphaFold DB v6 Predicted]
              </span>
            </div>

            <div className="flex items-center space-x-2 font-mono text-[11px]">
              <span className="text-gray-400">AVG pLDDT:</span>
              <span className="text-[#65CBF3] font-bold">{protein.avgPlddt}%</span>
            </div>
          </div>

          {/* Interactive 3D Canvas */}
          <div ref={canvasRef} className="flex-1 relative cursor-grab active:cursor-grabbing" />

          {/* Canonical 4-Band AlphaFold pLDDT Legend (Mandatory Science Skill guideline) */}
          <div className="absolute bottom-4 left-4 bg-[#0B111E]/95 border border-[#1E293B] p-2.5 rounded shadow-xl text-[10px] font-mono pointer-events-none space-y-1">
            <div className="text-gray-300 font-bold mb-1">ALPHAFOLD CONFIDENCE (pLDDT):</div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded bg-[#0053D6]" />
              <span className="text-gray-300">Very High (&gt;90)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded bg-[#65CBF3]" />
              <span className="text-gray-300">Confident (70-90)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded bg-[#FFDB13]" />
              <span className="text-gray-300">Low (50-70)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded bg-[#FF7D45]" />
              <span className="text-gray-300">Very Low (&lt;50)</span>
            </div>
          </div>

          {/* Outbound Authoritative Links */}
          <div className="absolute bottom-4 right-4 flex items-center space-x-2 text-[11px] font-mono">
            <a
              href={`https://www.rcsb.org/structure/${protein.pdbId}`}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 bg-[#1E293B] hover:bg-[#334155] border border-gray-600 rounded flex items-center space-x-1 text-gray-200"
            >
              <span>RCSB PDB</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href={`https://www.uniprot.org/uniprotkb/${protein.uniprotId}`}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 bg-[#1E293B] hover:bg-[#334155] border border-gray-600 rounded flex items-center space-x-1 text-gray-200"
            >
              <span>UniProtKB</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href={`https://alphafold.ebi.ac.uk/entry/${protein.uniprotId}`}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 bg-[#1E293B] hover:bg-[#334155] border border-gray-600 rounded flex items-center space-x-1 text-gray-200"
            >
              <span>AlphaFold DB</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* RIGHT PANE: Synchronized Tabular Data & Pharmacophore Inspector */}
        <div className="w-96 bg-[#090D16] flex flex-col shrink-0 overflow-hidden">
          {/* Tabs */}
          <div className="bg-[#0B111E] border-b border-[#1E293B] flex text-xs font-mono">
            <button
              onClick={() => setActiveTab('3d_fold')}
              className={`flex-1 py-2.5 text-center font-bold transition-all border-b-2 ${
                activeTab === '3d_fold'
                  ? 'border-[#0053D6] text-white bg-[#0053D6]/10'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              DOMAINS
            </button>
            <button
              onClick={() => setActiveTab('variants')}
              className={`flex-1 py-2.5 text-center font-bold transition-all border-b-2 ${
                activeTab === 'variants'
                  ? 'border-[#0053D6] text-white bg-[#0053D6]/10'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              VARIANTS
            </button>
            <button
              onClick={() => setActiveTab('pharmacology')}
              className={`flex-1 py-2.5 text-center font-bold transition-all border-b-2 ${
                activeTab === 'pharmacology'
                  ? 'border-[#0053D6] text-white bg-[#0053D6]/10'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              DRUGS & CHEM
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
            {/* Overview Card */}
            <div className="bg-[#0D1524] border border-[#1E293B] p-3 rounded space-y-1.5">
              <div className="text-[10px] text-gray-400 font-bold uppercase">TARGET PROFILE</div>
              <div className="text-sm font-bold text-white">{protein.name}</div>
              <div className="text-[11px] text-gray-400 leading-relaxed font-sans">{protein.description}</div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1E293B] text-[11px]">
                <div>
                  <span className="text-gray-500">LENGTH:</span>{' '}
                  <span className="text-gray-200 font-bold">{protein.length} aa</span>
                </div>
                <div>
                  <span className="text-gray-500">MASS:</span>{' '}
                  <span className="text-gray-200 font-bold">{protein.massDa.toLocaleString()} Da</span>
                </div>
              </div>
            </div>

            {/* DOMAINS TAB */}
            {activeTab === '3d_fold' && (
              <div className="space-y-2">
                <div className="text-[10px] text-gray-400 font-bold uppercase">FUNCTIONAL ARCHITECTURE:</div>
                {protein.domains.map((dom, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedDomain(dom.name)}
                    className={`p-2.5 border rounded cursor-pointer transition-all ${
                      selectedDomain === dom.name
                        ? 'bg-[#0053D6]/20 border-[#0053D6] text-white'
                        : 'bg-[#0B111E] border-[#1E293B] text-gray-300 hover:bg-[#152033]'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-[11px]">
                      <span>{dom.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: `${dom.color}25`, color: dom.color }}>
                        {dom.start} - {dom.end}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* VARIANTS TAB */}
            {activeTab === 'variants' && (
              <div className="space-y-2">
                <div className="text-[10px] text-gray-400 font-bold uppercase">CLINICAL VARIANTS (CLINVAR):</div>
                {protein.variants.map((v, i) => (
                  <div key={i} className="bg-[#0B111E] border border-[#1E293B] p-2.5 rounded space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-[12px]">{v.change}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          v.status === 'Pathogenic'
                            ? 'bg-red-950/70 border border-red-600 text-red-400'
                            : 'bg-emerald-950/70 border border-emerald-600 text-emerald-400'
                        }`}
                      >
                        {v.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400 leading-snug">{v.consequence}</div>
                    <div className="text-[9px] text-[#65CBF3]">{v.clinvarId}</div>
                  </div>
                ))}
              </div>
            )}

            {/* PHARMACOLOGY TAB */}
            {activeTab === 'pharmacology' && (
              <div className="space-y-2">
                <div className="text-[10px] text-gray-400 font-bold uppercase">CHEMBL & OPENTARGETS DRUGS:</div>
                {protein.drugs.map((d, i) => (
                  <div key={i} className="bg-[#0B111E] border border-[#1E293B] p-2.5 rounded space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#FACC15] text-[12px]">{d.name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-[#1E293B] text-gray-300 rounded font-bold">
                        {d.phase}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400">{d.mechanism}</div>
                    <div className="text-[9px] text-gray-500">{d.chemblId}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
