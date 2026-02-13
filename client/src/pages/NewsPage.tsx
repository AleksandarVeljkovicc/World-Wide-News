import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, Form, Button, ListGroup } from 'react-bootstrap';
import { api } from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import { validateForbiddenChars, getForbiddenCharsError } from '../validation/InputValidator';
import Logger from '../utils/logger';
import ErrorHandler from '../utils/errorHandler';
import styles from './css/NewsPage.module.css';

interface NewsArticle {
  news_id: number;
  headline: string;
  text: string;
  type: string;
  published: string;
  views: number;
  name: string;
  last_name: string;
  image?: string;
}

interface Comment {
  comments_id: number;
  news_id: number;
  comment: string;
  date: string;
  name: string;
  last_name: string;
  image?: string;
  user_id?: number | null;
}

export default function NewsPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user, isAdmin } = useAuth();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const loadArticle = () => {
    if (!id) return;
    api
      .get<NewsArticle>(`/news/${id}`)
      .then(setArticle)
      .catch(() => setArticle(null))
      .finally(() => setLoading(false));
  };

  const loadComments = () => {
    if (!id) return;
    api
      .get<{ comments: Comment[] }>(`/news/${id}/comments`)
      .then((data) => setComments(data.comments))
      .catch(() => setComments([]));
  };

  useEffect(() => {
    loadArticle();
  }, [id]);

  useEffect(() => {
    if (article) loadComments();
  }, [article?.news_id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !commentText.trim() || commentText.length < 2) {
      setMessage('Comment cannot be less than 2 characters.');
      return;
    }
    if (!validateForbiddenChars(commentText)) {
      setMessage(getForbiddenCharsError('Comment'));
      return;
    }
    setSubmitting(true);
    setMessage('');
    try {
      await api.post(`/news/${id}/comments`, { comment: commentText });
      setCommentText('');
      loadComments();
      setMessage('Comment added.');
    } catch (err: unknown) {
      setMessage((err as { error?: string })?.error || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    Logger.logInput('comment_delete', { comment_id: commentId });
    try {
      await api.delete(`/comments/${commentId}`);
      loadComments();
    } catch (err) {
      ErrorHandler.handleError(err, { action: 'delete_comment', comment_id: commentId });
    }
  };

  const canDeleteComment = (c: Comment) => {
    if (!isAuthenticated || !user) return false;
    // Administrator can delete all comments
    if (isAdmin) return true;
    // Regular users can only delete their own comments
    return c.user_id !== null && c.user_id !== undefined && user.id === c.user_id;
  };

  if (loading) return <div className="text-center py-5">Loading...</div>;
  if (!article) return <div className="text-center py-5">Article not found.</div>;

  const publishedDate = new Date(article.published).toLocaleString();

  return (
    <div className={styles.articleContainer}>
      <h1 className="mb-3" style={{ fontSize: '2rem', wordBreak: 'break-word' }}>
        {article.headline}
      </h1>
      <hr />
      <p className="text-muted fst-italic">
        Published by {article.name} {article.last_name}
      </p>
      <p className="text-muted">
        {publishedDate} • {article.views} views
      </p>
      <hr />
      {article.image && (
        <img
          src={article.image}
          alt={article.headline}
          className={`img-fluid w-100 mb-3 ${styles.articleImage}`}
        />
      )}
      <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{article.text}</p>
      <hr />
      {isAuthenticated && (
        <Form onSubmit={handleAddComment} className="mb-4">
          <Form.Group className="mb-2">
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Comment"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
          </Form.Group>
          {message && (
            <div className={`mb-2 small ${message.includes('added') ? 'text-success' : 'text-danger'}`}>
              {message}
            </div>
          )}
          <Button type="submit" variant="primary" disabled={submitting}>
            Comment
          </Button>
        </Form>
      )}
      <h5>Comments</h5>
      {comments.length === 0 ? (
        <p className="text-muted">No comments yet.</p>
      ) : (
        <ListGroup>
          {comments.map((c) => (
            <ListGroup.Item key={c.comments_id}>
              <div className="d-flex">
                <div className="me-2">
                  {c.image ? (
                    <img
                      src={c.image}
                      alt=""
                      style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <img
                      src="/no-image-avatar.png"
                      alt=""
                      style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                    />
                  )}
                </div>
                <div className="flex-grow-1">
                  <strong>{c.name} {c.last_name}</strong>
                  <span className="text-muted small ms-2">{new Date(c.date).toLocaleString()}</span>
                  <p className="mb-1 mt-1" style={{ whiteSpace: 'pre-wrap' }}>{c.comment}</p>
                  {canDeleteComment(c) && (
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleDeleteComment(c.comments_id)}
                    >
                      Remove comment
                    </Button>
                  )}
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
}
