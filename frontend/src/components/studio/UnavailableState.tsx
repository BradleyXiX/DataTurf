import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { liveRoute } from './demoUrl';
import styles from './studioChrome.module.css';

interface UnavailableStateProps {
  reason?: string;
  demoUrl?: string;
  headingLevel?: 'h1' | 'h2';
}

export function UnavailableState({
  reason = 'Live Premier League snapshot is currently unavailable.',
  demoUrl = '/?demo=true',
  headingLevel: Heading = 'h1',
}: UnavailableStateProps) {
  return (
    <section className={styles.unavailable} aria-labelledby="snapshot-unavailable">
      <p className={styles.unavailableLabel}>Premier League data</p>
      <Heading id="snapshot-unavailable">Live data is unavailable</Heading>
      <p>{reason}</p>
      <p>Open the demo to explore comparisons and match records with sample data.</p>
      <div className={styles.unavailableActions}>
        <Link href={demoUrl}>Explore demo data <ArrowRight size={16} aria-hidden="true" /></Link>
        <a href={liveRoute(demoUrl)}>Retry live data</a>
      </div>
    </section>
  );
}
