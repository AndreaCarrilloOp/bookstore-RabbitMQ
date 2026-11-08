const base = (import.meta.env.VITE_API_BASE || 'http://localhost:8888').replace(/\/$/, '');
export const apiBase = base;
export async function callFunction(name, { method = 'GET', body, id } = {}) {
  const url = `${base}/.netlify/functions/${name}${id !== undefined ? '/' + encodeURIComponent(id) : ''}`;
  let response;
  try {
    response = await fetch(url, { method,
      headers: { 'Accept': 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
  } catch (error) { throw new Error(`No se logró conectar al backend (${base}): ${error.message}`); }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Error HTTP ${response.status}`);
  return data;
}
