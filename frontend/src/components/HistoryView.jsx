export default function HistoryView({ messages, onRerun }) {
  const queries = messages.filter((m) => m.role === "user");

  if (queries.length === 0) {
    return (
      <div className="view-empty">
        <p className="view-empty-title">No queries yet</p>
        <p className="view-empty-sub">Your question history will appear here.</p>
      </div>
    );
  }

  return (
    <div className="history-view">
      <div className="schema-view-header">
        <h3 className="schema-view-title">Query History</h3>
        <span className="schema-view-count">{queries.length} quer{queries.length !== 1 ? "ies" : "y"}</span>
      </div>
      <div className="history-list">
        {[...queries].reverse().map((msg, i) => (
          <div key={i} className="history-item">
            <span className="history-q">{msg.text}</span>
            <button className="history-rerun-btn" onClick={() => onRerun(msg.text)}>
              ↗ Ask again
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
