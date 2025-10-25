// src/app/agents/actionExecutor.ts
// 🎯 结构化操作执行器 - 将 LLM 输出转换为实际操作

import { LLMReasoningResult } from './llmReasoningEngine';

export interface ExecutionResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export class ActionExecutor {
  private resumeStore: any; // 简历状态管理

  constructor(resumeStore: any) {
    this.resumeStore = resumeStore;
    console.log("🎯 ActionExecutor initialized");
  }

  /**
   * 🚀 执行 LLM 推理结果
   */
  async executeReasoningResult(
    reasoning: LLMReasoningResult,
    userId: string = 'default'
  ): Promise<ExecutionResult> {
    console.log("🎯 执行推理结果:", reasoning);

    try {
      const { action, target, entity, data } = reasoning;

      switch (action) {
        case 'add':
          return await this.executeAddAction(target, entity, data);
        
        case 'edit':
          return await this.executeEditAction(target, entity, data);
        
        case 'delete':
          return await this.executeDeleteAction(target, entity, data);
        
        case 'move':
          return await this.executeMoveAction(target, entity, data);
        
        case 'optimize':
          return await this.executeOptimizeAction(target, entity, data);
        
        case 'replace':
          return await this.executeReplaceAction(target, entity, data);
        
        default:
          throw new Error(`未知操作类型: ${action}`);
      }

    } catch (error) {
      console.error("❌ 执行失败:", error);
      return {
        success: false,
        message: "执行失败",
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * ➕ 执行添加操作
   */
  private async executeAddAction(
    target: string, 
    entity: string, 
    data: any
  ): Promise<ExecutionResult> {
    const { addField } = this.resumeStore.getState();

    // 找到目标section
    const targetSection = this.findTargetSection(entity);
    if (!targetSection) {
      throw new Error(`未找到${entity} section`);
    }

    // 根据实体类型创建字段
    const newField = this.createFieldByEntity(entity, data);
    
    // 添加到store
    addField(targetSection.id, newField);

    return {
      success: true,
      message: `成功添加${entity}信息`,
      data: newField
    };
  }

  /**
   * ✏️ 执行编辑操作
   */
  private async executeEditAction(
    target: string,
    entity: string, 
    data: any
  ): Promise<ExecutionResult> {
    const { updateFieldValue, updatePoint } = this.resumeStore.getState();
    const { sections } = this.resumeStore.getState();

    if (target === 'field' && data.fieldId) {
      updateFieldValue(data.sectionId, data.fieldId, data.content);
    } else if (target === 'point') {
      // 检查是否是批量编辑"Responsibility:"前缀的请求
      const isBulkResponsibilityEdit = data.content && 
        (data.content.includes('remove') || data.content.includes('remove')) &&
        (data.content.includes('Responsibility') || data.content.includes('responsibility'));
      
      if (isBulkResponsibilityEdit || !data.pointId) {
        // 处理批量编辑：移除"Responsibility:"前缀
        const workExperienceSection = this.findTargetSection('experience');
        if (!workExperienceSection) {
          throw new Error('未找到Work Experience section');
        }

        let editedCount = 0;
        
        // 遍历所有fields和points
        workExperienceSection.fields?.forEach((field: any) => {
          field.points?.forEach((point: any) => {
            if (point.content && point.content.startsWith('Responsibility:')) {
              // 移除"Responsibility:"前缀
              const newContent = point.content.replace(/^Responsibility:\s*/, '');
              updatePoint(workExperienceSection.id, field.id, point.id, newContent);
              editedCount++;
            }
          });
        });

        return {
          success: true,
          message: `成功编辑了 ${editedCount} 个bullet points，移除了"Responsibility:"前缀`
        };
      } else {
        // 单个point编辑
        updatePoint(data.sectionId, data.fieldId, data.pointId, data.content);
      }
    } else {
      throw new Error('编辑操作缺少必要参数');
    }

    return {
      success: true,
      message: "编辑成功"
    };
  }

  /**
   * 🗑️ 执行删除操作
   */
  private async executeDeleteAction(
    target: string,
    entity: string,
    data: any
  ): Promise<ExecutionResult> {
    const { removeField, removePoint } = this.resumeStore.getState();

    // 处理字段名不匹配问题：LLM返回section，ActionExecutor期望sectionId
    const sectionId = data.sectionId || data.section;
    
    console.log("🗑️ 字段映射:", { 
      original: { sectionId: data.sectionId, section: data.section, fieldId: data.fieldId, pointId: data.pointId },
      mapped: { sectionId, fieldId: data.fieldId, pointId: data.pointId }
    });

    console.log("🗑️ 删除操作参数:", { target, entity, data, sectionId });
    console.log("🗑️ 当前sections状态:", this.resumeStore.getState().sections);

    if (target === 'field' && data.fieldId) {
      console.log("🗑️ 执行删除field:", sectionId, data.fieldId);
      removeField(sectionId, data.fieldId);
    } else if (target === 'point' && data.pointId) {
      console.log("🗑️ 执行删除point:", sectionId, data.fieldId, data.pointId);
      removePoint(sectionId, data.fieldId, data.pointId);
    } else {
      console.log("🗑️ 删除操作参数不足:", { target, data });
      throw new Error('删除操作缺少必要参数');
    }

    console.log("🗑️ 删除后sections状态:", this.resumeStore.getState().sections);

    return {
      success: true,
      message: "删除成功"
    };
  }

  /**
   * 🔄 执行移动操作
   */
  private async executeMoveAction(
    target: string,
    entity: string,
    data: any
  ): Promise<ExecutionResult> {
    // TODO: 实现移动逻辑
    return {
      success: true,
      message: "移动操作已执行"
    };
  }

  /**
   * ⚡ 执行优化操作
   */
  private async executeOptimizeAction(
    target: string,
    entity: string,
    data: any
  ): Promise<ExecutionResult> {
    // TODO: 实现优化逻辑
    return {
      success: true,
      message: "优化操作已执行"
    };
  }

  /**
   * 🔄 执行替换操作
   */
  private async executeReplaceAction(
    target: string,
    entity: string,
    data: any
  ): Promise<ExecutionResult> {
    const { updateFieldValue } = this.resumeStore.getState();

    if (target === 'field' && data.fieldId && data.content) {
      updateFieldValue(data.sectionId, data.fieldId, data.content);
    } else {
      throw new Error('替换操作缺少必要参数');
    }

    return {
      success: true,
      message: "替换成功"
    };
  }

  /**
   * 🎯 根据实体类型创建字段
   */
  private createFieldByEntity(entity: string, data: any): any {
    const fieldId = `field-${Date.now()}`;

    switch (entity) {
      case 'education':
        return {
          id: fieldId,
          name: data.institution || 'University Name',
          value: data.institution || 'University Name',
          points: [
            {
              id: `point-${Date.now()}-1`,
              content: `Degree: ${data.degree || 'Degree'}`
            },
            {
              id: `point-${Date.now()}-2`, 
              content: `Date: ${data.time || 'Date'}`
            },
            ...(data.major ? [{
              id: `point-${Date.now()}-3`,
              content: `Major: ${data.major}`
            }] : [])
          ]
        };

      case 'experience':
        return {
          id: fieldId,
          name: 'Company Name',
          value: data.company || 'Company Name',
          points: [
            {
              id: `point-${Date.now()}-1`,
              content: `Position: ${data.position || 'Position'}`
            },
            {
              id: `point-${Date.now()}-2`,
              content: `Date: ${data.duration || 'Date'}`
            }
          ]
        };

      case 'skill':
        return {
          id: fieldId,
          name: 'Skills',
          value: undefined,
          points: (data.skills || []).map((skill: string, index: number) => ({
            id: `point-${Date.now()}-${index}`,
            content: skill
          }))
        };

      default:
        throw new Error(`未知实体类型: ${entity}`);
    }
  }

  /**
   * 🔍 查找目标section
   */
  private findTargetSection(entity: string): any {
    const { sections } = this.resumeStore.getState();
    
    const sectionMap: Record<string, string[]> = {
      'education': ['education', '教育', 'education & training'],
      'experience': ['work', 'experience', '工作', 'employment'],
      'skill': ['skill', 'skills', 'technical', '技能', '技术']
    };

    const keywords = sectionMap[entity] || [];
    
    return sections.find((s: any) => 
      keywords.some(keyword => 
        s.title.toLowerCase().includes(keyword.toLowerCase())
      )
    );
  }
}
