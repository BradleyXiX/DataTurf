'use client';

import { useEffect, useRef } from 'react';
import styles from './fixtureTrace.module.css';

const fixtureBranches = ['M332 5v9l20 9', 'M412 5v9l-60 9', 'M492 5v9l-140 9'];
const matchupLine = 'M352 23l-36 15H12';

export function FixtureTrace() {
  const trace = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const indicator = trace.current;
    if (!indicator || !('IntersectionObserver' in window)) return;

    const visibility = new IntersectionObserver(([entry]) => {
      indicator.toggleAttribute('data-in-view', entry.intersectionRatio >= 0.6);
    }, { threshold: 0.6 });
    visibility.observe(indicator);
    return () => visibility.disconnect();
  }, []);

  return (
    <svg
      ref={trace}
      className={styles.trace}
      data-fixture-trace
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 504 44"
      preserveAspectRatio="none"
    >
      <path className={styles.track} d={fixtureBranches.join(' ')} />
      <path className={styles.track} d={matchupLine} />
      <path className={styles.node} d="M328 5h8m72 0h8m72 0h8M348 23h8M8 38h8" />
      {fixtureBranches.map((branch) => (
        <path key={branch} className={styles.branches} pathLength="1" d={branch} />
      ))}
      <path className={styles.signal} pathLength="1" d={matchupLine} />
    </svg>
  );
}
