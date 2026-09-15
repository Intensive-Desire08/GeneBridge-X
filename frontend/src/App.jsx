import React, { useEffect } from 'react';
import * as THREE from 'three';
import './index.css';

function App() {
  useEffect(() => {
    
    
      // 1. Smooth entrance & active state for semicircular edge windows
      const glidePods = document.querySelectorAll('.glide-pod');
      const podObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('glide-left-hidden', 'glide-right-hidden');
            entry.target.classList.add('glide-visible');
          }
        });
      }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
      });
      glidePods.forEach(pod => podObserver.observe(pod));

      // 2. Interactive scroll progress tracker
      const progressBar = document.getElementById('scrollProgressBar');
      const updateScrollMetrics = () => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (totalHeight > 0 && progressBar) {
          const progress = (window.scrollY / totalHeight) * 100;
          progressBar.style.height = `${Math.min(Math.max(progress, 6), 100)}%`;
        }
      };
      window.addEventListener('scroll', updateScrollMetrics, { passive: true });

      // 3. Quick target chips & selector interaction
      const selector = document.getElementById('diseaseTargetSelector');
      const quickChips = document.querySelectorAll('.quick-chip');
      const startBtn = document.getElementById('startAnalysisBtn');

      quickChips.forEach(chip => {
        chip.addEventListener('click', () => {
          const targetVal = chip.getAttribute('data-target');
          chip.classList.add('scale-95');
          setTimeout(() => chip.classList.remove('scale-95'), 120);

          if (targetVal === 'EGFR T790M' && selector) selector.value = 'nsclc';
          if (targetVal === 'KRAS G12D' && selector) selector.value = 'crc';
          if (targetVal === 'HER2 Neu' && selector) selector.value = 'tnbc';
        });
      });

      if (startBtn) {
        startBtn.addEventListener('click', () => {
          const originalText = startBtn.innerHTML;
          startBtn.innerHTML = `
            <span class="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
            <span>Synthesizing Target Conformation...</span>
          `;
          startBtn.disabled = true;

          setTimeout(() => {
            startBtn.innerHTML = originalText;
            startBtn.disabled = false;
            const targetSection = document.getElementById('telemetry-section');
            if (targetSection) targetSection.scrollIntoView({ behavior: 'smooth' });
          }, 800);
        });
      }

      // 4. Enhanced High-Visibility Three.js Canvas:
      // Vibrant Greenish Fluid Sea at Hero -> Transitions to Radiant Multi-Color Double Helix DNA on Scroll
      const canvas = document.getElementById('bg-canvas');
      if (canvas && THREE) {
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 80);

        // A. Vibrant Greenish-Cyan Fluid Sea Mesh at Hero
        const seaCols = 64;
        const seaRows = 64;
        const seaGeometry = new THREE.PlaneGeometry(160, 120, seaCols, seaRows);
        const seaPos = seaGeometry.attributes.position;
        const origZ = new Float32Array(seaPos.count);
        for (let i = 0; i < seaPos.count; i++) {
          origZ[i] = seaPos.getZ(i);
        }

        // Palette for Fluid Sea: Crisp Emerald to Bright Cyan
        const colorsSea = new Float32Array(seaPos.count * 3);
        const cEmerald = new THREE.Color(0x10b981);
        const cTeal = new THREE.Color(0x06b6d4);
        const cRoyal = new THREE.Color(0x3b82f6);
        for (let i = 0; i < seaPos.count; i++) {
          const t = (seaPos.getX(i) + 80) / 160;
          const col = cEmerald.clone().lerp(t > 0.5 ? cTeal : cRoyal, 0.5);
          colorsSea[i * 3] = col.r;
          colorsSea[i * 3 + 1] = col.g;
          colorsSea[i * 3 + 2] = col.b;
        }
        seaGeometry.setAttribute('color', new THREE.BufferAttribute(colorsSea, 3));

        const seaMaterial = new THREE.MeshBasicMaterial({
          vertexColors: true,
          wireframe: true,
          transparent: true,
          opacity: 0.75
        });
        const seaMesh = new THREE.Mesh(seaGeometry, seaMaterial);
        seaMesh.rotation.x = -Math.PI / 3;
        seaMesh.position.set(0, 4, -10);
        scene.add(seaMesh);

        // B. RADIANT & LUMINOUS 3D DNA DOUBLE HELIX (High Visibility, Vibrant Particles & Rungs)
        const helixGroup = new THREE.Group();
        const helixPoints = 1100;
        const helixRadius = 16.5; // Wider for strong visual presence
        const helixHeight = 240;
        const turns = 6.5;

        const dnaGeometry = new THREE.BufferGeometry();
        const dnaPositions = new Float32Array(helixPoints * 3);
        const dnaColors = new Float32Array(helixPoints * 3);

        // Rich high-contrast colors
        const colorStrand1 = new THREE.Color(0x10b981); // Radiant Emerald
        const colorStrand2 = new THREE.Color(0x0284c7); // Vivid Azure / Cyan
        const colorRung1   = new THREE.Color(0xf59e0b); // Luminous Amber
        const colorRung2   = new THREE.Color(0x8b5cf6); // Vibrant Purple

        let idx = 0;
        for (let i = 0; i < helixPoints; i++) {
          const t = (i / helixPoints) * turns * Math.PI * 2;
          const y = (i / helixPoints) * helixHeight - helixHeight / 2;
          const modType = i % 4;

          let x, z, col;
          if (modType === 0) {
            // Strand A (Emerald)
            x = Math.cos(t) * helixRadius;
            z = Math.sin(t) * helixRadius;
            col = colorStrand1;
          } else if (modType === 1) {
            // Strand B (Azure Cyan)
            x = Math.cos(t + Math.PI) * helixRadius;
            z = Math.sin(t + Math.PI) * helixRadius;
            col = colorStrand2;
          } else if (modType === 2) {
            // Rung point (Amber)
            const interp = (Math.sin(i * 7) + 1) * 0.5;
            const xa = Math.cos(t) * helixRadius;
            const za = Math.sin(t) * helixRadius;
            const xb = Math.cos(t + Math.PI) * helixRadius;
            const zb = Math.sin(t + Math.PI) * helixRadius;
            x = xa + (xb - xa) * interp;
            z = za + (zb - za) * interp;
            col = colorRung1;
          } else {
            // Base pair accent node (Violet / Magenta)
            const interp = (Math.cos(i * 5) + 1) * 0.5;
            const xa = Math.cos(t) * helixRadius;
            const za = Math.sin(t) * helixRadius;
            const xb = Math.cos(t + Math.PI) * helixRadius;
            const zb = Math.sin(t + Math.PI) * helixRadius;
            x = xa + (xb - xa) * interp;
            z = za + (zb - za) * interp;
            col = colorRung2;
          }

          dnaPositions[idx] = x;
          dnaPositions[idx + 1] = y;
          dnaPositions[idx + 2] = z;

          dnaColors[idx] = col.r;
          dnaColors[idx + 1] = col.g;
          dnaColors[idx + 2] = col.b;
          idx += 3;
        }

        dnaGeometry.setAttribute('position', new THREE.BufferAttribute(dnaPositions, 3));
        dnaGeometry.setAttribute('color', new THREE.BufferAttribute(dnaColors, 3));

        // High-contrast glowing circular particle sprite
        const pCanvas = document.createElement('canvas');
        pCanvas.width = 128;
        pCanvas.height = 128;
        const pCtx = pCanvas.getContext('2d');
        const pGrad = pCtx.createRadialGradient(64, 64, 0, 64, 64, 60);
        pGrad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
        pGrad.addColorStop(0.25, 'rgba(255, 255, 255, 0.9)');
        pGrad.addColorStop(0.55, 'rgba(16, 185, 129, 0.7)');
        pGrad.addColorStop(0.85, 'rgba(14, 165, 233, 0.35)');
        pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        pCtx.fillStyle = pGrad;
        pCtx.fillRect(0, 0, 128, 128);
        const pTexture = new THREE.CanvasTexture(pCanvas);

        // Larger, more luminous particle material
        const dnaMaterial = new THREE.PointsMaterial({
          size: 4.6, // Prominent particle size
          vertexColors: true,
          map: pTexture,
          transparent: true,
          opacity: 0.2, // Will dynamically scale to 1.0 on scroll
          depthWrite: false,
          blending: THREE.NormalBlending
        });

        const dnaPoints = new THREE.Points(dnaGeometry, dnaMaterial);
        helixGroup.add(dnaPoints);

        // Add ambient floating molecular spheres for extra scientific depth
        const ambientGroup = new THREE.Group();
        const ambCount = 80;
        const ambGeo = new THREE.BufferGeometry();
        const ambPos = new Float32Array(ambCount * 3);
        const ambColors = new Float32Array(ambCount * 3);
        for (let i = 0; i < ambCount; i++) {
          ambPos[i * 3] = (Math.random() - 0.5) * 70;
          ambPos[i * 3 + 1] = (Math.random() - 0.5) * 200;
          ambPos[i * 3 + 2] = (Math.random() - 0.5) * 40;
          const rndCol = Math.random() > 0.5 ? colorStrand1 : colorStrand2;
          ambColors[i * 3] = rndCol.r;
          ambColors[i * 3 + 1] = rndCol.g;
          ambColors[i * 3 + 2] = rndCol.b;
        }
        ambGeo.setAttribute('position', new THREE.BufferAttribute(ambPos, 3));
        ambGeo.setAttribute('color', new THREE.BufferAttribute(ambColors, 3));
        const ambMat = new THREE.PointsMaterial({
          size: 3.2,
          map: pTexture,
          vertexColors: true,
          transparent: true,
          opacity: 0.45,
          depthWrite: false
        });
        const ambPoints = new THREE.Points(ambGeo, ambMat);
        helixGroup.add(ambPoints);

        helixGroup.position.set(0, 0, 0);
        helixGroup.rotation.z = -0.12;
        scene.add(helixGroup);

        // Scroll Tracking & Canvas Cross-Fade
        let scrollRatio = 0;
        const handleScroll = () => {
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          scrollRatio = maxScroll > 0 ? window.scrollY / maxScroll : 0;
        };
        window.addEventListener('scroll', handleScroll, { passive: true });

        // Animation Loop
        const clock = new THREE.Clock();
        const renderLoop = () => {
          requestAnimationFrame(renderLoop);
          const elapsed = clock.getElapsedTime();

          // 1. Fluid Sea Mesh Undulation
          const pos = seaGeometry.attributes.position;
          for (let i = 0; i < pos.count; i++) {
            const u = pos.getX(i) * 0.07;
            const v = pos.getY(i) * 0.07;
            const wave = Math.sin(u + elapsed * 1.8) * Math.cos(v + elapsed * 1.4) * 4.2 +
                         Math.sin(u * 1.6 - elapsed * 1.1) * 2.2;
            pos.setZ(i, origZ[i] + wave);
          }
          pos.needsUpdate = true;

          // 2. Dynamic Scroll Cross-Fade:
          // Near Top: Fluid sea is 0.75 opacity; DNA is faint (0.2)
          // Scrolled: Fluid sea drops to 0.0; DNA brightens to intense 1.0
          const seaTargetOpacity = Math.max(0.0, 1.0 - scrollRatio * 3.5);
          const dnaTargetOpacity = Math.min(1.0, scrollRatio * 2.5);

          seaMaterial.opacity += (seaTargetOpacity - seaMaterial.opacity) * 0.1;
          dnaMaterial.opacity += (dnaTargetOpacity - dnaMaterial.opacity) * 0.1;

          // Sea translates downward as user scrolls
          seaMesh.position.y = 4 - scrollRatio * 50;

          // DNA double helix rotates with scroll and time, creating dynamic testable feedback
          helixGroup.rotation.y = elapsed * 0.45 + (window.scrollY * 0.0032);
          helixGroup.position.y = -15 + scrollRatio * 35;

          renderer.render(scene, camera);
        };
        renderLoop();

        // Responsive Resize
        window.addEventListener('resize', () => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        });
      }
  }, []);

  return (
    <div className="min-h-[420vh] bg-transparent font-body text-[#0f172a] antialiased relative overflow-x-hidden selection:bg-emerald-500 selection:text-white">
      
{/* Dual-Mode Three.js WebGL Canvas (Fluid Sea into Radiant Luminous DNA Helix) */}
<canvas className="fixed inset-0 w-full h-full pointer-events-none z-0" id="bg-canvas"></canvas>
{/* Dynamic Contrast Layer & Telemetry Center Gradient Tunnel */}
<div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_25%,rgba(255,255,255,0.25)_0%,rgba(241,245,249,0.15)_60%,rgba(203,213,225,0.05)_100%)]"></div>
{/* Luminous Central Backdrop Glow for High-Contrast DNA Particles in Scroll Zone */}
<div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_50%_60%,rgba(15,23,42,0.12)_0%,rgba(15,23,42,0.02)_55%,transparent_75%)]"></div>
<div className="fixed inset-0 pointer-events-none z-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]"></div>
{/* Sticky Clinical Navigation Header */}
<header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-2xl border-b border-slate-200/90 shadow-[0_4px_24px_-2px_rgba(15,23,42,0.08)]">
<div className="h-16 w-full px-4 sm:px-8 flex items-center justify-between gap-4 max-w-7xl mx-auto">
<div className="flex items-center gap-3 cursor-pointer" onClick={() => { window.scrollTo({top: 0, behavior: 'smooth'}) }}>
<div className="relative w-10 h-10 rounded-xl bg-white shadow-md border border-slate-200/80 p-1 flex items-center justify-center">
<img alt="PhyloTargetX Logo" className="w-full h-full object-contain" src="/logo.svg"/>
</div>
<div className="flex flex-col">
<div className="flex items-center gap-2">
<span className="font-headline text-lg sm:text-xl text-[#0f172a] font-extrabold tracking-tight">PhyloTargetX</span>
<span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">v4.2 PRO</span>
</div>
<span className="font-mono text-[11px] text-[#475569] font-medium tracking-wide uppercase">Computational Oncology &amp; Target Identification</span>
</div>
</div>
<nav className="hidden lg:flex items-center gap-1.5 p-1 rounded-xl bg-slate-100/90 border border-slate-200/80 text-sm">
<button className="px-3.5 py-1.5 rounded-lg font-semibold bg-white text-emerald-700 shadow-sm border border-slate-200/60 transition-all hover:text-emerald-800" onClick={() => { document.getElementById('hero').scrollIntoView({behavior: 'smooth'}) }}>Dashboard</button>
<button className="px-3.5 py-1.5 rounded-lg font-semibold text-[#334155] hover:bg-white/80 hover:text-[#0f172a] transition-all" onClick={() => { document.getElementById('telemetry-section').scrollIntoView({behavior: 'smooth'}) }}>Crystallography</button>
<button className="px-3.5 py-1.5 rounded-lg font-semibold text-[#334155] hover:bg-white/80 hover:text-[#0f172a] transition-all" onClick={() => { document.getElementById('phylogenetics').scrollIntoView({behavior: 'smooth'}) }}>Phylogenetics</button>
<button className="px-3.5 py-1.5 rounded-lg font-semibold text-[#334155] hover:bg-white/80 hover:text-[#0f172a] transition-all" onClick={() => { document.getElementById('binding').scrollIntoView({behavior: 'smooth'}) }}>Affinity Pockets</button>
<button className="px-3.5 py-1.5 rounded-lg font-semibold text-[#334155] hover:bg-white/80 hover:text-[#0f172a] transition-all" onClick={() => { document.getElementById('variants').scrollIntoView({behavior: 'smooth'}) }}>Variant Atlas</button>
<button className="px-3.5 py-1.5 rounded-lg font-semibold text-[#334155] hover:bg-white/80 hover:text-[#0f172a] transition-all" onClick={() => { document.getElementById('protocol').scrollIntoView({behavior: 'smooth'}) }}>HSM Protocol</button>
</nav>
<div className="flex items-center gap-3">
<div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/90 shadow-sm">
<span className="relative flex h-2.5 w-2.5">
<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
<span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
</span>
<span className="font-mono text-xs text-emerald-900 font-bold">Pipeline Active</span>
</div>
<div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-200/90 text-sky-900">
<span className="material-symbols-outlined text-[16px] text-sky-600">sync_alt</span>
<span className="font-mono text-xs font-semibold">PDB / UniProt Synced</span>
</div>
<div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/30 cursor-pointer hover:scale-105 transition-transform">
<span className="material-symbols-outlined text-[18px]">biotech</span>
</div>
</div>
</div>
</header>
{/* Corner Telemetry HUD Coordinates (High Contrast) */}
<div className="fixed top-20 left-6 z-20 pointer-events-none hidden lg:flex flex-col gap-1 text-[#334155] font-mono text-[11px] font-semibold select-none bg-white/75 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
<span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>LAT 37.7749° N · LON 122.4194° W</span>
<span className="text-[#0f172a]">DISPERSION_INDEX: <strong className="text-sky-600">1.042 λ</strong></span>
<span className="text-emerald-700 tracking-wider">HELIX_AXIS // EGFR-T790M-V4</span>
</div>
<div className="fixed top-20 right-6 z-20 pointer-events-none hidden lg:flex flex-col items-end gap-1 text-[#334155] font-mono text-[11px] font-semibold select-none bg-white/75 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
<span className="text-[#0f172a]">CRYSTAL_RES: <strong className="text-indigo-600">1.84 Å</strong></span>
<span>CONVERGENCE: <strong className="text-emerald-700">1.0e-06</strong></span>
<span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300 text-[10px]">ISO 15189 CERTIFIED</span>
</div>
{/* Quick-Scroll Testable Navigation Rail & Progress (Interactive Dot Nav) */}
<nav aria-label="Section shortcuts" className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-end gap-3 pointer-events-auto">
<div className="p-2 rounded-2xl bg-white/90 backdrop-blur-xl border border-slate-200/90 shadow-xl flex flex-col gap-2.5 items-center">
{/* Progress bar track */}
<div className="w-1 h-28 bg-slate-200 rounded-full relative overflow-hidden mb-1">
<div className="absolute top-0 left-0 w-full bg-gradient-to-b from-emerald-500 via-sky-500 to-indigo-600 rounded-full transition-all duration-150" id="scrollProgressBar" style={{'height': '10%'}}></div>
</div>
{/* Dot Buttons with Clickable Smooth Scroll */}
<button className="nav-dot group relative flex items-center justify-center w-7 h-7 rounded-full text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-all active:scale-90" onClick={() => { document.getElementById('hero').scrollIntoView({behavior: 'smooth'}) }} title="00 Hero Overview">
<span className="w-2.5 h-2.5 rounded-full bg-emerald-600 group-hover:scale-125 transition-transform"></span>
<span className="absolute right-9 px-2.5 py-1 rounded-md bg-[#0f172a] text-white text-xs font-mono font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-lg">Hero Dashboard</span>
</button>
<button className="nav-dot group relative flex items-center justify-center w-7 h-7 rounded-full text-slate-500 hover:text-sky-700 hover:bg-sky-50 transition-all active:scale-90" onClick={() => { document.getElementById('telemetry-section').scrollIntoView({behavior: 'smooth'}) }} title="01 Active Target Pipeline">
<span className="w-2.5 h-2.5 rounded-full bg-sky-500 group-hover:scale-125 transition-transform"></span>
<span className="absolute right-9 px-2.5 py-1 rounded-md bg-[#0f172a] text-white text-xs font-mono font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-lg">01 Crystallography</span>
</button>
<button className="nav-dot group relative flex items-center justify-center w-7 h-7 rounded-full text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 transition-all active:scale-90" onClick={() => { document.getElementById('phylogenetics').scrollIntoView({behavior: 'smooth'}) }} title="02 Phylogenetic Drift">
<span className="w-2.5 h-2.5 rounded-full bg-indigo-500 group-hover:scale-125 transition-transform"></span>
<span className="absolute right-9 px-2.5 py-1 rounded-md bg-[#0f172a] text-white text-xs font-mono font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-lg">02 Phylogenetics</span>
</button>
<button className="nav-dot group relative flex items-center justify-center w-7 h-7 rounded-full text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition-all active:scale-90" onClick={() => { document.getElementById('binding').scrollIntoView({behavior: 'smooth'}) }} title="03 Structural Binding Pockets">
<span className="w-2.5 h-2.5 rounded-full bg-teal-500 group-hover:scale-125 transition-transform"></span>
<span className="absolute right-9 px-2.5 py-1 rounded-md bg-[#0f172a] text-white text-xs font-mono font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-lg">03 Binding Pockets</span>
</button>
<button className="nav-dot group relative flex items-center justify-center w-7 h-7 rounded-full text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-all active:scale-90" onClick={() => { document.getElementById('variants').scrollIntoView({behavior: 'smooth'}) }} title="04 Variant Atlas">
<span className="w-2.5 h-2.5 rounded-full bg-amber-500 group-hover:scale-125 transition-transform"></span>
<span className="absolute right-9 px-2.5 py-1 rounded-md bg-[#0f172a] text-white text-xs font-mono font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-lg">04 Variant Atlas</span>
</button>
<button className="nav-dot group relative flex items-center justify-center w-7 h-7 rounded-full text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-all active:scale-90" onClick={() => { document.getElementById('protocol').scrollIntoView({behavior: 'smooth'}) }} title="05 Protocol Enclave">
<span className="w-2.5 h-2.5 rounded-full bg-rose-500 group-hover:scale-125 transition-transform"></span>
<span className="absolute right-9 px-2.5 py-1 rounded-md bg-[#0f172a] text-white text-xs font-mono font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-lg">05 Batch Enclave</span>
</button>
</div>
</nav>
{/* Main Journey Container with Generous Scroll Spacing */}
<main className="relative z-10 w-full pt-16 flex flex-col gap-40 pb-44">
{/* SECTION 1: EXPANSIVE SEMICIRCLE CANOPY HERO (Translucent Wall-to-Wall Arch, Brand Title Image, Expansive Target Suite) */}
<section className="w-full min-h-[95vh] flex items-center justify-center pt-8 sm:pt-12 pb-6 px-0 relative overflow-hidden" id="hero">
{/* Majestic Semicircle Canopy touching edges and opening upward */}
<div className="w-full px-4 sm:px-8 md:px-14 lg:px-20 pt-16 sm:pt-20 pb-16 flex flex-col items-center text-center transition-all duration-300">
<div className="w-full max-w-6xl mx-auto flex flex-col items-center">
{/* Centered Emblem with Brand Logo */}
<div className="mb-4 relative group">
<div className="absolute -inset-3 bg-gradient-to-r from-emerald-500/30 via-teal-400/30 to-sky-500/30 rounded-3xl blur-xl opacity-80 group-hover:opacity-100 transition duration-500"></div>
<div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/90 shadow-[0_16px_36px_-8px_rgba(15,23,42,0.15)] border-2 border-white flex items-center justify-center p-2.5 transition-transform duration-300 hover:scale-105 backdrop-blur-md">
<img alt="PhyloTargetX Emblem" className="w-full h-full object-contain" src="/logo.png"/>
</div>
</div>
{/* Oncology Status Badge */}
<div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-xs mb-3">
<span className="relative flex h-2.5 w-2.5">
<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
<span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
</span>
<span className="font-mono text-xs text-emerald-950 uppercase font-bold tracking-wider">
          Bioinformatics &amp; Precision Oncology Suite
        </span>
