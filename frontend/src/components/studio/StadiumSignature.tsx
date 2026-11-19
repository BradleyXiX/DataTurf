import Image from 'next/image';
import styles from './stadium.module.css';

export function StadiumSignature() {
  return (
    <div id="explore-stadium" className={styles.stage} aria-hidden="true">
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
    </div>
  );
}
