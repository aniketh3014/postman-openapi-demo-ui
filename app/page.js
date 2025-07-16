"use client";
import { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import components to avoid SSR issues
const Collections = dynamic(() => import("./components/Collections"), {
  ssr: false,
});
const Requests = dynamic(() => import("./components/Requests"), {
  ssr: false,
});
const OpenAPIs = dynamic(() => import("./components/OpenAPIs"), {
  ssr: false,
});
const HealthCheck = dynamic(() => import("./components/HealthCheck"), {
  ssr: false,
});

const NAV_ITEMS = [
  { key: "collections", label: "Collections" },
  { key: "requests", label: "Requests" },
  { key: "openapis", label: "OpenAPI Specs" },
  { key: "health", label: "Health Check" },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("collections");

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r flex flex-col py-8 px-4">
        <h1 className="text-2xl font-bold text-blue-700 mb-10 tracking-tight">
          Postman API Demo
        </h1>
        <nav className="flex flex-col gap-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`px-4 py-2 rounded text-left transition font-medium ${
                activeTab === item.key
                  ? "bg-blue-600 text-white shadow"
                  : "hover:bg-blue-100 text-gray-700"
              }`}
              onClick={() => setActiveTab(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="flex-grow" />
        <footer className="text-xs text-gray-400 pt-8">
          &copy; {new Date().getFullYear()} Postman API Demo UI
        </footer>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === "collections" && <Collections />}
        {activeTab === "requests" && <Requests />}
        {activeTab === "openapis" && <OpenAPIs />}
        {activeTab === "health" && <HealthCheck />}
        {/* Global Footer */}
        <footer className="w-full flex items-center justify-center gap-3 text-lg text-gray-700 font-semibold py-6 bg-white border-t fixed bottom-0 left-0 z-50">
          <span>
            Made with{" "}
            <span className="text-red-500" role="img" aria-label="love">
              ❤️
            </span>{" "}
            by Aniket
          </span>
          <a
            href="https://github.com/aniketh3014/postman-openapi-demo"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 flex items-center hover:text-black"
            title="GitHub Repository"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-7 h-7"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .268.18.579.688.481C19.138 20.2 22 16.448 22 12.021 22 6.484 17.523 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </footer>
      </main>
    </div>
  );
}