</div>
{/* Brand Title Image Display */}
<div className="w-full my-2 flex justify-center">
<img alt="PhyloTargetX" className="h-20 sm:h-24 md:h-28 mx-auto object-contain my-3 drop-shadow-sm" src="/text-logo.svg"/>
</div>
{/* Relaxed Elegant Subtitle Paragraph */}
<p className="font-body text-base sm:text-lg md:text-xl text-[#334155] font-medium mt-1 max-w-3xl leading-relaxed">
        PhyloTargetX computes evolutionary conservation gradients, crystallographic pocket topologies, and drug sensitivity profiles across therapeutic oncogene mutations.
      </p>
{/* Expansive Wide Target Selection Suite */}
<div className="mt-8 w-full max-w-5xl mx-auto">
<div className="p-6 sm:p-8 lg:p-10 rounded-3xl bg-white/80 hover:bg-white/90 backdrop-blur-xl border border-white/60 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.12)] text-left transition-all">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
<label className="font-mono text-xs sm:text-sm font-bold text-[#1e293b] tracking-wider uppercase flex items-center gap-2" htmlFor="diseaseTargetSelector">
<span className="material-symbols-outlined text-[19px] text-emerald-600">target</span>
              Select Target Disease / Oncogenic Axis
            </label>
<span className="font-mono text-xs text-emerald-800 flex items-center gap-1.5 font-bold bg-emerald-100/90 px-3 py-1 rounded-full border border-emerald-300 w-fit">
<span className="material-symbols-outlined text-[14px] text-emerald-700">verified</span>
              PDB 7A2A Validated
            </span>
