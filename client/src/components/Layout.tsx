import { Outlet } from 'react-router-dom';
import Header from './header/Header';
import Footer from './footer/Footer';
import styles from './Layout.module.css';

export default function Layout() {
  return (
    <div className={`d-flex flex-column min-vh-100 ${styles.layout}`}>
      <Header />
      <main className={`flex-grow-1 py-4 ${styles.main}`}>
        <div className="container">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
