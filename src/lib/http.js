const BACKEND = process.env.REACT_APP_BACKEND_ORIGIN || "";

export function apiUrl(path) {
  if (!path.startsWith("/")) path = "/" + path;
  return `${BACKEND}${path}`;
}