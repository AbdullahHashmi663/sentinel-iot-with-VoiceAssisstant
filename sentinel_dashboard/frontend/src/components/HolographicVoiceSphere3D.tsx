// ==============================================================================
// SENTINEL-IOT: 3D HOLOGRAPHIC ACOUSTIC SPHERE (STITCH FUTURISTIC HUD)
// Real-Time Three.js Tactical Audio Sphere • Orbital Gyro Reticles • FFT Modulation
// ==============================================================================

"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface HolographicVoiceSphere3DProps {
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  isAlert?: boolean;
  className?: string;
}

export default function HolographicVoiceSphere3D({
  isListening,
  isSpeaking,
  isThinking,
  isAlert = false,
  className = ""
}: HolographicVoiceSphere3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef({ isListening, isSpeaking, isThinking, isAlert });

  useEffect(() => {
    stateRef.current = { isListening, isSpeaking, isThinking, isAlert };
  }, [isListening, isSpeaking, isThinking, isAlert]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 320;

    // 1. Scene & Perspective Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 0, 8);

    // 2. WebGL Renderer with Alpha & Antialiasing
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // 3. Tactical Cyber Color Matrix
    const cyanColor = new THREE.Color(0x00f0ff);
    const emeraldColor = new THREE.Color(0x00ff66);
    const amberColor = new THREE.Color(0xffb700);
    const crimsonColor = new THREE.Color(0xff2a5f);

    // 4. Core Pulsing Holographic Icosahedron Wireframe
    const innerGeo = new THREE.IcosahedronGeometry(2.0, 3);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    scene.add(innerMesh);

    // 5. Audio Particle Cloud (Neural Lattice Points)
    const particleCount = 750;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const originalRadii = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 2.4 + Math.random() * 0.4;
      originalRadii[i] = r;

      particlePos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      particlePos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePos[i * 3 + 2] = r * Math.cos(phi);
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x00ffcc,
      size: 0.08,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 6. Orbital Gyro Tactical Reticle Rings
    function createReticleRing(radius: number, tube: number, segments: number, colorHex: number, tiltX: number, tiltY: number) {
      const ringGeo = new THREE.TorusGeometry(radius, tube, 6, segments);
      const ringMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        wireframe: true,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = tiltX;
      ringMesh.rotation.y = tiltY;
      scene.add(ringMesh);
      return { ringMesh, ringMat };
    }

    const ring1 = createReticleRing(3.2, 0.02, 64, 0x00f0ff, Math.PI / 3, 0.2);
    const ring2 = createReticleRing(3.6, 0.015, 48, 0x00ff66, -Math.PI / 4, 0.5);
    const ring3 = createReticleRing(2.9, 0.025, 32, 0x3b82f6, 0.5, -Math.PI / 3);

    // 7. Central Glowing Core Beacon
    const coreGeo = new THREE.SphereGeometry(0.8, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      wireframe: false,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // Responsive Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 400;
      const h = container.clientHeight || 320;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // 8. Animation & Waveform Modulation Loop
    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const { isListening: listening, isSpeaking: speaking, isThinking: thinking, isAlert: alert } = stateRef.current;

      // Color reactivity
      if (alert) {
        innerMat.color.copy(crimsonColor);
        particleMat.color.copy(crimsonColor);
        coreMat.color.copy(crimsonColor);
      } else if (speaking) {
        innerMat.color.copy(emeraldColor);
        particleMat.color.copy(emeraldColor);
        coreMat.color.copy(emeraldColor);
      } else if (listening) {
        innerMat.color.copy(cyanColor);
        particleMat.color.copy(cyanColor);
        coreMat.color.copy(cyanColor);
      } else if (thinking) {
        innerMat.color.copy(amberColor);
        particleMat.color.copy(amberColor);
        coreMat.color.copy(amberColor);
      } else {
        innerMat.color.copy(cyanColor);
        particleMat.color.copy(cyanColor);
        coreMat.color.copy(cyanColor);
      }

      // Dynamic rotation speeds based on activity
      const rotSpeed = speaking ? 0.7 : listening ? 0.5 : thinking ? 0.9 : 0.3;
      innerMesh.rotation.x = t * (0.25 * rotSpeed * 3);
      innerMesh.rotation.y = t * (0.35 * rotSpeed * 3);

      const pulseAmp = speaking ? 0.18 : listening ? 0.12 : thinking ? 0.15 : 0.06;
      const pulseFreq = speaking ? 6.0 : listening ? 4.5 : 2.5;
      const pulse = 1 + Math.sin(t * pulseFreq) * pulseAmp;
      innerMesh.scale.set(pulse, pulse, pulse);

      // Audio waveform simulation on particle cloud
      const posArray = particleGeo.attributes.position.array as Float32Array;
      const modSpeed = speaking ? 9.0 : listening ? 6.0 : 3.5;
      const modAmp1 = speaking ? 0.35 : listening ? 0.22 : 0.14;
      const modAmp2 = speaking ? 0.25 : listening ? 0.15 : 0.08;

      for (let i = 0; i < particleCount; i++) {
        const origR = originalRadii[i];
        const modulation =
          Math.sin(t * modSpeed + i * 0.15) * modAmp1 +
          Math.cos(t * (modSpeed * 0.6) + i * 0.3) * modAmp2;
        const currentR = origR + modulation;

        const x = posArray[i * 3];
        const y = posArray[i * 3 + 1];
        const z = posArray[i * 3 + 2];
        const len = Math.sqrt(x * x + y * y + z * z) || 1;

        posArray[i * 3] = (x / len) * currentR;
        posArray[i * 3 + 1] = (y / len) * currentR;
        posArray[i * 3 + 2] = (z / len) * currentR;
      }
      particleGeo.attributes.position.needsUpdate = true;

      particleSystem.rotation.y = -t * (0.15 * rotSpeed * 3);
      particleSystem.rotation.x = Math.sin(t * 0.2) * 0.2;

      // Reticle rings counter-rotation
      ring1.ringMesh.rotation.z = t * 0.4 * (listening || speaking ? 1.5 : 1.0);
      ring2.ringMesh.rotation.z = -t * 0.3 * (listening || speaking ? 1.5 : 1.0);
      ring3.ringMesh.rotation.x = Math.PI / 4 + Math.sin(t * 0.5) * 0.2;
      ring3.ringMesh.rotation.z = t * 0.25 * (thinking ? 2.0 : 1.0);

      // Central beacon core pulse
      const coreSpeed = speaking ? 8.0 : listening ? 5.5 : 3.0;
      const corePulse = 0.8 + Math.sin(t * coreSpeed) * 0.25;
      coreMesh.scale.set(corePulse, corePulse, corePulse);
      coreMat.opacity = 0.3 + Math.sin(t * coreSpeed) * 0.2;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      ring1.ringMesh.geometry.dispose();
      (ring1.ringMat as THREE.Material).dispose();
      ring2.ringMesh.geometry.dispose();
      (ring2.ringMat as THREE.Material).dispose();
      ring3.ringMesh.geometry.dispose();
      (ring3.ringMat as THREE.Material).dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full min-h-[300px] flex items-center justify-center relative ${className}`}
    />
  );
}
