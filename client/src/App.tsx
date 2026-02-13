import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import NewsPage from './pages/NewsPage';
import LogoutPage from './pages/LogoutPage';
import AddNewsPage from './pages/AddNewsPage';
import RemoveNewsPage from './pages/RemoveNewsPage';
import SignupConfirmPage from './pages/SignupConfirmPage';

function usePageTitle(): void {
  const { pathname } = useLocation();
  useEffect(() => {
    const segment = pathname.split('/').filter(Boolean).pop();
    if (!segment) {
      document.title = 'World Wide News';
      return;
    }
    const title = segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    document.title = title;
  }, [pathname]);
}

function App() {
  usePageTitle();
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="category/:category" element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="signup/confirm" element={<SignupConfirmPage />} />
        <Route path="news/:id" element={<NewsPage />} />
        <Route path="logout" element={<LogoutPage />} />
        <Route path="add-news" element={<AddNewsPage />} />
        <Route path="remove-news" element={<RemoveNewsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
