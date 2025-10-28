# 🧱 模块化Prompt系统

## 📋 概述

将原有的超长 `systemPrompt` 重构为多层级、可维护、可扩展的模块化Prompt体系，现已集成Few-shot示例系统。

## 🏗️ 架构设计

### 🧭 System Layer (base.ts)
- **作用**: 定义AI的身份、核心能力和基本任务目标
- **内容**: 专业简历解析专家身份、深度语义理解能力、智能分类等

### 🧱 Schema Layer (schema.ts)  
- **作用**: 定义标准化的JSON输出格式和数据结构要求
- **内容**: JSON格式约束、字段结构定义、输出示例等

### 🧠 Domain Layer (rules/*.ts)
- **作用**: 定义各section的业务规则和解析逻辑，**现已集成Few-shot示例**
- **文件** (完整10个section):
  - `header.ts` - 头部信息解析规则 + 3个示例
  - `summary.ts` - 个人简介解析规则 + 3个示例
  - `work.ts` - 工作经历解析规则 + 3个示例
  - `education.ts` - 教育背景解析规则 + 3个示例
  - `skills.ts` - 技能解析规则 + 3个示例
  - `projects.ts` - 项目解析规则 + 3个示例
  - `certifications.ts` - 证书与奖项解析规则 + 3个示例
  - `languages.ts` - 语言能力解析规则 + 3个示例
  - `volunteer.ts` - 志愿者/领导经验解析规则 + 3个示例
  - `portfolio.ts` - 作品集/出版物解析规则 + 3个示例
  - `general.ts` - 通用辅助规则

## 📁 目录结构

```
src/prompts/parser/
├── base.ts                # 🧭 System Layer
├── schema.ts              # 🧱 Schema Layer  
├── rules/
│   ├── header.ts          # 🧠 头部信息规则 + Few-shot示例
│   ├── summary.ts         # 🧠 个人简介规则 + Few-shot示例
│   ├── work.ts            # 🧠 工作经历规则 + Few-shot示例
│   ├── education.ts       # 🧠 教育规则 + Few-shot示例
│   ├── skills.ts          # 🧠 技能规则 + Few-shot示例
│   ├── projects.ts        # 🧠 项目规则 + Few-shot示例
│   ├── certifications.ts # 🧠 证书规则 + Few-shot示例
│   ├── languages.ts       # 🧠 语言能力规则 + Few-shot示例
│   ├── volunteer.ts       # 🧠 志愿者/领导规则 + Few-shot示例
│   ├── portfolio.ts       # 🧠 作品集/出版物规则 + Few-shot示例
│   └── general.ts         # 🧠 通用规则
├── index.ts               # 🧱 核心拼接器
└── README.md              # 📚 系统文档
```

## 🚀 使用方式

### 基本使用
```typescript
import { buildParserPrompt } from "@/prompts/parser";

// 包含Few-shot示例（推荐）
const systemPrompt = buildParserPrompt({ includeExamples: true });

// 仅规则，无示例（快速测试）
const rulesOnlyPrompt = buildParserPrompt({ includeExamples: false });
```

### 动态配置
```typescript
// 仅包含核心section，带示例
const simplePrompt = buildParserPrompt({
  include: ["header", "summary", "work", "education", "skills"],
  includeExamples: true
});

// 排除工作经历（适合学生简历），带示例
const studentPrompt = buildParserPrompt({
  exclude: ["work"],
  includeExamples: true
});

// 完整简历解析（所有10个section），无示例
const completePrompt = buildParserPrompt({
  include: ["header", "summary", "work", "education", "skills", "projects", "certifications", "languages", "volunteer", "portfolio", "general"],
  includeExamples: false
});
```

### 预定义Prompt
```typescript
import { 
  DEFAULT_PARSER_PROMPT,    // 完整prompt + 示例（所有10个section）
  SIMPLE_PARSER_PROMPT,     // 简化prompt（核心section，无示例）
  STUDENT_PARSER_PROMPT,    // 学生简历prompt + 示例
  COMPLETE_PARSER_PROMPT,   // 完整简历prompt（所有section，无示例）
  RULES_ONLY_PROMPT         // 仅规则版本（无示例）
} from "@/prompts/parser";
```

## 📚 Few-shot示例系统

### **头部信息示例**
- 标准格式：姓名、邮箱、电话、地址
- 包含作品集：GitHub、个人网站、LinkedIn
- 完整信息：所有联系方式

### **个人简介示例**
- 标准简介：经验年限、专业领域、核心技能
- 职业目标：具体职位、公司类型、技能应用
- 专业总结：技术栈、成就、领导经验

### **工作经历示例**
- 标准格式：Google Software Engineer
- 复杂公司名：Apple (Apple Online Store - Onsite-Vendor)
- 多职责：Microsoft Senior Developer

### **教育背景示例**
- 本科学位：UTA B.S. Computer Science
- 研究生学位：MIT M.S. Computer Science
- 博士学位：Stanford PhD in AI

### **技能示例**
- 分类技能：Backend/Frontend/Database
- 单一技能列表：Programming Languages/Frameworks/Tools
- 简单列表：Java, Spring Boot, React...

### **项目示例**
- 完整项目：E-commerce Platform
- 开源项目：DataViz.js
- 学术项目：Machine Learning Research

### **证书示例**
- AWS证书：Solutions Architect Professional
- 多个证书：Google Cloud, Azure, Kubernetes
- 奖项：Employee of the Year

### **语言能力示例**
- 多语言：英语(母语)、中文(母语)、西班牙语(中级)
- 详细描述：日语(流利，JLPT N2)、韩语(中级)
- 商务语言：英语(母语)、西班牙语(商务级)

### **志愿者/领导示例**
- 志愿者工作：Code for America、社区教学
- 领导经验：大学编程俱乐部主席
- 开源贡献：React、Node.js项目贡献

### **作品集/出版物示例**
- 作品集链接：GitHub、个人网站、LinkedIn
- 学术出版物：IEEE会议论文、ACM期刊文章
- 博客文章：技术文章、Medium专栏

## ✅ 优势

1. **🧩 模块化**: 每个规则独立，便于维护和测试
2. **🔧 可扩展**: 轻松添加新的section规则
3. **⚡ 动态加载**: 按需组合不同规则
4. **🔄 版本控制**: 未来可与Version Control系统集成
5. **📊 可测试**: 每个模块可单独测试
6. **🎯 专业化**: 针对不同section的专业规则
7. **📚 Few-shot**: 集成示例系统，提升AI理解准确性
8. **🎛️ 灵活配置**: 支持示例开关，平衡性能与质量

## 🔮 未来扩展

- 支持 `work_v2.ts` 等版本化规则
- 与 `promptRegistry.json` 集成
- 添加规则优先级和依赖关系
- 支持规则的条件加载
- 动态示例生成和优化