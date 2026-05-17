# Magic Writing Experience (灵感笔迹)

[English](#english) | [简体中文](#简体中文)

---

<a name="english"></a>
## English

### Overview
**Magic Writing Experience** is a minimalist, distraction-free text editor designed for storytellers and creative writers. It integrates a powerful AI co-pilot to help you overcome writer's block with seamless completions, context-aware editing ("Magic Edits"), and deep world-building integration ("Lore Settings").

### Key Features
- **Block-Based Editor**: A clean, modular writing experience where every paragraph or heading is a manageable block.
- **AI Co-pilot**: Get intelligent continuation of your prose based on your current tone and context.
- **Magic Edits**: Highlight text and invoke AI to rewrite, expand, or polish your writing with creative precision.
- **Lore Settings**: Build your story's universe (World, Characters, Plots) and have the AI use these settings as background knowledge for higher consistency.
- **Distraction-Free Design**: Minimalist UI that keeps the focus on your words, featuring a Zen-like atmosphere.
- **Multi-File Management**: Organized file explorer and sidebar to manage drafts and chapters.
- **Mobile Responsive**: Write and edit on the go with a fully responsive mobile interface.

### Tech Stack
- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4
- **Animations**: Motion (Framer Motion)
- **Icons**: Lucide React
- **AI Engine**: Google Gemini API (@google/genai)
- **Build Tool**: Vite

### Getting Started

#### Prerequisites
- Node.js (Latest LTS recommended)
- Gemini API Key

#### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file and add your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

#### Development
Run the development server:
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

---

<a name="简体中文"></a>
## 简体中文

### 项目简介
**Magic Writing Experience (灵感笔迹)** 是一款专为故事创作者和创意写作设计的极简、无干扰文本编辑器。它集成了一个强大的 AI 副驾驶，通过平滑的续写建议、上下文感知的“划词修改”以及深度嵌入的“世界观设定”，助您摆脱写作瓶颈。

### 核心功能
- **块状编辑器**：极简且模块化的写作体验，每一个段落或标题都是一个可独立管理的块。
- **AI 智能续写**：根据当前的语境、语气和逻辑，为您提供智能的文字延续方案。
- **划词魔法修改**：只需选中文字，即可调用 AI 进行重写、扩写或修辞优化，精准提升文笔。
- **设定集系统**：构建故事的世界观、角色和剧情脉络，AI 会将这些设定作为背景知识注入，确保创作逻辑的高度一致。
- **沉浸式设计**：摒弃杂乱，提供完全聚焦于文字本身的 Zen 风格界面。
- **多文档管理**：内置文件资源管理器和侧边栏，轻松管理草稿与章节大纲。
- **移动端适配**：响应式布局支持，随时随地开启创作模式。

### 技术栈
- **前端核心**：React 19 + TypeScript
- **样式方案**：Tailwind CSS 4
- **动画动效**：Motion (Framer Motion)
- **图标库**：Lucide React
- **AI 引擎**：Google Gemini API (@google/genai)
- **构建工具**：Vite

### 快速开始

#### 环境要求
- Node.js (推荐最新的 LTS 版本)
- Gemini API Key

#### 安装步骤
1. 克隆仓库：
   ```bash
   git clone <repository-url>
   ```
2. 安装依赖：
   ```bash
   npm install
   ```
3. 配置环境：
   创建一个 `.env` 文件并填入您的 Gemini API Key：
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

#### 本地开发
启动开发服务器：
```bash
npm run dev
```
应用将在 `http://localhost:3000` 运行。
