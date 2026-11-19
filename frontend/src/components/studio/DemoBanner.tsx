import Link from 'next/link';
import { liveRoute } from './demoUrl';
import styles from './studioChrome.module.css';

export function DemoBanner({ currentPath = '/' }: { currentPath?: string }) {
  const exitUrl = liveRoute(currentPath);

  return (
    <aside className={styles.demo} aria-label="Demo mode">
      <div className={styles.demoShell}>
        <p><strong>Demo fixtures</strong> <span>Sample data for this walkthrough.</span></p>
        <Link href={exitUrl}>Exit demo</Link>
      </div>
    </aside>
  );
}
