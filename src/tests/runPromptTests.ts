// TODO (Phase 5): Add automated semantic scoring (BLEU, LLM evaluation)
// TODO (Phase 5): Integrate with A/B testing framework for production
// TODO (Phase 5): Add regression testing for prompt changes

import { buildPrompt } from "../prompts/shared/buildPrompt";
import { openai } from "../app/api/openai-client";
import testCases from "./testCases.json";
import { logPromptMetrics, saveTestReport, saveMarkdownReport, TestResult, PromptMetrics } from "../utils/tokenLogger";
import { estimateCost } from "../utils/costCalculator";

interface TestCase {
  id: string;
  input: string;
  expectedType: "text" | "json";
  description: string;
  category: string;
}

interface TestRunResult {
  version: string;
  testId: string;
  testInput: string;
  elapsedMs: number;
  totalTokens: number;
  cost: number;
  response: string;
  success: boolean;
  error?: string;
  passRate: number;
}

async function runSingleTest(
  testCase: TestCase, 
  version: string, 
  model: string = "gpt-4o"
): Promise<TestRunResult> {
  const startTime = Date.now();
  
  try {
    console.log(`🧪 运行测试: ${testCase.id} (${version})`);
    
    // 构建prompt
    const prompt = await buildPrompt(testCase.input, undefined, version);
    
    // 调用OpenAI API
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: testCase.input }
      ],
      temperature: 0.1,
      max_tokens: 2000,
    });

    const elapsedMs = Date.now() - startTime;
    const response = completion.choices[0].message.content || "";
    const usage = completion.usage;
    
    if (!usage) {
      throw new Error("No usage information returned from OpenAI");
    }

    // 计算成本
    const costBreakdown = estimateCost(
      model, 
      usage.prompt_tokens, 
      usage.completion_tokens
    );

    // 记录指标
    const metrics: PromptMetrics = {
      timestamp: new Date().toISOString(),
      version,
      testId: testCase.id,
      testInput: testCase.input,
      promptTokens: usage.prompt_tokens,
      completionTokens: usage.completion_tokens,
      totalTokens: usage.total_tokens,
      elapsedMs,
      model,
      cost: costBreakdown.totalCost,
      success: true
    };
    
    logPromptMetrics(metrics);

    // 评估输出质量
    const passRate = evaluateResponse(response, testCase.expectedType);
    const success = passRate >= 80; // 80%以上认为成功

    return {
      version,
      testId: testCase.id,
      testInput: testCase.input,
      elapsedMs,
      totalTokens: usage.total_tokens,
      cost: costBreakdown.totalCost,
      response,
      success,
      passRate
    };

  } catch (error) {
    const elapsedMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.error(`❌ 测试失败: ${testCase.id} (${version})`, errorMessage);
    
    // 记录失败的指标
    const metrics: PromptMetrics = {
      timestamp: new Date().toISOString(),
      version,
      testId: testCase.id,
      testInput: testCase.input,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      elapsedMs,
      model,
      cost: 0,
      success: false,
      error: errorMessage
    };
    
    logPromptMetrics(metrics);

    return {
      version,
      testId: testCase.id,
      testInput: testCase.input,
      elapsedMs,
      totalTokens: 0,
      cost: 0,
      response: "",
      success: false,
      error: errorMessage,
      passRate: 0
    };
  }
}

function evaluateResponse(response: string, expectedType: "text" | "json"): number {
  if (!response || response.trim().length === 0) {
    return 0;
  }

  let score = 0;

  if (expectedType === "json") {
    try {
      // 尝试解析JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        JSON.parse(jsonMatch[0]);
        score += 50; // JSON格式正确
      }
      
      // 检查是否包含action字段
      if (response.includes('"action"')) {
        score += 30;
      }
      
      // 检查是否包含type字段
      if (response.includes('"type"')) {
        score += 20;
      }
    } catch {
      // JSON解析失败，但可能仍有部分正确性
      if (response.includes('"action"') || response.includes('"type"')) {
        score += 20;
      }
    }
  } else {
    // 文本响应评估
    const responseLength = response.length;
    
    if (responseLength > 10) {
      score += 30; // 有实际内容
    }
    
    if (responseLength > 50) {
      score += 30; // 内容丰富
    }
    
    if (responseLength > 100) {
      score += 20; // 详细回答
    }
    
    // 检查是否包含专业词汇
    const professionalWords = ['professional', 'enhanced', 'optimized', 'improved', 'developed', 'implemented'];
    const hasProfessionalWords = professionalWords.some(word => 
      response.toLowerCase().includes(word)
    );
    
    if (hasProfessionalWords) {
      score += 20;
    }
  }

  return Math.min(score, 100);
}

async function runPromptTests(): Promise<void> {
  console.log("🚀 开始Prompt测试套件...");
  
  const versions = ["v1", "v2"];
  const model = "gpt-4o";
  const results: TestRunResult[] = [];
  
  console.log(`📋 测试配置:`);
  console.log(`  - 版本: ${versions.join(", ")}`);
  console.log(`  - 模型: ${model}`);
  console.log(`  - 测试用例: ${testCases.length}个`);
  
  // 运行所有测试
  for (const version of versions) {
    console.log(`\n🔄 测试版本: ${version}`);
    
    for (const testCase of testCases as TestCase[]) {
      const result = await runSingleTest(testCase, version, model);
      results.push(result);
      
      // 添加延迟避免API限制
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // 生成报告
  console.log("\n📊 生成测试报告...");
  saveTestReport(results);
  saveMarkdownReport(results);
  
  // 输出统计信息
  console.log("\n📈 测试统计:");
  const versionStats = versions.map(version => {
    const versionResults = results.filter(r => r.version === version);
    const successCount = versionResults.filter(r => r.success).length;
    const avgElapsed = versionResults.reduce((sum, r) => sum + r.elapsedMs, 0) / versionResults.length;
    const avgTokens = versionResults.reduce((sum, r) => sum + r.totalTokens, 0) / versionResults.length;
    const avgCost = versionResults.reduce((sum, r) => sum + r.cost, 0) / versionResults.length;
    const avgPassRate = versionResults.reduce((sum, r) => sum + r.passRate, 0) / versionResults.length;
    
    console.log(`  ${version}:`);
    console.log(`    - 成功率: ${successCount}/${versionResults.length} (${Math.round(successCount/versionResults.length*100)}%)`);
    console.log(`    - 平均耗时: ${Math.round(avgElapsed)}ms`);
    console.log(`    - 平均Token: ${Math.round(avgTokens)}`);
    console.log(`    - 平均成本: $${avgCost.toFixed(4)}`);
    console.log(`    - 平均通过率: ${Math.round(avgPassRate)}%`);
  });
  
  const totalCost = results.reduce((sum, r) => sum + r.cost, 0);
  console.log(`\n💰 总测试成本: $${totalCost.toFixed(4)}`);
  
  console.log("\n✅ Prompt测试套件完成!");
  console.log("📄 报告已保存到 src/tests/reports/");
}

// 如果直接运行此脚本
if (require.main === module) {
  runPromptTests().catch(console.error);
}

export { runPromptTests, runSingleTest, evaluateResponse };
