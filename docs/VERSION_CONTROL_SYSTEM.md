# 🚀 AI Resume Prompt Version Control 系统

## 📋 概述

在现有Prompt Registry + Few-shot Examples系统基础上，成功实现了**Prompt Version Control**功能，支持每个模块维护多个版本（v1、v2等），并通过配置灵活切换版本。

## 📁 版本化文件结构

```
src/prompts/
├── base/
│   ├── v1/
│   │   ├── rule.ts           # v1版本规则
│   │   ├── examples.ts       # v1版本示例
│   │   └── index.ts          # v1版本导出
│   ├── v2/
│   │   ├── rule.ts           # v2版本规则（增强版）
│   │   ├── examples.ts       # v2版本示例（增强版）
│   │   └── index.ts          # v2版本导出
│   └── latest.ts             # 指向当前默认版本
├── rewrite/
│   ├── v1/
│   │   ├── rule.ts           # v1版本改写规则
│   │   ├── examples.ts       # v1版本改写示例
│   │   └── index.ts          # v1版本导出
│   ├── v2/
│   │   ├── rule.ts           # v2版本改写规则（增强版）
│   │   ├── examples.ts       # v2版本改写示例（增强版）
│   │   └── index.ts          # v2版本导出
│   └── latest.ts             # 指向v2版本（当前默认）
├── delete/
│   ├── v1/                   # 删除模块v1版本
│   ├── v2/                   # 删除模块v2版本
│   └── latest.ts             # 指向v1版本
├── education/
│   ├── v1/                   # 教育模块v1版本
│   ├── v2/                   # 教育模块v2版本
│   └── latest.ts             # 指向v1版本
├── work/
│   ├── v1/                   # 工作模块v1版本
│   ├── v2/                   # 工作模块v2版本
│   └── latest.ts             # 指向v1版本
├── contextWrapper.ts         # 上下文包装
├── promptRegistry.json       # 版本化模块注册表
├── buildPrompt.ts            # 动态版本加载逻辑
└── index.ts                  # 指向latest版本
```

## 🔧 核心配置

### `promptRegistry.json` 版本化配置
```json
{
  "modules": [
    {
      "name": "base",
      "file": "base/${version}/rule.ts",
      "examples": "base/${version}/examples.ts",
      "always": true,
      "version": "v1",
      "description": "基础身份定义和通用规则"
    },
    {
      "name": "rewrite",
      "file": "rewrite/${version}/rule.ts",
      "examples": "rewrite/${version}/examples.ts",
      "trigger": ["rewrite", "improve", "optimize"],
      "version": "v2",
      "description": "改写逻辑模块"
    }
  ]
}
```

## ⚙️ 动态版本加载机制

### 1. 版本路径替换
```typescript
// 获取版本号并替换路径占位符
const version = module.version || "v1";
const rulePath = module.file.replace("${version}", version);
const examplesPath = module.examples?.replace("${version}", version);
```

### 2. 动态模块加载
```typescript
// 1. 加载模块规则
const ruleModule = await import(`./${rulePath}`);
const ruleContent = ruleModule[Object.keys(ruleModule)[0]];

// 2. 加载Few-shot示例
if (examplesPath) {
  const exampleModule = await import(`./${examplesPath}`);
  const exampleContent = exampleModule[Object.keys(exampleModule)[0]];
}
```

### 3. 版本信息输出
```typescript
console.log(`✅ 加载规则: ${module.name}(${version}) - ${module.description}`);
console.log(`📚 加载示例: ${module.name}(${version}) - Few-shot examples`);
console.log(`📦 已加载模块: [${loadedModules.join(", ")}]`);
```

## 🔄 版本管理API

### GET `/api/prompt-version`
获取当前所有模块的版本信息：
```json
{
  "success": true,
  "currentVersions": [
    {
      "name": "base",
      "version": "v1",
      "description": "基础身份定义和通用规则",
      "always": true,
      "trigger": []
    },
    {
      "name": "rewrite",
      "version": "v2",
      "description": "改写逻辑模块",
      "always": false,
      "trigger": ["rewrite", "improve", "optimize"]
    }
  ],
  "metadata": {
    "version": "1.0.0",
    "lastUpdated": "2025-01-26",
    "description": "AI Resume Prompt Module Registry with Version Control"
  }
}
```

