// src/app/agents/workExperienceAgent.ts
// 💼 工作经验Agent - 完全推理驱动的AI智能工作经验系统

// Simple UUID generator without external dependencies
const generateId = () => {
  return 'id-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
};

// 🧠 学习缓存 - 存储用户偏好和模式
const learningCache = new Map<string, any>();

// 🧠 获取或创建用户学习数据
const getUserLearningData = (userId: string) => {
  if (!learningCache.has(userId)) {
    learningCache.set(userId, {
      sectionAliases: new Map(),
      preferredFormats: new Map(),
      commonPatterns: new Map(),
      lastUpdated: new Date()
    });
  }
  return learningCache.get(userId);
};

// 🧠 学习section别名
const learnSectionAlias = (userId: string, originalTitle: string, detectedTitle: string) => {
  const userData = getUserLearningData(userId);
  userData.sectionAliases.set(originalTitle.toLowerCase(), detectedTitle);
  userData.lastUpdated = new Date();
};

// 🧠 学习用户偏好格式
const learnUserPreference = (userId: string, preferenceType: string, value: any) => {
  const userData = getUserLearningData(userId);
  userData.preferredFormats.set(preferenceType, value);
  userData.lastUpdated = new Date();
};

// 结构化日志记录
const logStage = (stage: string, data: any = {}) => {
  const timestamp = new Date().toISOString();
  console.log(`💼 [${timestamp}] [${stage}]:`, data);
};

// 🧠 智能语义相似度计算
const semanticSimilarity = (text1: string, text2: string): number => {
  const s1 = text1.toLowerCase().trim();
  const s2 = text2.toLowerCase().trim();
  
  if (s1 === s2) return 1.0;
  if (s1.includes(s2) || s2.includes(s1)) return 0.9;
  
  // 语义等价词映射
  const semanticMap: Record<string, string[]> = {
    'work': ['job', 'employment', 'career', 'professional', 'occupation'],
    'experience': ['history', 'background', 'track', 'record'],
    'section': ['area', 'category', 'part', 'segment']
  };
  
  // 计算语义相似度
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  
  let semanticMatches = 0;
  const totalWords = Math.max(words1.length, words2.length);
  
  for (const word1 of words1) {
    for (const word2 of words2) {
      if (word1 === word2) {
        semanticMatches += 1;
      } else {
        // 检查语义等价词
        for (const [key, synonyms] of Object.entries(semanticMap)) {
          if ((word1 === key && synonyms.includes(word2)) || 
              (word2 === key && synonyms.includes(word1))) {
            semanticMatches += 0.8;
            break;
          }
        }
      }
    }
  }
  
  return semanticMatches / totalWords;
};

