import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const client = axios.create({ baseURL: '/api/v1' });

const plainClient = axios.create({ baseURL: '/api/v1' });

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<string> | null = null;

export function clearStoredAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
}

export function redirectToLogin() {
  clearStoredAuth();
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

export async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token available');
      const { data } = await plainClient.post('/auth/refresh', null, {
        params: { token: refreshToken },
      });
      const accessToken: string = data.data.token.accessToken;
      localStorage.setItem('token', accessToken);
      return accessToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    const url = config?.url ?? '';
    const isPublicAuth = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh');

    if (error.response?.status === 401 && config && !config._retry && !isPublicAuth) {
      config._retry = true;
      try {
        const token = await refreshAccessToken();
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
        if (url.includes('/auth/me')) {
          config.params = { ...(config.params ?? {}), token };
        }
        return client(config);
      } catch {
        redirectToLogin();
      }
    }
    return Promise.reject(error);
  }
);

export default client;
