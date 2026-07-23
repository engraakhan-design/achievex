export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('achievex_access_token') : null;
  const response = await fetch(`${API_URL}/api/v1${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } });
  const body = await response.json().catch(() => ({}));
  if (response.status === 401 && typeof window !== 'undefined' && !path.startsWith('/auth/')) localStorage.removeItem('achievex_access_token');
  if (!response.ok) throw new Error(Array.isArray(body.message) ? body.message.join(', ') : body.message ?? 'Request failed');
  return body as T;
}
