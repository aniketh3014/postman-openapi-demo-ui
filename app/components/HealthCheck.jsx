import React, { useEffect, useState } from "react";
import { fetchHealth } from "../lib/api.js";

export default function HealthCheck() {
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchHealth()
      .then((data) => {
        if (mounted) setStatus(data.status || "unknown");
      })
      .catch((err) => {
        if (mounted) setError(err.message || "Failed to check health");
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
        <h2 className="text-3xl font-bold mb-6 text-blue-700 text-center flex items-center gap-2">
          <span role="img" aria-label="heartbeat" className="text-4xl">
            💓
          </span>
          API Health Check
        </h2>
        {error ? (
          <div className="flex flex-col items-center">
            <span className="text-5xl mb-2">❌</span>
            <div className="text-red-600 font-semibold text-lg text-center">
              Error: {error}
            </div>
          </div>
        ) : status === "loading" ? (
          <div className="flex flex-col items-center">
            <span className="animate-spin text-4xl mb-2">⏳</span>
            <div className="text-gray-500 text-lg">Checking API health...</div>
          </div>
        ) : status === "ok" ? (
          <div className="flex flex-col items-center">
            <span className="text-5xl mb-2 animate-pulse">✅</span>
            <div className="text-green-600 font-bold text-xl">
              API is healthy
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <span className="text-5xl mb-2">⚠️</span>
            <div className="text-yellow-600 font-semibold text-lg text-center">
              Status: {status}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
