import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../config/api';
import HeaderTop from './HeaderTop';
import HeaderNav from './HeaderNav';
import styles from './header.module.css';

interface Category {
  news_type_id: number;
  type: string;
}

export default function Header() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api
      .get<{ categories: Category[] }>('/news/categories')
      .then((data) => setCategories(data.categories))
      .catch(() => {});
  }, []);

  const userInfo = user ? `${user.info} (${user.status})` : undefined;

  return (
    <header className={styles.header}>
      <div className="container">
        <HeaderTop />
        <HeaderNav
          categories={categories}
          isAuthenticated={isAuthenticated}
          isAdmin={isAdmin}
          userInfo={userInfo}
        />
      </div>
    </header>
  );
}
