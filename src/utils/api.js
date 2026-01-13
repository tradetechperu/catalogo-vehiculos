function getToken() {
  return localStorage.getItem("admin_token") || "";
}

const API_BASE = process.env.REACT_APP_API_URL;

export async function api(path, options = {}) {
  const token = getToken();

  const r = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.message || "Error");
  return data;
}
