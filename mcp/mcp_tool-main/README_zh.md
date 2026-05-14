<!--
 * @Author: Mr.Car
 * @Date: 2025-03-20 17:40:04
-->
<div align="center">
  <img src="https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3MjU5MDl8MHwxfHNlYXJjaHwxfHxiZWF1dGlmdWwlMjB3ZWF0aGVyJTIwbGFuZHNjYXBlfGVufDB8fHx8MTc0MjU0NzkxN3ww&ixlib=rb-4.0.3&q=80&w=1080" alt="Weather MCP Tool" width="100%">
  <h1>Weather MCP Tool</h1>
  <p>一句话查询全球天气，完美集成 Cursor 编辑器的极简天气查询工具</p>
  
  [![smithery badge](https://smithery.ai/badge/@MrCare/mcp_tool)](https://smithery.ai/server/@MrCare/mcp_tool)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Python Version](https://img.shields.io/badge/python-3.8%2B-blue)](https://www.python.org/downloads/)
  
  [English](README.md) | [中文](README_zh.md)
</div>

<div align="center">
  <img src="real_zh.gif" alt="Weather MCP Tool 演示" width="100%">
  <p><i>看看如何用自然语言轻松查询天气</i></p>
</div>

## ✨ 特性

- 💡 **极简**: 一句话查询天气
- 🤖 **智能**: 支持中英文自然语言交互
- 🌏 **全球**: 支持所有主要城市
- 🔌 **即插即用**: 完美集成 Cursor
- 🚀 **高性能**: 异步处理，响应迅速
- 🎨 **美观**: 清晰直观的天气展示

## 🚀 快速开始

### 1. 获取 API Key

> 🔑 在开始之前，请先 [获取 OpenWeather API Key](https://home.openweathermap.org/api_keys)

### 2. 一键安装（推荐）

使用 Smithery 一键安装和配置：

```bash
npx -y @smithery/cli@latest install @MrCare/mcp_tool --client cursor --config "{\"openweathermapApiKey\":\"your_api_key_here\",\"port\":8000}"
```

> 如需安装 WindSurf 和 Cine 版本，请访问我们的 [Smithery 仓库](https://smithery.ai/server/@MrCare/mcp_tool)。

### 3. 手动安装

#### 3.1 克隆并安装

```bash
git clone https://github.com/yourusername/weather-server.git && cd weather-server && pip install -e .
```

#### 3.2 配置 API Key

**方法一：使用配置文件（推荐）**

复制示例配置文件并修改：
```bash
cp env.example .env
```
然后编辑 `.env` 文件，将 `your_api_key_here` 替换为你的 API Key。

**方法二：使用环境变量**

macOS/Linux:
```bash
export OPENWEATHERMAP_API_KEY="your_api_key"
```

Windows:
```cmd
set OPENWEATHERMAP_API_KEY=your_api_key
```

#### 3.3 启用工具

编辑 `~/.cursor/mcp.json` (Windows: `%USERPROFILE%\.cursor\mcp.json`):
```json
{
    "weather_fastmcp": {
        "command": "python",
        "args": ["-m", "weather_server.server"]
    }
}
```

重启 Cursor 即可使用！

## 📝 使用示例

在 Cursor 中直接输入：
```
东京天气怎么样？
伦敦明天会下雨吗？
纽约的天气预报
巴黎今天温度多少？
```

就这么简单！

## ⚙️ 参数说明

如需更精确的查询，可以指定以下参数：

| 参数 | 说明 | 默认值 |
|-----------|-------------|---------|
| city | 城市名称（支持中英文） | 必填 |
| days | 预报天数（1-5天） | 5 |
| units | 温度单位 (metric: 摄氏度, imperial: 华氏度) | metric |
| lang | 返回语言 (zh_cn: 中文, en: 英文) | zh_cn |

## ❓ 常见问题

1. **工具不工作？**
   - 确保 API Key 设置正确
   - 重启 Cursor
   - 检查 Python 环境

2. **找不到城市？**
   - 尝试使用英文名称
   - 检查拼写
   - 使用完整城市名

## 👨‍💻 作者

- Mr.Car
- Email: 534192336car@gmail.com

## 🙏 致谢

- [FastMCP](https://github.com/microsoft/fastmcp)
- [OpenWeatherMap](https://openweathermap.org/)
- [Cursor](https://cursor.sh/)

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件 