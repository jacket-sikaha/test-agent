// app/components/Chat.client.tsx
"use client";

import { useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setLoading(true);

    // 乐观更新 UI
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();

      const reply: string = data?.reply ?? data?.content ?? "(无回复)";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "请求失败，请重试" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        maxWidth: 640,
        margin: "0 auto",
        paddingTop: 24,
      }}
    >
      {/* 消息列表 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              textAlign: m.role === "user" ? "right" : "left",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid #e5e7eb",
                background: m.role === "user" ? "#eff6ff" : "#f9fafb",
              }}
            >
              {m.content}
            </span>
          </div>
        ))}
        {loading && <div style={{ color: "#9ca3af" }}>思考中...</div>}
      </div>

      {/* 输入区 */}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入你的问题…"
          style={{ flex: 1, padding: 8 }}
          disabled={loading}
        />
        <button onClick={send} disabled={loading || !input.trim()}>
          发送
        </button>
      </div>
    </div>
  );
}
