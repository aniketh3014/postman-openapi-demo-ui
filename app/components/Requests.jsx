"use client";
import React, { useEffect, useState } from "react";

// --- API helpers (inline for self-containment, but should be moved to lib/api.js) ---
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/api/v1";

// List all requests
async function fetchRequests() {
  const res = await fetch(`${API_BASE}/requests`);
  if (!res.ok) throw new Error("Failed to fetch requests");
  const json = await res.json();
  if (!json.success) throw new Error("API returned unsuccessful response");
  return json.data || [];
}

// Get request by ID
async function fetchRequest(id) {
  const res = await fetch(`${API_BASE}/requests/${id}`);
  if (!res.ok) throw new Error("Failed to fetch request");
  return res.json();
}

// Create request
async function createRequest(data) {
  const res = await fetch(`${API_BASE}/requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create request");
  return res.json();
}

// Delete request
async function deleteRequest(id) {
  const res = await fetch(`${API_BASE}/requests/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete request");
  return res.json();
}

// Update payload
async function updatePayload(id, payload) {
  const res = await fetch(`${API_BASE}/requests/${id}/payload`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ payload }),
  });
  if (!res.ok) throw new Error("Failed to update payload");
  return res.json();
}

// Update headers
async function updateHeaders(id, headersObj) {
  const res = await fetch(`${API_BASE}/requests/${id}/headers`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(headersObj),
  });
  if (!res.ok) throw new Error("Failed to update headers");
  return res.json();
}

// Update params
async function updateParams(id, paramsObj) {
  const res = await fetch(`${API_BASE}/requests/${id}/params`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ params: paramsObj }),
  });
  if (!res.ok) throw new Error("Failed to update params");
  return res.json();
}

