import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../config/api';
import styles from './sidebar.module.css';

interface PopularNews {
  news_id: number;
  headline: string;
  image?: string;
  views: number;
}

const truncateTitle = (text: string, maxLength: number = 150): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
};

export default function Sidebar() {
  const { isAdmin } = useAuth();
  const [popularNews, setPopularNews] = useState<PopularNews | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      api
        .get<{ popular: PopularNews | null }>('/news')
        .then((data) => {
          setPopularNews(data.popular);
        })
        .catch(() => {
          setPopularNews(null);
        });
    }
  }, [isAdmin]);

  if (isAdmin) {
    return (
      <aside className={styles.sidebar}>
        <div className={styles.sidebarContent}>
          <Link to="/add-news" className={styles.sidebarButton}>
            Add news
          </Link>
          <Link to="/remove-news" className={styles.sidebarButton}>
            Remove news
          </Link>
        </div>
      </aside>
    );
  }

  if (!popularNews) {
    return null;
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.popularCard}>
        <div className={styles.popularImageWrapper}>
          {popularNews.image ? (
            <img
              src={popularNews.image}
              alt={popularNews.headline}
              className={styles.popularImage}
            />
          ) : (
            <div className={styles.noImagePlaceholder}>
              <span>No image</span>
            </div>
          )}
          <div className={styles.popularOverlay}>
            <span className={styles.popularLabel}>Most popular this month</span>
          </div>
        </div>
        <Link to={`/news/${popularNews.news_id}`} className={styles.popularHeadline}>
          {truncateTitle(popularNews.headline)}
        </Link>
      </div>
    </aside>
  );
}
