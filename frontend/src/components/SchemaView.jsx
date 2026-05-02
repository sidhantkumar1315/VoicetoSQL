export default function SchemaView({ tables }) {
  if (!tables || tables.length === 0) {
    return (
      <div className="view-empty">
        <p className="view-empty-title">No database loaded</p>
        <p className="view-empty-sub">Upload a .db, .sqlite, or .csv file using the sidebar.</p>
      </div>
    );
  }

  return (
    <div className="schema-view">
      <div className="schema-view-header">
        <h3 className="schema-view-title">Database Schema</h3>
        <span className="schema-view-count">{tables.length} table{tables.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="schema-view-tables">
        {tables.map((t) => (
          <div key={t.table} className="schema-view-card">
            <div className="schema-view-card-header">
              <span className="schema-view-table-name">{t.table}</span>
              <span className="schema-view-row-count">{t.row_count.toLocaleString()} rows</span>
            </div>
            <table className="schema-col-table">
              <thead>
                <tr>
                  <th>Column</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {t.columns.map((col) => (
                  <tr key={col.name}>
                    <td className="col-name-cell">{col.name}</td>
                    <td className="col-type-cell">{col.type || "TEXT"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
