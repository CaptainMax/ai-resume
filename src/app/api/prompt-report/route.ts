import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const REPORT_PATH = path.join(process.cwd(), "src/tests/reports/report.json");
const MARKDOWN_PATH = path.join(process.cwd(), "src/tests/reports/report.md");
const METRICS_PATH = path.join(process.cwd(), "src/tests/reports/metrics.log");

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "json";
    
    if (format === "markdown") {
      // 返回Markdown报告
      if (fs.existsSync(MARKDOWN_PATH)) {
        const markdown = fs.readFileSync(MARKDOWN_PATH, "utf8");
        return new NextResponse(markdown, {
          headers: {
            "Content-Type": "text/markdown",
          },
        });
      } else {
        return NextResponse.json({
          success: false,
          error: "Markdown report not found. Run tests first."
        }, { status: 404 });
      }
    }
    
    // 返回JSON报告
    if (fs.existsSync(REPORT_PATH)) {
      const report = JSON.parse(fs.readFileSync(REPORT_PATH, "utf8"));
      
      // 添加额外统计信息
      const enhancedReport = {
        ...report,
        metadata: {
          ...report.metadata,
          generatedAt: report.timestamp,
          reportPath: REPORT_PATH,
          markdownPath: MARKDOWN_PATH,
          metricsPath: METRICS_PATH
        },
        recommendations: generateRecommendations(report.results)
      };
      
      return NextResponse.json(enhancedReport);
    } else {
      return NextResponse.json({
        success: false,
        error: "Test report not found. Run tests first.",
        instructions: "Run 'npm run prompt:test' to generate test reports."
      }, { status: 404 });
    }
    
  } catch (error) {
    console.error("❌ 获取报告失败:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to retrieve test report"
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { action } = await req.json();
    
    if (action === "run-tests") {
      // 触发测试运行 - 使用直接导入
      try {
        const { runPromptTests } = await import("../../../tests/runPromptTests");
        
        // 在后台运行测试
        runPromptTests().catch(console.error);
        
        return NextResponse.json({
          success: true,
          message: "Test suite started in background",
          status: "running"
        });
      } catch (importError) {
        console.error("❌ 导入测试模块失败:", importError);
        return NextResponse.json({
          success: false,
          error: "Failed to import test module",
          details: importError instanceof Error ? importError.message : String(importError)
        }, { status: 500 });
      }
    }
    
    if (action === "clear-reports") {
      // 清理报告文件
      const filesToClear = [REPORT_PATH, MARKDOWN_PATH, METRICS_PATH];
      let clearedCount = 0;
      
      filesToClear.forEach(filePath => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          clearedCount++;
        }
      });
      
      return NextResponse.json({
        success: true,
        message: `Cleared ${clearedCount} report files`,
        clearedFiles: filesToClear.filter(f => fs.existsSync(f))
      });
    }
    
    return NextResponse.json({
      success: false,
      error: "Invalid action. Supported actions: 'run-tests', 'clear-reports'"
    }, { status: 400 });
    
  } catch (error) {
    console.error("❌ 处理请求失败:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to process request"
    }, { status: 500 });
  }
}

function generateRecommendations(results: any[]): any {
  const versions = [...new Set(results.map(r => r.version))];
  
  const recommendations = {
    bestVersion: null as string | null,
    costOptimization: [] as string[],
    performanceIssues: [] as string[],
    qualityIssues: [] as string[]
  };
  
  // 分析每个版本
  const versionAnalysis = versions.map(version => {
    const versionResults = results.filter(r => r.version === version);
    const successRate = versionResults.filter(r => r.success).length / versionResults.length;
    const avgCost = versionResults.reduce((sum, r) => sum + r.cost, 0) / versionResults.length;
    const avgElapsed = versionResults.reduce((sum, r) => sum + r.elapsedMs, 0) / versionResults.length;
    const avgPassRate = versionResults.reduce((sum, r) => sum + r.passRate, 0) / versionResults.length;
    
    return {
      version,
      successRate,
      avgCost,
      avgElapsed,
      avgPassRate,
      score: successRate * 0.4 + avgPassRate * 0.3 + (100 - avgElapsed / 10) * 0.2 + (100 - avgCost * 10000) * 0.1
    };
  });
  
  // 找出最佳版本
  const bestVersion = versionAnalysis.reduce((best, current) => 
    current.score > best.score ? current : best
  );
  
  recommendations.bestVersion = bestVersion.version;
  
  // 生成建议
  versionAnalysis.forEach(analysis => {
    if (analysis.avgCost > 0.005) {
      recommendations.costOptimization.push(
        `${analysis.version} has high average cost ($${analysis.avgCost.toFixed(4)}). Consider optimizing prompts.`
      );
    }
    
    if (analysis.avgElapsed > 2000) {
      recommendations.performanceIssues.push(
        `${analysis.version} has slow response times (${Math.round(analysis.avgElapsed)}ms average). Consider prompt optimization.`
      );
    }
    
    if (analysis.successRate < 0.9) {
      recommendations.qualityIssues.push(
        `${analysis.version} has low success rate (${Math.round(analysis.successRate * 100)}%). Review prompt quality.`
      );
    }
  });
  
  return recommendations;
}
