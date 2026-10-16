"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function SentinelOrb({ active = false }: { active?: boolean }) {
  const mount = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  useEffect(() => { activeRef.current = active; }, [active]);
  useEffect(() => {
    const host = mount.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" }); } catch { return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.z = 4.6;
    const group = new THREE.Group();
    scene.add(group);
    const geometry = new THREE.BufferGeometry();
    const count = 2500;
    const points = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = Math.PI * (3 - Math.sqrt(5)) * i;
      points.set([Math.cos(theta) * radius, y, Math.sin(theta) * radius], i * 3);
      const color = new THREE.Color(i % 8 === 0 ? "#ff9985" : i % 3 === 0 ? "#f1efe8" : "#b3df93");
      colors.set([color.r, color.g, color.b], i * 3);
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(points, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({ size: 0.014, vertexColors: true, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false });
    group.add(new THREE.Points(geometry, material));
    const innerGeometry = new THREE.IcosahedronGeometry(0.8, 1);
    const innerMaterial = new THREE.MeshBasicMaterial({ color: "#b3df93", wireframe: true, transparent: true, opacity: 0.12 });
    group.add(new THREE.Mesh(innerGeometry, innerMaterial));
    const resize = new ResizeObserver(() => {
      renderer.setSize(host.clientWidth, host.clientHeight);
      camera.aspect = host.clientWidth / Math.max(host.clientHeight, 1);
      camera.updateProjectionMatrix();
    });
    resize.observe(host);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let visible = true;
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; });
    observer.observe(host);
    const render = (time: number) => {
      frame = requestAnimationFrame(render);
      if (!visible || document.hidden) return;
      if (!reduced.matches) {
        group.rotation.y = time * (activeRef.current ? 0.00028 : 0.00008);
        group.rotation.z = Math.sin(time * 0.0002) * 0.1;
        group.scale.setScalar(1 + Math.sin(time * (activeRef.current ? 0.005 : 0.001)) * (activeRef.current ? 0.045 : 0.015));
      }
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(frame); resize.disconnect(); observer.disconnect(); geometry.dispose(); material.dispose(); innerGeometry.dispose(); innerMaterial.dispose(); renderer.dispose(); renderer.domElement.remove(); };
  }, []);
  return <div className={`sentinel-orb ${active ? "is-active" : ""}`} aria-hidden="true"><div className="orb-halo" /><div ref={mount} className="orb-render" /><span className="orb-equator" /><span className="orb-center" /></div>;
}
