// Frontend talks to the local Express backend (see /backend).
// Override with VITE_API_URL if your backend runs elsewhere.
export const API_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";

export async function callApi<T = any>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
}
