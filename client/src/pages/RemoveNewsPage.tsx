import { useEffect, useState } from 'react';
import { Form, Button, Card, ListGroup, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../config/api';
import Logger from '../utils/logger';
import ErrorHandler from '../utils/errorHandler';
import styles from './css/RemoveNewsPage.module.css';

interface NewsItem {
  news_id: number;
  headline: string;
  type: string;
  published: string;
  views: number;
  name: string;
  last_name: string;
}

export default function RemoveNewsPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/');
      return;
    }
    loadNews();
  }, [isAuthenticated, isAdmin, navigate]);

  const loadNews = (query?: string) => {
    const url = query ? `/news/admin/list?search=${encodeURIComponent(query)}` : '/news/admin/list';
    if (query) {
      Logger.logInput('remove_news_load', { search: query });
    }
    api
      .get<{ news: NewsItem[] }>(url)
      .then((data) => setNews(data.news))
      .catch((err) => {
        ErrorHandler.handleError(err, { action: 'load_news_admin', query });
        setNews([]);
      })
      .finally(() => setLoading(false));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    Logger.logInput('remove_news_search', { search });
    setLoading(true);
    loadNews(search || undefined);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    Logger.logInput('remove_news_delete', { news_id: id });
    try {
      await api.delete(`/news/${id}`);
      setNews((prev) => prev.filter((n) => n.news_id !== id));
    } catch (err) {
      ErrorHandler.handleError(err, { action: 'delete_news', news_id: id });
    }
  };

  if (!isAuthenticated || !isAdmin) return null;

  return (
    <div className={styles.container}>
      <h1 className="mb-4">Remove news</h1>
      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button type="submit" variant="primary">
                Search
              </Button>
            </InputGroup>
          </Form>
        </Card.Body>
      </Card>
      {loading ? (
        <div className="text-center py-5">Loading...</div>
      ) : news.length === 0 ? (
        <p className="text-muted">No articles.</p>
      ) : (
        <ListGroup>
          {news.map((item) => (
            <ListGroup.Item key={item.news_id} className="d-flex justify-content-between align-items-center">
              <div>
                <Link to={`/news/${item.news_id}`} className="fw-bold text-decoration-none text-dark">
                  {item.headline}
                </Link>
                <div className="small text-muted">
                  Author: {item.name} {item.last_name} • Published: {new Date(item.published).toLocaleString()} • {item.views} views
                </div>
              </div>
              <Button variant="danger" size="sm" onClick={() => handleDelete(item.news_id)}>
                Delete
              </Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
}
