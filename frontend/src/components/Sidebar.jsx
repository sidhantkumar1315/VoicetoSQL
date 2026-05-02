import { useRef, useState } from "react";
import axios from "axios";
import ThemeToggle from "./ThemeToggle";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const NAV_ITEMS = [
  { icon: "💬", label: "Chat",    id: "chat" },
  { icon: "🗂",  label: "Schema", id: "schema" },
  { icon: "🕐",  label: "History",id: "history" },
];

export default function Sidebar({
  collapsed, onToggle,
  tables, hasCustomDb, onUploaded, onReset,
  dark, onThemeToggle,
  activeNav, onNavChange,
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file) => {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["db", "sqlite", "csv"].includes(ext)) {
      setError("Only .db, .sqlite, or .csv files.");
      return;
    }
    setUploading(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    try {
      const { data } = await axios.post(`${BASE}/upload`, fd);
      onUploaded(data);
      onNavChange("chat");
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleReset = async () => {
    try {
      await axios.post(`${BASE}/reset`);
      onReset();
    } catch {}
  };

  return (
    <aside className={`sidebar${collapsed ? " sidebar--collapsed" : ""}`}>
      {/* Header */}
      <div className="sidebar-header">
        {!collapsed && (
          <div className="sidebar-brand">
            <span className="sidebar-brand-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 3 21 3 21 8" />
                <line x1="4" y1="20" x2="21" y2="3" />
                <polyline points="21 16 21 21 16 21" />
                <line x1="15" y1="15" x2="21" y2="21" />
                <line x1="4" y1="4" x2="9" y2="9" />
              </svg>
            </span>
            <span className="sidebar-brand-name">VoiceToSQL</span>
          </div>
        )}
        <button className="sidebar-toggle-btn" onClick={onToggle} title="Toggle sidebar">
          <span className="bar" /><span className="bar" /><span className="bar" />
        </button>
      </div>

      {/* Add Database */}
      <div className="sidebar-upload-area">
        <input
          ref={inputRef}
          type="file"
          accept=".db,.sqlite,.csv"
          style={{ display: "none" }}
          onChange={(e) => { handleFile(e.target.files[0]); e.target.value = ""; }}
        />
        {hasCustomDb ? (
          <button className="sidebar-reset-btn" onClick={handleReset} title="Switch to demo data">
            <span className="add-icon">↩</span>
            {!collapsed && <span>Demo data</span>}
          </button>
        ) : (
          <button
            className="sidebar-add-btn"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            title="Add Database"
          >
            <span className="add-icon">+</span>
            {!collapsed && <span>{uploading ? "Loading…" : "Add Database"}</span>}
          </button>
        )}
        {error && !collapsed && <p className="sidebar-error">{error}</p>}
      </div>

      <div className="sidebar-divider" />

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`sidebar-nav-item${activeNav === item.id ? " sidebar-nav-item--active" : ""}`}
            onClick={() => onNavChange(item.id)}
            title={item.label}
          >
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && <span className="nav-label">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Tables list (Schema section) */}
      {!collapsed && tables.length > 0 && (
        <>
          <div className="sidebar-divider" />
          <div className="sidebar-section">
            <p className="sidebar-section-title">Tables</p>
            {tables.map((t) => (
              <div key={t.table} className="sidebar-table-row">
                <span className="sidebar-table-icon">⊟</span>
                <div className="sidebar-table-meta">
                  <span className="sidebar-table-name">{t.table}</span>
                  <span className="sidebar-table-count">{t.row_count.toLocaleString()} rows</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="sidebar-spacer" />

      {/* Bottom */}
      <div className="sidebar-bottom">
        <div className="sidebar-divider" />
        <div className="sidebar-theme-row">
          <ThemeToggle dark={dark} onToggle={onThemeToggle} />
          {!collapsed && (
            <span className="nav-label">{dark ? "Light mode" : "Dark mode"}</span>
          )}
        </div>
      </div>
    </aside>
  );
}
