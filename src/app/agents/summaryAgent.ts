// src/app/agents/summaryAgent.ts
// 📝 Summary Agent - 专门处理简历Summary部分

// Simple UUID generator without external dependencies
const generateId = () => {
  return 'id-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
};

// 结构化日志记录
const logStage = (stage: string, data: any = {}) => {
  const timestamp = new Date().toISOString();
  console.log(`📝 [${timestamp}] [${stage}]:`, data);
};

// 发送反馈到LLM推理引擎
const sendFeedback = async (userId: string, reasoning: any, success: boolean, stats: any) => {
  try {
    const feedbackData = {
      userId,
      reasoning: {
        intent: reasoning.intent,
        entities: reasoning.entities,
        action: 'add' as const,
        target: 'field' as const,
        entity: reasoning.intent,
        data: reasoning.entities,
        confidence: reasoning.confidence,
        reasoning: reasoning.reasoningSteps?.join('; ') || 'Summary operation executed',
        reasoningSteps: reasoning.reasoningSteps || []
      },
      success,
      stats,
      timestamp: new Date().toISOString()
    };
    
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/llm-reasoning/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedbackData)
    });
    
    logStage("feedback-sent", { success, stats });
  } catch (error) {
    logStage("feedback-error", { error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export class SummaryAgent {
  async execute(entities: any, context: any): Promise<{ success: boolean; message: string; updatedResume?: any }> {
    logStage("intent-received", { entities, contextKeys: Object.keys(context) });
    
    try {
      // 🧠 深度克隆sections以避免状态污染
      const originalSections = context.sections || [];
      const sections = structuredClone(originalSections);
      
      // 🧠 提取LLM推理信息
      const reasoning = {
        intent: entities.intent || 'add_summary',
        entities: entities,
        confidence: entities.confidence || 0.85,
        reasoningSteps: entities.reasoningSteps || ['Analyze user intent → Identify Summary section → Create or update summary']
      };
      
      // 🧠 记录推理链
      logStage("reasoning-start", { 
        intent: reasoning.intent,
        confidence: reasoning.confidence,
        reasoningSteps: reasoning.reasoningSteps
      });
      
      // 📝 智能检测或创建Summary section
      let summarySection = sections.find((section: any) => 
        /summary|摘要|简介|profile|overview/i.test(section.title)
      );
      
      if (!summarySection) {
        logStage("section-detected", { action: "creating-new-section" });
        summarySection = {
          id: generateId(),
          title: 'Summary',
          fields: []
        };
        sections.push(summarySection);
      } else {
        logStage("section-detected", { 
          action: "using-existing-section", 
          sectionId: summarySection.id,
          sectionTitle: summarySection.title
        });
      }
      
      // 📝 提取Summary内容
      const summaryContent = entities.summary || entities.content || entities.text || 
        "Experienced professional with strong technical skills and proven track record.";
      
      logStage("summary-extraction", { content: summaryContent.substring(0, 100) + '...' });
      
      // 📝 创建或更新Summary字段
      let summaryField = summarySection.fields.find((field: any) => 
        /summary|摘要|简介|profile|overview/i.test(field.name)
      );
      
      if (summaryField) {
        // 更新现有Summary
        summaryField.value = summaryContent;
        logStage("summary-updated", { 
          action: "updated-existing",
          content: summaryContent.substring(0, 50) + '...'
        });
      } else {
        // 创建新的Summary字段
        const newSummaryField = {
          id: generateId(),
          name: 'Summary',
          value: summaryContent
        };
        
        summarySection.fields.push(newSummaryField);
        logStage("summary-created", { 
          action: "created-new-field",
          content: summaryContent.substring(0, 50) + '...',
          fieldId: newSummaryField.id
        });
      }
      
      // 发送反馈
      await sendFeedback(context.userId || 'default', reasoning, true, { added: 1, updated: 0 });
      
      const message = `✅ 成功添加/更新简历摘要`;
      
      return {
        success: true,
        message,
        updatedResume: sections
      };
      
    } catch (error) {
      logStage("execution-error", { error: error instanceof Error ? error.message : 'Unknown error' });
      return {
        success: false,
        message: `❌ 添加简历摘要失败: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}
