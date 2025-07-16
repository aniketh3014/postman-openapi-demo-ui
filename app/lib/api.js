const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/api/v1";

// --- Health Check ---
export async function fetchHealth() {
  const res = await fetch(`${API_BASE.replace(/\/api\/v1$/, "")}/health`);
  if (!res.ok) throw new Error("Health check failed");
  return res.json();
}

// --- Collections ---
export async function fetchCollections() {
  const res = await fetch(`${API_BASE}/postman`);
  if (!res.ok) throw new Error("Failed to fetch collections");
  const json = await res.json();
  if (!json.success) throw new Error("API returned unsuccessful response");
  return json.data || [];
}

export async function fetchCollection(id) {
  const res = await fetch(`${API_BASE}/postman/${id}`);
  if (!res.ok) throw new Error("Failed to fetch collection");
  return res.json();
}

export async function updateCollection(id, data) {
  const res = await fetch(`${API_BASE}/postman/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update collection");
  return res.json();
}

export async function importCollection(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/postman/import`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to import collection");
  return res.json();
}

export function exportCollection(id) {
  // Returns the export URL for downloading
  return `${API_BASE}/postman/${id}/export`;
}

// --- OpenAPI Specs ---
export async function fetchOpenAPIs() {
  const res = await fetch(`${API_BASE}/openapi`);
  if (!res.ok) throw new Error("Failed to fetch OpenAPI specs");
  const json = await res.json();
  if (!json.success) throw new Error("API returned unsuccessful response");
  return json.data || [];
}

export async function fetchOpenAPI(id) {
  const res = await fetch(`${API_BASE}/openapi/${id}`);
  if (!res.ok) throw new Error("Failed to fetch OpenAPI spec");
  return res.json();
}

export async function updateOpenAPI(id, data) {
  const res = await fetch(`${API_BASE}/openapi/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update OpenAPI spec");
  return res.json();
}

export async function importOpenAPI(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/openapi/import`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to import OpenAPI spec");
  return res.json();
}

export function exportOpenAPI(id) {
  // Returns the export URL for downloading
  return `${API_BASE}/openapi/${id}/export`;
}
