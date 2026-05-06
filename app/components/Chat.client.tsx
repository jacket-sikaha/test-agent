// app/page.tsx（或 app/components/Chat.client.tsx）
"use client";

import { useChat } from "@ai-sdk/react"; // AI SDK 5+
import { useState } from "react";

export default function Chat() {
  const { messages, sendMessage, status, error } = useChat({
    // api: "/api/chat", // 对应你的 API 路由（默认就是 /api/chat，可省略）
  });

  const [input, setInput] = useState("");

  // 发送消息
  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    sendMessage({ text }); // 5+ 推荐用法
    setInput("");
  };

  // 回车发送
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="flex flex-col w-full h-full"
      style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}
    >
      {/* 消息列表 */}
      <div className="flex-1 flex flex-col gap-4">
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              textAlign: m.role === "user" ? "right" : "left",
            }}
          >
            {/* 简单把 parts 转成文本；你可以按需渲染 tool-call 等类型 */}
            <span
              style={{
                display: "inline-block",
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid #e5e7eb",
                background: m.role === "user" ? "#eff6ff" : "#f9fafb",
                maxWidth: "80%",
                wordBreak: "break-word",
              }}
            >
              {m.parts
                ?.filter((p) => p.type === "text")
                .map((p, i) => (
                  <span key={i}>{p.text}</span>
                ))}
            </span>
          </div>
        ))}

        {status === "streaming" && (
          <div style={{ color: "#9ca3af" }}>正在输出…</div>
        )}
      </div>

      {/* 错误提示 */}
      {error && (
        <div style={{ color: "#ef4444", marginTop: 6 }}>
          出错了：{error.message ?? "未知错误"}
        </div>
      )}

      {/* 输入区 */}
      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="问点什么…（试试：北京天气如何）"
          style={{ flex: 1, padding: 8 }}
          disabled={status === "streaming"}
        />
        <button
          onClick={handleSend}
          disabled={status === "streaming" || !input.trim()}
        >
          发送
        </button>
      </div>
    </div>
  );
}
