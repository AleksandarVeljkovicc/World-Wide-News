import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './header.module.css';

interface HeaderNavProps {
  categories: { news_type_id: number; type: string }[];
  isAuthenticated: boolean;
  isAdmin: boolean;
  userInfo: string | undefined;
}

export default function HeaderNav({
  categories,
  isAuthenticated,
  isAdmin,
  userInfo,
}: HeaderNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className={styles.navRow} aria-label="Main navigation">
      <div className={styles.navWrapper}>
        <button
          type="button"
          className={styles.hamburgerBtn}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-controls="main-nav-list"
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
        <ul
          id="main-nav-list"
          className={`${styles.navList} ${menuOpen ? styles.open : ''}`}
        >
        <li>
          <Link to="/" className={styles.navLink}>
            Home
          </Link>
        </li>
        <li>
          <Link to="/contact" className={styles.navLink}>
            Contact us
          </Link>
        </li>
        {categories.map((cat) => (
          <li key={cat.news_type_id}>
            <Link
              to={`/category/${encodeURIComponent(cat.type)}`}
              className={styles.navLink}
            >
              {cat.type}
            </Link>
          </li>
        ))}
        {isAuthenticated ? (
          <li className={styles.loginListItem}>
            <Link to="/logout" className={`${styles.navLink} ${styles.loginLink}`}>
              {userInfo}
            </Link>
          </li>
        ) : (
          <li className={styles.loginListItem}>
            <Link to="/login" className={`${styles.navLink} ${styles.loginLink}`}>
              Log in
            </Link>
          </li>
        )}
        </ul>
      </div>
    </nav>
  );
}
