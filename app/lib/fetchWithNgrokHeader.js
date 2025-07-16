// assignment/demo-ui/app/lib/fetchWithNgrokHeader.js
export default function fetchWithNgrokHeader(url, options = {}) {
  const headers = {
    ...(options.headers || {}),
    "ngrok-skip-browser-warning": "true",
  };
  return fetch(url, { ...options, headers });
}
