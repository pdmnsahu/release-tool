const BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  getReleases: () => request('/releases'),
  getRelease: (id) => request(`/releases/${id}`),
  createRelease: (data) => request('/releases', { method: 'POST', body: JSON.stringify(data) }),
  updateRelease: (id, data) => request(`/releases/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteRelease: (id) => request(`/releases/${id}`, { method: 'DELETE' }),
  toggleStep: (id, stepKey, completed) =>
    request(`/releases/${id}/steps/${stepKey}`, {
      method: 'PATCH',
      body: JSON.stringify({ completed }),
    }),
};
