'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './stadium.module.css';

const StadiumModel = dynamic(
  () => import('../visuals/StadiumModel').catch(() => ({ default: () => null })),
  { ssr: false },
);

export function StadiumSignature() {
  const stage = useRef<HTMLDivElement>(null);
  const [eligible, setEligible] = useState(false);
  const [failed, setFailed] = useState(false);
  const onFailure = useCallback(() => setFailed(true), []);

  useEffect(() => {
    const element = stage.current;
    if (!element) return;

    const preference = window.matchMedia('(min-width: 64rem) and (prefers-reduced-motion: no-preference)');
    let loaded = document.readyState === 'complete';
    let inView = false;
    let mounted = false;
    let delay: number | undefined;

    const check = () => {
      window.clearTimeout(delay);
      if (!preference.matches) {
        mounted = false;
        setEligible(false);
        return;
      }
      if (!loaded || !inView || mounted) return;
      delay = window.setTimeout(() => {
        try {
          const context = document.createElement('canvas').getContext('webgl2');
          if (!context) return;
          context.getExtension('WEBGL_lose_context')?.loseContext();
          mounted = true;
          setEligible(true);
        } catch {
          onFailure();
        }
      }, 120);
    };

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      check();
    });
    const onLoad = () => {
      loaded = true;
      check();
    };
    observer.observe(element);
    window.addEventListener('load', onLoad, { once: true });
    preference.addEventListener('change', check);

    return () => {
      window.clearTimeout(delay);
      observer.disconnect();
      window.removeEventListener('load', onLoad);
      preference.removeEventListener('change', check);
    };
  }, [onFailure]);

  return (
    <div ref={stage} id="explore-stadium" className={styles.stage} aria-hidden="true">
      <Image
        className={styles.poster}
        src="/stadium/stadium-poster.webp"
        alt=""
        width={1280}
        height={720}
        unoptimized
        preload
      />
      <span className={styles.rightMark} />
      {eligible && !failed && <StadiumModel className={styles.model} onFailure={onFailure} />}
    </div>
  );
}
