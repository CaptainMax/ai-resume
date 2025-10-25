// src/app/agents/skillAgent.ts
// 🛠️ 技能Agent - 完全推理驱动的AI智能技能系统

// Simple UUID generator without external dependencies
const generateId = () => {
  return 'id-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
};

// 结构化日志记录
const logStage = (stage: string, data: any = {}) => {
  const timestamp = new Date().toISOString();
  console.log(`🛠️ [${timestamp}] [${stage}]:`, data);
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
        reasoning: reasoning.reasoningSteps?.join('; ') || 'Skills operation executed',
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

export class SkillAgent {
  async execute(entities: any, context: any): Promise<{ success: boolean; message: string; updatedResume?: any }> {
    logStage("intent-received", { entities, contextKeys: Object.keys(context) });
    
    try {
      // 🧠 深度克隆sections以避免状态污染
      const originalSections = context.sections || [];
      const sections = structuredClone(originalSections);
      
      // 🧠 提取LLM推理信息
      const reasoning = {
        intent: entities.intent || 'add_skill',
        entities: entities,
        confidence: entities.confidence || 0.85,
        reasoningSteps: entities.reasoningSteps || ['Analyze user intent → Identify Skills section → Create or update entry']
      };
      
      // 🧠 记录推理链
      logStage("reasoning-start", { 
        intent: reasoning.intent,
        confidence: reasoning.confidence,
        reasoningSteps: reasoning.reasoningSteps
      });
      
      // 🛠️ 自动检测或创建Skills section
      let skillsSection = sections.find((section: any) => 
        /skills|skill|技能|技术/i.test(section.title)
      );
      
      if (!skillsSection) {
        logStage("section-detected", { action: "creating-new-section" });
        skillsSection = {
          id: generateId(),
          title: 'Skills',
          fields: []
        };
        sections.push(skillsSection);
      } else {
        logStage("section-detected", { action: "using-existing-section", sectionId: skillsSection.id });
      }
      
      // 🧠 处理技能数据 - 支持数组或字符串格式
      const skills = Array.isArray(entities.skills) 
        ? entities.skills 
        : entities.skill 
          ? [entities.skill]
          : entities.skills 
            ? entities.skills.split(',').map((s: string) => s.trim())
            : ['Programming'];
      
      logStage("deduplication-check", { skills, skillsCount: skills.length });
      
      // 检查是否存在相似的技能条目
      let existingEntry = null;
      let similarityScore = 0;
      
      for (const field of skillsSection.fields) {
        // 检查技能条目的相似性
        const fieldSimilarity = textSimilarity(field.name, 'Technical Skills') || 
                               textSimilarity(field.name, 'Skills') ||
                               textSimilarity(field.name, '技能');
        
        if (fieldSimilarity >= 0.75) {
          existingEntry = field;
          similarityScore = fieldSimilarity;
          break;
        }
      }
      
      let stats = { added: 0, updated: 0, skillsAdded: 0 };
      
      if (existingEntry && similarityScore >= 0.75) {
        // 更新现有技能条目
        logStage("deduplication-check", { 
          action: "updating-existing", 
          similarity: similarityScore.toFixed(2),
          existingName: existingEntry.name
        });
        
        // 检查每个新技能是否已存在
        for (const newSkill of skills) {
          const skillExists = existingEntry.points.some((point: any) => 
            textSimilarity(point.content, newSkill) >= 0.75
          );
          
          if (!skillExists) {
            existingEntry.points.push({
              id: generateId(),
              content: newSkill
            });
            stats.skillsAdded++;
          }
        }
        
        stats.updated = 1;
        
        logStage("creation-complete", { 
          action: "updated-existing", 
          skillsAdded: stats.skillsAdded,
          totalSkills: existingEntry.points.length,
          similarity: similarityScore.toFixed(2)
        });
        
      } else {
        // 创建新的技能条目
        logStage("deduplication-check", { 
          action: "creating-new-entry", 
          reason: existingEntry ? `similarity-too-low: ${similarityScore.toFixed(2)}` : "no-existing-entries"
        });
        
        const newSkillEntry = {
          id: generateId(),
          name: 'Technical Skills',
          value: 'Technical Skills',
          points: skills.map((skill: string) => ({
            id: generateId(),
            content: skill
          }))
        };
        
        // 添加技能到section
        skillsSection.fields.push(newSkillEntry);
        stats.added = 1;
        stats.skillsAdded = skills.length;
        
        logStage("creation-complete", { 
          action: "created-new-entry", 
          skillsAdded: stats.skillsAdded,
          skills,
          entryId: newSkillEntry.id
        });
      }
      
      // 发送反馈
      await sendFeedback(context.userId || 'default', reasoning, true, stats);
      
      const actionText = stats.updated > 0 ? '更新' : '添加';
      const message = `✅ 成功${actionText}技能：${skills.join(', ')}`;
      
      return {
        success: true,
        message,
        updatedResume: sections
      };
      
    } catch (error) {
      logStage("execution-error", { error: error instanceof Error ? error.message : 'Unknown error' });
      return {
        success: false,
        message: `❌ 添加技能失败: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}