import { useState, useRef } from "react";
import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function FileUpload({ onUploaded, onReset, hasCustomDb }) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["db", "sqlite", "csv"].includes(ext)) {
      setError("Only .db, .sqlite, or .csv files are supported.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await axios.post(`${BASE}/upload`, formData);
      onUploaded(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    setError("");
    try {
      await axios.post(`${BASE}/reset`);
      onReset();
    } catch {
      setError("Failed to reset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-area">
      {hasCustomDb ? (
        <div className="upload-active">
          <span className="upload-active-label">📂 Custom database loaded</span>
          <button className="reset-btn" onClick={handleReset} disabled={loading}>
            Switch to demo data
          </button>
        </div>
      ) : (
        <div
          className={`dropzone ${dragging ? "dragging" : ""} ${loading ? "loading" : ""}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFile(e.dataTransfer.files[0]);
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".db,.sqlite,.csv"
            style={{ display: "none" }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
          {loading ? (
            <span className="upload-hint">Uploading...</span>
          ) : (
            <>
              <span className="upload-icon">⬆️</span>
              <span className="upload-hint">
                Drop your <strong>.db</strong>, <strong>.sqlite</strong>, or <strong>.csv</strong> file here
                <br />
                <small>or click to browse</small>
              </span>
            </>
          )}
        </div>
      )}
      {error && <p className="upload-error">{error}</p>}
    </div>
  );
}
