// app/page.tsx
import Chat from "./components/Chat.client";

export default function Home() {
  return (
    <main className="h-svh" style={{ padding: 24 }}>
      <h2>最小 Agent 模板（GLM‑4.7‑Flash 免费模型）</h2>
      <Chat />
    </main>
  );
}