// Clone request
async function cloneRequest(id, name) {
  const res = await fetch(`${API_BASE}/requests/${id}/clone`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("Failed to clone request");
  return res.json();
}

// List requests for a collection
async function fetchRequestsByCollection(collectionId) {
  const res = await fetch(`${API_BASE}/postman/${collectionId}/requests`);
  if (!res.ok) throw new Error("Failed to fetch requests for collection");
  const json = await res.json();
  if (!json.success) throw new Error("API returned unsuccessful response");
  return json.data || [];
}

// --- UI Components ---

function RequestList({
  requests,
  onSelect,
  onDelete,
  onClone,
  selectedId,
  loading,
}) {
  return (
    <div className="space-y-2 w-full">
      {loading ? (
        <div className="text-gray-400 text-center">Loading requests...</div>
      ) : requests.length === 0 ? (
        <div className="text-gray-400 text-center">No requests found.</div>
      ) : (
        requests.map((req) => (
          <div
            key={req.id}
            className={`flex items-center justify-between px-4 py-2 rounded cursor-pointer transition border ${
              selectedId === req.id
                ? "bg-blue-100 border-blue-400"
                : "hover:bg-blue-50 border-transparent"
            }`}
            onClick={() => onSelect(req.id)}
          >
            <span className="truncate font-medium text-blue-900">
              {req.name || req.id}
            </span>
            <div className="flex gap-2">
              <button
                className="text-xs text-green-600 hover:underline"
                title="Clone"
                onClick={(e) => {
                  e.stopPropagation();
                  onClone(req.id);
                }}
              >
                Clone
              </button>
              <button
                className="text-xs text-red-500 hover:underline"
                title="Delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(req.id);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function KeyValueEditor({ label, data, onChange, disabled }) {
  const [entries, setEntries] = useState(
    Object.entries(data || {}).length > 0 ? Object.entries(data) : [["", ""]],
  );

  useEffect(() => {
    setEntries(
      Object.entries(data || {}).length > 0 ? Object.entries(data) : [["", ""]],
    );
  }, [data]);

  const handleEntryChange = (idx, key, value) => {
    const newEntries = entries.map((entry, i) =>
      i === idx ? [key, value] : entry,
    );
    setEntries(newEntries);
    onChange(Object.fromEntries(newEntries.filter(([k]) => k)));
  };

  const handleAdd = () => {
    setEntries([...entries, ["", ""]]);
  };

  const handleRemove = (idx) => {
    const newEntries = entries.filter((_, i) => i !== idx);
    setEntries(newEntries.length ? newEntries : [["", ""]]);
    onChange(Object.fromEntries(newEntries.filter(([k]) => k)));
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {entries.map(([k, v], idx) => (
        <div className="flex gap-2 mb-1" key={idx}>
          <input
            className="border px-2 py-1 rounded w-1/3 text-black"
            placeholder="Key"
            value={k}
            disabled={disabled}
            onChange={(e) => handleEntryChange(idx, e.target.value, v)}
          />
          <input
            className="border px-2 py-1 rounded w-2/3 text-black"
            placeholder="Value"
            value={v}
            disabled={disabled}
            onChange={(e) => handleEntryChange(idx, k, e.target.value)}
          />
          {!disabled && (
            <button
              className="text-xs text-red-500"
              onClick={() => handleRemove(idx)}
              type="button"
              title="Remove"
            >
              ×
            </button>
          )}
        </div>
      ))}
      {!disabled && (
        <button
          className="text-xs text-blue-600 hover:underline mt-1"
          onClick={handleAdd}
          type="button"
        >
          + Add
        </button>
      )}
    </div>
  );
}

function RequestDetail({
  request,
  onSavePayload,
  onSaveHeaders,
  onSaveParams,
  saving,
}) {
  const [body, setBody] = useState(request?.body || {});
  const [headers, setHeaders] = useState(request?.headers || {});
  const [params, setParams] = useState(request?.params?.params || {});
  const [editPayload, setEditPayload] = useState(false);
  const [editHeaders, setEditHeaders] = useState(false);
  const [editParams, setEditParams] = useState(false);

  useEffect(() => {
    setBody(request?.body || {});
    setHeaders(request?.headers || {});
    setParams(request?.params?.params || {});
    setEditPayload(false);
    setEditHeaders(false);
    setEditParams(false);
  }, [request]);

  if (!request) {
    return (
      <div className="text-gray-400 italic p-4">
        Select a request to view or edit.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-8">
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold text-blue-700">
          {request.name || (
            <span className="italic text-gray-400">Unnamed</span>
          )}
        </h3>
        <div className="text-xs text-gray-500 mt-1">ID: {request.id}</div>
        <div className="text-xs text-black">
          Collection:{" "}
          {request.collection_id || request.collectionId || (
            <span className="italic text-gray-400">none</span>
          )}
        </div>
      </div>
      {/* Payload */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium mb-1 text-blue-900">
            Payload (mode: {body.mode || "none"})
          </label>
          <button
            className="text-xs text-blue-600 hover:underline"
            onClick={() => setEditPayload((v) => !v)}
          >
            {editPayload ? "Cancel" : "Edit"}
          </button>
        </div>
        {editPayload ? (
          <>
            {body.mode === "raw" && (
              <textarea
                className="border px-2 py-1 rounded w-full min-h-[60px] bg-white text-black"
                value={body.raw || ""}
                onChange={(e) =>
                  setBody((prev) => ({ ...prev, raw: e.target.value }))
                }
                placeholder="Payload (raw)"
              />
            )}
            {(body.mode === "formdata" || body.mode === "urlencoded") && (
              <KeyValueEditor
                label={body.mode === "formdata" ? "Form Data" : "URL Encoded"}
                data={
                  Array.isArray(body[body.mode])
                    ? Object.fromEntries(
                        (body[body.mode] || []).map((kv) => [kv.key, kv.value]),
                      )
                    : body[body.mode] || {}
                }
                onChange={(kvObj) =>
                  setBody((prev) => ({
                    ...prev,
                    [body.mode]: Object.entries(kvObj).map(([key, value]) => ({
                      key,
                      value,
                    })),
                  }))
                }
                disabled={false}
              />
            )}
            {/* Add more modes as needed */}
            <button
              className="mt-2 px-4 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 w-full"
              onClick={() => onSavePayload(request.id, body)}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </>
        ) : (
          <pre className="bg-gray-100 rounded p-3 text-xs overflow-x-auto text-black">
            {body.mode === "raw"
              ? body.raw || (
                  <span className="italic text-gray-400">No payload</span>
                )
              : JSON.stringify(body, null, 2)}
          </pre>
        )}
      </div>
      {/* Headers */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium mb-1 text-blue-900">
            Headers
          </label>
          <button
            className="text-xs text-blue-600 hover:underline"
            onClick={() => setEditHeaders((v) => !v)}
          >
            {editHeaders ? "Cancel" : "Edit"}
          </button>
        </div>
        <KeyValueEditor
          label=""
          data={headers}
          onChange={setHeaders}
          disabled={!editHeaders}
        />
        {editHeaders && (
          <button
            className="mt-2 px-4 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 w-full"
            onClick={() => onSaveHeaders(request.id, headers)}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        )}
      </div>
      {/* Params */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium mb-1 text-blue-900">
            Params
          </label>
          <button
            className="text-xs text-blue-600 hover:underline"
            onClick={() => setEditParams((v) => !v)}
          >
            {editParams ? "Cancel" : "Edit"}
          </button>
        </div>
        <KeyValueEditor
          label=""
          data={params}
          onChange={setParams}
          disabled={!editParams}
        />
        {editParams && (
          <button
            className="mt-2 px-4 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 w-full"
            onClick={() => onSaveParams(request.id, params)}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        )}
      </div>
      {/* Method and URL */}
      <div className="mb-2">
        <label className="block text-sm font-medium mb-1 text-blue-900">
          Method
        </label>
        <div className="text-xs text-black">{request.method || "GET"}</div>
        <label className="block text-sm font-medium mb-1 mt-2 text-blue-900">
          URL
        </label>
        <div className="text-xs text-black">
          {request.url?.raw || (
            <span className="italic text-gray-400">No URL</span>
          )}
        </div>
      </div>
    </div>
  );
}

function RequestCreateForm({ onCreate, creating, collections }) {
  const [form, setForm] = useState({
    name: "",
    method: "GET",
    url: "",
    collectionId: "",
    payload: "",
    headers: {},
    params: {},
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <form
      className="bg-gradient-to-br from-blue-100 via-white to-blue-50 rounded-xl shadow p-6 mb-6 w-full"
      onSubmit={async (e) => {
        e.preventDefault();
        await onCreate(form);
        setForm({
          name: "",
          method: "GET",
          url: "",
          collectionId: "",
          payload: "",
          headers: {},
          params: {},
        });
      }}
    >
      <h3 className="text-lg font-bold mb-4 text-center text-blue-700">
        Create New Request
      </h3>
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1 text-blue-900">
          Name
        </label>
        <input
          className="border px-2 py-1 rounded w-full bg-white text-blue-900"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Request name"
        />
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1 text-blue-900">
          Method
        </label>
        <select
          className="border px-2 py-1 rounded w-full bg-white text-blue-900"
          name="method"
          value={form.method}
          onChange={handleChange}
        >
          <option>GET</option>
          <option>POST</option>
          <option>PUT</option>
          <option>DELETE</option>
          <option>PATCH</option>
        </select>
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1 text-blue-900">
          URL
        </label>
        <input
          className="border px-2 py-1 rounded w-full bg-white text-blue-900"
          name="url"
          value={form.url}
          onChange={handleChange}
          placeholder="https://api.example.com/endpoint"
        />
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1 text-blue-900">
          Collection
        </label>
        <select
          className="border px-2 py-1 rounded w-full bg-white text-blue-900"
          name="collectionId"
          value={form.collectionId}
          onChange={handleChange}
        >
          <option value="">(None)</option>
          {collections.map((col) => (
            <option key={col.id} value={col.id}>
              {col.name || col.id}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        className="text-xs text-blue-600 hover:underline mb-2"
        onClick={() => setShowAdvanced((v) => !v)}
      >
        {showAdvanced ? "Hide Advanced" : "Show Advanced"}
      </button>
      {showAdvanced && (
        <>
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1 text-blue-900">
              Payload
            </label>
            <textarea
              className="border px-2 py-1 rounded w-full min-h-[40px] bg-white text-blue-900"
              name="payload"
              value={form.payload}
              onChange={handleChange}
              placeholder="Payload (JSON or text)"
            />
          </div>
          <div className="mb-2">
            <KeyValueEditor
              label="Headers"
              data={form.headers}
              onChange={(headers) => setForm((prev) => ({ ...prev, headers }))}
              disabled={false}
            />
          </div>
          <div className="mb-2">
            <KeyValueEditor
              label="Params"
              data={form.params}
              onChange={(params) => setForm((prev) => ({ ...prev, params }))}
              disabled={false}
            />
          </div>
        </>
      )}
      <button
        type="submit"
        className="mt-2 px-4 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 w-full"
        disabled={creating}
      >
        {creating ? "Creating..." : "Create"}
      </button>
    </form>
  );
}

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all requests
  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to fetch requests.");
    }
    setLoading(false);
  };

  // Fetch all collections (for create form)
  const loadCollections = async () => {
    try {
      const res = await fetch(`${API_BASE}/postman`);
      const json = await res.json();
      if (!json.success) throw new Error("API returned unsuccessful response");
      setCollections(json.data || []);
    } catch (err) {
      // ignore for now
    }
  };

  // Fetch single request
  const loadRequestDetail = async (id) => {
    setDetailLoading(true);
    setError(null);
    try {
      const res = await fetchRequest(id);
      setSelectedRequest(res.data);
    } catch (err) {
      setError(err.message || "Failed to fetch request detail.");
      setSelectedRequest(null);
    }
    setDetailLoading(false);
  };

  useEffect(() => {
    loadRequests();
    loadCollections();
  }, []);

  useEffect(() => {
    if (selectedId) {
      loadRequestDetail(selectedId);
    } else {
      setSelectedRequest(null);
    }
  }, [selectedId]);

  // Create request
  const handleCreate = async (data) => {
    setCreating(true);
    setError(null);
    try {
      await createRequest(data);
      await loadRequests();
      setSelectedId(null);
    } catch (err) {
      setError(err.message || "Failed to create request.");
    }
    setCreating(false);
  };

  // Delete request
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this request?"))
      return;
    setError(null);
    try {
      await deleteRequest(id);
      if (selectedId === id) setSelectedId(null);
      await loadRequests();
    } catch (err) {
      setError(err.message || "Failed to delete request.");
    }
  };

  // Clone request
  const handleClone = async (id) => {
    setError(null);
    const name = window.prompt("Enter a name for the cloned request:");
    if (!name) return;
    try {
      await cloneRequest(id, name);
      await loadRequests();
    } catch (err) {
      setError(err.message || "Failed to clone request.");
    }
  };

  // Save payload
  const handleSavePayload = async (id, body) => {
    setSaving(true);
    setError(null);
    try {
      await updatePayload(id, body);
      await loadRequestDetail(id);
      await loadRequests();
    } catch (err) {
      setError(err.message || "Failed to save payload.");
    }
    setSaving(false);
  };

  // Save headers
  const handleSaveHeaders = async (id, headers) => {
    setSaving(true);
    setError(null);
    try {
      await updateHeaders(id, headers);
      await loadRequestDetail(id);
      await loadRequests();
    } catch (err) {
      setError(err.message || "Failed to save headers.");
    }
    setSaving(false);
  };

  // Save params
  const handleSaveParams = async (id, paramsObj) => {
    setSaving(true);
    setError(null);
    try {
      await updateParams(id, { params: paramsObj });
      await loadRequestDetail(id);
      await loadRequests();
    } catch (err) {
      setError(err.message || "Failed to save params.");
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-8 px-2">
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8 bg-white rounded-xl shadow-lg p-6 md:p-10">
        {/* Sidebar: List & Create */}
        <div className="w-full md:w-1/3 max-w-xs flex flex-col items-center">
          <RequestCreateForm
            onCreate={handleCreate}
            creating={creating}
            collections={collections}
          />
          {error && (
            <div className="mb-2 text-red-500 text-sm text-center">{error}</div>
          )}
          <div className="w-full">
            <RequestList
              requests={requests}
              onSelect={setSelectedId}
              onDelete={handleDelete}
              onClone={handleClone}
              selectedId={selectedId}
              loading={loading}
            />
          </div>
        </div>
        {/* Main: Detail & Edit */}
        <div className="flex-1 min-w-0 flex flex-col items-center justify-center">
          <div className="w-full max-w-2xl">
            {detailLoading ? (
              <div className="text-gray-400 text-center">
                Loading request...
              </div>
            ) : (
              <RequestDetail
                request={selectedRequest}
                onSavePayload={handleSavePayload}
                onSaveHeaders={handleSaveHeaders}
                onSaveParams={handleSaveParams}
                saving={saving}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
