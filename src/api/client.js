import { useAppStore } from '../stores/useAppStore.js';

const API_BASE = '/api/v1';

async function refreshAccessToken() {
  const { refreshToken, setTokens, clearAuth } = useAppStore.getState();
  if (!refreshToken) return null;
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  if (!res.ok) {
    clearAuth();
    return null;
  }
  const data = await res.json();
  setTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
}

export async function apiRequest(path, options = {}) {
  const state = useAppStore.getState();
  const headers = { ...(options.headers || {}) };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }
  if (state.accessToken) {
    headers.Authorization = `Bearer ${state.accessToken}`;
  }
  if (state.activeOrganizationId) {
    headers['X-Organization-Id'] = state.activeOrganizationId;
  }

  let res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body: options.body && !(options.body instanceof FormData) && typeof options.body !== 'string'
      ? JSON.stringify(options.body)
      : options.body
  });

  if (res.status === 401 && state.refreshToken && !options._retried) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return apiRequest(path, { ...options, _retried: true });
    }
  }

  if (options.rawResponse) {
    if (!res.ok) throw new Error(`Download failed (${res.status})`);
    return res;
  }

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) {
    let message = data?.error?.message || data?.message || `Request failed (${res.status})`;
    const fieldErrors = data?.error?.details?.fieldErrors;
    if (fieldErrors && typeof fieldErrors === 'object') {
      const detailsList = Object.entries(fieldErrors)
        .flatMap(([field, msgs]) => (Array.isArray(msgs) ? msgs.map((m) => `${field}: ${m}`) : []));
      if (detailsList.length > 0) {
        message = detailsList.join(' · ');
      }
    }
    const err = new Error(message);
    err.code = data?.error?.code;
    err.status = res.status;
    err.details = data?.error?.details;
    throw err;
  }
  return data;
}

export const api = {
  get: (path) => apiRequest(path, { method: 'GET' }),
  post: (path, body) => apiRequest(path, { method: 'POST', body }),
  patch: (path, body) => apiRequest(path, { method: 'PATCH', body }),
  put: (path, body) => apiRequest(path, { method: 'PUT', body }),
  delete: (path) => apiRequest(path, { method: 'DELETE' }),
  upload: (path, formData) => apiRequest(path, { method: 'POST', body: formData }),
  download: (path) => apiRequest(path, { method: 'GET', rawResponse: true })
};
