# 🧱 Prompts 文件夹结构

## 📋 概述

重新组织后的prompts文件夹采用清晰的功能分类结构，便于管理和扩展。

## 🏗️ 文件夹结构

```
src/prompts/
├── parser/                 # 📄 简历解析相关
│   ├── base.ts            # System Layer
│   ├── schema.ts          # Schema Layer
│   ├── rules/             # Domain Layer (10个section)
│   │   ├── header.ts      # 头部信息规则 + 示例
│   │   ├── summary.ts     # 个人简介规则 + 示例
│   │   ├── work.ts        # 工作经历规则 + 示例
│   │   ├── education.ts   # 教育背景规则 + 示例
│   │   ├── skills.ts      # 技能规则 + 示例
│   │   ├── projects.ts    # 项目规则 + 示例
│   │   ├── certifications.ts # 证书规则 + 示例
│   │   ├── languages.ts   # 语言能力规则 + 示例
│   │   ├── volunteer.ts   # 志愿者规则 + 示例
│   │   ├── portfolio.ts   # 作品集规则 + 示例
│   │   └── general.ts     # 通用规则
│   ├── index.ts           # 核心拼接器
│   └── README.md          # 详细文档
│
├── aichat/                 # 🤖 AI聊天相关
│   ├── base/              # 基础prompt模块
│   ├── delete/            # 删除功能模块
│   ├── education/         # 教育编辑模块
│   ├── rewrite/           # 重写功能模块
│   ├── work/              # 工作经历模块
│   ├── summary/           # 个人简介模块
│   ├── skills/            # 技能模块
│   ├── projects/          # 项目模块
│   ├── certifications/   # 证书模块
│   ├── languages/         # 语言能力模块
│   ├── volunteer/         # 志愿者模块
│   ├── portfolio/         # 作品集模块
│   └── index.ts           # 统一导出
│
├── shared/                 # 🔧 共享工具和配置
│   ├── buildPrompt.ts     # Prompt构建器
│   ├── contextWrapper.ts  # 上下文包装器
│   ├── extractJson.ts     # JSON提取工具
│   ├── promptRegistry.json # Prompt注册表
│   ├── VERSION_CONTROL_SYSTEM.md # 版本控制文档
│   └── index.ts           # 统一导出
│
└── index.ts               # 🧱 主入口文件
```

## 🎯 功能分类

### 📄 Parser (简历解析)
- **用途**: 将非结构化简历文本转换为结构化JSON数据
- **特点**: 模块化、Few-shot示例、10个section全覆盖
- **使用**: `import { buildParserPrompt } from "@/prompts/parser"`

### 🤖 AI Chat (智能聊天)
- **用途**: AI聊天功能的各种prompt模块，覆盖所有简历section
- **特点**: 版本控制、模块化、功能分离、全面覆盖
- **模块**: base, delete, education, rewrite, work, summary, skills, projects, certifications, languages, volunteer, portfolio
- **使用**: `import { buildPrompt } from "@/prompts/aichat"`

### 🔧 Shared (共享工具)
- **用途**: 跨功能使用的工具和配置
- **特点**: 通用性、可复用、系统配置
- **使用**: `import { buildPrompt } from "@/prompts/shared"`

## 🚀 使用方式

### 简历解析
```typescript
import { buildParserPrompt } from "@/prompts/parser";

// 完整解析（所有10个section + 示例）
const systemPrompt = buildParserPrompt({ includeExamples: true });

// 学生简历解析
const studentPrompt = buildParserPrompt({
  exclude: ["work"],
  includeExamples: true
});
```

### AI聊天
```typescript
import { buildPrompt } from "@/prompts/aichat";

// 使用特定模块
const prompt = buildPrompt("work", "v2");
```

### 共享工具
```typescript
import { buildPrompt } from "@/prompts/shared";
import { extractJsonFromResponse } from "@/prompts/shared";

// 使用共享工具
const prompt = buildPrompt(moduleName, version);
const json = extractJsonFromResponse(response);
```

## ✅ 优势

1. **🧩 清晰分类**: 按功能划分，职责明确
2. **🔧 易于维护**: 相关文件集中管理
3. **📈 可扩展性**: 新功能可独立添加
4. **🔄 版本控制**: 支持模块化版本管理
5. **📊 统一接口**: 通过index.ts统一导出
6. **🎯 专业化**: 每个分类专注特定功能

## 🔮 未来扩展

- **📊 Analytics**: 添加prompt分析和优化模块
- **🎨 Templates**: 添加简历模板相关prompt
- **🌐 Internationalization**: 添加多语言支持
- **🔍 Search**: 添加智能搜索相关prompt
- **📈 Reporting**: 添加报告生成相关prompt
