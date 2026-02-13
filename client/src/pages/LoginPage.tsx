import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logger from '../utils/logger';
import ErrorHandler from '../utils/errorHandler';
import styles from './css/LoginPage.module.css';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    Logger.logInput('login', { username, remember });
    
    try {
      await login(username, password, remember);
      navigate('/');
    } catch (err: unknown) {
      const errorMessage = ErrorHandler.handleError(err, { action: 'login' });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginForm}>
        <h2 className={styles.loginTitle}>Log in</h2>
        <Form onSubmit={handleSubmit}>
          <Form.Group className={styles.formGroup}>
            <Form.Control
              type="text"
              placeholder="Username"
              className={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className={styles.formGroup}>
            <Form.Control
              type="password"
              placeholder="Password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className={styles.formGroup}>
            <Form.Check
              type="checkbox"
              label="Remember me"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className={styles.checkbox}
            />
          </Form.Group>
          <Button type="submit" className={styles.submitButton} disabled={loading}>
            SING IN
          </Button>
          <p className={styles.signupText}>
            Don't have an account? <Link to="/signup" className={styles.signupLink}>Sing up</Link>
          </p>
        </Form>
      </div>
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
}
