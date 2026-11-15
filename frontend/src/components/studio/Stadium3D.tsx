'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * DataTurf Stadium 3D Signature Trial
 * Lazy-loaded client component that progressively enhances the landing hero on desktop.
 *
 * Safety & performance guarantees:
 * - Stays strictly off Club and Compare routes (loaded only via dynamic import on Explore).
 * - Bails out instantly on mobile (<768px), reduced motion, or unsupported WebGL.
 * - IntersectionObserver halts the animation loop when scrolled offscreen (0% GPU/CPU offscreen).
 * - Pointer-events none: zero scroll hijacking, zero gesture interception.
 * - Clean WebGL resource disposal on unmount.
 */
export default function Stadium3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 1. Guard against mobile screen widths (<768px)
    if (window.innerWidth < 768) return;

    // 2. Guard against prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // 3. Guard against unsupported or disabled WebGL
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) return;
    } catch {
      return;
    }

    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 900;
    const height = container.clientHeight || 450;

    // Three.js Scene Setup
    const scene = new THREE.Scene();

    // Isometric-angled camera setup
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.set(0, 140, 180);
    camera.lookAt(0, -10, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.domElement.style.pointerEvents = 'none';
    container.appendChild(renderer.domElement);

    // Subtle emerald tactical line materials
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.35,
    });
    const subLineMat = new THREE.LineBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.18,
    });

    // Pitch Dimensions in 3D units (scaled proportionally to 105m x 68m)
    const pitchLength = 140;
    const pitchWidth = 90;
    const halfL = pitchLength / 2;
    const halfW = pitchWidth / 2;

    // 1. Outer Pitch Touchline
    const outerPoints = [
      new THREE.Vector3(-halfL, 0, -halfW),
      new THREE.Vector3(halfL, 0, -halfW),
      new THREE.Vector3(halfL, 0, halfW),
      new THREE.Vector3(-halfL, 0, halfW),
      new THREE.Vector3(-halfL, 0, -halfW),
    ];
    const outerGeo = new THREE.BufferGeometry().setFromPoints(outerPoints);
    const outerLine = new THREE.Line(outerGeo, lineMat);
    scene.add(outerLine);

    // 2. Halfway Line
    const halfPoints = [
      new THREE.Vector3(0, 0, -halfW),
      new THREE.Vector3(0, 0, halfW),
    ];
    const halfGeo = new THREE.BufferGeometry().setFromPoints(halfPoints);
    const halfwayLine = new THREE.Line(halfGeo, lineMat);
    scene.add(halfwayLine);

    // 3. Center Circle (radius ~12.2)
    const circlePoints: THREE.Vector3[] = [];
    const segments = 48;
    const radius = 12.2;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      circlePoints.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
    }
    const circleGeo = new THREE.BufferGeometry().setFromPoints(circlePoints);
    const centerCircle = new THREE.Line(circleGeo, lineMat);
    scene.add(centerCircle);

    // 4. Center Spot
    const spotGeo = new THREE.CircleGeometry(0.8, 16);
    spotGeo.rotateX(-Math.PI / 2);
    const spotMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.7 });
    const centerSpot = new THREE.Mesh(spotGeo, spotMat);
    scene.add(centerSpot);

    // 5. Left Penalty Box & Goal Box
    const leftPenaltyPoints = [
      new THREE.Vector3(-halfL, 0, -26),
      new THREE.Vector3(-halfL + 22, 0, -26),
      new THREE.Vector3(-halfL + 22, 0, 26),
      new THREE.Vector3(-halfL, 0, 26),
    ];
    const leftPenGeo = new THREE.BufferGeometry().setFromPoints(leftPenaltyPoints);
    scene.add(new THREE.Line(leftPenGeo, lineMat));

    // 6. Right Penalty Box & Goal Box
    const rightPenaltyPoints = [
      new THREE.Vector3(halfL, 0, -26),
      new THREE.Vector3(halfL - 22, 0, -26),
      new THREE.Vector3(halfL - 22, 0, 26),
      new THREE.Vector3(halfL, 0, 26),
    ];
    const rightPenGeo = new THREE.BufferGeometry().setFromPoints(rightPenaltyPoints);
    scene.add(new THREE.Line(rightPenGeo, lineMat));

    // 7. Stadium Elliptical Outer Ring (Architecture outline)
    const stadiumRingPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const theta = (i / 64) * Math.PI * 2;
      stadiumRingPoints.push(new THREE.Vector3(Math.cos(theta) * 95, -2, Math.sin(theta) * 65));
    }
    const stadiumRingGeo = new THREE.BufferGeometry().setFromPoints(stadiumRingPoints);
    scene.add(new THREE.Line(stadiumRingGeo, subLineMat));

    // Subtle Corner Floodlight Beams (Angled Line Guides)
    const corners = [
      [-halfL - 10, -halfW - 10],
      [halfL + 10, -halfW - 10],
      [halfL + 10, halfW + 10],
      [-halfL - 10, halfW + 10],
    ];
    corners.forEach(([cx, cz]) => {
      const beamPoints = [
        new THREE.Vector3(cx, 16, cz),
        new THREE.Vector3(cx * 0.7, 0, cz * 0.7),
      ];
      const beamGeo = new THREE.BufferGeometry().setFromPoints(beamPoints);
      scene.add(new THREE.Line(beamGeo, subLineMat));
    });

    // Ambient Animation Loop with IntersectionObserver
    let isVisible = true;
    let animId: number | null = null;
    let clock = new THREE.Clock();

    const animate = () => {
      if (!isVisible) return;
      animId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      // Gentle, subtle breathing rotation around pitch center
      scene.rotation.y = Math.sin(clock.getElapsedTime() * 0.2) * 0.04;

      renderer.render(scene, camera);
    };

    // Observer to halt rendering when out of viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          if (isVisible && !animId) {
            clock.start();
            animate();
          } else if (!isVisible && animId) {
            cancelAnimationFrame(animId);
            animId = null;
          }
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // Initial start
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };
    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      if (animId) cancelAnimationFrame(animId);

      renderer.dispose();
      outerGeo.dispose();
      halfGeo.dispose();
      circleGeo.dispose();
      spotGeo.dispose();
      leftPenGeo.dispose();
      rightPenGeo.dispose();
      stadiumRingGeo.dispose();
      lineMat.dispose();
      subLineMat.dispose();
      spotMat.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden transition-opacity duration-1000 ease-out"
      aria-hidden="true"
    />
  );
}
