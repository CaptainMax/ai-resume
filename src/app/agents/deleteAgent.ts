// src/app/agents/deleteAgent.ts
// 🗑️ 删除Agent - 完全推理驱动的AI智能删除系统

// Simple UUID generator without external dependencies
const generateId = () => {
  return 'id-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
};

// 结构化日志记录
const logStage = (stage: string, data: any = {}) => {
  const timestamp = new Date().toISOString();
  console.log(`🗑️ [${timestamp}] ${stage}:`, data);
};

// 文本相似度计算（简化版）
const textSimilarity = (text1: string, text2: string): number => {
  const s1 = text1.toLowerCase().trim();
  const s2 = text2.toLowerCase().trim();
  
  if (s1 === s2) return 1.0;
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;
  
  // 简单的词汇重叠计算
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  const commonWords = words1.filter(word => words2.includes(word));
  return commonWords.length / Math.max(words1.length, words2.length);
};

// 发送反馈到LLM推理引擎
const sendFeedback = async (userId: string, reasoning: any, success: boolean, deletedStats: any) => {
  try {
    const feedbackData = {
      userId,
      reasoning: {
        intent: reasoning.intent,
        entities: reasoning.entities,
        action: 'delete' as const,
        target: 'field' as const,
        entity: reasoning.intent,
        data: reasoning.entities,
        confidence: reasoning.confidence,
        reasoning: reasoning.reasoningSteps?.join('; ') || 'Delete operation executed',
        reasoningSteps: reasoning.reasoningSteps || []
      },
      success,
      deletedStats,
      timestamp: new Date().toISOString()
    };
    
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/llm-reasoning/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedbackData)
    });
    
    logStage("feedback-sent", { success, deletedStats });
  } catch (error) {
    logStage("feedback-error", { error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export class DeleteAgent {
  async execute(entities: any, context: any): Promise<{ success: boolean; message: string; updatedResume?: any }> {
    logStage("intent-received", { entities, contextKeys: Object.keys(context) });
    
    try {
      // 🧠 深度克隆sections以避免状态污染
      const originalSections = context.sections || [];
      const sections = structuredClone(originalSections);
      const { selectedPoint, selectedField, selectedSection } = context;
      
      // 🧠 提取LLM推理信息
      const reasoning = {
        intent: entities.intent || 'delete_item',
        entities: entities,
        confidence: entities.confidence || 0.8,
        reasoningSteps: entities.reasoningSteps || ['Delete operation initiated']
      };
      
      // 🧠 记录推理链
      logStage("reasoning-chain", { 
        intent: reasoning.intent,
        confidence: reasoning.confidence,
        reasoningSteps: reasoning.reasoningSteps
      });
      
      let deletedCount = 0;
      let deletedItems: string[] = [];
      let deletedStats = {
        sections: 0,
        fields: 0,
        points: 0,
        totalItems: 0
      };
      
      // 🧠 推理阶段：确定删除策略
      logStage("reasoning-start", { 
        hasSelectedPoint: !!selectedPoint,
        hasSelectedField: !!selectedField, 
        hasSelectedSection: !!selectedSection,
        hasEntityIds: !!(entities.sectionId || entities.fieldId || entities.pointId),
        hasKeyword: !!entities.keyword,
        hasKeywords: Array.isArray(entities.keyword),
        hasType: !!entities.type,
        confidence: reasoning.confidence
      });
      
      // 🎯 策略1：优先处理选中的项目
      if (selectedPoint) {
        logStage("deletion-start", { strategy: "selected-point", pointId: selectedPoint.pointId });
        const result = this.deleteByIds(sections, selectedPoint.sectionId, selectedPoint.fieldId, selectedPoint.pointId);
        if (result.success) {
          deletedCount++;
          deletedItems.push("选中的项目点");
          logStage("deletion-complete", { strategy: "selected-point", success: true });
          return {
            success: true,
            message: '✅ 成功删除选中的项目点',
            updatedResume: sections
          };
        }
      }
      
      if (selectedField) {
        logStage("deletion-start", { strategy: "selected-field", fieldId: selectedField.fieldId });
        const result = this.deleteByIds(sections, selectedField.sectionId, selectedField.fieldId);
        if (result.success) {
          deletedCount++;
          deletedItems.push("选中的字段");
          logStage("deletion-complete", { strategy: "selected-field", success: true });
          return {
            success: true,
            message: '✅ 成功删除选中的字段',
            updatedResume: sections
          };
        }
      }
      
      if (selectedSection) {
        logStage("deletion-start", { strategy: "selected-section", sectionId: selectedSection });
        const result = this.deleteByIds(sections, selectedSection);
        if (result.success) {
          deletedCount++;
          deletedItems.push("选中的部分");
          logStage("deletion-complete", { strategy: "selected-section", success: true });
          return {
            success: true,
            message: '✅ 成功删除选中的部分',
            updatedResume: sections
          };
        }
      }
      
      // 🎯 策略2：基于实体ID的精确删除
      if (entities.sectionId || entities.fieldId || entities.pointId) {
        logStage("deletion-start", { strategy: "entity-ids", entities });
        const result = this.deleteByIds(sections, entities.sectionId, entities.fieldId, entities.pointId);
        if (result.success) {
          deletedCount++;
          deletedItems.push("指定的项目");
          logStage("deletion-complete", { strategy: "entity-ids", success: true });
          return {
            success: true,
            message: '✅ 成功删除指定的项目',
            updatedResume: sections
          };
        }
      }
      
      // 🎯 策略3：基于关键词的智能匹配删除（支持数组和语义匹配）
      if (entities.keyword || entities.keywords) {
        const keywords = Array.isArray(entities.keyword) ? entities.keyword : 
                        Array.isArray(entities.keywords) ? entities.keywords :
                        [entities.keyword];
        
        logStage("deletion-start", { strategy: "keyword-match", keywords });
        const result = this.deleteByKeywords(sections, keywords);
        if (result.success) {
          deletedCount += result.deletedCount;
          deletedItems.push(...result.deletedItems);
          deletedStats.points += result.deletedCount;
          deletedStats.totalItems += result.deletedCount;
          
          logStage("deletion-complete", { 
            strategy: "keyword-match", 
            success: true, 
            deletedCount: result.deletedCount,
            deletedItems: result.deletedItems
          });
          
          // 发送反馈
          await sendFeedback(context.userId || 'default', reasoning, true, deletedStats);
          
          return {
            success: true,
            message: `✅ 成功删除包含关键词的 ${result.deletedCount} 个项目`,
            updatedResume: sections
          };
        }
      }
      
      // 🎯 策略4：基于实体类型的智能删除
      if (entities.type) {
        logStage("deletion-start", { strategy: "type-based", type: entities.type, value: entities.value });
        const result = this.deleteByType(sections, entities.type, entities.value);
        if (result.success) {
          deletedCount += result.deletedCount;
          deletedItems.push(...result.deletedItems);
          deletedStats.sections += result.sectionsDeleted || 0;
          deletedStats.fields += result.fieldsDeleted || 0;
          deletedStats.points += result.pointsDeleted || 0;
          deletedStats.totalItems += result.deletedCount;
          
          logStage("deletion-complete", { 
            strategy: "type-based", 
            success: true,
            deletedCount: result.deletedCount,
            deletedItems: result.deletedItems
          });
          
          // 发送反馈
          await sendFeedback(context.userId || 'default', reasoning, true, deletedStats);
          
          return {
            success: true,
            message: `✅ 成功删除 ${entities.type} 类型的 ${result.deletedCount} 个项目`,
            updatedResume: sections
          };
        }
      }
      
      // 没有找到要删除的项目
      logStage("deletion-failed", { reason: "no-matching-items" });
      
      // 发送失败反馈
      await sendFeedback(context.userId || 'default', reasoning, false, deletedStats);
      
      return {
        success: false,
        message: '❌ 未找到要删除的项目，请选中或提供更多信息'
      };
      
    } catch (error) {
      logStage("deletion-error", { error: error instanceof Error ? error.message : 'Unknown error' });
      return {
        success: false,
        message: `❌ 删除操作失败: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  /**
   * 🎯 根据ID精确删除
   */
  private deleteByIds(sections: any[], sectionId?: string, fieldId?: string, pointId?: string): { success: boolean } {
    if (sectionId && fieldId && pointId) {
      // 删除特定point
      const section = sections.find((s: any) => s.id === sectionId);
      if (section) {
        const field = section.fields.find((f: any) => f.id === fieldId);
        if (field) {
          const originalLength = field.points.length;
          field.points = field.points.filter((p: any) => p.id !== pointId);
          return { success: originalLength > field.points.length };
        }
      }
    } else if (sectionId && fieldId) {
      // 删除特定field
      const section = sections.find((s: any) => s.id === sectionId);
      if (section) {
        const originalLength = section.fields.length;
        section.fields = section.fields.filter((f: any) => f.id !== fieldId);
        return { success: originalLength > section.fields.length };
      }
    } else if (sectionId) {
      // 删除特定section
      const originalLength = sections.length;
      const index = sections.findIndex((s: any) => s.id === sectionId);
      if (index !== -1) {
        sections.splice(index, 1);
        return { success: true };
      }
    }
    return { success: false };
  }
  
  /**
   * 🧠 根据关键词数组进行语义匹配删除
   */
  private deleteByKeywords(sections: any[], keywords: string[]): { success: boolean; deletedCount: number; deletedItems: string[] } {
    let deletedCount = 0;
    const deletedItems: string[] = [];
    const similarityThreshold = 0.75;
    
    sections.forEach((section: any) => {
      if (section.fields) {
        section.fields.forEach((field: any) => {
          // 检查字段名称语义匹配
          if (field.name) {
            for (const keyword of keywords) {
              const similarity = textSimilarity(field.name, keyword);
              if (similarity >= similarityThreshold) {
                deletedItems.push(`字段: ${field.name} (相似度: ${similarity.toFixed(2)})`);
                deletedCount++;
                return;
              }
            }
          }
          
          // 检查points内容语义匹配
          if (field.points) {
            for (let i = field.points.length - 1; i >= 0; i--) {
              const point = field.points[i];
              if (point.content) {
                for (const keyword of keywords) {
                  const similarity = textSimilarity(point.content, keyword);
                  if (similarity >= similarityThreshold) {
                    deletedItems.push(`项目: ${point.content.substring(0, 30)}... (相似度: ${similarity.toFixed(2)})`);
                    field.points.splice(i, 1);
                    deletedCount++;
                    break; // 找到匹配后跳出关键词循环
                  }
                }
              }
            }
          }
        });
      }
    });
    
    return { success: deletedCount > 0, deletedCount, deletedItems };
  }
  
  /**
   * 🎯 根据类型智能删除（支持section和entry删除）
   */
  private deleteByType(sections: any[], type: string, value?: string): { 
    success: boolean; 
    deletedCount: number; 
    deletedItems: string[];
    sectionsDeleted?: number;
    fieldsDeleted?: number;
    pointsDeleted?: number;
  } {
    let deletedCount = 0;
    let sectionsDeleted = 0;
    let fieldsDeleted = 0;
    let pointsDeleted = 0;
    const deletedItems: string[] = [];
    
    const typeMapping: Record<string, string[]> = {
      'skill': ['skills', 'skill', '技能', '技术'],
      'education': ['education', '教育', '学历'],
      'experience': ['experience', 'work', '工作经验', '工作经历'],
      'project': ['project', '项目', '作品']
    };
    
    const targetSections = typeMapping[type.toLowerCase()] || [type];
    
    // 从后往前遍历以避免索引问题
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      if (targetSections.some(target => section.title.toLowerCase().includes(target))) {
        if (value) {
          // 删除特定值的项目
          if (section.fields) {
            for (let j = section.fields.length - 1; j >= 0; j--) {
              const field = section.fields[j];
              if (field.name && field.name.toLowerCase().includes(value.toLowerCase())) {
                deletedItems.push(`${type}: ${field.name}`);
                section.fields.splice(j, 1);
                fieldsDeleted++;
                deletedCount++;
              }
            }
          }
        } else {
          // 删除整个section
          deletedItems.push(`部分: ${section.title}`);
          sections.splice(i, 1);
          sectionsDeleted++;
          deletedCount++;
        }
      }
    }
    
    return { 
      success: deletedCount > 0, 
      deletedCount, 
      deletedItems,
      sectionsDeleted,
      fieldsDeleted,
      pointsDeleted
    };
  }
}