import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { validateForbiddenChars, getForbiddenCharsError } from '../validation/InputValidator';
import Logger from '../utils/logger';
import styles from './css/SignupPage.module.css';

const COUNTRIES = [
  'Serbia', 'Croatia', 'Bosnia and Herzegovina', 'Montenegro', 'North Macedonia', 'Slovenia',
  'United States', 'United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 'Austria', 'Switzerland',
  'Russia', 'Ukraine', 'Poland', 'Czech Republic', 'Hungary', 'Romania', 'Bulgaria', 'Greece',
  'Turkey', 'China', 'Japan', 'India', 'Australia', 'Canada', 'Brazil', 'Argentina',
];

export default function SignupPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    password: '',
    cPassword: '',
    email: '',
    first_name: '',
    last_name: '',
    country: '',
    city: '',
    date_of_birth: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    
    if (!validateForbiddenChars(form.username)) {
      newErrors.username = getForbiddenCharsError('Username');
    }
    if (!validateForbiddenChars(form.password)) {
      newErrors.password = getForbiddenCharsError('Password');
    }
    if (!validateForbiddenChars(form.email)) {
      newErrors.email = getForbiddenCharsError('Email');
    }
    if (!validateForbiddenChars(form.first_name)) {
      newErrors.first_name = getForbiddenCharsError('First name');
    }
    if (!validateForbiddenChars(form.last_name)) {
      newErrors.last_name = getForbiddenCharsError('Last name');
    }
    if (form.city && !validateForbiddenChars(form.city)) {
      newErrors.city = getForbiddenCharsError('City');
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    setLoading(true);
    
    try {
      const formData: Record<string, string | undefined> = { ...form };
      
      Logger.logInput('signup', formData);
      
      // Convert image to base64 if present
      if (image) {
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            // Remove data:image/...;base64, prefix if present
            const base64Data = base64String.includes(',') 
              ? base64String.split(',')[1] 
              : base64String;
            resolve(base64Data);
          };
          reader.onerror = () => reject(new Error('Failed to read image file'));
          reader.readAsDataURL(image);
        });
        
        formData.image_base64 = base64Data;
      }
      
      await register(formData as Parameters<typeof register>[0]);
      navigate('/signup/confirm');
    } catch (err: unknown) {
      const data = err as { errors?: Record<string, string> };
      setErrors(data?.errors || {});
    } finally {
      setLoading(false);
    }
  };

  const errorMessages = Object.values(errors).filter(Boolean);

  return (
    <div className={styles.signupContainer}>
      <div className={styles.signupForm}>
        <h2 className={styles.signupTitle}>Sing up</h2>
        <Form onSubmit={handleSubmit}>
          <Form.Group className={styles.formGroup}>
            <Form.Control
              name="username"
              placeholder="Username"
              className={styles.input}
              value={form.username}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className={styles.formGroup}>
            <Form.Control
              name="password"
              type="password"
              placeholder="Password"
              className={styles.input}
              value={form.password}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className={styles.formGroup}>
            <Form.Control
              name="cPassword"
              type="password"
              placeholder="Confirm password"
              className={styles.input}
              value={form.cPassword}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className={styles.formGroup}>
            <Form.Control
              name="email"
              type="email"
              placeholder="Email"
              className={styles.input}
              value={form.email}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className={styles.formGroup}>
            <Form.Control
              name="first_name"
              placeholder="First name"
              className={styles.input}
              value={form.first_name}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className={styles.formGroup}>
            <Form.Control
              name="last_name"
              placeholder="Last name"
              className={styles.input}
              value={form.last_name}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className={styles.formGroup}>
            <Form.Select
              name="country"
              className={styles.input}
              value={form.country}
              onChange={handleChange}
              required
            >
              <option value="">Country</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className={styles.formGroup}>
            <Form.Control
              name="city"
              placeholder="City"
              className={styles.input}
              value={form.city}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className={styles.formGroup}>
            <Form.Control
              name="date_of_birth"
              type="date"
              placeholder="mm/dd/yyyy"
              className={styles.input}
              value={form.date_of_birth}
              onChange={handleChange}
            />
          </Form.Group>
          <Button
            type="button"
            className={styles.addPhotoButton}
            onClick={() => document.getElementById('photo-input')?.click()}
          >
            <i className="fa-solid fa-camera"></i> Add photo
          </Button>
          <input
            id="photo-input"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />
          <Button type="submit" className={styles.submitButton} disabled={loading}>
            SING UP
          </Button>
          <p className={styles.loginText}>
            Already have an account? <Link to="/login" className={styles.loginLink}>Log in</Link>
          </p>
        </Form>
      </div>
      {errorMessages.length > 0 && (
        <div className={styles.errorMessages}>
          {errorMessages.map((msg, idx) => (
            <p key={idx} className={styles.errorMessage}>{msg}</p>
          ))}
        </div>
      )}
    </div>
  );
}
