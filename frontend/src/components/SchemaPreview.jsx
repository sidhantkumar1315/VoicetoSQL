import { useState } from "react";

export default function SchemaPreview({ tables }) {
  const [open, setOpen] = useState(false);

  if (!tables || tables.length === 0) return null;

  return (
    <div className="schema-preview">
      <button className="schema-toggle" onClick={() => setOpen((o) => !o)}>
        🗂 {tables.length} table{tables.length !== 1 ? "s" : ""} loaded
        {open ? " ▲" : " ▼"}
      </button>

      {open && (
        <div className="schema-body">
          {tables.map((t) => (
            <div key={t.table} className="schema-table">
              <div className="schema-table-header">
                <span className="schema-table-name">{t.table}</span>
                <span className="schema-row-count">{t.row_count.toLocaleString()} rows</span>
              </div>
              <div className="schema-cols">
                {t.columns.map((col) => (
                  <span key={col.name} className="schema-col">
                    <span className="col-name">{col.name}</span>
                    <span className="col-type">{col.type || "TEXT"}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
