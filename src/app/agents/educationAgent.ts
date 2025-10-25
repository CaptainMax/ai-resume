// src/app/agents/educationAgent.ts
// 🎓 教育经历Agent - 完全推理驱动的AI智能教育系统

// Simple UUID generator without external dependencies
const generateId = () => {
  return 'id-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
};

// 结构化日志记录
const logStage = (stage: string, data: any = {}) => {
  const timestamp = new Date().toISOString();
  console.log(`🎓 [${timestamp}] [${stage}]:`, data);
};

// 文本相似度计算（简化版）
const textSimilarity = (a: string, b: string): number => {
  const s1 = a.toLowerCase().trim();
  const s2 = b.toLowerCase().trim();
  
  if (s1 === s2) return 1.0;
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;
  
  // 简单的词汇重叠计算
  const w1 = s1.split(/\s+/);
  const w2 = s2.split(/\s+/);
  const common = w1.filter(w => w2.includes(w));
  return common.length / Math.max(w1.length, w2.length);
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
        reasoning: reasoning.reasoningSteps?.join('; ') || 'Education operation executed',
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

export class EducationAgent {
  async execute(entities: any, context: any): Promise<{ success: boolean; message: string; updatedResume?: any }> {
    logStage("intent-received", { entities, contextKeys: Object.keys(context) });
    
    try {
      // 🧠 深度克隆sections以避免状态污染
      const originalSections = context.sections || [];
      const sections = structuredClone(originalSections);
      
      // 🧠 提取LLM推理信息
      const reasoning = {
        intent: entities.intent || 'add_education',
        entities: entities,
        confidence: entities.confidence || 0.85,
        reasoningSteps: entities.reasoningSteps || ['Analyze user intent → Identify Education section → Create or update entry']
      };
      
      // 🧠 记录推理链
      logStage("reasoning-start", { 
        intent: reasoning.intent,
        confidence: reasoning.confidence,
        reasoningSteps: reasoning.reasoningSteps
      });
      
      // 🎓 自动检测或创建Education section
      let educationSection = sections.find((section: any) => 
        /education|教育/i.test(section.title)
      );
      
      if (!educationSection) {
        logStage("education-section-detected", { action: "creating-new-section" });
        educationSection = {
          id: generateId(),
          title: 'Education',
          fields: []
        };
        sections.push(educationSection);
      } else {
        logStage("education-section-detected", { action: "using-existing-section", sectionId: educationSection.id });
      }
      
      // 🧠 语义去重检查
      const institution = entities.institution || 'University';
      const degree = entities.degree || 'Bachelor\'s Degree';
      const major = entities.major || 'Computer Science';
      const period = entities.period || entities.time || '2020-2024';
      
      logStage("deduplication-check", { institution, degree, major, period });
      
      // 检查是否存在相似的教育经历
      let existingEntry = null;
      let similarityScore = 0;
      
      for (const field of educationSection.fields) {
        const nameSimilarity = textSimilarity(field.name, institution);
        const valueSimilarity = textSimilarity(field.value, institution);
        const maxSimilarity = Math.max(nameSimilarity, valueSimilarity);
        
        if (maxSimilarity >= 0.75) {
          existingEntry = field;
          similarityScore = maxSimilarity;
          break;
        }
      }
      
      let stats = { added: 0, updated: 0 };
      
      if (existingEntry && similarityScore >= 0.75) {
        // 更新现有条目
        logStage("deduplication-check", { 
          action: "updating-existing", 
          similarity: similarityScore.toFixed(2),
          existingName: existingEntry.name
        });
        
        existingEntry.name = institution;
        existingEntry.value = institution;
        
        // 更新或添加points
        const degreePoint = existingEntry.points.find((p: any) => p.content.startsWith('Degree:'));
        const majorPoint = existingEntry.points.find((p: any) => p.content.startsWith('Major:'));
        const periodPoint = existingEntry.points.find((p: any) => p.content.startsWith('Period:'));
        
        if (degreePoint) {
          degreePoint.content = `Degree: ${degree}`;
        } else {
          existingEntry.points.push({ id: generateId(), content: `Degree: ${degree}` });
        }
        
        if (majorPoint) {
          majorPoint.content = `Major: ${major}`;
        } else {
          existingEntry.points.push({ id: generateId(), content: `Major: ${major}` });
        }
        
        if (periodPoint) {
          periodPoint.content = `Period: ${period}`;
        } else {
          existingEntry.points.push({ id: generateId(), content: `Period: ${period}` });
        }
        
        stats.updated = 1;
        
        logStage("creation-complete", { 
          action: "updated-existing", 
          institution, 
          degree, 
          major, 
          period,
          similarity: similarityScore.toFixed(2)
        });
        
      } else {
        // 创建新的教育经历条目
        logStage("deduplication-check", { 
          action: "creating-new-entry", 
          reason: existingEntry ? `similarity-too-low: ${similarityScore.toFixed(2)}` : "no-existing-entries"
        });
        
        const newEducationEntry = {
          id: generateId(),
          name: institution,
          value: institution,
          points: [
            {
              id: generateId(),
              content: `Degree: ${degree}`
            },
            {
              id: generateId(),
              content: `Major: ${major}`
            },
            {
              id: generateId(),
              content: `Period: ${period}`
            }
          ]
        };
        
        // 添加教育经历到section
        educationSection.fields.push(newEducationEntry);
        stats.added = 1;
        
        logStage("creation-complete", { 
          action: "created-new-entry", 
          institution, 
          degree, 
          major, 
          period,
          entryId: newEducationEntry.id
        });
      }
      
      // 发送反馈
      await sendFeedback(context.userId || 'default', reasoning, true, stats);
      
      const actionText = stats.updated > 0 ? '更新' : '添加';
      const message = `✅ 成功${actionText}教育经历：${institution} - ${degree}`;
      
      return {
        success: true,
        message,
        updatedResume: sections
      };
      
    } catch (error) {
      logStage("execution-error", { error: error instanceof Error ? error.message : 'Unknown error' });
      return {
        success: false,
        message: `❌ 添加教育经历失败: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}