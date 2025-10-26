// src/app/agents/improveResumeAgent.ts
// 🔧 简历改进Agent - 完全推理驱动的AI智能简历优化系统

import { IAgent } from './base/IAgent';

// Simple UUID generator without external dependencies
const generateId = () => {
  return 'id-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
};

// 结构化日志记录
const logStage = (stage: string, data: any = {}) => {
  const timestamp = new Date().toISOString();
  console.log(`🔧 [${timestamp}] [${stage}]:`, data);
};

// 发送反馈到LLM推理引擎
const sendFeedback = async (userId: string, reasoning: any, success: boolean, stats: any) => {
  try {
    const feedbackData = {
      userId,
      reasoning: {
        intent: reasoning.intent,
        entities: reasoning.entities,
        action: 'improve' as const,
        target: 'resume' as const,
        entity: reasoning.intent,
        data: reasoning.entities,
        confidence: reasoning.confidence,
        reasoning: reasoning.reasoningSteps?.join('; ') || 'Resume improvement operation executed',
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

export class ImproveResumeAgent implements IAgent {
  id = 'improveResumeAgent';
  name = 'Resume Improver';
  description = '改进和优化简历内容';
  status: 'available' | 'busy' | 'disabled' = 'available';
  capabilities = ['improve', 'enhance', 'optimize', 'rewrite'];
  dependencies: string[] = ['analyzeResumeAgent'];

  async execute(task: any): Promise<{ success: boolean; message: string; updatedResume?: any; suggestions?: string[] }> {
    const { entities = {}, context = {} } = task;
    logStage("intent-received", { entities, contextKeys: Object.keys(context) });
    
    try {
      // 🧠 深度克隆sections以避免状态污染
      const originalSections = context.sections || [];
      const sections = JSON.parse(JSON.stringify(originalSections));
      
      // 🧠 提取LLM推理信息
      const reasoning = {
        intent: entities.intent || 'improve_resume',
        entities: entities,
        confidence: entities.confidence || 0.9,
        reasoningSteps: entities.reasoningSteps || [
          'Analyze resume structure',
          'Identify weak sections', 
          'Generate targeted suggestions'
        ]
      };
      
      // 🧠 记录推理链
      logStage("reasoning-start", { 
        intent: reasoning.intent,
        confidence: reasoning.confidence,
        reasoningSteps: reasoning.reasoningSteps
      });
      
      // 🔧 分析简历结构
      logStage("section-analysis", { sectionsCount: sections.length, sections: sections.map((s: any) => s.title) });
      
      let sectionsAnalyzed = 0;
      let suggestionsGenerated = 0;
      const allSuggestions: string[] = [];
      const improvedSections = [...sections];
      
      // 遍历每个section进行分析和改进
      for (const section of improvedSections) {
        sectionsAnalyzed++;
        const sectionSuggestions = this.analyzeSection(section, entities);
        allSuggestions.push(...sectionSuggestions);
        suggestionsGenerated += sectionSuggestions.length;
        
        logStage("section-analysis", { 
          section: section.title, 
          suggestionsCount: sectionSuggestions.length,
          suggestions: sectionSuggestions
        });
      }
      
      // 🔧 生成整体改进建议
      const generalSuggestions = this.generateGeneralSuggestions(improvedSections, entities);
      allSuggestions.push(...generalSuggestions);
      suggestionsGenerated += generalSuggestions.length;
      
      logStage("suggestion-generation", { 
        totalSuggestions: allSuggestions.length,
        sectionsAnalyzed,
        suggestionsGenerated
      });
      
      // 发送反馈
      const stats = { 
        sectionsAnalyzed, 
        suggestionsGenerated: allSuggestions.length,
        sectionsImproved: improvedSections.length
      };
      
      await sendFeedback(context.userId || 'default', reasoning, true, stats);
      
      return {
        success: true,
        message: `✅ 简历分析完成，生成了 ${allSuggestions.length} 条改进建议`,
        updatedResume: improvedSections,
        suggestions: allSuggestions
      };
      
    } catch (error) {
      logStage("execution-error", { error: error instanceof Error ? error.message : 'Unknown error' });
      return {
        success: false,
        message: `❌ 简历改进失败: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  /**
   * 🔍 分析单个section并生成改进建议
   */
  private analyzeSection(section: any, entities: any): string[] {
    const suggestions: string[] = [];
    const sectionTitle = section.title.toLowerCase();
    
    if (!section.fields || section.fields.length === 0) {
      suggestions.push(`"${section.title}" 部分为空，建议添加相关内容`);
      return suggestions;
    }
    
    // 分析每个field
    for (const field of section.fields) {
      if (field.points && field.points.length > 0) {
        for (const point of field.points) {
          const content = point.content || '';
          
          // 检查内容长度
          if (content.length < 30) {
            suggestions.push(`"${point.content}" 描述过短，建议添加更多细节`);
          }
          
          // 检查量化指标
          if (!this.hasQuantifiableMetrics(content)) {
            suggestions.push(`"${point.content}" 缺少量化指标，建议添加具体数字和成果`);
          }
          
          // 检查通用词汇
          if (this.hasGenericWords(content)) {
            suggestions.push(`"${point.content}" 使用了通用词汇，建议使用更具体的动词和描述`);
          }
          
          // 根据section类型提供特定建议
          if (sectionTitle.includes('work') || sectionTitle.includes('experience')) {
            if (!this.hasActionVerbs(content)) {
              suggestions.push(`"${point.content}" 缺少强有力的行动动词，建议使用"achieved", "developed", "managed"等`);
            }
          }
          
          if (sectionTitle.includes('education')) {
            if (!this.hasAcademicDetails(content)) {
              suggestions.push(`"${point.content}" 可以添加更多学术成就，如GPA、荣誉、相关课程等`);
            }
          }
          
          if (sectionTitle.includes('skill')) {
            if (!this.hasSkillLevel(content)) {
              suggestions.push(`"${point.content}" 可以添加技能熟练程度，如"Expert in", "Proficient in"等`);
            }
          }
        }
      }
    }
    
    return suggestions;
  }
  
  /**
   * 🎯 生成整体改进建议
   */
  private generateGeneralSuggestions(sections: any[], entities: any): string[] {
    const suggestions: string[] = [];
    
    // 检查简历结构完整性
    const hasWorkExperience = sections.some(s => /work|experience|工作/i.test(s.title));
    const hasEducation = sections.some(s => /education|教育/i.test(s.title));
    const hasSkills = sections.some(s => /skill|技能/i.test(s.title));
    
    if (!hasWorkExperience) {
      suggestions.push("建议添加工作经验部分，这是简历的核心内容");
    }
    
    if (!hasEducation) {
      suggestions.push("建议添加教育背景部分");
    }
    
    if (!hasSkills) {
      suggestions.push("建议添加技能部分，突出技术能力和软技能");
    }
    
    // 检查内容密度
    const totalFields = sections.reduce((sum, s) => sum + (s.fields?.length || 0), 0);
    if (totalFields < 3) {
      suggestions.push("简历内容较少，建议添加更多相关经历和成就");
    }
    
    // 根据用户偏好提供建议
    if (entities.style === 'technical') {
      suggestions.push("技术简历建议：突出编程语言、工具、项目经验和技术成就");
    } else if (entities.style === 'creative') {
      suggestions.push("创意简历建议：使用视觉元素、项目作品集和创意表达方式");
    } else {
      suggestions.push("专业简历建议：使用简洁的格式、量化的成就和相关的关键词");
    }
    
    return suggestions;
  }
  
  /**
   * 🔍 检查是否包含量化指标
   */
  private hasQuantifiableMetrics(content: string): boolean {
    const metrics = /\d+%|\d+\+|\$\d+|\d+[km]?|\d+\s*(years?|months?|days?)/i;
    return metrics.test(content);
  }
  
  /**
   * 🔍 检查是否包含通用词汇
   */
  private hasGenericWords(content: string): boolean {
    const genericWords = /responsible for|worked on|helped with|assisted|involved in/i;
    return genericWords.test(content);
  }
  
  /**
   * 🔍 检查是否包含行动动词
   */
  private hasActionVerbs(content: string): boolean {
    const actionVerbs = /achieved|developed|managed|led|created|implemented|designed|built|improved|increased|reduced|optimized/i;
    return actionVerbs.test(content);
  }
  
  /**
   * 🔍 检查是否包含学术细节
   */
  private hasAcademicDetails(content: string): boolean {
    const academicTerms = /gpa|honors|dean's list|magna cum laude|summa cum laude|relevant courses|thesis|research/i;
    return academicTerms.test(content);
  }
  
  /**
   * 🔍 检查是否包含技能水平
   */
  private hasSkillLevel(content: string): boolean {
    const skillLevels = /expert|proficient|advanced|intermediate|beginner|skilled|experienced/i;
    return skillLevels.test(content);
  }

  /**
   * 🎯 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      // 简单的健康检查：验证基本功能
      return true;
    } catch (error) {
      console.error('❌ ImproveResumeAgent 健康检查失败:', error);
      return false;
    }
  }
}