// src/app/agents/editAgent.ts
// ✏️ 编辑Agent - 完全推理驱动的AI智能编辑系统

// Simple UUID generator without external dependencies
const generateId = () => {
  return 'id-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
};

// 结构化日志记录
const logStage = (stage: string, data: any = {}) => {
  const timestamp = new Date().toISOString();
  console.log(`✏️ [${timestamp}] ${stage}:`, data);
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
const sendFeedback = async (userId: string, reasoning: any, success: boolean, editStats: any) => {
  try {
    const feedbackData = {
      userId,
      reasoning: {
        intent: reasoning.intent,
        entities: reasoning.entities,
        action: 'edit' as const,
        target: 'field' as const,
        entity: reasoning.intent,
        data: reasoning.entities,
        confidence: reasoning.confidence,
        reasoning: reasoning.reasoningSteps?.join('; ') || 'Edit operation executed',
        reasoningSteps: reasoning.reasoningSteps || []
      },
      success,
      editStats,
      timestamp: new Date().toISOString()
    };
    
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/llm-reasoning/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedbackData)
    });
    
    logStage("feedback-sent", { success, editStats });
  } catch (error) {
    logStage("feedback-error", { error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export class EditAgent {
  async execute(entities: any, context: any): Promise<{ success: boolean; message: string; updatedResume?: any }> {
    logStage("intent-received", { entities, contextKeys: Object.keys(context) });
    
    try {
      // 🧠 深度克隆sections以避免状态污染
      const originalSections = context.sections || [];
      const sections = structuredClone(originalSections);
      const { selectedPoint, selectedField } = context;
      
      // 🧠 提取LLM推理信息
      const reasoning = {
        intent: entities.intent || 'edit_item',
        entities: entities,
        confidence: entities.confidence || 0.8,
        reasoningSteps: entities.reasoningSteps || ['Edit operation initiated']
      };
      
      // 🧠 记录推理链
      logStage("reasoning-chain", { 
        intent: reasoning.intent,
        confidence: reasoning.confidence,
        reasoningSteps: reasoning.reasoningSteps
      });
      
      let editedCount = 0;
      let editedItems: string[] = [];
      let editStats = {
        points: 0,
        fields: 0,
        totalItems: 0
      };
      
      // 🧠 推理阶段：确定编辑策略
      logStage("reasoning-start", { 
        hasSelectedPoint: !!selectedPoint,
        hasSelectedField: !!selectedField,
        hasEntityIds: !!(entities.sectionId || entities.fieldId || entities.pointId),
        hasKeyword: !!entities.keyword,
        hasKeywords: Array.isArray(entities.keyword),
        hasType: !!entities.type,
        confidence: reasoning.confidence
      });
      
      // 🎯 策略1：优先处理选中的项目
      if (selectedPoint && entities.newContent) {
        logStage("edit-start", { strategy: "selected-point", pointId: selectedPoint.pointId });
        const result = this.editByIds(sections, selectedPoint.sectionId, selectedPoint.fieldId, selectedPoint.pointId, entities.newContent);
        if (result.success) {
          editedCount++;
          editedItems.push("选中的项目点");
          editStats.points++;
          editStats.totalItems++;
          
          logStage("edit-complete", { strategy: "selected-point", success: true });
          
          // 发送反馈
          await sendFeedback(context.userId || 'default', reasoning, true, editStats);
          
          return {
            success: true,
            message: '✅ 成功编辑选中的项目点',
            updatedResume: sections
          };
        }
      }
      
      if (selectedField && entities.newName) {
        logStage("edit-start", { strategy: "selected-field", fieldId: selectedField.fieldId });
        const result = this.editFieldByIds(sections, selectedField.sectionId, selectedField.fieldId, entities.newName);
        if (result.success) {
          editedCount++;
          editedItems.push("选中的字段");
          editStats.fields++;
          editStats.totalItems++;
          
          logStage("edit-complete", { strategy: "selected-field", success: true });
          
          // 发送反馈
          await sendFeedback(context.userId || 'default', reasoning, true, editStats);
          
          return {
            success: true,
            message: '✅ 成功编辑选中的字段',
            updatedResume: sections
          };
        }
      }
      
      // 🎯 策略2：基于实体ID的精确编辑
      if (entities.sectionId && entities.fieldId && entities.pointId && entities.newContent) {
        logStage("edit-start", { strategy: "entity-ids", entities });
        const result = this.editByIds(sections, entities.sectionId, entities.fieldId, entities.pointId, entities.newContent);
        if (result.success) {
          editedCount++;
          editedItems.push("指定的项目点");
          editStats.points++;
          editStats.totalItems++;
          
          logStage("edit-complete", { strategy: "entity-ids", success: true });
          
          // 发送反馈
          await sendFeedback(context.userId || 'default', reasoning, true, editStats);
          
          return {
            success: true,
            message: '✅ 成功编辑指定的项目点',
            updatedResume: sections
          };
        }
      }
      
      if (entities.sectionId && entities.fieldId && entities.newName) {
        logStage("edit-start", { strategy: "entity-field-ids", entities });
        const result = this.editFieldByIds(sections, entities.sectionId, entities.fieldId, entities.newName);
        if (result.success) {
          editedCount++;
          editedItems.push("指定的字段");
          editStats.fields++;
          editStats.totalItems++;
          
          logStage("edit-complete", { strategy: "entity-field-ids", success: true });
          
          // 发送反馈
          await sendFeedback(context.userId || 'default', reasoning, true, editStats);
          
          return {
            success: true,
            message: '✅ 成功编辑指定的字段',
            updatedResume: sections
          };
        }
      }
      
      // 🎯 策略3：基于关键词的智能匹配编辑
      if (entities.keyword || entities.keywords) {
        const keywords = Array.isArray(entities.keyword) ? entities.keyword : 
                        Array.isArray(entities.keywords) ? entities.keywords :
                        [entities.keyword];
        
        logStage("edit-start", { strategy: "keyword-match", keywords });
        const result = this.editByKeywords(sections, keywords, entities.newContent || entities.newName);
        if (result.success) {
          editedCount += result.editedCount;
          editedItems.push(...result.editedItems);
          editStats.points += result.pointsEdited || 0;
          editStats.fields += result.fieldsEdited || 0;
          editStats.totalItems += result.editedCount;
          
          logStage("edit-complete", { 
            strategy: "keyword-match", 
            success: true, 
            editedCount: result.editedCount,
            editedItems: result.editedItems
          });
          
          // 发送反馈
          await sendFeedback(context.userId || 'default', reasoning, true, editStats);
          
          return {
            success: true,
            message: `✅ 成功编辑包含关键词的 ${result.editedCount} 个项目`,
            updatedResume: sections
          };
        }
      }
      
      // 🎯 策略4：基于类型的智能编辑
      if (entities.type) {
        logStage("edit-start", { strategy: "type-based", type: entities.type, keyword: entities.keyword, newValue: entities.newValue });
        const result = this.editByType(sections, entities.type, entities.keyword, entities.newValue);
        if (result.success) {
          editedCount += result.editedCount;
          editedItems.push(...result.editedItems);
          editStats.points += result.pointsEdited || 0;
          editStats.fields += result.fieldsEdited || 0;
          editStats.totalItems += result.editedCount;
          
          logStage("edit-complete", { 
            strategy: "type-based", 
            success: true,
            editedCount: result.editedCount,
            editedItems: result.editedItems
          });
          
          // 发送反馈
          await sendFeedback(context.userId || 'default', reasoning, true, editStats);
          
          return {
            success: true,
            message: `✅ 成功编辑 ${entities.type} 类型的 ${result.editedCount} 个项目`,
            updatedResume: sections
          };
        }
      }
      
      // 🎯 策略5：批量前缀删除/替换操作
      if (entities.action && (entities.action.includes('delete prefix') || entities.action.includes('remove prefix'))) {
        logStage("edit-start", { strategy: "bulk-prefix-removal", action: entities.action, section: entities.section });
        const result = this.removePrefixFromSection(sections, entities.section, entities.action);
        if (result.success) {
          editedCount += result.editedCount;
          editedItems.push(...result.editedItems);
          editStats.points += result.pointsEdited;
          editStats.totalItems += result.editedCount;
          
          logStage("edit-complete", { strategy: "bulk-prefix-removal", success: true, editedCount: result.editedCount });
          
          // 发送反馈
          await sendFeedback(context.userId || 'default', reasoning, true, editStats);
          
          return {
            success: true,
            message: `✅ 成功删除前缀，修改了 ${result.editedCount} 个项目`,
            updatedResume: sections
          };
        }
      }
      
      // 没有找到要编辑的项目
      logStage("edit-failed", { reason: "no-matching-items" });
      
      // 发送失败反馈
      await sendFeedback(context.userId || 'default', reasoning, false, editStats);
      
      return {
        success: false,
        message: '❌ 未找到要编辑的项目，请选中或提供更多信息'
      };
      
    } catch (error) {
      logStage("edit-error", { error: error instanceof Error ? error.message : 'Unknown error' });
      return {
        success: false,
        message: `❌ 编辑操作失败: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  /**
   * 🎯 根据ID精确编辑项目点
   */
  private editByIds(sections: any[], sectionId: string, fieldId: string, pointId: string, newContent: string): { success: boolean } {
    const section = sections.find((s: any) => s.id === sectionId);
    if (section) {
      const field = section.fields.find((f: any) => f.id === fieldId);
      if (field) {
        const point = field.points.find((p: any) => p.id === pointId);
        if (point) {
          point.content = newContent;
          return { success: true };
        }
      }
    }
    return { success: false };
  }
  
  /**
   * 🎯 根据ID精确编辑字段
   */
  private editFieldByIds(sections: any[], sectionId: string, fieldId: string, newName: string): { success: boolean } {
    const section = sections.find((s: any) => s.id === sectionId);
    if (section) {
      const field = section.fields.find((f: any) => f.id === fieldId);
      if (field) {
        field.name = newName;
        field.value = newName;
        return { success: true };
      }
    }
    return { success: false };
  }
  
  /**
   * 🧠 根据关键词数组进行语义匹配编辑
   */
  private editByKeywords(sections: any[], keywords: string[], newValue: string): { 
    success: boolean; 
    editedCount: number; 
    editedItems: string[];
    pointsEdited?: number;
    fieldsEdited?: number;
  } {
    let editedCount = 0;
    let pointsEdited = 0;
    let fieldsEdited = 0;
    const editedItems: string[] = [];
    const similarityThreshold = 0.75;
    
    sections.forEach((section: any) => {
      if (section.fields) {
        section.fields.forEach((field: any) => {
          // 检查字段名称语义匹配
          if (field.name) {
            for (const keyword of keywords) {
              const similarity = textSimilarity(field.name, keyword);
              if (similarity >= similarityThreshold) {
                editedItems.push(`字段: ${field.name} → ${newValue} (相似度: ${similarity.toFixed(2)})`);
                field.name = newValue;
                field.value = newValue;
                fieldsEdited++;
                editedCount++;
                break;
              }
            }
          }
          
          // 检查points内容语义匹配
          if (field.points) {
            field.points.forEach((point: any) => {
              if (point.content) {
                for (const keyword of keywords) {
                  const similarity = textSimilarity(point.content, keyword);
                  if (similarity >= similarityThreshold) {
                    editedItems.push(`项目: ${point.content.substring(0, 30)}... → ${newValue} (相似度: ${similarity.toFixed(2)})`);
                    point.content = newValue;
                    pointsEdited++;
                    editedCount++;
                    break;
                  }
                }
              }
            });
          }
        });
      }
    });
    
    return { success: editedCount > 0, editedCount, editedItems, pointsEdited, fieldsEdited };
  }
  
  /**
   * 🎯 根据类型智能编辑
   */
  private editByType(sections: any[], type: string, keyword?: string, newValue?: string): { 
    success: boolean; 
    editedCount: number; 
    editedItems: string[];
    pointsEdited?: number;
    fieldsEdited?: number;
  } {
    let editedCount = 0;
    let pointsEdited = 0;
    let fieldsEdited = 0;
    const editedItems: string[] = [];
    
    const typeMapping: Record<string, string[]> = {
      'skill': ['skills', 'skill', '技能', '技术'],
      'education': ['education', '教育', '学历'],
      'experience': ['experience', 'work', '工作经验', '工作经历'],
      'project': ['project', '项目', '作品']
    };
    
    const targetSections = typeMapping[type.toLowerCase()] || [type];
    
    sections.forEach((section: any) => {
      if (targetSections.some(target => section.title.toLowerCase().includes(target))) {
        if (section.fields) {
          section.fields.forEach((field: any) => {
            if (keyword && newValue) {
              // 编辑特定关键词的项目
              if (field.name && field.name.toLowerCase().includes(keyword.toLowerCase())) {
                editedItems.push(`${type}: ${field.name} → ${newValue}`);
                field.name = newValue;
                field.value = newValue;
                fieldsEdited++;
                editedCount++;
              }
              
              if (field.points) {
                field.points.forEach((point: any) => {
                  if (point.content && point.content.toLowerCase().includes(keyword.toLowerCase())) {
                    editedItems.push(`${type}: ${point.content.substring(0, 30)}... → ${newValue}`);
                    point.content = newValue;
                    pointsEdited++;
                    editedCount++;
                  }
                });
              }
            } else if (newValue) {
              // 编辑所有项目
              if (field.name) {
                editedItems.push(`${type}: ${field.name} → ${newValue}`);
                field.name = newValue;
                field.value = newValue;
                fieldsEdited++;
                editedCount++;
              }
            }
          });
        }
      }
    });
    
    return { 
      success: editedCount > 0, 
      editedCount, 
      editedItems,
      pointsEdited,
      fieldsEdited
    };
  }
  
  /**
   * 🎯 从指定section中删除前缀
   */
  private removePrefixFromSection(sections: any[], targetSection: string, action: string): { 
    success: boolean; 
    editedCount: number; 
    editedItems: string[];
    pointsEdited: number;
  } {
    let editedCount = 0;
    let editedItems: string[] = [];
    let pointsEdited = 0;
    
    // 解析要删除的前缀
    const deleteMatch = action.match(/delete prefix ["']([^"']+)["']/i);
    const removeMatch = action.match(/remove prefix ["']([^"']+)["']/i);
    const prefixToRemove = deleteMatch ? deleteMatch[1] : (removeMatch ? removeMatch[1] : 'responsibility');
    
    logStage("prefix-removal-start", { targetSection, prefixToRemove });
    
    // 查找目标section
    const section = sections.find((s: any) => 
      s.title && s.title.toLowerCase().includes(targetSection.toLowerCase())
    );
    
    if (!section) {
      logStage("prefix-removal-failed", { reason: "section-not-found", targetSection });
      return { success: false, editedCount: 0, editedItems: [], pointsEdited: 0 };
    }
    
    // 遍历所有fields和points
    section.fields.forEach((field: any) => {
      if (field.points) {
        field.points.forEach((point: any) => {
          if (point.content) {
            const originalContent = point.content;
            // 检查是否以指定前缀开头（不区分大小写）
            const prefixRegex = new RegExp(`^${prefixToRemove}\\s*:\\s*`, 'i');
            if (prefixRegex.test(originalContent)) {
              // 删除前缀
              const newContent = originalContent.replace(prefixRegex, '').trim();
              point.content = newContent;
              editedCount++;
              pointsEdited++;
              editedItems.push(`删除前缀 "${prefixToRemove}": ${originalContent.substring(0, 50)}...`);
              
              logStage("prefix-removed", { 
                original: originalContent.substring(0, 30) + '...',
                new: newContent.substring(0, 30) + '...'
              });
            }
          }
        });
      }
    });
    
    logStage("prefix-removal-complete", { 
      success: editedCount > 0, 
      editedCount, 
      pointsEdited 
    });
    
    return { 
      success: editedCount > 0, 
      editedCount, 
      editedItems,
      pointsEdited
    };
  }
}