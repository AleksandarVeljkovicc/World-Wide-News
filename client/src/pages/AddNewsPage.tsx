import { useEffect, useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../config/api';
import { validateForbiddenChars, getForbiddenCharsError } from '../validation/InputValidator';
import Logger from '../utils/logger';
import ErrorHandler from '../utils/errorHandler';
import styles from './css/AddNewsPage.module.css';

interface Category {
  news_type_id: number;
  type: string;
}

export default function AddNewsPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [headline, setHeadline] = useState('');
  const [article, setArticle] = useState('');
  const [type, setType] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/');
      return;
    }
    api
      .get<{ categories: Category[] }>('/news/categories')
      .then((data) => setCategories(data.categories))
      .catch((err) => ErrorHandler.handleError(err, { action: 'load_categories' }));
  }, [isAuthenticated, isAdmin, navigate]);

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1] || '');
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const newErrors: Record<string, string> = {};
    
    if (!image) {
      newErrors.upload = 'Please choose an image.';
    }
    
    if (!validateForbiddenChars(headline)) {
      newErrors.headline = getForbiddenCharsError('Headline');
    }
    
    if (!validateForbiddenChars(article)) {
      newErrors.article = getForbiddenCharsError('Article');
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    
    const newsData = {
      headline,
      article,
      type: parseInt(type, 10),
    };
    Logger.logInput('add_news', newsData);
    
    try {
      const imageBase64 = await toBase64(image);
      await api.post('/news', {
        ...newsData,
        image_base64: imageBase64,
      });
      navigate('/');
    } catch (err: unknown) {
      const data = err as { errors?: Record<string, string> };
      setErrors(data.errors || { _: ErrorHandler.handleError(err, { action: 'add_news' }) });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !isAdmin) return null;

  return (
    <div className={styles.container}>
      <h1 className="mb-4">Add news</h1>
      <Card>
        <Card.Body>
          {Object.keys(errors).length > 0 && (
            <Alert variant="danger">
              {Object.entries(errors).map(([k, v]) => (
                <div key={k}>{v}</div>
              ))}
            </Alert>
          )}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Control
                placeholder="Headline"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                isInvalid={!!errors.headline}
                required
              />
              <Form.Control.Feedback type="invalid">{errors.headline}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Select
                value={type}
                onChange={(e) => setType(e.target.value)}
                isInvalid={!!errors.type}
                required
              >
                <option value="">---Select category---</option>
                {categories.map((c) => (
                  <option key={c.news_type_id} value={c.news_type_id}>
                    {c.type}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.type}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                as="textarea"
                rows={15}
                placeholder="Add text"
                value={article}
                onChange={(e) => setArticle(e.target.value)}
                isInvalid={!!errors.article}
                required
              />
              <Form.Control.Feedback type="invalid">{errors.article}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => setImage((e.target.files || [])[0] || null)}
                isInvalid={!!errors.upload}
              />
              <Form.Control.Feedback type="invalid">{errors.upload}</Form.Control.Feedback>
            </Form.Group>
            <Button type="submit" variant="primary" size="lg" disabled={loading}>
              Add article
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
