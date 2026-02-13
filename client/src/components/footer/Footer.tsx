import styles from './footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <p className={styles.links}>
          <a href="#" className={styles.link}>Legal Notice</a>
          <a href="#" className={styles.link}>Privacy Policy</a>
          <a href="#" className={styles.link}>Terms of use</a>
        </p>
        <h6 className={styles.copyright}>
          &copy; World Wide <span className={styles.newsHighlight}>News</span> 2022
        </h6>
      </div>
    </footer>
  );
}
