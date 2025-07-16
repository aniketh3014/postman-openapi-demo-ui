"use client";
import React, { useEffect, useState, useRef } from "react";
import {
  fetchCollections,
  fetchCollection,
  updateCollection,
  importCollection,
  exportCollection,
} from "../lib/api.js";

function CollectionList({
  collections,
  onSelect,
  onDelete,
  selectedId,
  loading,
}) {
  return (
    <div className="space-y-2">
      {loading ? (
        <div className="text-gray-400">Loading collections...</div>
      ) : collections.length === 0 ? (
        <div className="text-gray-400">No collections found.</div>
      ) : (
        collections.map((col) => (
          <div
            key={col.id}
            className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer transition border ${
              selectedId === col.id
                ? "bg-blue-100 border-blue-400"
                : "hover:bg-gray-100 border-transparent"
            }`}
            onClick={() => onSelect(col.id)}
          >
            <span className="truncate font-medium text-black">
              {col.name || col.id}
            </span>
            <button
              className="ml-2 text-xs text-red-500 hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(col.id);
              }}
              title="Delete collection"
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}

function CollectionDetail({ collection, onSave, onExport, saving }) {
  const [editData, setEditData] = useState(collection || {});
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    setEditData(collection || {});
    setEditMode(false);
  }, [collection]);

  if (!collection) {
    return (
      <div className="text-gray-400 italic p-4 text-center">
        Select a collection to view or edit.
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
      <div className="flex flex-col items-center mb-6">
        <h3 className="text-2xl font-bold text-blue-700 mb-2 text-center">
          {editMode ? (
            <input
              className="border px-2 py-1 rounded w-64 text-black"
              name="name"
              value={editData.name || ""}
              onChange={handleChange}
              placeholder="Collection Name"
            />
          ) : (
            collection.name || (
              <span className="italic text-gray-400">Unnamed</span>
            )
          )}
        </h3>
        <div className="flex gap-2 mt-2">
          <button
            className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
            onClick={() => setEditMode((m) => !m)}
          >
            {editMode ? "Cancel" : "Edit"}
          </button>
          <a
            href={onExport(collection.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 rounded bg-green-600 text-white text-sm hover:bg-green-700"
            title="Export collection"
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
            {collection.description || (
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
      <div className="mt-6 text-center">
        <label className="block text-sm font-medium mb-1 text-blue-900">
          ID
        </label>
        <div className="text-xs text-black">{collection.id}</div>
      </div>
    </div>
  );
}

export default function Collections() {
  const [collections, setCollections] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [collectionRequests, setCollectionRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef();

  // Fetch all collections
  const loadCollections = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCollections();
      setCollections(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to fetch collections.");
    }
    setLoading(false);
  };

  // Fetch single collection
  const loadCollectionDetail = async (id) => {
    setDetailLoading(true);
    setError(null);
    try {
      const res = await fetchCollection(id);
      setSelectedCollection(res.data);
      // Fetch requests for this collection
      const reqRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/api/v1"}/postman/${id}/requests`,
      );
      const reqJson = await reqRes.json();
      setCollectionRequests(reqJson.success ? reqJson.data : []);
    } catch (err) {
      setError(err.message || "Failed to fetch collection detail.");
      setSelectedCollection(null);
      setCollectionRequests([]);
    }
    setDetailLoading(false);
  };

  useEffect(() => {
    loadCollections();
  }, []);

  useEffect(() => {
    if (selectedId) {
      loadCollectionDetail(selectedId);
    } else {
      setSelectedCollection(null);
    }
  }, [selectedId]);

  // Save (update) collection
  const handleSave = async (data) => {
    setSaving(true);
    setError(null);
    try {
      await updateCollection(data.id, data);
      await loadCollections();
      await loadCollectionDetail(data.id);
    } catch (err) {
      setError(err.message || "Failed to save collection.");
    }
    setSaving(false);
  };

  // Delete collection
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this collection?"))
      return;
    setError(null);
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/api/v1"}/postman/${id}`,
        {
          method: "DELETE",
        },
      );
      if (selectedId === id) setSelectedId(null);
      await loadCollections();
    } catch (err) {
      setError(err.message || "Failed to delete collection.");
    }
  };

  // Import collection
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    setError(null);
    try {
      await importCollection(file);
      await loadCollections();
      setSelectedId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError(err.message || "Failed to import collection.");
    }
    setImporting(false);
  };

  // Export collection (returns URL)
  const handleExport = (id) => exportCollection(id);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-8 px-2">
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8 bg-white rounded-xl shadow-lg p-6 md:p-10">
        {/* Sidebar: List & Import */}
        <div className="w-full md:w-1/3 max-w-xs flex flex-col items-center">
          <div className="flex items-center justify-between mb-4 w-full">
            <h2 className="text-xl font-bold text-blue-700 text-center w-full">
              Collections
            </h2>
            <label className="relative inline-block">
              <input
                type="file"
                accept=".json"
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
            <div className="mb-2 text-red-500 text-sm text-center w-full">
              {error}
            </div>
          )}
          <div className="w-full">
            <CollectionList
              collections={collections}
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
                Loading collection...
              </div>
            ) : (
              <>
                <CollectionDetail
                  collection={selectedCollection}
                  onSave={handleSave}
                  onExport={handleExport}
                  saving={saving}
                />
                {/* Show requests for this collection */}
                {selectedCollection && (
                  <div className="mt-10">
                    <h4 className="text-lg font-bold mb-2 text-blue-700 text-center">
                      Requests in this Collection
                    </h4>
                    {collectionRequests.length === 0 ? (
                      <div className="text-gray-400 text-center">
                        No requests found for this collection.
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-200 bg-white rounded shadow">
                        {collectionRequests.map((req) => (
                          <li
                            key={req.id}
                            className="px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between"
                          >
                            <span className="font-medium text-black">
                              {req.name || req.id}
                            </span>
                            <span className="text-xs text-gray-500 mt-1 md:mt-0">
                              {req.method} &mdash; {req.url?.raw || ""}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
