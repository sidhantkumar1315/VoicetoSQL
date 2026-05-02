import { useState } from "react";
import ResultTable from "./ResultTable";
import ResultChart from "./ResultChart";
import BotAvatar from "./BotAvatar";

export default function ChatMessage({ msg }) {
  const [showSQL, setShowSQL] = useState(false);

  if (msg.role === "user") {
    return (
      <div className="message user-message">
        <div className="message-inner user-inner">
          <span className="user-bubble">{msg.text}</span>
          <div className="user-avatar">You</div>
        </div>
      </div>
    );
  }

  if (msg.role === "error") {
    return (
      <div className="message bot-message">
        <div className="message-inner bot-inner">
          <BotAvatar />
          <div className="error-bubble">⚠️ {msg.text}</div>
        </div>
      </div>
    );
  }

  const { summary, sql, columns, rows, row_count } = msg.data;
  const hasData = columns && columns.length > 0 && rows && rows.length > 0;

  return (
    <div className="message bot-message">
      <div className="message-inner bot-inner">
        <BotAvatar />

        <div className="result-card">
          {/* White top section: summary + sql toggle */}
          <div className="result-summary-section">
            <p className="summary">{summary}</p>

            <div className="result-meta-row">
              {sql && (
                <button className="sql-toggle" onClick={() => setShowSQL((s) => !s)}>
                  <span className="sql-toggle-icon">{showSQL ? "▲" : "▼"}</span>
                  {showSQL ? "Hide SQL" : "View SQL"}
                </button>
              )}
              {row_count > 0 && (
                <span className="stat-pill">{row_count} row{row_count !== 1 ? "s" : ""} · {columns.length} col{columns.length !== 1 ? "s" : ""}</span>
              )}
            </div>

            {showSQL && sql && <pre className="sql-block">{sql}</pre>}
          </div>

          {/* Beige data section: chart + table */}
          {hasData && (
            <div className="data-section">
              <ResultChart columns={columns} rows={rows} />
              <ResultTable columns={columns} rows={rows} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
