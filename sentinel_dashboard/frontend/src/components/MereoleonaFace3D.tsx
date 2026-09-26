// ==============================================================================
// SENTINEL-IOT: MEREOLEONA VERMILLION 3D HOLOGRAPHIC FACE & MANA CORE
// Real-Time Three.js Avatar • Dynamic Dashboard Theme Alignment
// Animated Lip-Sync • Static Orientation • Reactive Hologram Colors
// ==============================================================================

"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface MereoleonaFace3DProps {
  isSpeaking: boolean;
  isListening: boolean;
  isThinking: boolean;
  isCritAlert?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function MereoleonaFace3D({
  isSpeaking,
  isListening,
  isThinking,
  isCritAlert = false,
  onClick,
  className = ""
}: MereoleonaFace3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const stateRef = useRef({
    isSpeaking,
    isListening,
    isThinking,
    isCritAlert
  });

  useEffect(() => {
    stateRef.current = { isSpeaking, isListening, isThinking, isCritAlert };
  }, [isSpeaking, isListening, isThinking, isCritAlert]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    mount.innerHTML = "";

    const width = mount.clientWidth || mount.parentElement?.clientWidth || 200;
    const height = mount.clientHeight || 126;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.3);

    // 2. WebGL Renderer with Transparent Background
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);

    // 3. Dynamic Theme Color Extraction Function
    const getThemeColors = () => {
      if (typeof window === "undefined") {
        return {
          accent: new THREE.Color(0x00f3ff),
          brand: new THREE.Color(0x06b6d4),
          alert: new THREE.Color(0xef4444)
        };
      }
      const styles = getComputedStyle(document.documentElement);
      const accentStr = styles.getPropertyValue("--accent-primary").trim() || "#00f3ff";
      const brandStr = styles.getPropertyValue("--brand-cyan").trim() || styles.getPropertyValue("--brand-primary").trim() || "#06b6d4";
      const alertStr = styles.getPropertyValue("--alert-critical").trim() || "#ef4444";

      return {
        accent: new THREE.Color(accentStr),
        brand: new THREE.Color(brandStr),
        alert: new THREE.Color(alertStr)
      };
    };

    let themeColors = getThemeColors();

    // 4. Load Textures directly
    const textureLoader = new THREE.TextureLoader();
    const idleTex = textureLoader.load("/mereoleona/idle.jpg");
    idleTex.colorSpace = THREE.SRGBColorSpace;

    const speakingTex = textureLoader.load("/mereoleona/speaking.jpg");
    speakingTex.colorSpace = THREE.SRGBColorSpace;

    const blinkTex = textureLoader.load("/mereoleona/blink.jpg");
    blinkTex.colorSpace = THREE.SRGBColorSpace;

    // 5. Character Head Rig Group (Static Orientation)
    const headGroup = new THREE.Group();
    scene.add(headGroup);

    // Avatar Disc Geometry & Material
    const avatarGeo = new THREE.CircleGeometry(1.36, 64);
    const avatarMat = new THREE.MeshBasicMaterial({
      map: idleTex,
      transparent: true,
      side: THREE.DoubleSide
    });
    const avatarMesh = new THREE.Mesh(avatarGeo, avatarMat);
    headGroup.add(avatarMesh);

    // 6. Lighting (Synchronized with Dashboard Theme)
    const ambientLight = new THREE.AmbientLight(themeColors.brand, 1.2);
    scene.add(ambientLight);

    const coreLight = new THREE.PointLight(themeColors.accent, 3.5, 10);
    coreLight.position.set(0, -0.4, 1.8);
    scene.add(coreLight);

    // 7. Holographic Cyber-Rings (Themed)
    const ringGeo1 = new THREE.RingGeometry(1.38, 1.43, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: themeColors.accent,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    const ringMesh1 = new THREE.Mesh(ringGeo1, ringMat1);
    headGroup.add(ringMesh1);

    const ringGeo2 = new THREE.RingGeometry(1.48, 1.52, 48);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: themeColors.brand,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
      wireframe: true
    });
    const ringMesh2 = new THREE.Mesh(ringGeo2, ringMat2);
    headGroup.add(ringMesh2);

    // Base Hologram Projector Ring
    const baseRingGeo = new THREE.TorusGeometry(1.35, 0.03, 16, 64);
    const baseRingMat = new THREE.MeshBasicMaterial({
      color: themeColors.brand,
      transparent: true,
      opacity: 0.65
    });
    const baseRing = new THREE.Mesh(baseRingGeo, baseRingMat);
    baseRing.rotation.x = Math.PI / 2.3;
    baseRing.position.y = -1.25;
    scene.add(baseRing);

    // 8. 3D Swirling Theme Mana Particles
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particleVelocities: { y: number; angle: number; speed: number; radius: number }[] = [];

    const updateParticlePalette = (currentTheme: { accent: THREE.Color; brand: THREE.Color }) => {
      const palette = [
        currentTheme.accent,
        currentTheme.brand,
        new THREE.Color(0xffffff),
        currentTheme.accent.clone().offsetHSL(0, 0, 0.2)
      ];

      for (let i = 0; i < particleCount; i++) {
        const col = palette[Math.floor(Math.random() * palette.length)];
        particleColors[i * 3] = col.r;
        particleColors[i * 3 + 1] = col.g;
        particleColors[i * 3 + 2] = col.b;
      }
      particleGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));
      particleGeo.attributes.color.needsUpdate = true;
    };

    for (let i = 0; i < particleCount; i++) {
      const radius = 0.8 + Math.random() * 1.2;
      const angle = Math.random() * Math.PI * 2;
      const y = -1.4 + Math.random() * 2.8;

      particlePositions[i * 3] = Math.cos(angle) * radius;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 1.2;

      particleVelocities.push({
        y: 0.012 + Math.random() * 0.022,
        angle: angle,
        speed: 0.018 + Math.random() * 0.025,
        radius: radius
      });
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    updateParticlePalette(themeColors);

    // Custom Canvas Texture for Glowing Ember Particles
    const emberCanvas = document.createElement("canvas");
    emberCanvas.width = 32;
    emberCanvas.height = 32;
    const emberCtx = emberCanvas.getContext("2d");
    if (emberCtx) {
      const grad = emberCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, "rgba(255,255,255,1)");
      grad.addColorStop(0.4, "rgba(255,255,255,0.7)");
      grad.addColorStop(0.8, "rgba(255,255,255,0.2)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      emberCtx.fillStyle = grad;
      emberCtx.fillRect(0, 0, 32, 32);
    }
    const emberTex = new THREE.CanvasTexture(emberCanvas);

    const particleMat = new THREE.PointsMaterial({
      size: 0.14,
      vertexColors: true,
      map: emberTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // Static Hologram Rig (Fixed orientation, no mouse tilt)
    headGroup.rotation.set(0, 0, 0);

    // 9. Observer for Real-Time Dashboard Theme Switching
    const applyThemeUpdates = () => {
      themeColors = getThemeColors();
      ringMat1.color.copy(themeColors.accent);
      ringMat2.color.copy(themeColors.brand);
      baseRingMat.color.copy(themeColors.brand);
      ambientLight.color.copy(themeColors.brand);
      coreLight.color.copy(themeColors.accent);
      updateParticlePalette(themeColors);
    };

    const themeObserver = new MutationObserver(() => {
      applyThemeUpdates();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"]
    });

    // 10. Animation Loop (60 FPS) with performance.now() timer
    let lastTime = performance.now() * 0.001;
    const startTime = lastTime;
    let speakTimer = 0;
    let blinkTimer = 0;
    let isBlinking = false;
    let isMouthOpen = false;
    let animId = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const currentTime = performance.now() * 0.001;
      const delta = Math.min(currentTime - lastTime, 0.1);
      lastTime = currentTime;
      const elapsed = currentTime - startTime;
      const { isSpeaking: speaking, isListening: listening, isCritAlert: alert } = stateRef.current;

      // Static orientation (does not track or tilt with mouse)
      headGroup.rotation.set(0, 0, 0);

      // Lip-Sync & Face State Switching
      if (speaking) {
        speakTimer += delta;
        if (speakTimer > 0.12) {
          speakTimer = 0;
          isMouthOpen = !isMouthOpen;
          const targetTex = isMouthOpen ? speakingTex : idleTex;
          if (avatarMat.map !== targetTex) {
            avatarMat.map = targetTex;
            avatarMat.needsUpdate = true;
          }
          avatarMesh.scale.set(
            1.0 + (isMouthOpen ? 0.025 : 0),
            1.0 + (isMouthOpen ? 0.04 : 0),
            1.0
          );
        }
      } else {
        speakTimer = 0;
        avatarMesh.scale.set(1.0, 1.0, 1.0);
        blinkTimer += delta;

        if (!isBlinking && blinkTimer > 3.0 + Math.sin(elapsed) * 1.5) {
          isBlinking = true;
          blinkTimer = 0;
          if (avatarMat.map !== blinkTex) {
            avatarMat.map = blinkTex;
            avatarMat.needsUpdate = true;
          }
        } else if (isBlinking && blinkTimer > 0.16) {
          isBlinking = false;
          blinkTimer = 0;
          if (avatarMat.map !== idleTex) {
            avatarMat.map = idleTex;
            avatarMat.needsUpdate = true;
          }
        } else if (!isBlinking && avatarMat.map !== idleTex) {
          avatarMat.map = idleTex;
          avatarMat.needsUpdate = true;
        }
      }

      // Rotating Hologram Rings
      ringMesh1.rotation.z = elapsed * 0.6;
      ringMesh2.rotation.z = -elapsed * 0.9;
      baseRing.rotation.z = elapsed * 0.5;

      // Dynamic Ring Colors based on activity & active theme
      if (alert) {
        ringMat1.color.copy(themeColors.alert);
        coreLight.color.copy(themeColors.alert);
        coreLight.intensity = 5.0 + Math.sin(elapsed * 12) * 2;
      } else if (speaking) {
        ringMat1.color.copy(themeColors.accent);
        coreLight.color.copy(themeColors.brand);
        coreLight.intensity = 4.0 + Math.sin(elapsed * 8) * 1.5;
      } else if (listening) {
        ringMat1.color.setHex(0xfcee0a);
        coreLight.color.setHex(0xfcee0a);
        coreLight.intensity = 3.4;
      } else {
        ringMat1.color.copy(themeColors.accent);
        coreLight.color.copy(themeColors.brand);
        coreLight.intensity = 2.5 + Math.sin(elapsed * 3) * 0.6;
      }

      // 3D Swirling Mana Embers
      const positions = particleGeo.attributes.position.array as Float32Array;
      const speedMultiplier = speaking ? 2.4 : alert ? 3.0 : 1.0;

      for (let i = 0; i < particleCount; i++) {
        const vel = particleVelocities[i];
        vel.angle += vel.speed * speedMultiplier;
        positions[i * 3 + 1] += vel.y * speedMultiplier;

        const r = vel.radius * (1.0 + (positions[i * 3 + 1] + 1.4) * 0.2);
        positions[i * 3] = Math.cos(vel.angle) * r;
        positions[i * 3 + 2] = Math.sin(vel.angle) * 0.7 + 0.2;

        if (positions[i * 3 + 1] > 1.8) {
          positions[i * 3 + 1] = -1.4;
          vel.angle = Math.random() * Math.PI * 2;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // 11. ResizeObserver for precise sizing
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 10 && newH > 10) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(mount);

    // 12. Cleanup
    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      renderer.dispose();
      avatarGeo.dispose();
      avatarMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      baseRingGeo.dispose();
      baseRingMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      emberTex.dispose();
      idleTex.dispose();
      speakingTex.dispose();
      blinkTex.dispose();
      try {
        if (renderer.domElement.parentElement) {
          renderer.domElement.parentElement.removeChild(renderer.domElement);
        }
      } catch {
        // Element already detached
      }
    };
  }, []);

  const hasCustomMinH = className.includes("min-h-") || className.includes("h-");

  return (
    <div
      onClick={onClick}
      className={`relative w-full h-full ${hasCustomMinH ? "" : "min-h-[135px]"} flex items-center justify-center overflow-hidden select-none cursor-pointer ${className}`}
      title="Mereoleona Vermillion 3D Mana Hologram • Click to Toggle Voice Listening"
    >
      <div ref={mountRef} className="w-full h-full flex items-center justify-center" />
    </div>
  );
}
