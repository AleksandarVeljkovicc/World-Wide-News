import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { api } from '../config/api';
import Logger from '../utils/logger';
import ErrorHandler from '../utils/errorHandler';
import Sidebar from '../components/sidebar/Sidebar';
import styles from './css/HomePage.module.css';

interface NewsItem {
  news_id: number;
  headline: string;
  type: string;
  published: string;
  views: number;
  image?: string;
}

export default function HomePage() {
  const { category } = useParams<{ category: string }>();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    if (category) {
      Logger.logInput('home_category', { category });
    }
    api
      .get<{ news: NewsItem[] }>(`/news${query}`)
      .then((data) => {
        setNews(data.news);
      })
      .catch((err) => ErrorHandler.handleError(err, { action: 'load_news', category }))
      .finally(() => setLoading(false));
  }, [category]);

  const title = category ? category : 'Latest news';

  const truncateTitle = (text: string, maxLength: number = 150): string => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return <div className="text-center py-5">Loading...</div>;
  }

  return (
    <Row>
      <Col lg={9} className={styles.newsContainer}>
        <h1 className={styles.sectionTitle}>{title}</h1>
        <div className="d-flex flex-column">
          {news.map((item) => (
            <div key={item.news_id} className={styles.newsCard}>
              <div className="row g-0">
                <div className="col-md-4">
                  <div className={styles.imageWrapper}>
                    {item.image ? (
                      <img src={item.image} alt={item.headline} className={styles.newsImage} />
                    ) : (
                      <div className={styles.noImagePlaceholder}>
                        <span>No image</span>
                      </div>
                    )}
                    <span className={styles.categoryTag}>{item.type}</span>
                  </div>
                </div>
                <div className="col-md-8">
                  <div className={styles.cardBody}>
                    <h5 className={styles.newsTitle}>
                      <Link to={`/news/${item.news_id}`} className={styles.newsTitleLink}>
                        {truncateTitle(item.headline)}
                      </Link>
                    </h5>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {news.length === 0 && <p className="text-muted">No news found.</p>}
      </Col>
      <Col lg={3}>
        <Sidebar />
      </Col>
    </Row>
  );
}
