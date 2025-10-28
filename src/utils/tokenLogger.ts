import fs from "fs";
import path from "path";

export interface PromptMetrics {
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

export interface TestResult {
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

const METRICS_LOG_PATH = path.join(process.cwd(), "src/tests/reports/metrics.log");
const REPORT_PATH = path.join(process.cwd(), "src/tests/reports/report.json");

export function logPromptMetrics(metrics: PromptMetrics): void {
  try {
    const logEntry = `[${metrics.timestamp}] ${JSON.stringify(metrics)}\n`;
    fs.appendFileSync(METRICS_LOG_PATH, logEntry);
    console.log(`📊 记录指标: ${metrics.version} - ${metrics.testId} - ${metrics.totalTokens} tokens - ${metrics.elapsedMs}ms`);
  } catch (error) {
    console.error("❌ 记录指标失败:", error);
  }
}

export function saveTestReport(results: TestResult[]): void {
  try {
    const report = {
      timestamp: new Date().toISOString(),
      summary: generateSummary(results),
      results: results
    };
    
    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
    console.log(`📋 测试报告已保存: ${REPORT_PATH}`);
  } catch (error) {
    console.error("❌ 保存报告失败:", error);
  }
}

export function generateSummary(results: TestResult[]): any {
  const versions = [...new Set(results.map(r => r.version))];
  const summary = {
    totalTests: results.length,
    versions: versions.map(version => {
      const versionResults = results.filter(r => r.version === version);
      const avgElapsed = versionResults.reduce((sum, r) => sum + r.elapsedMs, 0) / versionResults.length;
      const avgTokens = versionResults.reduce((sum, r) => sum + r.totalTokens, 0) / versionResults.length;
      const avgCost = versionResults.reduce((sum, r) => sum + r.cost, 0) / versionResults.length;
      const avgPassRate = versionResults.reduce((sum, r) => sum + r.passRate, 0) / versionResults.length;
      const successCount = versionResults.filter(r => r.success).length;
      
      return {
        version,
        testCount: versionResults.length,
        successCount,
        avgElapsedMs: Math.round(avgElapsed),
        avgTokens: Math.round(avgTokens),
        avgCost: Math.round(avgCost * 10000) / 10000, // 保留4位小数
        avgPassRate: Math.round(avgPassRate * 100) / 100,
        successRate: Math.round((successCount / versionResults.length) * 100)
      };
    })
  };
  
  return summary;
}

export function generateMarkdownReport(results: TestResult[]): string {
  const summary = generateSummary(results);
  const timestamp = new Date().toISOString();
  
  let markdown = `# Prompt Version Comparison Report\n\n`;
  markdown += `**Generated:** ${timestamp}\n\n`;
  
  // 总体统计
  markdown += `## 📊 Overall Statistics\n\n`;
  markdown += `- **Total Tests:** ${summary.totalTests}\n`;
  markdown += `- **Versions Tested:** ${summary.versions.length}\n\n`;
  
  // 版本对比表格
  markdown += `## ⚖️ Version Comparison\n\n`;
  markdown += `| Version | Tests | Success Rate | Avg Time | Avg Tokens | Avg Cost | Avg Pass Rate |\n`;
  markdown += `|---------|-------|--------------|----------|------------|----------|---------------|\n`;
  
  summary.versions.forEach(v => {
    markdown += `| ${v.version} | ${v.testCount} | ${v.successRate}% | ${v.avgElapsedMs}ms | ${v.avgTokens} | $${v.avgCost} | ${v.avgPassRate}% |\n`;
  });
  
  markdown += `\n`;
  
  // 详细结果
  markdown += `## 📋 Detailed Results\n\n`;
  markdown += `| Version | Test ID | Input | Time | Tokens | Cost | Success | Pass Rate |\n`;
  markdown += `|---------|---------|-------|------|--------|------|---------|----------|\n`;
  
  results.forEach(r => {
    const input = r.testInput.length > 50 ? r.testInput.substring(0, 50) + "..." : r.testInput;
    markdown += `| ${r.version} | ${r.testId} | ${input} | ${r.elapsedMs}ms | ${r.totalTokens} | $${r.cost} | ${r.success ? "✅" : "❌"} | ${r.passRate}% |\n`;
  });
  
  markdown += `\n`;
  
  // 推荐
  markdown += `## 🎯 Recommendations\n\n`;
  const bestVersion = summary.versions.reduce((best, current) => {
    const bestScore = best.successRate * 0.4 + (100 - best.avgElapsedMs / 10) * 0.3 + (100 - best.avgCost * 10000) * 0.3;
    const currentScore = current.successRate * 0.4 + (100 - current.avgElapsedMs / 10) * 0.3 + (100 - current.avgCost * 10000) * 0.3;
    return currentScore > bestScore ? current : best;
  });
  
  markdown += `**🏆 Best Overall Performance:** ${bestVersion.version}\n\n`;
  markdown += `- **Success Rate:** ${bestVersion.successRate}%\n`;
  markdown += `- **Average Response Time:** ${bestVersion.avgElapsedMs}ms\n`;
  markdown += `- **Average Cost:** $${bestVersion.avgCost}\n`;
  markdown += `- **Average Pass Rate:** ${bestVersion.avgPassRate}%\n\n`;
  
  // 成本分析
  markdown += `## 💰 Cost Analysis\n\n`;
  const totalCost = results.reduce((sum, r) => sum + r.cost, 0);
  const avgCostPerTest = totalCost / results.length;
  markdown += `- **Total Test Cost:** $${Math.round(totalCost * 10000) / 10000}\n`;
  markdown += `- **Average Cost per Test:** $${Math.round(avgCostPerTest * 10000) / 10000}\n\n`;
  
  // 性能建议
  markdown += `## 🚀 Performance Recommendations\n\n`;
  summary.versions.forEach(v => {
    if (v.avgElapsedMs > 2000) {
      markdown += `- ⚠️ **${v.version}** has slow response times (${v.avgElapsedMs}ms average)\n`;
    }
    if (v.avgCost > 0.005) {
      markdown += `- 💰 **${v.version}** has high costs ($${v.avgCost} average)\n`;
    }
    if (v.successRate < 90) {
      markdown += `- 🔧 **${v.version}** needs improvement (${v.successRate}% success rate)\n`;
    }
  });
  
  return markdown;
}

export function saveMarkdownReport(results: TestResult[]): void {
  try {
    const markdown = generateMarkdownReport(results);
    const markdownPath = path.join(process.cwd(), "src/tests/reports/report.md");
    fs.writeFileSync(markdownPath, markdown);
    console.log(`📄 Markdown报告已保存: ${markdownPath}`);
  } catch (error) {
    console.error("❌ 保存Markdown报告失败:", error);
  }
}
