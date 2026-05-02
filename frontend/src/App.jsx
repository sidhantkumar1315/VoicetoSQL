import { useState, useRef, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ChatMessage from "./components/ChatMessage";
import VoiceButton from "./components/VoiceButton";
import SchemaView from "./components/SchemaView";
import HistoryView from "./components/HistoryView";
import BotAvatar from "./components/BotAvatar";
import { sendQuery, fetchSchema } from "./api";
import "./App.css";

const DEMO_SUGGESTIONS = [
  "Top 5 products by revenue",
  "Best performing salesperson",
  "Revenue by region",
  "Monthly profit trend 2025",
  "Total expenses by category",
];

const VIEW_TITLES = {
  chat:    "Chat",
  schema:  "Schema",
  history: "History",
};

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      data: {
        summary: "Hello! Ask me anything about your data — in plain English or using your voice.",
        sql: "", columns: [], rows: [], row_count: 0,
      },
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState([]);
  const [hasCustomDb, setHasCustomDb] = useState(false);
  const [dark, setDark] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState("chat");
  const bottomRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    fetchSchema().then((d) => setTables(d.tables || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (activeNav === "chat") {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeNav]);

  const submit = async (question) => {
    const q = question.trim();
    if (!q || loading) return;
    setActiveNav("chat");
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setInput("");
    setLoading(true);
    try {
      const data = await sendQuery(q);
      setMessages((prev) => [...prev, { role: "bot", data }]);
    } catch (err) {
      const detail = err.response?.data?.detail || "Something went wrong. Please try again.";
      setMessages((prev) => [...prev, { role: "error", text: detail }]);
    } finally {
      setLoading(false);
    }
  };

  const handleUploaded = (data) => {
    setTables(data.tables || []);
    setHasCustomDb(true);
    setMessages([{
      role: "bot",
      data: {
        summary: `Database loaded — ${data.tables.length} table${data.tables.length !== 1 ? "s" : ""} found. Ask me anything about your data.`,
        sql: "", columns: [], rows: [], row_count: 0,
      },
    }]);
    setActiveNav("chat");
  };

  const handleReset = () => {
    setHasCustomDb(false);
    fetchSchema().then((d) => setTables(d.tables || [])).catch(() => {});
    setMessages([{
      role: "bot",
      data: {
        summary: "Switched back to demo data. Try one of the suggestions to get started.",
        sql: "", columns: [], rows: [], row_count: 0,
      },
    }]);
  };

  const suggestions = hasCustomDb
    ? tables.flatMap((t) => [`How many rows in ${t.table}?`, `Show all data from ${t.table}`]).slice(0, 5)
    : DEMO_SUGGESTIONS;

  return (
    <div className={`app-layout${sidebarCollapsed ? " sidebar-is-collapsed" : ""}`}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
        tables={tables}
        hasCustomDb={hasCustomDb}
        onUploaded={handleUploaded}
        onReset={handleReset}
        dark={dark}
        onThemeToggle={() => setDark((d) => !d)}
        activeNav={activeNav}
        onNavChange={setActiveNav}
      />

      <div className="main-area">
        {/* Top bar */}
        <div className="topbar">
          <div className="topbar-left">
            <h2 className="topbar-title">{VIEW_TITLES[activeNav]}</h2>
            {hasCustomDb && activeNav === "chat" && (
              <span className="topbar-badge">Custom DB</span>
            )}
          </div>
          <div className="topbar-right">
            {activeNav === "chat" && (
              <span className="topbar-hint">Ask in plain English or use your voice</span>
            )}
          </div>
        </div>

        {/* Schema view */}
        {activeNav === "schema" && (
          <div className="view-scroll-area">
            <SchemaView tables={tables} />
          </div>
        )}

        {/* History view */}
        {activeNav === "history" && (
          <div className="view-scroll-area">
            <HistoryView messages={messages} onRerun={(q) => { setActiveNav("chat"); submit(q); }} />
          </div>
        )}

        {/* Chat view */}
        {activeNav === "chat" && (
          <>
            <div className="suggestions-bar">
              {suggestions.map((s) => (
                <button key={s} className="chip" onClick={() => submit(s)} disabled={loading}>
                  {s}
                </button>
              ))}
            </div>

            <main className="chat-area">
              {messages.map((msg, i) => (
                <ChatMessage key={i} msg={msg} />
              ))}
              {loading && (
                <div className="message bot-message">
                  <div className="message-inner bot-inner loading-inner">
                    <BotAvatar />
                    <div className="loading-bubble">
                      <span className="dot" /><span className="dot" /><span className="dot" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </main>

            <footer className="input-area">
              <VoiceButton onTranscript={(t) => { setInput(t); submit(t); }} disabled={loading} />
              <input
                className="text-input"
                type="text"
                placeholder="Ask a question about your data…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit(input)}
                disabled={loading}
              />
              <button
                className="send-btn"
                onClick={() => submit(input)}
                disabled={loading || !input.trim()}
              >
                Send
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
