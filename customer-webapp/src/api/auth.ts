import client from './client';

export const login = (username: string, password: string) =>
  client.post('/auth/login', { username, password }).then(r => r.data);

export const register = (username: string, email: string, password: string) =>
  client.post('/auth/register', { username, email, password }).then(r => r.data);

export const refreshToken = (token: string) =>
  client.post('/auth/refresh', null, { params: { token } }).then(r => r.data);
