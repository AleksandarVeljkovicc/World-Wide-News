import { Link } from 'react-router-dom';
import styles from './css/SignupConfirmPage.module.css';

export default function SignupConfirmPage() {
  return (
    <div className={`text-center py-5 ${styles.container}`}>
      <h1 className="mb-4">
        Account created successfully{' '}
        <span className="text-success">✓</span>
      </h1>
      <p>
        <Link to="/login">Log in</Link> to your account.
      </p>
    </div>
  );
}
