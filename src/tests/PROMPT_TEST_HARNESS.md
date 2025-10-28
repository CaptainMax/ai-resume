# 🧪 AI Resume Prompt Test Harness & Performance Monitoring

## 📋 概述

在现有Prompt Registry + Few-shot Examples + Version Control系统基础上，成功实现了**Prompt Test Harness & Performance Monitoring**功能，让系统具备可测试、可度量、可优化的工程能力。

## 📁 系统结构

```
src/
├── prompts/                     # 保留原有版本化结构
├── tests/
│   ├── testCases.json           # 固定测试输入集
│   ├── runPromptTests.ts        # 核心测试脚本
│   └── reports/                 # 生成的报告目录
│       ├── report.json          # JSON格式报告
│       ├── report.md            # Markdown格式报告
│       └── metrics.log          # 详细指标日志
├── utils/
│   ├── tokenLogger.ts           # Token使用和耗时记录
│   └── costCalculator.ts        # 成本估算工具
└── api/
    └── prompt-report/route.ts   # 报告API端点
```

## 🧪 核心功能

### 1️⃣ 自动化测试套件

**`testCases.json`** - 固定测试输入集：
```json
[
  {
    "id": "rewrite_basic",
    "input": "rewrite: I improved sales by 30%",
    "expectedType": "text",
    "description": "基础改写测试",
    "category": "rewrite"
  },
  {
    "id": "education_add",
    "input": "add education entry: MIT, 2019-2023, M.S. Computer Science",
    "expectedType": "json",
    "description": "添加教育经历测试",
    "category": "education"
  }
]
```

**`runPromptTests.ts`** - 核心测试脚本：
- 支持批量测试多个版本（v1, v2）
- 记录每次调用的token使用和耗时
- 计算成本并评估输出质量
- 生成详细的JSON和Markdown报告

### 2️⃣ Token使用监控

**`tokenLogger.ts`** - 指标记录系统：
```typescript
interface PromptMetrics {
  timestamp: string;
  version: string;
  testId: string;
  testInput: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  elapsedMs: number;
  model: string;
  cost?: number;
  success: boolean;
  error?: string;
}
```

功能：
- 记录每次API调用的详细指标
- 生成测试报告和统计摘要
- 支持Markdown格式报告生成
- 提供智能推荐和性能分析

### 3️⃣ 成本估算系统

**`costCalculator.ts`** - 成本计算工具：
```typescript
const MODEL_PRICING = {
  "gpt-4o": {
    input: 0.005,   // $5 per 1M input tokens
    output: 0.015   // $15 per 1M output tokens
  },
  "gpt-4o-mini": {
    input: 0.00015, // $0.15 per 1M input tokens
    output: 0.0006  // $0.6 per 1M output tokens
  }
  // ... 更多模型定价
};
```

功能：
- 支持多种OpenAI模型定价
- 精确计算输入/输出token成本
- 批量成本分析和效率评分
- 成本格式化和可视化

### 4️⃣ 报告生成系统

**API端点** - `/api/prompt-report`：
- **GET**: 获取JSON或Markdown格式报告
- **POST**: 触发测试运行或清理报告

**报告内容**：
- 版本对比表格
- 详细测试结果
- 性能统计和成本分析
- 智能推荐和优化建议

## 📊 测试指标

| 指标 | 含义 | 评估标准 |
|------|------|----------|
| ⏱ **elapsed** | 每次调用耗时 | < 2000ms 为优秀 |
| 🧮 **tokens** | 输入+输出token总数 | 根据任务复杂度评估 |
| 💵 **cost** | 成本估算 | 基于模型定价计算 |
| 📊 **passRate** | 输出质量评分 | 80%以上为合格 |
| 🧠 **success** | 测试是否成功 | 基于passRate判断 |

## 🚀 使用方式

### 命令行使用
```bash
# 运行完整测试套件
npm run prompt:test

# 查看JSON报告
npm run prompt:report

# 查看Markdown报告
npm run prompt:report-md
```

### API使用
```bash
# 获取JSON报告
curl http://localhost:3000/api/prompt-report

# 获取Markdown报告
curl "http://localhost:3000/api/prompt-report?format=markdown"

# 触发测试运行
curl -X POST http://localhost:3000/api/prompt-report \
  -H "Content-Type: application/json" \
  -d '{"action": "run-tests"}'

# 清理报告
curl -X POST http://localhost:3000/api/prompt-report \
  -H "Content-Type: application/json" \
  -d '{"action": "clear-reports"}'
```