### POST `/api/prompt-version`
切换模块版本：
```json
{
  "moduleName": "rewrite",
  "version": "v1"
}
```

响应：
```json
{
  "success": true,
  "message": "Successfully switched rewrite to version v1",
  "updatedModule": {
    "name": "rewrite",
    "version": "v1",
    "description": "改写逻辑模块"
  }
}
```

## 🧪 测试验证

所有测试场景均已通过验证：

| 测试内容 | 配置版本 | 预期加载 | 结果 |
|---------|---------|---------|------|
| rewrite v1 | `"version": "v1"` | rewrite/v1 + examples | ✅ |
| rewrite v2 | `"version": "v2"` | rewrite/v2 + examples | ✅ |
| 版本切换API | POST切换版本 | 实时更新配置 | ✅ |
| 切换后加载 | 修改配置后 | 加载新版本 | ✅ |

## 🚀 系统优势

1. **多版本管理** - 支持v1、v2等多个版本并存
2. **动态切换** - 通过API实时切换版本
3. **版本追踪** - 控制台显示当前加载版本
4. **A/B测试** - 支持不同版本对比测试
5. **热更新** - 修改版本无需重启服务
6. **可扩展** - 轻松添加新版本

## 📊 版本差异对比

### Base模块 v1 vs v2
- **v1**: 基础身份定义和通用规则
- **v2**: 增强版，包含ATS优化和专业度提升

### Rewrite模块 v1 vs v2
- **v1**: 基础改写规则
- **v2**: 增强版，包含更多专业改写示例和ATS关键词

### Education模块 v1 vs v2
- **v1**: 基础教育规则
- **v2**: 增强版，包含GPA、相关课程等详细信息

### Work模块 v1 vs v2
- **v1**: 基础工作规则
- **v2**: 增强版，包含量化成就和具体技术栈

## 🎯 使用示例

### 1. 查看当前版本
```bash
curl http://localhost:3000/api/prompt-version
```

### 2. 切换rewrite到v1版本
```bash
curl -X POST http://localhost:3000/api/prompt-version \
  -H "Content-Type: application/json" \
  -d '{"moduleName": "rewrite", "version": "v1"}'
```

### 3. 切换base到v2版本
```bash
curl -X POST http://localhost:3000/api/prompt-version \
  -H "Content-Type: application/json" \
  -d '{"moduleName": "base", "version": "v2"}'
```

### 4. 控制台输出示例
```
🔧 开始构建Prompt，消息: rewrite this content to be more professional...
✅ 加载规则: base(v1) - 基础身份定义和通用规则
📚 加载示例: base(v1) - Few-shot examples
✅ 加载规则: rewrite(v2) - 改写逻辑模块
📚 加载示例: rewrite(v2) - Few-shot examples
✅ 加载规则: education(v1) - 教育规则模块
📚 加载示例: education(v1) - Few-shot examples
✅ 加载规则: work(v1) - 工作规则模块
📚 加载示例: work(v1) - Few-shot examples
✅ 添加上下文信息
📦 已加载模块: [base(v1), rewrite(v2), education(v1), work(v1), context]
📊 最终Prompt长度: 4527 字符
```

## 🔮 未来扩展

- **Phase 4**: 自动化Prompt A/B测试
- **Phase 4**: 按版本记录token使用量进行成本对比
- **Phase 4**: UI界面进行版本管理

## ✅ 完成标准验证

1. ✅ `promptRegistry.json` 支持版本字段和占位符
2. ✅ `buildPrompt.ts` 能动态加载不同版本路径
3. ✅ 控制台输出版本信息
4. ✅ 所有模块在切换版本后可正常工作
5. ✅ 版本管理API功能完整
6. ✅ 版本切换实时生效

**Prompt Version Control系统现在完全就绪！** 🎉

系统实现了多版本管理、动态切换、版本追踪等核心功能，为Phase 4的A/B测试和成本分析奠定了坚实基础。通过版本控制，可以轻松对比不同版本的性能，优化Prompt效果，提升AI模型的输出质量。
