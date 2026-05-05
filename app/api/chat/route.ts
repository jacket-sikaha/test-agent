// app/api/chat/route.ts
import { NextRequest } from "next/server";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { tool } from "langchain"; // 注意：是 langchain
import * as z from "zod";

// Edge runtime（符合官方示例写法）
export const runtime = "edge";

// ① 一个“工具”：查天气（你可以替换成任何真实/模拟接口）
const getWeather = tool(
  async ({ location }: { location: string }) => {
    // 模拟返回；后续可换成你自己的后端接口
    return `${location}今天：晴，25°C，风力3级`;
  },
  {
    name: "get_weather",
    description: "根据城市获取当天天气（示例）",
    schema: z.object({
      location: z.string().describe("城市名，比如 北京、上海"),
    }),
  },
);

// ② 模型：接入智谱 GLM‑4.7‑Flash（OpenAI 兼容端点）
const chat = new ChatOpenAI({
  model: "glm-4.7-flash", // 智谱免费模型名
  configuration: {
    baseURL: "https://open.bigmodel.cn/api/paas/v4", // OpenAI 兼容
  },
  apiKey: process.env.ZHIPU_API_KEY, // 从 .env.local 读
});

// ③ 最小 Agent（ReAct 工具调用）
const agent = await chat.bindTools([getWeather]); // 简单做法：直接给模型绑定工具
// 如果你之后想用 LangGraph 完整 Agent，可改用 createAgent/createReactAgent

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = body?.message as string | undefined;
    if (!text) {
      return new Response("请传入 { message: '你的问题' }", { status: 400 });
    }

    // 构造消息（可以扩展为多轮，这里只做最简单的单轮示例）
    const messages = [new HumanMessage(text)];

    // 调用带工具的模型（非流式）
    const res = await agent.invoke(messages);

    // 提取文本回复
    const reply =
      res?.content ??
      res?.text ??
      (typeof res === "string" ? res : JSON.stringify(res));

    return Response.json({ reply });
  } catch (e: any) {
    console.error(e);
    return Response.json({ error: e?.message ?? "未知错误" }, { status: 500 });
  }
}
