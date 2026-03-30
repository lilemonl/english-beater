const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

interface ApiResponse<T> {
  message: string;
  data: T;
}

const buildQuery = (params: Record<string, string | number | undefined>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.append(key, String(value));
    }
  });
  const qs = query.toString();
  return qs ? `?${qs}` : '';
};

const request = async <T>(path: string, options: RequestInit = {}, token?: string) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const json = (await res.json()) as ApiResponse<T> | { message: string };

  if (!res.ok) {
    throw new Error((json as { message: string }).message || 'Request failed');
  }

  return (json as ApiResponse<T>).data;
};

export const api = {
  login: (code = 'mock') =>
    request<{ openid: string; token: string; expiresIn: number }>(
      '/api/auth/login',
      { method: 'POST', body: JSON.stringify({ code }) }
    ),

  getDictionary: (params: {
    level?: string;
    pos?: string;
    sentiment?: string;
    theme?: string;
    q?: string;
    page?: number;
    pageSize?: number;
  }) => request<{ list: any[]; page: number; pageSize: number; total: number }>(
    `/api/dictionary${buildQuery(params)}`,
    { method: 'GET' }
  ),

  getQuestions: (params: { level?: string; round?: number }) =>
    request<{ round: number; questions: any[] }>(
      `/api/game/questions${buildQuery(params)}`,
      { method: 'GET' }
    ),

  getProgress: (token: string) =>
    request<any>('/api/user/progress', { method: 'GET' }, token),

  saveProgress: (token: string, payload: any) =>
    request<any>('/api/user/progress', { method: 'POST', body: JSON.stringify(payload) }, token)
};
