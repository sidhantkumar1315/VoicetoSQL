import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function sendQuery(question) {
  const { data } = await axios.post(`${BASE}/query`, { question });
  return data;
}

export async function fetchSchema() {
  const { data } = await axios.get(`${BASE}/schema`);
  return data;
}
