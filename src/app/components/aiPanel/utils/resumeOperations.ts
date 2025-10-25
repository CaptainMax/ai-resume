// src/app/components/aiPanel/utils/resumeOperations.ts
// 📝 简历操作工具函数

import { useResumeStore } from '@/app/store/useResumeStore';

/**
 * 🎓 添加教育经历字段
 */
export const addEducationField = async (details: any) => {
  const { addField } = useResumeStore.getState();
  
  // 找到Education section
  const sections = useResumeStore.getState().sections;
  const educationSection = sections.find(s => 
    s.title.toLowerCase().includes('education') || 
    s.title.toLowerCase().includes('教育')
  );
  
  if (!educationSection) {
    throw new Error('未找到Education section');
  }

  // 创建新的教育字段 - 用实际大学名替换字段名
  const universityName = details.institution || 'University Name';
  const newField = {
    id: `field-${Date.now()}`,
    name: universityName, // 🎯 用实际大学名替换字段名
    value: universityName,
    points: [
      {
        id: `point-${Date.now()}-1`,
        content: `Degree: ${details.degree || 'Degree'}`
      },
      {
        id: `point-${Date.now()}-2`,
        content: `Date: ${details.time || 'Date'}`
      },
      ...(details.major ? [{
        id: `point-${Date.now()}-3`,
        content: `Major: ${details.major}`
      }] : [])
    ]
  };

  addField(educationSection.id, newField);
};

/**
 * 💼 添加工作经历字段
 */
export const addExperienceField = async (details: any) => {
  const { addField } = useResumeStore.getState();
  
  // 找到Work Experience section
  const sections = useResumeStore.getState().sections;
  const workSection = sections.find(s => 
    s.title.toLowerCase().includes('work') || 
    s.title.toLowerCase().includes('experience') ||
    s.title.toLowerCase().includes('工作')
  );
  
  if (!workSection) {
    throw new Error('未找到Work Experience section');
  }

  // 创建新的工作字段
  const newField = {
    id: `field-${Date.now()}`,
    name: details.company || 'Company Name',
    value: details.company || 'Company Name',
    points: [
      {
        id: `point-${Date.now()}-1`,
        content: `Position: ${details.position || 'Position'}`
      },
      {
        id: `point-${Date.now()}-2`,
        content: `Date: ${details.time || 'Date'}`
      }
    ]
  };

  addField(workSection.id, newField);
};

/**
 * 🛠️ 添加技能字段
 */
export const addSkillField = async (details: any) => {
  const { addField } = useResumeStore.getState();
  
  // 找到Technical Skills section
  const sections = useResumeStore.getState().sections;
  const skillsSection = sections.find(s => 
    s.title.toLowerCase().includes('skill') || 
    s.title.toLowerCase().includes('technical') ||
    s.title.toLowerCase().includes('技能')
  );
  
  if (!skillsSection) {
    throw new Error('未找到Technical Skills section');
  }

  // 为每个技能创建point
  const skillPoints = details.skills?.map((skill: string, index: number) => ({
    id: `point-${Date.now()}-${index}`,
    content: skill
  })) || [];

  // 创建新的技能字段
  const newField = {
    id: `field-${Date.now()}`,
    name: 'Skills',
    value: undefined,
    points: skillPoints
  };

  addField(skillsSection.id, newField);
};

/**
 * 🗑️ 执行删除操作
 */
export const executeDeleteAction = async () => {
  const { removePoint } = useResumeStore.getState();
  const { selectedPoint } = useResumeStore.getState();
  
  // 如果有选中的point，删除它
  if (selectedPoint) {
    removePoint(selectedPoint.sectionId, selectedPoint.fieldId, selectedPoint.pointId);
    console.log("🗑️ 已删除选中的point:", selectedPoint);
  } else {
    throw new Error('没有选中的point可以删除');
  }
};

/**
 * ✏️ 执行编辑操作
 */
export const executeEditAction = async () => {
  // TODO: 实现编辑操作逻辑
  console.log("✏️ 执行编辑操作");
};

/**
 * 🎯 执行MIT替换操作
 */
export const executeMitReplacement = async () => {
  try {
    const { updateFieldValue } = useResumeStore.getState();
    const sections = useResumeStore.getState().sections;
    
    // 找到Education section
    const educationSection = sections.find(s => 
      s.title.toLowerCase().includes('education') || 
      s.title.toLowerCase().includes('教育')
    );
    
    if (!educationSection) {
      throw new Error('未找到Education section');
    }
    
    console.log('🔍 搜索MIT字段，当前字段:', educationSection.fields?.map(f => f.name));
    
    // 更灵活的MIT字段搜索
    const mitField = educationSection.fields?.find(f => {
      const fieldName = f.name?.toLowerCase() || '';
      const fieldValue = f.value?.toLowerCase() || '';
      
      // 检查字段名或值是否包含MIT
      return fieldName.includes('mit') || 
             fieldValue.includes('mit') ||
             fieldName === 'mit' ||
             fieldValue === 'mit';
    });
    
    if (!mitField) {
      // 如果找不到MIT字段，尝试查找任何包含"mit"的字段
      const anyMitField = educationSection.fields?.find(f => {
        const fieldName = f.name?.toLowerCase() || '';
        const fieldValue = f.value?.toLowerCase() || '';
        return fieldName.includes('mit') || fieldValue.includes('mit');
      });
      
      if (anyMitField) {
        console.log('🎯 找到可能的MIT字段:', anyMitField.name);
        // 执行替换
        updateFieldValue(educationSection.id, anyMitField.id, 'Massachusetts Institute of Technology');
        console.log('✅ MIT已替换为完整名称');
        return true;
      } else {
        throw new Error('未找到MIT字段，请检查字段名称');
      }
    }
    
    // 执行替换
    updateFieldValue(educationSection.id, mitField.id, 'Massachusetts Institute of Technology');
    
    console.log('✅ MIT已替换为完整名称');
    return true;
  } catch (error) {
    console.error('❌ MIT替换失败:', error);
    return false;
  }
};
