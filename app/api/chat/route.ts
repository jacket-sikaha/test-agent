// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { tool } from "langchain";
import { createAgent } from "langchain"; // 自动建 Agent 图（含工具循环）
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import * as z from "zod";

// ① 定义一个“天气工具”（返回字符串即可，会被转成 ToolMessage 给模型）
const getWeather = tool(
  ({ city }: { city: string }) => {
    // 这里先用假数据，后面你可以换成真实 API
    const map: Record<string, string> = {
      北京: "北京今天：晴，26°C，北风3级，适合出行。",
      上海: "上海今天：多云，28°C，东南风2级，有时有阵雨。",
      广州: "广州今天：雷阵雨，31°C，湿度较高，注意带伞。",
    };
    return map[city] ?? `${city}的天气数据暂未接入，请稍后再试。`;
  },
  {
    name: "get_weather", // 建议用 snake_case
    description:
      "根据城市名称查询当天天气（仅支持部分城市示例）。当用户问“xx天气怎么样/几度”时，优先使用此工具。",
    schema: z.object({
      city: z.string().describe("城市名，例如：北京、上海、广州"),
    }),
  },
);

// ② 接入 GLM‑4.7‑Flash（OpenAI 兼容端点）
const llm = new ChatOpenAI({
  model: "glm-4.7-flash",
  configuration: {
    baseURL: "https://open.bigmodel.cn/api/paas/v4", // 智谱 OpenAI 兼容
  },
  apiKey: process.env.ZHIPU_API_KEY!, // .env.local 里的 ZHIPU_API_KEY
});

// ③ 用 createAgent 把“模型 + 工具”组成一个会自动跑工具循环的图
const agent = createAgent({
  model: llm,
  tools: [getWeather], // 静态工具列表【turn5fetch0】
  systemPrompt: new SystemMessage(
    "你是一个助手。用户问某个城市的天气时，务必使用 get_weather 工具查询后回答；其它问题则直接回答。",
  ),
});

// ④ 对外接口（POST /api/chat）
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 支持两种前端写法：
    //  - { message: "..." }  （简单版）
    //  - { messages: [{ role, content }] } （useChat 标准）
    let messages: any[];
    if (body.messages && Array.isArray(body.messages)) {
      // 来自 useChat 等前端 hook 的标准结构
      messages = body.messages
        .map((m: any) => {
          if (m.role === "user") {
            const content =
              typeof m.content === "string" ? m.content : String(m.content);
            return new HumanMessage(content);
          }
          // 忽略 assistant/system 等其它角色（演示用）
          return null;
        })
        .filter(Boolean);
    } else {
      // 兼容单条消息 { message: "..." }
      const text = body?.message ?? body?.prompt ?? "";
      if (!text) {
        return NextResponse.json(
          { error: "请传入 { message: '你的问题' } 或 { messages: [...] }" },
          { status: 400 },
        );
      }
      messages = [new HumanMessage(String(text))];
    }

    // ⑤ 让 Agent 跑起来（会自动决定是否调用 getWeather 并循环到结束）
    const result = await agent.invoke({ messages });

    // ⑥ 取最终回复（Agent 图会在 messages 末尾追加最终的 AIMessage）
    const last = result.messages?.[result.messages.length - 1];
    const reply =
      last?.content ?? (typeof last === "string" ? last : JSON.stringify(last));

    return NextResponse.json({ reply });
  } catch (e: any) {
    console.error("[/api/chat] error:", e);
    return NextResponse.json(
      { error: e?.message ?? "服务异常，请稍后再试" },
      { status: e?.status ?? 500 },
    );
  }
}
