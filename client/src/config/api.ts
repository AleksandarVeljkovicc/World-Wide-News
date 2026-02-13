const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

// Helper function to get token from storage (checks both localStorage and sessionStorage)
const getStoredToken = (): string | null => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

export const api = {
  baseUrl: API_BASE,
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = getStoredToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw { status: res.status, ...data };
    }
    return data as T;
  },
  get: <T>(url: string) => api.request<T>(url),
  post: <T>(url: string, body: unknown) =>
    api.request<T>(url, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(url: string, body: unknown) =>
    api.request<T>(url, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(url: string) => api.request<T>(url, { method: 'DELETE' }),
};
