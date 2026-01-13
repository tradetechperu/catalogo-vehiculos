const BACKEND =
  process.env.REACT_APP_BACKEND_ORIGIN ||
  "http://localhost:4000";

export function apiFetch(path, options = {}) {
  if (!path.startsWith("/")) path = "/" + path;

  return fetch(`${BACKEND}${path}`, {
    cache: "no-store",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
}
