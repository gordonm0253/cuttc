import { auth } from '../firebase';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const currentUser = auth.currentUser;
  if (currentUser) {
    const token = await currentUser.getIdToken();
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const apiGet = (path) => request(path);
export const apiPost = (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) });
export const apiPut = (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) });
export const apiDelete = (path) => request(path, { method: 'DELETE' });
