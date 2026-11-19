'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const modelUrl = '/stadium/stadium.glb';
const poses = [
  { position: new THREE.Vector3(23, 24, 26), target: new THREE.Vector3(0.3, 1.6, -0.1), width: 45.5 },
  { position: new THREE.Vector3(1.5, 31, 24), target: new THREE.Vector3(0, 1.55, -0.2), width: 41.2 },
  { position: new THREE.Vector3(-22, 14, 27), target: new THREE.Vector3(0, 1.48, -0.2), width: 41 },
];

function disposeModel(model: THREE.Object3D) {
  const materials = new Set<THREE.Material>();
  const geometries = new Set<THREE.BufferGeometry>();

  // The checked-in stadium contains geometry and materials, with no textures.
  model.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return;
    geometries.add(node.geometry);
    const surfaces = Array.isArray(node.material) ? node.material : [node.material];
    for (const surface of surfaces) materials.add(surface);
  });

  for (const geometry of geometries) geometry.dispose();
  for (const material of materials) material.dispose();
}

export default function StadiumModel({
  className,
  onFailure,
}: {
  className: string;
  onFailure: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = host.current;
    const opening = mount?.closest<HTMLElement>('#explore-opening');
    if (!mount || !opening) return;

    const controller = new AbortController();
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#131b16');
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 250);
    const target = new THREE.Vector3();
    const key = new THREE.DirectionalLight('#f2ffe7', 2.65);
    key.position.set(4, 20, 12);
    const rim = new THREE.DirectionalLight('#bbd5eb', 1.15);
    rim.position.set(-13, 13, -8);
    scene.add(new THREE.HemisphereLight('#e4f4de', '#24372b', 1.75), key, rim);

    let model: THREE.Object3D | undefined;
    let renderer: THREE.WebGLRenderer | undefined;
    let frame = 0;
    let visible = false;
    let size = { width: 0, height: 0 };
    let measured = { width: 0, height: 0, start: 0 };
    let renderedProgress = -1;

    const fail = () => {
      if (controller.signal.aborted) return;
      controller.abort();
      delete mount.dataset.ready;
      opening.style.removeProperty('--pitch-progress');
      onFailure();
    };

    const render = () => {
      frame = 0;
      if (!renderer || !visible || document.hidden || controller.signal.aborted) return;

      const { width, height, start } = measured;
      if (!width || !height) return;
      const travel = Math.min(380, height * 0.9);
      const progress = THREE.MathUtils.clamp((window.scrollY - start) / travel, 0, 1);
      const resized = width !== size.width || height !== size.height;
      if (progress === renderedProgress && !resized) return;

      const segment = progress < 0.5 ? 0 : 1;
      const fraction = progress * 2 - segment;
      const eased = fraction * fraction * (3 - 2 * fraction);
      const a = poses[segment];
      const b = poses[segment + 1];
      camera.position.lerpVectors(a.position, b.position, eased);
      camera.lookAt(target.lerpVectors(a.target, b.target, eased));

      const aspect = width / height;
      const cameraWidth = THREE.MathUtils.lerp(a.width, b.width, eased);
      const cameraHeight = cameraWidth / Math.min(aspect, 16 / 9);
      camera.left = -cameraHeight * aspect / 2;
      camera.right = cameraHeight * aspect / 2;
      camera.top = cameraHeight / 2;
      camera.bottom = -cameraHeight / 2;
      camera.updateProjectionMatrix();

      if (resized) {
        renderer.setSize(width, height, false);
        size = { width, height };
      }
      try {
        renderer.render(scene, camera);
      } catch {
        fail();
        return;
      }

      renderedProgress = progress;
      opening.style.setProperty('--pitch-progress', progress.toFixed(3));
      mount.dataset.ready = 'true';
    };

    const schedule = () => {
      if (renderer && visible && !frame && !document.hidden && !controller.signal.aborted) {
        frame = window.requestAnimationFrame(render);
      }
    };

    const measure = () => {
      const bounds = mount.getBoundingClientRect();
      measured = {
        width: bounds.width,
        height: bounds.height,
        start: Math.max(0, bounds.top + window.scrollY - innerHeight * 0.32),
      };
      schedule();
    };

    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) measure();
    });
    const resize = new ResizeObserver(measure);
    visibility.observe(mount);
    resize.observe(mount);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', schedule, { passive: true });
    document.addEventListener('visibilitychange', schedule);

    const loseContext = (event: Event) => {
      event.preventDefault();
      fail();
    };

    const load = async () => {
      const response = await fetch(modelUrl, { signal: controller.signal });
      if (!response.ok) throw new Error('Stadium response failed');
      const buffer = await response.arrayBuffer();
      const gltf = await new GLTFLoader().parseAsync(buffer, '/stadium/');
      if (controller.signal.aborted) {
        disposeModel(gltf.scene);
        return;
      }

      model = gltf.scene;
      scene.add(model);
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.96;
      renderer.domElement.addEventListener('webglcontextlost', loseContext);
      mount.append(renderer.domElement);
      measure();
    };

    load().catch(fail);

    return () => {
      controller.abort();
      if (frame) window.cancelAnimationFrame(frame);
      visibility.disconnect();
      resize.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', schedule);
      document.removeEventListener('visibilitychange', schedule);
      if (model) disposeModel(model);
      if (renderer) {
        renderer.domElement.removeEventListener('webglcontextlost', loseContext);
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
      }
      opening.style.removeProperty('--pitch-progress');
      delete mount.dataset.ready;
    };
  }, [onFailure]);

  return <div ref={host} className={className} />;
}
