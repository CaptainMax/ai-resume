// OpenAI模型定价（每1000 tokens，美元）
const MODEL_PRICING = {
  "gpt-4o": {
    input: 0.005,   // $5 per 1M input tokens
    output: 0.015   // $15 per 1M output tokens
  },
  "gpt-4o-mini": {
    input: 0.00015, // $0.15 per 1M input tokens
    output: 0.0006  // $0.6 per 1M output tokens
  },
  "gpt-4": {
    input: 0.03,    // $30 per 1M input tokens
    output: 0.06    // $60 per 1M output tokens
  },
  "gpt-3.5-turbo": {
    input: 0.001,   // $1 per 1M input tokens
    output: 0.002   // $2 per 1M output tokens
  }
};

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface CostBreakdown {
  inputCost: number;
  outputCost: number;
  totalCost: number;
  model: string;
  tokenUsage: TokenUsage;
}

export function estimateCost(
  model: string, 
  promptTokens: number, 
  completionTokens: number
): CostBreakdown {
  const pricing = MODEL_PRICING[model as keyof typeof MODEL_PRICING];
  
  if (!pricing) {
    console.warn(`⚠️ 未知模型定价: ${model}, 使用默认定价`);
    // 使用gpt-4o的定价作为默认值
    const defaultPricing = MODEL_PRICING["gpt-4o"];
    const inputCost = (promptTokens / 1000) * defaultPricing.input;
    const outputCost = (completionTokens / 1000) * defaultPricing.output;
    
    return {
      inputCost: Math.round(inputCost * 100000) / 100000, // 保留5位小数
      outputCost: Math.round(outputCost * 100000) / 100000,
      totalCost: Math.round((inputCost + outputCost) * 100000) / 100000,
      model,
      tokenUsage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens
      }
    };
  }
  
  const inputCost = (promptTokens / 1000) * pricing.input;
  const outputCost = (completionTokens / 1000) * pricing.output;
  const totalCost = inputCost + outputCost;
  
  return {
    inputCost: Math.round(inputCost * 100000) / 100000, // 保留5位小数
    outputCost: Math.round(outputCost * 100000) / 100000,
    totalCost: Math.round(totalCost * 100000) / 100000,
    model,
    tokenUsage: {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens
    }
  };
}

export function calculateBatchCost(results: Array<{model: string, promptTokens: number, completionTokens: number}>): {
  totalCost: number;
  breakdown: Array<CostBreakdown>;
  summary: {
    totalTests: number;
    totalTokens: number;
    avgCostPerTest: number;
    modelDistribution: Record<string, number>;
  };
} {
  const breakdown = results.map(result => 
    estimateCost(result.model, result.promptTokens, result.completionTokens)
  );
  
  const totalCost = breakdown.reduce((sum, cost) => sum + cost.totalCost, 0);
  const totalTokens = breakdown.reduce((sum, cost) => sum + cost.tokenUsage.totalTokens, 0);
  
  // 统计模型使用分布
  const modelDistribution: Record<string, number> = {};
  breakdown.forEach(cost => {
    modelDistribution[cost.model] = (modelDistribution[cost.model] || 0) + 1;
  });
  
  return {
    totalCost: Math.round(totalCost * 100000) / 100000,
    breakdown,
    summary: {
      totalTests: results.length,
      totalTokens,
      avgCostPerTest: Math.round((totalCost / results.length) * 100000) / 100000,
      modelDistribution
    }
  };
}

export function getModelPricing(model: string): {input: number, output: number} | null {
  return MODEL_PRICING[model as keyof typeof MODEL_PRICING] || null;
}

export function formatCost(cost: number): string {
  if (cost < 0.001) {
    return `$${(cost * 1000000).toFixed(0)}μ`; // 微美元
  } else if (cost < 0.01) {
    return `$${(cost * 1000).toFixed(2)}m`; // 毫美元
  } else {
    return `$${cost.toFixed(4)}`; // 美元
  }
}

export function getCostEfficiencyScore(
  cost: number, 
  qualityScore: number, 
  responseTime: number
): number {
  // 成本效率评分：质量/成本比，考虑响应时间
  // 分数越高越好
  const timePenalty = Math.max(0, (responseTime - 1000) / 1000); // 超过1秒开始扣分
  const efficiencyScore = (qualityScore * 100) / (cost * 10000 + timePenalty);
  return Math.round(efficiencyScore * 100) / 100;
}
