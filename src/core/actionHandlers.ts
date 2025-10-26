// src/core/actionHandlers.ts
// 🎯 核心动作处理器 - 注册所有基础动作

import { registerAction, ReasoningStep } from './semanticActionRegistry';

/**
 * 🎯 注册所有核心动作处理器
 */
export function initializeCoreActions(): void {
  console.log('🎯 初始化核心动作处理器');

  // 1. 为现有公司添加描述
  registerAction('add_description_to_existing_company', async (step: ReasoningStep, resumeData: any) => {
    const { company, description, polishedContent } = step.params;
    const sections = resumeData.sections || [];
    let addedCount = 0;
    const addedItems: string[] = [];
    
    sections.forEach((section: any) => {
      if (section.fields) {
        section.fields.forEach((field: any) => {
          if (field.name?.toLowerCase().includes(company?.toLowerCase())) {
            if (!field.points) field.points = [];
            
            field.points.push({
              id: `point-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              content: polishedContent || description
            });
            addedCount++;
            addedItems.push(`Added description to ${field.name}: ${(polishedContent || description).substring(0, 50)}...`);
          }
        });
      }
    });
    
    return {
      success: true,
      action: 'add_description_to_existing_company',
      added: addedCount,
      items: addedItems,
      confidence: addedCount > 0 ? 0.9 : 0.1
    };
  }, {
    description: '为现有公司添加描述',
    semanticKeywords: ['add description', 'add to existing', '润色', '加入到', 'description for']
  });

  // 2. 更新现有工作经验
  registerAction('update_existing_work_experience', async (step: ReasoningStep, resumeData: any) => {
    const { company, newContent } = step.params;
    const sections = resumeData.sections || [];
    let updatedCount = 0;
    const updatedItems: string[] = [];
    
    sections.forEach((section: any) => {
      if (section.fields) {
        section.fields.forEach((field: any) => {
          if (field.name?.toLowerCase().includes(company?.toLowerCase())) {
            if (field.points) {
              field.points.forEach((point: any) => {
                const originalContent = point.content;
                point.content = newContent;
                updatedCount++;
                updatedItems.push(`${originalContent.substring(0, 30)}... → ${newContent.substring(0, 30)}...`);
              });
            }
          }
        });
      }
    });
    
    return {
      success: true,
      action: 'update_existing_work_experience',
      updated: updatedCount,
      items: updatedItems,
      confidence: updatedCount > 0 ? 0.9 : 0.1
    };
  }, {
    description: '更新现有工作经验',
    semanticKeywords: ['update existing', 'update work experience', '修改工作经验']
  });

  // 3. 润色并添加到现有条目
  registerAction('polish_and_add_to_existing_entry', async (step: ReasoningStep, resumeData: any) => {
    const { company, content, polishedContent } = step.params;
    const sections = resumeData.sections || [];
    let addedCount = 0;
    const addedItems: string[] = [];
    
    // 简单的润色逻辑
    const polished = polishedContent || content.replace(/，/g, ', ').replace(/。/g, '. ');
    
    sections.forEach((section: any) => {
      if (section.fields) {
        section.fields.forEach((field: any) => {
          if (field.name?.toLowerCase().includes(company?.toLowerCase())) {
            if (!field.points) field.points = [];
            
            field.points.push({
              id: `point-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              content: polished
            });
            addedCount++;
            addedItems.push(`Added polished content to ${field.name}: ${polished.substring(0, 50)}...`);
          }
        });
      }
    });
    
    return {
      success: true,
      action: 'polish_and_add_to_existing_entry',
      added: addedCount,
      items: addedItems,
      confidence: addedCount > 0 ? 0.9 : 0.1
    };
  }, {
    description: '润色并添加到现有条目',
    semanticKeywords: ['polish', '润色', 'add to existing', '加入到现有']
  });

  // 4. 创建新公司条目
  registerAction('create_new_company_entry', async (step: ReasoningStep, resumeData: any) => {
    const { company, position, period, description } = step.params;
    const sections = resumeData.sections || [];
    
    // 找到或创建工作经验部分
    let workExperienceSection = sections.find((s: any) => 
      s.title && s.title.toLowerCase().includes('work')
    );
    
    if (!workExperienceSection) {
      workExperienceSection = {
        id: `section-${Date.now()}`,
        title: 'Work Experience',
        fields: []
      };
      sections.push(workExperienceSection);
    }
    
    // 创建新公司条目
    const newEntry = {
      id: `field-${Date.now()}`,
      name: company,
      value: company,
      points: [
        {
          id: `point-${Date.now()}-1`,
          content: `Position: ${position}`
        },
        {
          id: `point-${Date.now()}-2`,
          content: `Period: ${period}`
        },
        {
          id: `point-${Date.now()}-3`,
          content: description
        }
      ]
    };
    
    workExperienceSection.fields.push(newEntry);
    
    return {
      success: true,
      action: 'create_new_company_entry',
      created: 1,
      company: company,
      confidence: 0.9
    };
  }, {
    description: '创建新公司条目',
    semanticKeywords: ['create new', 'add new company', '新公司', '创建新条目']
  });

  // 5. 查找并更新现有内容
  registerAction('find_and_update_existing_content', async (step: ReasoningStep, resumeData: any) => {
    const { keyword, newContent } = step.params;
    const sections = resumeData.sections || [];
    let updatedCount = 0;
    const updatedItems: string[] = [];
    
    sections.forEach((section: any) => {
      if (section.fields) {
        section.fields.forEach((field: any) => {
          if (field.points) {
            field.points.forEach((point: any) => {
              if (point.content?.toLowerCase().includes(keyword?.toLowerCase())) {
                const originalContent = point.content;
                point.content = newContent;
                updatedCount++;
                updatedItems.push(`${originalContent.substring(0, 30)}... → ${newContent.substring(0, 30)}...`);
              }
            });
          }
        });
      }
    });
    
    return {
      success: true,
      action: 'find_and_update_existing_content',
      updated: updatedCount,
      items: updatedItems,
      confidence: updatedCount > 0 ? 0.9 : 0.1
    };
  }, {
    description: '查找并更新现有内容',
    semanticKeywords: ['find and update', 'search and replace', '查找并更新']
  });

  // 6. 删除前缀转换内容
  registerAction('transform_content_with_prefix_removal', async (step: ReasoningStep, resumeData: any) => {
    const { prefix } = step.params;
    const sections = resumeData.sections || [];
    let transformedCount = 0;
    const transformedItems: string[] = [];
    
    sections.forEach((section: any) => {
      if (section.fields) {
        section.fields.forEach((field: any) => {
          if (field.points) {
            field.points.forEach((point: any) => {
              if (point.content) {
                const originalContent = point.content;
                const prefixRegex = new RegExp(`^${prefix}\\s*:\\s*`, 'i');
                
                if (prefixRegex.test(originalContent)) {
                  const newContent = originalContent.replace(prefixRegex, '').trim();
                  point.content = newContent;
                  transformedCount++;
                  transformedItems.push(`${originalContent.substring(0, 30)}... → ${newContent.substring(0, 30)}...`);
                }
              }
            });
          }
        });
      }
    });
    
    return {
      success: true,
      action: 'transform_content_with_prefix_removal',
      transformed: transformedCount,
      items: transformedItems,
      confidence: transformedCount > 0 ? 0.9 : 0.1
    };
  }, {
    description: '删除前缀转换内容',
    semanticKeywords: ['remove prefix', 'delete prefix', 'transform content', '删除前缀']
  });

  console.log('✅ 核心动作处理器初始化完成');
}
