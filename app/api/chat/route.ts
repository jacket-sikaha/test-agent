import { createUIMessageStreamResponse, type UIMessage } from "ai";
import { createAgent, tool } from "langchain"; // ✅ 修复：createAgent 和 tool 都来自 langchain 包
import { ChatOpenAI } from "@langchain/openai";
import { toBaseMessages, toUIMessageStream } from "@ai-sdk/langchain"; // LangChain 适配器
import { z } from "zod";

// ---------- 环境变量校验 ----------
if (!process.env.ZHIPU_API_KEY) {
  throw new Error("Missing ZHIPU_API_KEY environment variable");
}

// ---------- 1) 天气工具 ----------
const getWeather = tool(
  ({ city }: { city: string }) => {
    const map: Record<string, string> = {
      北京: "北京今天：晴，26°C，北风3级，适合出行。",
      上海: "上海今天：多云，28°C，东南风2级，有时有阵雨。",
      广州: "广州今天：雷阵雨，31°C，湿度较高，注意带伞。",
    };
    return map[city] ?? `${city}的天气数据暂未接入，请稍后再试。`;
  },
  {
    name: "get_weather",
    description:
      "根据城市名称查询当天天气（仅部分城市示例）。当用户问xx天气怎么样/几度时优先使用此工具。",
    schema: z.object({
      city: z.string().describe("城市名，例如：北京、上海、广州"),
    }),
  },
);

// ---------- 2) 模型（GLM-4.7-Flash，OpenAI 兼容端点） ----------
const llm = new ChatOpenAI({
  model: "glm-4.7-flash",
  configuration: {
    baseURL: "https://open.bigmodel.cn/api/paas/v4",
  },
  apiKey: process.env.ZHIPU_API_KEY,
});

// ---------- 3) Agent（会自动跑工具循环） ----------
const agent = createAgent({
  model: llm,
  tools: [getWeather],
  systemPrompt:
    "你是一个助手。用户问某个城市的天气时，务必使用 get_weather 工具查询后再回答；其它问题则直接回答。回答时使用中文。",
});

// ---------- 4) API 路由（流式 + UI 消息流） ----------
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    // 将 UIMessage 转成 LangChain 的 BaseMessage
    const langchainMessages = await toBaseMessages(messages);

    // ✅ 修复：streamMode 使用 ["messages"] 与 @ai-sdk/langchain 适配器匹配
    // 官方文档推荐写法：https://ai-sdk.dev/docs/advanced/langchain
    const stream = await agent.stream(
      { messages: langchainMessages },
      { streamMode: ["messages"] },
    );

    // 用 LangChain 适配器把流转成 AI SDK 的 UI 消息流
    return createUIMessageStreamResponse({
      stream: toUIMessageStream(stream, {
        // ✅ 修复：流内部错误通过 onError 回调传递给前端，而不是尝试返回 JSON
        onError: (error) => {
          console.error("[/api/chat] stream error:", error);
        },
      }),
    });
  } catch (e: unknown) {
    // 请求解析/初始化阶段的错误（流尚未开始），仍可返回 JSON 错误
    console.error("[/api/chat] init error:", e);
    const message = e instanceof Error ? e.message : "服务异常，请稍后再试";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