</div>
{/* Select Trigger & Hot Chips in Expansive Horizontal Grid */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
{/* Dropdown: Spans 7 cols on large screens */}
<div className="lg:col-span-7 relative group">
<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-600">
<span className="material-symbols-outlined text-[22px]">biotech</span>
</div>
<select defaultValue="nsclc" className="w-full pl-12 pr-11 py-4 rounded-2xl bg-slate-50/90 text-[#0f172a] font-body text-sm sm:text-base font-semibold border-2 border-slate-200 shadow-inner appearance-none focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/20 transition-all cursor-pointer" id="diseaseTargetSelector">
<option value="nsclc">Non-small cell lung cancer (NSCLC) — EGFR / KRAS / ALK</option>
<option value="tnbc">Triple-negative breast cancer (TNBC) — PARP1 / Trop-2</option>
<option value="gbm">Glioblastoma Multiforme (GBM) — IDH1 / MGMT / EGFRvIII</option>
<option value="crc">Colorectal Adenocarcinoma (CRC) — BRAF V600E / APC</option>
<option value="aml">Acute Myeloid Leukemia (AML) — FLT3 / NPM1 / DNMT3A</option>
</select>
<div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-[#475569] group-hover:text-[#0f172a] transition-colors">
<span className="material-symbols-outlined text-[24px]">expand_more</span>
</div>
</div>
{/* Hot Target Quick Chips: Spans 5 cols on large screens */}
<div className="lg:col-span-5 flex flex-wrap items-center gap-2">
<span className="font-mono text-xs text-[#475569] font-bold mr-1">Hot Targets:</span>
<button className="quick-chip px-3.5 py-2 rounded-xl bg-emerald-50/90 hover:bg-emerald-600 text-emerald-900 hover:text-white border border-emerald-300 font-mono text-xs font-bold transition-all duration-150 active:scale-95 shadow-xs" data-target="EGFR T790M" type="button">
                EGFR T790M
              </button>
<button className="quick-chip px-3.5 py-2 rounded-xl bg-sky-50/90 hover:bg-sky-600 text-sky-900 hover:text-white border border-sky-300 font-mono text-xs font-bold transition-all duration-150 active:scale-95 shadow-xs" data-target="KRAS G12D" type="button">
                KRAS G12D
              </button>
<button className="quick-chip px-3.5 py-2 rounded-xl bg-purple-50/90 hover:bg-purple-600 text-purple-900 hover:text-white border border-purple-300 font-mono text-xs font-bold transition-all duration-150 active:scale-95 shadow-xs" data-target="HER2 Neu" type="button">
                HER2 Neu
              </button>
<button className="quick-chip px-3 py-2 rounded-xl bg-slate-100/90 hover:bg-slate-200 text-[#334155] font-mono text-xs font-bold border border-slate-300 transition-all duration-150 flex items-center gap-1 shadow-xs" data-target="Custom Upload" type="button">
<span className="material-symbols-outlined text-[14px]">upload_file</span>
                Custom FASTA
              </button>
</div>
</div>
{/* Primary Action Row with Generous Spacing */}
<div className="mt-6 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
<button className="w-full sm:w-auto flex-1 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-headline text-base font-bold shadow-lg shadow-emerald-700/30 hover:shadow-xl hover:shadow-emerald-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2.5 group cursor-pointer" id="startAnalysisBtn" type="button">
<span>Start Target Analysis</span>
<span className="material-symbols-outlined text-[20px] transition-transform duration-200 group-hover:translate-x-1">
                arrow_forward
              </span>
</button>
<button className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/90 hover:bg-white text-[#1e293b] font-body text-sm font-bold border border-slate-300 transition-all duration-150 flex items-center justify-center gap-2 shadow-xs" onClick={() => { document.getElementById('telemetry-section').scrollIntoView({behavior: 'smooth'}) }} type="button">
<span className="material-symbols-outlined text-[19px] text-slate-700">insights</span>
<span>Inspect Telemetry</span>
</button>
</div>
</div>
</div>
{/* Testable Scroll Prompter */}
<div className="mt-10 flex flex-col items-center">
<button className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/85 hover:bg-white text-slate-800 text-xs font-mono font-bold border border-slate-300 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer animate-bounce hover:animate-none" onClick={() => { document.getElementById('telemetry-section').scrollIntoView({behavior: 'smooth'}) }}>
<span>Scroll to Explore Telemetry &amp; DNA Helix</span>
<span className="material-symbols-outlined text-[16px] text-emerald-600">arrow_downward</span>
</button>
<div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-[#475569] font-mono text-xs font-medium">
<span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[15px] text-emerald-600">verified</span> ISO 15189 Certified</span>
<span>•</span>
<span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[15px] text-sky-600">security</span> Zero-Knowledge Enclave</span>
<span>•</span>
<span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[15px] text-indigo-600">memory</span> 32x H100 SXM5 GPU</span>
</div>
</div>
</div>
</div>
</section>
{/* SECTION 2 / POD 1: Active Target Pipeline & Crystallographic Telemetry (RIGHT-ATTACHED SEMICIRCULAR WINDOW) */}
<section className="w-full flex justify-end items-center px-0" id="telemetry-section">
<div className="glide-pod glide-right-hidden w-full sm:max-w-2xl lg:max-w-3xl right-0 rounded-l-[260px] sm:rounded-l-[320px] p-8 sm:p-12 pl-16 sm:pl-28 bg-white/90 hover:bg-white/95 backdrop-blur-2xl border-2 border-r-0 border-slate-300/80 shadow-[0_25px_60px_-10px_rgba(15,23,42,0.18)] relative transition-all">
{/* Gradient indicator edge glow */}
<div className="absolute left-0 top-1/4 bottom-1/4 w-2 bg-gradient-to-b from-sky-500 via-emerald-500 to-indigo-600 rounded-r-full shadow-md"></div>
<div className="max-w-xl ml-auto text-left">
<div className="flex items-center gap-2 mb-3">
<span className="px-3 py-1 rounded-full bg-sky-100 text-sky-900 border border-sky-300 font-mono text-xs uppercase font-extrabold">
Telemetry Module 01
</span>
<span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold border border-emerald-300">
1.84 Å Resolution
</span>
</div>
<h2 className="font-headline text-2xl sm:text-3xl text-[#0f172a] font-extrabold tracking-tight">
Active Target Pipeline &amp; Crystallographic Telemetry
</h2>
<p className="font-body text-sm sm:text-base text-[#334155] font-medium mt-2 leading-relaxed">
High-definition electron density maps extracted from crystalline diffraction data, verified against cryo-EM structures with zero steric clashes.
</p>
{/* 3 Telemetry Cards with High Contrast */}
<div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 mt-6">
<div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
<span className="font-mono text-[11px] text-[#475569] font-bold uppercase block">Kinase Target</span>
<span className="font-headline text-lg sm:text-xl text-[#0f172a] font-extrabold mt-1 block">EGFR (7A2A)</span>
<span className="font-mono text-xs text-emerald-700 font-bold mt-1 flex items-center gap-1">
<span className="w-2 h-2 rounded-full bg-emerald-600"></span> Wild-type + T790M
</span>
</div>
<div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
<span className="font-mono text-[11px] text-[#475569] font-bold uppercase block">Pocket Volume</span>
<span className="font-headline text-lg sm:text-xl text-[#0f172a] font-extrabold mt-1 block">482.6 Å³</span>
<span className="font-mono text-xs text-[#334155] font-semibold mt-1 block">Cavity Depth: 14.2 Å</span>
</div>
<div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-xs col-span-2 sm:col-span-1">
<span className="font-mono text-[11px] text-emerald-900 font-bold uppercase block">AlphaFold-v3 pLDDT</span>
<span className="font-headline text-lg sm:text-xl text-emerald-800 font-extrabold mt-1 block">96.8 / 100</span>
<span className="font-mono text-xs text-emerald-700 font-bold mt-1 block">Ultra-high fidelity</span>
</div>
</div>
{/* Crystallographic Progress Metric */}
<div className="mt-5 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col gap-2.5">
<div className="flex items-center justify-between font-mono text-xs font-bold">
<span className="text-[#0f172a]">Crystallographic Electron Density Fit (R-free)</span>
<span className="text-emerald-700 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">0.198 (Optimal)</span>
</div>
<div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
<div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full" style={{'width': '88%'}}></div>
</div>
<div className="flex items-center justify-between font-mono text-xs text-[#475569] font-semibold">
<span>Backbone RMSD: 0.28 Å</span>
<span>Diffraction Space Group: P 21 21 21</span>
</div>
</div>
</div>
</div>
</section>
{/* SECTION 3 / POD 2: Phylogenetic Sequence Conservation & Ortholog Drift (LEFT-ATTACHED SEMICIRCULAR WINDOW) */}
<section className="w-full flex justify-start items-center px-0" id="phylogenetics">
<div className="glide-pod glide-left-hidden w-full sm:max-w-2xl lg:max-w-3xl left-0 rounded-r-[260px] sm:rounded-r-[320px] p-8 sm:p-12 pr-16 sm:pr-28 bg-white/90 hover:bg-white/95 backdrop-blur-2xl border-2 border-l-0 border-slate-300/80 shadow-[0_25px_60px_-10px_rgba(15,23,42,0.18)] relative transition-all">
{/* Gradient indicator edge glow */}
<div className="absolute right-0 top-1/4 bottom-1/4 w-2 bg-gradient-to-b from-indigo-500 via-purple-500 to-sky-500 rounded-l-full shadow-md"></div>
<div className="max-w-xl text-left">
<div className="flex items-center gap-2 mb-3">
<span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-300 font-mono text-xs uppercase font-extrabold">
Evolutionary Telemetry 02
</span>
<span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 font-bold border border-purple-300">
48 Orthologs Aligned
</span>
</div>
<h2 className="font-headline text-2xl sm:text-3xl text-[#0f172a] font-extrabold tracking-tight">
Phylogenetic Sequence Conservation &amp; Ortholog Drift
</h2>
<p className="font-body text-sm sm:text-base text-[#334155] font-medium mt-2 leading-relaxed">
Cross-species deep multiple sequence alignment separates strictly conserved kinase catalytic cores from hypervariable peripheral loops that facilitate drug resistance.
</p>
{/* Conservation Cards with Distinct Colors */}
<div className="mt-6 space-y-3.5">
<div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
<div className="flex items-center justify-between font-body text-sm">
<span className="font-bold text-[#0f172a] flex items-center gap-2">
<span className="material-symbols-outlined text-emerald-600 text-[20px]">nature_people</span>
Mammalia &amp; Primates Clade (Orthology)
</span>
<span className="font-mono text-xs font-extrabold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-300">94.2% Conserved</span>
</div>
<div className="w-full bg-emerald-200/50 rounded-full h-2.5 mt-2.5 overflow-hidden">
<div className="bg-emerald-600 h-full rounded-full" style={{'width': '94.2%'}}></div>
</div>
<div className="flex justify-between items-center font-mono text-xs text-[#334155] font-semibold mt-2">
<span>Ka/Ks Evolutionary Ratio: 0.114 (Strong Purifying Selection)</span>
<span className="text-emerald-800 font-bold">p &lt; 0.0001</span>
</div>
</div>
<div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200">
<div className="flex items-center justify-between font-body text-sm">
<span className="font-bold text-[#0f172a] flex items-center gap-2">
<span className="material-symbols-outlined text-indigo-600 text-[20px]">pets</span>
Vertebrata Extended Clade
</span>
<span className="font-mono text-xs font-extrabold text-indigo-800 bg-white px-2 py-0.5 rounded border border-indigo-300">81.7% Conserved</span>
</div>
<div className="w-full bg-indigo-200/50 rounded-full h-2.5 mt-2.5 overflow-hidden">
<div className="bg-indigo-600 h-full rounded-full" style={{'width': '81.7%'}}></div>
</div>
<div className="flex justify-between items-center font-mono text-xs text-[#334155] font-semibold mt-2">
<span>ATP binding loop invariant across 420 Myr</span>
<span>ClustalOmega v2.1</span>
</div>
</div>
</div>
<div className="mt-4 flex items-center gap-2 font-mono text-xs text-emerald-900 font-bold bg-white p-3 rounded-xl border border-slate-200">
<span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
<span>Conserved Kinase Triad: Lys745 — Glu762 — Asp855 perfectly aligned</span>
</div>
</div>
</div>
</section>
{/* SECTION 4 / POD 3: Structural Binding Pockets & Small Molecule Affinity (RIGHT-ATTACHED SEMICIRCULAR WINDOW) */}
<section className="w-full flex justify-end items-center px-0" id="binding">
<div className="glide-pod glide-right-hidden w-full sm:max-w-2xl lg:max-w-3xl right-0 rounded-l-[260px] sm:rounded-l-[320px] p-8 sm:p-12 pl-16 sm:pl-28 bg-white/90 hover:bg-white/95 backdrop-blur-2xl border-2 border-r-0 border-slate-300/80 shadow-[0_25px_60px_-10px_rgba(15,23,42,0.18)] relative transition-all">
{/* Gradient indicator edge glow */}
<div className="absolute left-0 top-1/4 bottom-1/4 w-2 bg-gradient-to-b from-teal-500 via-sky-500 to-blue-600 rounded-r-full shadow-md"></div>
<div className="max-w-xl ml-auto text-left">
<div className="flex items-center gap-2 mb-3">
<span className="px-3 py-1 rounded-full bg-teal-100 text-teal-900 border border-teal-300 font-mono text-xs uppercase font-extrabold">
Biophysical Telemetry 03
</span>
<span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold border border-emerald-300">
Docking Energy Validated
</span>
</div>
<h2 className="font-headline text-2xl sm:text-3xl text-[#0f172a] font-extrabold tracking-tight">
Structural Binding Pockets &amp; Small Molecule Affinity
</h2>
<p className="font-body text-sm sm:text-base text-[#334155] font-medium mt-2 leading-relaxed">
Thermodynamic binding free energy (ΔG) and covalent binding profiles calculated for flagship FDA-approved targeted kinase inhibitors.
</p>
<div className="mt-6 space-y-3">
{/* Osimertinib */}
<div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-300/80 flex items-center justify-between shadow-xs">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-mono text-xs font-extrabold shadow-sm">
3rd
</div>
<div>
<span className="font-headline text-base text-[#0f172a] font-extrabold block">Osimertinib (AZD9291)</span>
<span className="font-mono text-xs text-[#334155] font-medium">Irreversible Covalent · Cys797 Targeting</span>
</div>
</div>
<div className="text-right">
<span className="font-mono text-sm font-extrabold text-emerald-800 block">Kd = 0.52 nM</span>
<span className="font-mono text-xs text-[#475569] font-bold">ΔG: -12.4 kcal/mol</span>
</div>
</div>
{/* Gefitinib */}
<div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-300/80 flex items-center justify-between shadow-xs">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-mono text-xs font-extrabold shadow-sm">
1st
</div>
<div>
<span className="font-headline text-base text-[#0f172a] font-extrabold block">Gefitinib (Iressa)</span>
<span className="font-mono text-xs text-[#334155] font-medium">Reversible ATP-Competitive Inhibitor</span>
</div>
</div>
<div className="text-right">
<span className="font-mono text-sm font-extrabold text-sky-800 block">Kd = 3.20 nM</span>
<span className="font-mono text-xs text-[#475569] font-bold">ΔG: -9.8 kcal/mol</span>
</div>
</div>
{/* Erlotinib */}
<div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between shadow-xs">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-xl bg-slate-700 text-white flex items-center justify-center font-mono text-xs font-extrabold shadow-sm">
1st
</div>
<div>
<span className="font-headline text-base text-[#0f172a] font-extrabold block">Erlotinib (Tarceva)</span>
<span className="font-mono text-xs text-[#334155] font-medium">Quinazoline Ring · H-Bond Met793</span>
</div>
</div>
<div className="text-right">
<span className="font-mono text-sm font-extrabold text-slate-800 block">Kd = 2.85 nM</span>
<span className="font-mono text-xs text-[#475569] font-bold">ΔG: -10.1 kcal/mol</span>
</div>
</div>
</div>
</div>
</div>
</section>
{/* SECTION 5 / POD 4: Variant Atlas & Somatic Allele Frequency (LEFT-ATTACHED SEMICIRCULAR WINDOW) */}
<section className="w-full flex justify-start items-center px-0" id="variants">
<div className="glide-pod glide-left-hidden w-full sm:max-w-2xl lg:max-w-3xl left-0 rounded-r-[260px] sm:rounded-r-[320px] p-8 sm:p-12 pr-16 sm:pr-28 bg-white/90 hover:bg-white/95 backdrop-blur-2xl border-2 border-l-0 border-slate-300/80 shadow-[0_25px_60px_-10px_rgba(15,23,42,0.18)] relative transition-all">
{/* Gradient indicator edge glow */}
<div className="absolute right-0 top-1/4 bottom-1/4 w-2 bg-gradient-to-b from-amber-500 via-rose-500 to-purple-600 rounded-l-full shadow-md"></div>
<div className="max-w-xl text-left">
<div className="flex items-center gap-2 mb-3">
<span className="px-3 py-1 rounded-full bg-amber-100 text-amber-950 border border-amber-300 font-mono text-xs uppercase font-extrabold">
Genomic Atlas 04
</span>
<span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 font-bold border border-rose-300">
ClinVar &amp; COSMIC v99
</span>
</div>
<h2 className="font-headline text-2xl sm:text-3xl text-[#0f172a] font-extrabold tracking-tight">
Variant Atlas &amp; Allele Frequency Distribution
</h2>
<p className="font-body text-sm sm:text-base text-[#334155] font-medium mt-2 leading-relaxed">
Real-time somatic prevalence tracking monitors drug resistance gatekeeper mutations and secondary bypass escape trajectories in patient cohorts.
</p>
{/* 3 Variant Cards with Rich Alert Accents */}
<div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
{/* Variant 1 */}
<div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-300">
<div className="flex items-center justify-between">
<span className="font-headline text-lg font-extrabold text-[#0f172a]">T790M</span>
<span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 font-extrabold">Gatekeeper</span>
</div>
<span className="font-mono text-xs text-[#475569] block mt-1">Exon 20 steric clash</span>
<div className="mt-3">
<span className="font-headline text-xl text-rose-700 font-extrabold">52.8%</span>
<span className="font-mono text-xs text-[#334155] font-medium block">1st-gen relapse allele</span>
</div>
</div>
{/* Variant 2 */}
<div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-300">
<div className="flex items-center justify-between">
<span className="font-headline text-lg font-extrabold text-[#0f172a]">C797S</span>
<span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 font-extrabold">3rd-Gen Res</span>
</div>
<span className="font-mono text-xs text-[#475569] block mt-1">Loss of covalent thiol</span>
<div className="mt-3">
<span className="font-headline text-xl text-amber-700 font-extrabold">14.6%</span>
<span className="font-mono text-xs text-[#334155] font-medium block">Post-Osimertinib rel.</span>
</div>
</div>
{/* Variant 3 */}
<div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-300">
<div className="flex items-center justify-between">
<span className="font-headline text-lg font-extrabold text-[#0f172a]">L858R</span>
<span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-extrabold">Sensitizing</span>
</div>
<span className="font-mono text-xs text-[#475569] block mt-1">Exon 21 activation</span>
<div className="mt-3">
<span className="font-headline text-xl text-emerald-700 font-extrabold">41.2%</span>
<span className="font-mono text-xs text-[#334155] font-medium block">Primary driver oncogene</span>
</div>
</div>
</div>
<div className="mt-4 p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between font-mono text-xs text-[#334155] font-bold shadow-xs">
<span className="flex items-center gap-2">
<span className="material-symbols-outlined text-emerald-600 text-[18px]">query_stats</span>
Cross-referenced against 14,800 patient NGS panels
</span>
<span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">gnomAD v4.1 Synced</span>
</div>
</div>
</div>
</section>
{/* SECTION 6 / POD 5: Batch Protocol Execution & HSM Enclave Telemetry (RIGHT-ATTACHED SEMICIRCULAR WINDOW) */}
<section className="w-full flex justify-end items-center px-0" id="protocol">
<div className="glide-pod glide-right-hidden w-full sm:max-w-2xl lg:max-w-3xl right-0 rounded-l-[260px] sm:rounded-l-[320px] p-8 sm:p-12 pl-16 sm:pl-28 bg-white/90 hover:bg-white/95 backdrop-blur-2xl border-2 border-r-0 border-slate-300/80 shadow-[0_25px_60px_-10px_rgba(15,23,42,0.18)] relative transition-all">
{/* Gradient indicator edge glow */}
<div className="absolute left-0 top-1/4 bottom-1/4 w-2 bg-gradient-to-b from-rose-500 via-purple-600 to-indigo-700 rounded-r-full shadow-md"></div>
<div className="max-w-xl ml-auto text-left">
<div className="flex items-center gap-2 mb-3">
<span className="px-3 py-1 rounded-full bg-rose-100 text-rose-950 border border-rose-300 font-mono text-xs uppercase font-extrabold">
Execution Telemetry 05
</span>
<span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-950 font-bold border border-emerald-300 flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span> HSM Enclave Active
</span>
</div>
<h2 className="font-headline text-2xl sm:text-3xl text-[#0f172a] font-extrabold tracking-tight">
Batch Protocol Execution &amp; Enclave Telemetry
</h2>
<p className="font-body text-sm sm:text-base text-[#334155] font-medium mt-2 leading-relaxed">
Zero-knowledge hardware security modules (HSM) guarantee non-disclosure of proprietary lead compound chemical graphs during high-throughput evolutionary docking.
</p>
<div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 font-mono text-xs font-semibold">
<div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
<span className="text-[#475569]">Enclave Cryptographic Hash</span>
<span className="text-[#0f172a] font-bold">SHA-256: 0x9FD8...24B7</span>
</div>
<div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
<span className="text-[#475569]">GPU Cluster Allocations</span>
<span className="text-emerald-700 font-extrabold">32x NVIDIA H100 SXM5 (ESM-2 Dedicated)</span>
</div>
<div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
<span className="text-[#475569]">Inference Latency Target</span>
<span className="text-[#0f172a] font-extrabold">12.4 ms per residue pocket</span>
</div>
<div className="flex items-center justify-between">
<span className="text-[#475569]">Regulatory Audit Trail</span>
<span className="text-indigo-800 font-bold">FDA 21 CFR Part 11 Compliant</span>
</div>
</div>
{/* Action Buttons */}
<div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
<button className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-headline text-sm font-bold shadow-lg shadow-emerald-700/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer" type="button">
<span className="material-symbols-outlined text-[19px]">terminal</span>
<span>Launch Enclave Batch Job</span>
</button>
<button className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white border border-slate-300 hover:bg-slate-100 text-[#1e293b] font-body text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2" type="button">
<span className="material-symbols-outlined text-[18px] text-slate-600">download</span>
<span>Export Telemetry (JSON)</span>
</button>
</div>
</div>
</div>
</section>
</main>
{/* Clinical Sticky Footer */}
<footer className="w-full bg-white/95 backdrop-blur-xl border-t border-slate-200 py-6 relative z-20 shadow-md">
<div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs text-[#475569] font-medium">
<div className="flex flex-wrap items-center gap-3 sm:gap-4">
<div className="flex items-center gap-2">
<img alt="PhyloTargetX Icon" className="w-5 h-5 object-contain" src="https://lh3.googleusercontent.com/aida/AEtjO1XuYAURhcHomD0D4br43aW3mgKhDBEKvuIUAwUz7IdtRapSYQLaOB5P6u4JDBNvHAergXBEs3QB4skH5Vw7afa_vo5KhgFTNWliC_aomYeDvkNPHgw5mqR7OAMTV3k-B4Iz_Prg0bsmHcyUGqK07n-IhFF-2qmj7uGrHycrPzCnXksWjtiYFup0CYitdszJM8-kwKSOiJzk6bHXmH0NM8kokiPaVubfTkyIMBPlSCqkJaGHrErI28H4meDQ"/>
<span className="font-bold text-[#0f172a]">PhyloTargetX Platform</span>
</div>
<span>•</span>
<span>© 2025 Biologics Computational Lab</span>
<span>•</span>
<span className="text-emerald-700 font-bold">21 CFR Part 11 Active</span>
</div>
<div className="flex items-center gap-4">
<span>Genome: <strong className="text-[#0f172a]">GRCh38.p14</strong></span>
<span>•</span>
<span>Engine: <strong className="text-[#0f172a]">BLAST+ 2.15.0</strong></span>
</div>
</div>
</footer>


    </div>
  );
}

export default App;
