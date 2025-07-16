const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/api/v1";

// --- Health Check ---
export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE.replace(/\/api\/v1$/, "")}/health`, {
      headers: { "ngrok-skip-browser-warning": "true" },
    });
    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      json = null;
    }
    if (!res.ok) {
      console.error("Health check failed:", res.status, text);
      throw new Error(`Health check failed: ${res.status} ${text}`);
    }
    return json;
  } catch (err) {
    console.error("Error in fetchHealth:", err);
    throw err;
  }
}

// --- Collections ---
export async function fetchCollections() {
  const res = await fetch(`${API_BASE}/postman`, {
    headers: { "ngrok-skip-browser-warning": "true" },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch collections: ${res.status} ${text}`);
  }
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    const json = await res.json();
    return json.data || [];
  } else {
    const text = await res.text();
    throw new Error(`Expected JSON, got: ${text}`);
  }
}

export async function fetchCollection(id) {
  const res = await fetch(`${API_BASE}/postman/${id}`, {
    headers: { "ngrok-skip-browser-warning": "true" },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch collection: ${res.status} ${text}`);
  }
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  } else {
    const text = await res.text();
    throw new Error(`Expected JSON, got: ${text}`);
  }
}

export async function updateCollection(id, data) {
  const res = await fetch(`${API_BASE}/postman/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to update collection: ${res.status} ${text}`);
  }
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  } else {
    const text = await res.text();
    throw new Error(`Expected JSON, got: ${text}`);
  }
}

export async function importCollection(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/postman/import`, {
    method: "POST",
    headers: { "ngrok-skip-browser-warning": "true" },
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to import collection: ${res.status} ${text}`);
  }
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  } else {
    const text = await res.text();
    throw new Error(`Expected JSON, got: ${text}`);
  }
}

export function exportCollection(id) {
  // Returns the export URL for downloading
  return `${API_BASE}/postman/${id}/export`;
}

// --- OpenAPI Specs ---
export async function fetchOpenAPIs() {
  const res = await fetch(`${API_BASE}/openapi`, {
    headers: { "ngrok-skip-browser-warning": "true" },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch OpenAPI specs: ${res.status} ${text}`);
  }
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    const json = await res.json();
    return json.data || [];
  } else {
    const text = await res.text();
    throw new Error(`Expected JSON, got: ${text}`);
  }
}

export async function fetchOpenAPI(id) {
  const res = await fetch(`${API_BASE}/openapi/${id}`, {
    headers: { "ngrok-skip-browser-warning": "true" },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch OpenAPI spec: ${res.status} ${text}`);
  }
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  } else {
    const text = await res.text();
    throw new Error(`Expected JSON, got: ${text}`);
  }
}

export async function updateOpenAPI(id, data) {
  const res = await fetch(`${API_BASE}/openapi/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to update OpenAPI spec: ${res.status} ${text}`);
  }
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  } else {
    const text = await res.text();
    throw new Error(`Expected JSON, got: ${text}`);
  }
}

export async function importOpenAPI(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/openapi/import`, {
    method: "POST",
    headers: { "ngrok-skip-browser-warning": "true" },
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to import OpenAPI spec: ${res.status} ${text}`);
  }
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  } else {
    const text = await res.text();
    throw new Error(`Expected JSON, got: ${text}`);
  }
}

export function exportOpenAPI(id) {
  // Returns the export URL for downloading
  return `${API_BASE}/openapi/${id}/export`;
}
