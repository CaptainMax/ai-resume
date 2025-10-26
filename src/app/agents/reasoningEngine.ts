// src/app/agents/reasoningEngine.ts
// 🧠 LLM-Powered Reasoning Engine - Plans action chains dynamically

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ReasoningStep {
  step: number;
  action: string;
  target: string;
  method: string;
  params: Record<string, any>;
  reasoning: string;
  confidence: number;
}

export interface ActionPlan {
  intent: string;
  confidence: number;
  reasoning: string;
  steps: ReasoningStep[];
  context: Record<string, any>;
}

export interface ExecutionResult {
  success: boolean;
  result: any;
  step: ReasoningStep;
  error?: string;
}

export class ReasoningEngine {
  private userMemory: Map<string, any> = new Map();
  private actionHistory: Map<string, any[]> = new Map();
  private learningPatterns: Map<string, any> = new Map();

  /**
   * 🧠 Plan action chain from user intent
   */
  async planActionChain(
    userInput: string, 
    currentResume: any, 
    userId: string = 'default'
  ): Promise<ActionPlan> {
    console.log('🧠 Planning action chain for:', userInput);

    try {
      // Get user context and memory
      const userContext = this.getUserContext(userId, currentResume);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a reasoning engine that plans action chains for resume editing.

CRITICAL: Always analyze the context first! Look at existing content before deciding the action.

Your job is to:
1. Analyze user intent CAREFULLY - distinguish between:
   - Adding NEW content vs Updating EXISTING content
   - Adding new sections vs Adding to existing sections
   - Creating new entries vs Modifying existing entries
2. Break it down into structured reasoning steps
3. Plan the execution sequence
4. Consider user preferences and past patterns

Current resume structure:
${JSON.stringify(currentResume, null, 2)}

User context:
${JSON.stringify(userContext, null, 2)}

IMPORTANT CONTEXT ANALYSIS RULES:
- If user mentions a company name that ALREADY EXISTS in the resume, they likely want to UPDATE/ADD TO that existing entry
- If user says "add description for [existing company]", they want to ADD content to existing entry, not create new one
- If user says "add company [name]" and company already exists, they want to UPDATE existing entry
- If user says "在[公司名] 我的主要工作经验是...帮我润色一下加入到对应的工作经验当中", they want to ADD/UPDATE existing company entry
- If user mentions "润色" (polish) + "加入到对应的工作经验" (add to corresponding work experience), they want to UPDATE existing entry
- Always check if target content already exists before planning to create new content
- For Chinese input like "在Popping Art Design 我的主要工作经验是...", recognize this as updating existing company entry

Return a JSON action plan with this structure:
{
  "intent": "user's intent",
  "confidence": 0.0-1.0,
  "reasoning": "why this plan makes sense",
  "steps": [
    {
      "step": 1,
      "action": "identify_section",
      "target": "work_experience",
      "method": "semantic_search",
      "params": {"query": "work experience"},
      "reasoning": "find the work experience section",
      "confidence": 0.9
    },
    {
      "step": 2,
      "action": "find_content",
      "target": "points",
      "method": "semantic_match",
      "params": {"keyword": "responsibility", "threshold": 0.8},
      "reasoning": "find content with responsibility prefix",
      "confidence": 0.85
    },
    {
      "step": 3,
      "action": "transform_content",
      "target": "points",
      "method": "prefix_removal",
      "params": {"prefix": "responsibility", "preserve": true},
      "reasoning": "remove responsibility prefix while preserving content",
      "confidence": 0.9
    }
  ],
  "context": {
    "userPreferences": {},
    "learnedPatterns": {}
  }
}

🧠 SEMANTIC REASONING SYSTEM - No Fixed Actions

You are a semantic reasoning engine. Instead of choosing from predefined actions, 
you should reason about what the user truly wants and generate appropriate action plans.

KEY PRINCIPLES:
1. Understand the user's REAL intent, not just pattern matching
2. Generate semantic action names that describe what needs to be done
3. Focus on the outcome the user wants, not the method

CONTEXT-AWARE REASONING:
- "add description for Apple" → user wants to add description to existing Apple entry
- "add company Apple" (if Apple exists) → user wants to update existing Apple entry  
- "add company Google" (if Google doesn't exist) → user wants to create new Google entry
- "在Popping Art Design 我的主要工作经验是...帮我润色一下加入到对应的工作经验当中" → user wants to add polished work experience to existing Popping Art Design entry
- "在[公司名] 我的主要工作经验是...润色...加入到对应的工作经验" → user wants to add polished content to existing company entry

SEMANTIC ACTION GENERATION:
Generate action names that semantically describe what needs to be done:
- "add_description_to_existing_company"
- "update_existing_work_experience" 
- "polish_and_add_to_existing_entry"
- "create_new_company_entry"
- "find_and_update_existing_content"

Focus on the SEMANTIC MEANING, not predefined templates.`
          },
          {
            role: "user",
            content: `User input: "${userInput}"`
          }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from reasoning engine');

      const plan: ActionPlan = JSON.parse(response);
      
      // Store in user memory
      this.storeUserAction(userId, userInput, plan);
      
      console.log('✅ Action plan generated:', plan);
      return plan;

    } catch (error) {
      console.error('❌ Reasoning planning failed:', error);
      throw error;
    }
  }

  /**
   * 🎯 Execute reasoning step using semantic infrastructure
   */
  async executeReasoningStep(
    step: ReasoningStep, 
    resumeData: any, 
  ): Promise<ExecutionResult> {
    console.log(`🎯 Executing semantic step ${step.step}: ${step.action}`);

    try {
      // 使用语义动作注册表执行
      const { executeAction } = await import('@/core/semanticActionRegistry');
      const { mapSemanticAction } = await import('@/core/semanticMapper');
      const { fallbackInterpreter } = await import('@/core/fallbackInterpreter');

      // 1. 尝试直接执行
      try {
        const result = await executeAction(step.action, step, resumeData);
        return {
          success: true,
          result,
          step
        };
      } catch (error) {
        // 2. 尝试语义映射
        const mappedAction = mapSemanticAction(step.action);
        if (mappedAction !== step.action) {
          const result = await executeAction(mappedAction, step, resumeData);
          return {
            success: true,
            result,
            step
          };
        }

        // 3. 使用回退解释器
        const result = await fallbackInterpreter.handleUnknownAction(step.action, step, resumeData);
        return {
          success: true,
          result,
          step
        };
      }

    } catch (error) {
      console.error(`❌ Semantic step ${step.step} execution failed:`, error);
      return {
        success: false,
        result: null,
        step,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 🧠 所有执行逻辑现在由语义基础设施处理
  // 不再需要硬编码的方法！

  /**
   * 🧠 Get user context and memory
   */
  private getUserContext(userId: string, currentResume: any): any {
    const userMemory = this.userMemory.get(userId) || {};
    const actionHistory = this.actionHistory.get(userId) || [];
    const learningPatterns = this.learningPatterns.get(userId) || {};

    return {
      userMemory,
      actionHistory: actionHistory.slice(-10), // Last 10 actions
      learningPatterns,
      currentResume: {
        sections: currentResume.sections || [],
        structure: this.analyzeResumeStructure(currentResume)
      }
    };
  }

  /**
   * 📊 Analyze resume structure
   */
  private analyzeResumeStructure(resume: any): any {
    const sections = resume.sections || [];
    return {
      sectionCount: sections.length,
      sectionTitles: sections.map((s: any) => s.title),
      totalFields: sections.reduce((sum: number, s: any) => sum + (s.fields?.length || 0), 0),
      totalPoints: sections.reduce((sum: number, s: any) => 
        sum + (s.fields?.reduce((fSum: number, f: any) => fSum + (f.points?.length || 0), 0) || 0), 0)
    };
  }

  /**
   * 💾 Store user action in memory
   */
  private storeUserAction(userId: string, input: string, plan: ActionPlan): void {
    if (!this.actionHistory.has(userId)) {
      this.actionHistory.set(userId, []);
    }
    
    const history = this.actionHistory.get(userId)!;
    history.push({
      timestamp: new Date(),
      input,
      plan,
      success: true
    });
    
    // Keep only last 50 actions
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }
  }

  /**
   * 🎓 Learn from execution
   */
  private learnFromExecution(userId: string, step: ReasoningStep, result: any): void {
    if (!this.learningPatterns.has(userId)) {
      this.learningPatterns.set(userId, {
        successfulActions: new Map(),
        failedActions: new Map(),
        userPreferences: {}
      });
    }
    
    const patterns = this.learningPatterns.get(userId)!;
    const actionKey = `${step.action}_${step.method}`;
    
    if (result.success) {
      const successCount = patterns.successfulActions.get(actionKey) || 0;
      patterns.successfulActions.set(actionKey, successCount + 1);
    } else {
      const failCount = patterns.failedActions.get(actionKey) || 0;
      patterns.failedActions.set(actionKey, failCount + 1);
    }
  }

  /**
   * 📈 Calculate text similarity
   */
  private calculateSimilarity(text1: string, text2: string): number {
    const s1 = text1.toLowerCase().trim();
    const s2 = text2.toLowerCase().trim();
    
    if (s1 === s2) return 1.0;
    if (s1.includes(s2) || s2.includes(s1)) return 0.9;
    
    const words1 = s1.split(/\s+/);
    const words2 = s2.split(/\s+/);
    const common = words1.filter(w => words2.includes(w));
    return common.length / Math.max(words1.length, words2.length);
  }

  /**
   * 🧹 Clear user memory
   */
  clearUserMemory(userId?: string): void {
    if (userId) {
      this.userMemory.delete(userId);
      this.actionHistory.delete(userId);
      this.learningPatterns.delete(userId);
    } else {
      this.userMemory.clear();
      this.actionHistory.clear();
      this.learningPatterns.clear();
    }
  }
}