## 📈 报告示例

### JSON报告结构
```json
{
  "timestamp": "2025-10-27T04:37:10.179Z",
  "summary": {
    "totalTests": 6,
    "versions": [
      {
        "version": "v1",
        "testCount": 3,
        "successCount": 3,
        "avgElapsedMs": 1617,
        "avgTokens": 503,
        "avgCost": 0.0024,
        "avgPassRate": 95,
        "successRate": 100
      },
      {
        "version": "v2",
        "testCount": 3,
        "successCount": 3,
        "avgElapsedMs": 1800,
        "avgTokens": 567,
        "avgCost": 0.0028,
        "avgPassRate": 97.67,
        "successRate": 100
      }
    ]
  },
  "results": [...],
  "recommendations": {
    "bestVersion": "v1",
    "costOptimization": [],
    "performanceIssues": [],
    "qualityIssues": []
  }
}
```

### Markdown报告预览
```markdown
# Prompt Version Comparison Report

## ⚖️ Version Comparison

| Version | Tests | Success Rate | Avg Time | Avg Tokens | Avg Cost | Avg Pass Rate |
|---------|-------|--------------|----------|------------|----------|---------------|
| v1 | 3 | 100% | 1617ms | 503 | $0.0024 | 95% |
| v2 | 3 | 100% | 1800ms | 567 | $0.0028 | 97.67% |

## 🎯 Recommendations

**🏆 Best Overall Performance:** v1

- **Success Rate:** 100%
- **Average Response Time:** 1617ms
- **Average Cost:** $0.0024
- **Average Pass Rate:** 95%

## 💰 Cost Analysis

- **Total Test Cost:** $0.0157
- **Average Cost per Test:** $0.0026
```

## 🔧 系统优势

1. **🧪 自动化测试** - 批量运行固定测试输入，确保一致性
2. **⚖️ 版本对比** - 自动对比v1 vs v2的输出差异和质量
3. **📊 Token监控** - 详细记录每次调用的token使用和耗时
4. **💵 成本估算** - 基于模型定价精确计算调用成本
5. **📋 报告生成** - 自动生成JSON和Markdown格式报告
6. **🎯 智能推荐** - 基于性能数据推荐最佳版本
7. **🔧 可扩展性** - 支持添加新测试用例和评估指标

## 📊 性能对比示例

基于模拟测试数据：

| 版本 | 成功率 | 平均耗时 | 平均Token | 平均成本 | 平均通过率 | 推荐度 |
|------|--------|----------|-----------|----------|------------|--------|
| v1 | 100% | 1617ms | 503 | $0.0024 | 95% | ⭐⭐⭐⭐⭐ |
| v2 | 100% | 1800ms | 567 | $0.0028 | 97.67% | ⭐⭐⭐⭐ |

**分析结果**：
- **v1版本**：成本更低，响应更快，适合生产环境
- **v2版本**：质量更高，功能更丰富，适合高质量要求场景

## 🔮 未来扩展

已添加TODO注释为未来扩展做准备：
```typescript
// TODO (Phase 5): Add automated semantic scoring (BLEU, LLM evaluation)
// TODO (Phase 5): Integrate with A/B testing framework for production
// TODO (Phase 5): Add regression testing for prompt changes
```

**Phase 5 计划**：
- 自动语义评分（BLEU、LLM评估）
- 生产环境A/B测试框架
- Prompt变更回归测试
- 更复杂的质量评估指标

## ✅ 完成标准验证

1. ✅ `runPromptTests.ts` 可批量测试多个版本
2. ✅ 生成 JSON 与 Markdown 报告
3. ✅ 记录 token 使用与耗时
4. ✅ 报告中展示性能与成本对比
5. ✅ 控制台输出测试统计
6. ✅ API端点正常工作
7. ✅ 智能推荐系统运行正常

**Prompt Test Harness & Performance Monitoring系统现在完全就绪！** 🎉

系统实现了自动化测试、性能监控、成本分析、报告生成等核心功能。通过这个系统，可以：
- 量化不同Prompt版本的表现
- 监控API调用的成本和性能
- 自动生成详细的对比报告
- 获得基于数据的优化建议

这为AI Resume项目提供了完整的Prompt工程能力，确保系统可以持续优化和改进！
