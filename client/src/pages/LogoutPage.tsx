import { useEffect, useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../config/api';

interface UserInfo {
  user_id: number;
  username: string;
  name: string;
  last_name: string;
  email: string;
  status: string;
  country?: string;
  city?: string;
  date_of_birth?: string;
  create_date: string;
  image?: string;
}

export default function LogoutPage() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    api
      .get<UserInfo>('/auth/me')
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated) return null;
  if (loading) return <div className="text-center py-5">Loading...</div>;

  if (!user) {
    return (
      <div className="text-center py-5">
        <h1>You must be logged in to access this page.</h1>
        <Button as={Link} to="/login" variant="primary">
          Log in
        </Button>
      </div>
    );
  }

  const createDate = new Date(user.create_date).toLocaleString();
  const birthDate = user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : null;

  return (
    <div className="d-flex justify-content-center">
      <Card style={{ maxWidth: 500 }}>
        <Card.Body>
          <h2 className="mb-4">User info</h2>
          <div className="text-center mb-3">
            {user.image ? (
              <img src={user.image} alt="" style={{ width: 250, height: 'auto' }} />
            ) : (
              <img
                src="/no-image-avatar.png"
                alt="No photo"
                style={{ width: 250, height: 250, objectFit: 'cover' }}
              />
            )}
          </div>
          <p><strong>Name:</strong> {user.name} {user.last_name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Status:</strong> {user.status}</p>
          {user.country && <p><strong>Country:</strong> {user.country}</p>}
          {user.city && <p><strong>City:</strong> {user.city}</p>}
          {birthDate && <p><strong>Birthday:</strong> {birthDate}</p>}
          <p><strong>Account created:</strong> {createDate}</p>
          <Button variant="danger" onClick={handleLogout} className="w-100 mt-3">
            Log out
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
}