// 🧠 智能section检测 - 支持多种语义等价词和学习缓存
const detectWorkExperienceSection = (sections: any[], userId: string = 'default'): any => {
  const userData = getUserLearningData(userId);
  
  // 1. 首先检查学习到的别名
  for (const section of sections) {
    const titleLower = section.title.toLowerCase();
    for (const [alias, target] of userData.sectionAliases.entries()) {
      if (titleLower.includes(alias)) {
        logStage("section-detected", { 
          method: "learned-alias", 
          alias, 
          target,
          sectionTitle: section.title 
        });
        return section;
      }
    }
  }
  
  // 2. 精确模式匹配
  const workExperiencePatterns = [
    /work\s*experience/i,
    /工作经验/i,
    /employment\s*history/i,
    /career\s*history/i,
    /professional\s*experience/i,
    /job\s*history/i,
    /work\s*background/i,
    /career\s*background/i,
    /employment/i,
    /career/i,
    /professional/i
  ];
  
  for (const section of sections) {
    for (const pattern of workExperiencePatterns) {
      if (pattern.test(section.title)) {
        // 学习这个别名
        learnSectionAlias(userId, section.title, 'work experience');
        logStage("section-detected", { 
          method: "pattern-match", 
          pattern: pattern.toString(),
          sectionTitle: section.title 
        });
        return section;
      }
    }
  }
  
  // 3. 语义相似度匹配
  let bestMatch = null;
  let bestScore = 0;
  
  for (const section of sections) {
    const score = semanticSimilarity(section.title, 'work experience');
    if (score > bestScore && score > 0.6) {
      bestScore = score;
      bestMatch = section;
    }
  }
  
  if (bestMatch) {
    // 学习这个语义匹配
    learnSectionAlias(userId, bestMatch.title, 'work experience');
    logStage("section-detected", { 
      method: "semantic-match", 
      score: bestScore.toFixed(2),
      sectionTitle: bestMatch.title 
    });
  }
  
  return bestMatch;
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
        reasoning: reasoning.reasoningSteps?.join('; ') || 'Work Experience operation executed',
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

export class WorkExperienceAgent {
  async execute(entities: any, context: any): Promise<{ success: boolean; message: string; updatedResume?: any }> {
    logStage("intent-received", { entities, contextKeys: context ? Object.keys(context) : 'null context' });
    
    try {
      // 🧠 深度克隆sections以避免状态污染
      const originalSections = context.sections || [];
      const sections = structuredClone(originalSections);
      
      // 🧠 提取LLM推理信息
      const reasoning = {
        intent: entities.intent || 'add_work_experience',
        entities: entities,
        confidence: entities.confidence || 0.85,
        reasoningSteps: entities.reasoningSteps || ['Analyze user intent → Identify Work Experience section → Create or update entry']
      };
      
      // 🧠 记录推理链
      logStage("reasoning-start", { 
        intent: reasoning.intent,
        confidence: reasoning.confidence,
        reasoningSteps: reasoning.reasoningSteps
      });
      
      // 🧠 智能检测Work Experience section
      let workExperienceSection = detectWorkExperienceSection(sections, context.userId || 'default');
      
      if (!workExperienceSection) {
        logStage("section-detected", { action: "creating-new-section" });
        workExperienceSection = {
          id: generateId(),
          title: 'Work Experience',
          fields: []
        };
        sections.push(workExperienceSection);
      } else {
        logStage("section-detected", { 
          action: "using-existing-section", 
          sectionId: workExperienceSection.id,
          sectionTitle: workExperienceSection.title,
          semanticMatch: true
        });
      }
      
      // 🧠 智能实体提取 - 结合用户偏好
      const userId = context.userId || 'default';
      const userData = getUserLearningData(userId);
      
      // 学习用户偏好格式
      if (entities.company_name || entities.company) learnUserPreference(userId, 'company_field', 'company_name');
      if (entities.job_title || entities.position) learnUserPreference(userId, 'position_field', 'job_title');
      if (entities.start_date && entities.end_date) learnUserPreference(userId, 'period_format', 'date_range');
      
      // 智能实体映射 - 支持多种字段名
      let company = entities.company_name || entities.company || entities.data?.company || 'Company';
      let position = entities.job_title || entities.position || entities.data?.position || 'Software Engineer';
      let period = entities.period || entities.duration || entities.time || entities.data?.duration ||
        (entities.start_date && entities.end_date ? `${entities.start_date} - ${entities.end_date}` : '2020-2024');
      let description = entities.description || entities.data?.description || '';
      
      // 如果实体提取失败，尝试从用户输入中智能提取
      if (company === 'Company' && entities.userInput) {
        const userInput = entities.userInput;
        // 提取公司名称 - 寻找"加入了...公司"模式
        const companyMatch = userInput.match(/加入了\s*([^公司]+)公司/);
        if (companyMatch) {
          company = companyMatch[1].trim();
        }
        
        // 提取职位 - 寻找"作为...工程师"模式
        const positionMatch = userInput.match(/作为(?:一个)?\s*([^，,。.]+)/);
        if (positionMatch) {
          position = positionMatch[1].trim();
        }
        
        // 提取时间 - 寻找"从...加入了"模式
        const timeMatch = userInput.match(/从(\d{2}-\d{4})/);
        if (timeMatch) {
          period = timeMatch[1] + ' - Present';
        }
        
        // 提取描述 - 寻找"主要职责"后的内容
        const descMatch = userInput.match(/主要职责[：:]\s*(.+)/);
        if (descMatch) {
          description = descMatch[1].trim();
        }
      }
      
      // 如果仍然没有提取到有效信息，使用默认值但记录警告
      if (company === 'Company') {
        logStage("entity-extraction-warning", { 
          message: "未能从用户输入中提取公司名称，使用默认值",
          userInput: entities.userInput
        });
      }
      
      // 调试日志 - 显示提取的实体
      logStage("entity-extraction", { 
        extractedEntities: {
          company,
          position, 
          period,
          description
        },
        rawEntities: entities
      });
      
      logStage("deduplication-check", { company, position, period, description });
      
      // 🧠 智能语义去重检查
      let existingEntry = null;
      let similarityScore = 0;
      
      for (const field of workExperienceSection.fields) {
        const nameSimilarity = semanticSimilarity(field.name, company);
        const valueSimilarity = semanticSimilarity(field.value, company);
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
        
        existingEntry.name = company;
        existingEntry.value = company;
        
        // 更新或添加points
        const positionPoint = existingEntry.points.find((p: any) => p.content.startsWith('Position:'));
        const periodPoint = existingEntry.points.find((p: any) => p.content.startsWith('Period:'));
        const descriptionPoint = existingEntry.points.find((p: any) => p.content.startsWith('Description:'));
        
        if (positionPoint) {
          positionPoint.content = `Position: ${position}`;
        } else {
          existingEntry.points.push({ id: generateId(), content: `Position: ${position}` });
        }
        
        if (periodPoint) {
          periodPoint.content = `Period: ${period}`;
        } else {
          existingEntry.points.push({ id: generateId(), content: `Period: ${period}` });
        }
        
        if (description && descriptionPoint) {
          descriptionPoint.content = `Description: ${description}`;
        } else if (description) {
          existingEntry.points.push({ id: generateId(), content: `Description: ${description}` });
        }
        
        stats.updated = 1;
        
        logStage("creation-complete", { 
          action: "updated-existing", 
          company, 
          position, 
          period,
          description,
          similarity: similarityScore.toFixed(2)
        });
        
      } else {
        // 创建新的工作经验条目
        logStage("deduplication-check", { 
          action: "creating-new-entry", 
          reason: existingEntry ? `similarity-too-low: ${similarityScore.toFixed(2)}` : "no-existing-entries"
        });
        
        const newWorkExperienceEntry = {
          id: generateId(),
          name: company,
          value: company,
          points: [
            {
              id: generateId(),
              content: `Position: ${position}`
            },
            {
              id: generateId(),
              content: `Period: ${period}`
            }
          ]
        };
        
        // 添加可选的描述
        if (description) {
          newWorkExperienceEntry.points.push({
            id: generateId(),
            content: `Description: ${description}`
          });
        }
        
        // 添加工作经验到section
        workExperienceSection.fields.push(newWorkExperienceEntry);
        stats.added = 1;
        
        logStage("creation-complete", { 
          action: "created-new-entry", 
          company, 
          position, 
          period,
          description,
          entryId: newWorkExperienceEntry.id
        });
      }
      
      // 发送反馈
      await sendFeedback(context.userId || 'default', reasoning, true, stats);
      
      const actionText = stats.updated > 0 ? '更新' : '添加';
      const message = `✅ 成功${actionText}工作经验：${company} - ${position}`;
      
      return {
        success: true,
        message,
        updatedResume: sections
      };
      
    } catch (error) {
      logStage("execution-error", { error: error instanceof Error ? error.message : 'Unknown error' });
      return {
        success: false,
        message: `❌ 添加工作经验失败: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}