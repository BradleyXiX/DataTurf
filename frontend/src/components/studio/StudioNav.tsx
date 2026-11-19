import Link from 'next/link';
import { PitchArtwork } from './PitchArtwork';
import styles from './studioChrome.module.css';

interface StudioNavProps {
  isDemo?: boolean;
  seasonLabel?: string;
  currentRoute?: 'explore' | 'compare' | 'club';
}

export function StudioNav({ isDemo = false, seasonLabel, currentRoute = 'explore' }: StudioNavProps) {
  const suffix = isDemo ? '?demo=true' : '';

  return (
    <header className={styles.header}>
      <div className={styles.navShell}>
        <Link href={`/${suffix}`} className={styles.brand} aria-label="DataTurf home">
          <PitchArtwork variant="mark" className={styles.mark} />
          <span>DataTurf</span>
        </Link>
        <nav aria-label="Studio navigation" className={styles.nav}>
          <Link href={`/${suffix}`} aria-current={currentRoute === 'explore' ? 'page' : undefined}>Explore</Link>
          <Link href={`/compare${suffix}`} aria-current={currentRoute === 'compare' ? 'page' : undefined}>Compare</Link>
        </nav>
        {seasonLabel && <span className={styles.season}>EPL {seasonLabel}</span>}
      </div>
    </header>
  );
}
