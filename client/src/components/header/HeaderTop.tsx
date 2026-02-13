import { Link } from 'react-router-dom';
import SocialIcons from './SocialIcons';
import styles from './header.module.css';

export default function HeaderTop() {
  return (
    <div className={styles.topRow}>
      <Link to="/" aria-label="Home">
        <img
          src="/logo.png"
          alt="WWN - World Wide News"
          className={styles.logo}
        />
      </Link>
      <div className={styles.socialSection}>
        <p className={styles.socialLabel}>Social media</p>
        <div className={styles.socialIcons}>
          <SocialIcons linkClassName={styles.socialLink} />
        </div>
      </div>
    </div>
  );
}
