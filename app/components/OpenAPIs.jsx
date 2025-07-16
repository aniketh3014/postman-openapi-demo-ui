"use client";
import React, { useEffect, useState, useRef } from "react";
import {
  fetchOpenAPIs,
  fetchOpenAPI,
  updateOpenAPI,
  importOpenAPI,
  exportOpenAPI,
} from "../lib/api.js";

function OpenAPIList({ specs, onSelect, onDelete, selectedId, loading }) {
  return (
    <div className="space-y-2 w-full">
      {loading ? (
        <div className="text-gray-400 text-center">
          Loading OpenAPI specs...
        </div>
      ) : specs.length === 0 ? (
        <div className="text-gray-400 text-center">No OpenAPI specs found.</div>
      ) : (
        specs.map((spec) => (
          <div
            key={spec.id}
            className={`flex items-center justify-between px-4 py-2 rounded cursor-pointer transition border ${
              selectedId === spec.id
                ? "bg-blue-100 border-blue-400"
                : "hover:bg-blue-50 border-transparent"
            }`}
            onClick={() => onSelect(spec.id)}
          >
            <span className="truncate font-medium text-black">
              {spec.title || spec.name || spec.id}
            </span>
            <button
              className="ml-2 text-xs text-red-500 hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(spec.id);
              }}
              title="Delete OpenAPI spec"
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}

function OpenAPIDetail({ spec, onSave, onExport, saving }) {
  const [editData, setEditData] = useState(spec || {});
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    setEditData(spec || {});
    setEditMode(false);
  }, [spec]);

  if (!spec) {
    return (
      <div className="text-gray-400 italic p-4 text-center">
        Select an OpenAPI spec to view or edit.
      </div>
    );
  }

  const handleChange = (e) => {
    setEditData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = () => {
    onSave(editData);
  };

  return (
    <div className="bg-white rounded-xl shadow p-8">
      <div className="flex flex-col items-center justify-center mb-6">
        <h3 className="text-2xl font-bold text-blue-700 text-center">
          {editMode ? (
            <input
              className="border px-2 py-1 rounded w-64 text-black"
              name="title"
              value={editData.title || editData.name || ""}
              onChange={handleChange}
              placeholder="Spec Title"
            />
          ) : (
            <span className="text-black">
              {spec.title || spec.name || (
                <span className="italic text-gray-400">Unnamed</span>
              )}
            </span>
          )}
        </h3>
        <div className="flex gap-2 mt-4">
          <button
            className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
            onClick={() => setEditMode((m) => !m)}
          >
            {editMode ? "Cancel" : "Edit"}
          </button>
          <a
            href={onExport(spec.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 rounded bg-green-600 text-white text-sm hover:bg-green-700"
            title="Export OpenAPI spec"
          >
            Export
          </a>
        </div>
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1 text-blue-900">
          Description
        </label>
        {editMode ? (
          <textarea
            className="border px-2 py-1 rounded w-full min-h-[60px] text-black"
            name="description"
            value={editData.description || ""}
            onChange={handleChange}
            placeholder="Description"
          />
        ) : (
          <div className="min-h-[24px] text-black">
            {spec.description || (
              <span className="italic text-gray-400">No description</span>
            )}
          </div>
        )}
      </div>
      {editMode && (
        <div className="mt-4 flex gap-2 justify-center">
          <button
            className="px-4 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      )}
      <div className="mt-6">
        <label className="block text-sm font-medium mb-1 text-blue-900">
          ID
        </label>
        <div className="text-xs text-black">{spec.id}</div>
      </div>
    </div>
  );
}

export default function OpenAPIs() {
  const [specs, setSpecs] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedSpec, setSelectedSpec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef();

  // Fetch all OpenAPI specs
  const loadSpecs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOpenAPIs();
      setSpecs(data);
    } catch (err) {
      setError(err.message || "Failed to fetch OpenAPI specs.");
    }
    setLoading(false);
  };

  // Fetch single OpenAPI spec
  const loadSpecDetail = async (id) => {
    setDetailLoading(true);
    setError(null);
    try {
      const res = await fetchOpenAPI(id);
      setSelectedSpec(res.data);
    } catch (err) {
      setError(err.message || "Failed to fetch OpenAPI spec detail.");
      setSelectedSpec(null);
    }
    setDetailLoading(false);
  };

  useEffect(() => {
    loadSpecs();
  }, []);

  useEffect(() => {
    if (selectedId) {
      loadSpecDetail(selectedId);
    } else {
      setSelectedSpec(null);
    }
  }, [selectedId]);

  // Save (update) OpenAPI spec
  const handleSave = async (data) => {
    setSaving(true);
    setError(null);
    try {
      await updateOpenAPI(data.id, data);
      await loadSpecs();
      await loadSpecDetail(data.id);
    } catch (err) {
      setError(err.message || "Failed to save OpenAPI spec.");
    }
    setSaving(false);
  };

  // Delete OpenAPI spec
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this OpenAPI spec?"))
      return;
    setError(null);
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/api/v1"}/openapi/${id}`,
        {
          method: "DELETE",
        },
      );
      if (selectedId === id) setSelectedId(null);
      await loadSpecs();
    } catch (err) {
      setError(err.message || "Failed to delete OpenAPI spec.");
    }
  };

  // Import OpenAPI spec
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    setError(null);
    try {
      await importOpenAPI(file);
      await loadSpecs();
      setSelectedId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError(err.message || "Failed to import OpenAPI spec.");
    }
    setImporting(false);
  };

  // Export OpenAPI spec (returns URL)
  const handleExport = (id) => exportOpenAPI(id);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-8 px-2">
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8 bg-white rounded-xl shadow-lg p-6 md:p-10">
        {/* Sidebar: List & Import */}
        <div className="w-full md:w-1/3 max-w-xs flex flex-col items-center">
          <div className="flex items-center justify-between mb-4 w-full">
            <h2 className="text-xl font-bold text-blue-700 text-center w-full">
              OpenAPI Specs
            </h2>
            <label className="relative inline-block">
              <input
                type="file"
                accept=".json,.yaml,.yml"
                className="absolute left-0 top-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleImport}
                ref={fileInputRef}
                disabled={importing}
              />
              <span className="px-3 py-1 bg-blue-600 text-white rounded text-sm cursor-pointer hover:bg-blue-700">
                {importing ? "Importing..." : "Import"}
              </span>
            </label>
          </div>
          {error && (
            <div className="mb-2 text-red-500 text-sm text-center">{error}</div>
          )}
          <div className="w-full">
            <OpenAPIList
              specs={specs}
              onSelect={setSelectedId}
              onDelete={handleDelete}
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
                Loading OpenAPI spec...
              </div>
            ) : (
              <OpenAPIDetail
                spec={selectedSpec}
                onSave={handleSave}
                onExport={handleExport}
                saving={saving}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
