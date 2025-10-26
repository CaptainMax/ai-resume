// src/app/utils/sortUtils.ts
// 专门处理简历字段排序的工具函数

/**
 * 工作经历按时间排序的函数（最新的在前）
 * @param fields 工作经历字段数组
 * @returns 按时间排序后的字段数组
 */
export function sortWorkExperienceFields(fields: any[]): any[] {
  return fields.sort((a, b) => {
    // 从field的points中提取时间信息
    const getDateValue = (field: any): number => {
      const points = field.points || [];
      const datePoint = points.find((point: any) => 
        point.content && point.content.toLowerCase().includes('date:')
      );
      
      if (datePoint) {
        const dateText = datePoint.content.toLowerCase();
        
        // 处理不同的日期格式
        // 1. "Date: Mar. 2022 - Feb. 2025" 或 "Date: 03-2025 - Current"
        // 2. "Date: 2022 - 2025"
        // 3. "Date: Current" 或 "Date: Present"
        
        // 检查是否是当前工作
        if (dateText.includes('current') || dateText.includes('present') || dateText.includes('now')) {
          return 999999; // 当前工作优先级最高
        }
        
        // 提取开始年份
        const yearMatches = dateText.match(/\b(19|20)\d{2}\b/g);
        if (yearMatches && yearMatches.length > 0) {
          // 取第一个年份作为开始年份
          const startYear = parseInt(yearMatches[0]);
          
          // 如果有结束年份，取结束年份；否则取开始年份
          const endYear = yearMatches.length > 1 ? parseInt(yearMatches[1]) : startYear;
          
          // 返回结束年份，这样最新的工作会排在前面
          return endYear;
        }
        
        // 处理月份格式 "03-2025"
        const monthYearMatch = dateText.match(/\b(\d{1,2})-(\d{4})\b/);
        if (monthYearMatch) {
          return parseInt(monthYearMatch[2]); // 返回年份
        }
      }
      
      // 如果没有找到日期信息，检查field name中是否包含年份
      const fieldName = (field.name || '').toLowerCase();
      const nameYearMatch = fieldName.match(/\b(19|20)\d{2}\b/);
      if (nameYearMatch) {
        return parseInt(nameYearMatch[0]);
      }
      
      // 默认值（最低优先级）
      return 0;
    };

    const dateA = getDateValue(a);
    const dateB = getDateValue(b);
    
    // 按时间降序排序（最新的在前）
    return dateB - dateA;
  });
}

/**
 * 教育背景按学位高低排序的函数
 * @param fields 教育背景字段数组
 * @returns 按学位优先级排序后的字段数组
 */
export function sortEducationFields(fields: any[]): any[] {
  // 学位优先级定义（数字越小优先级越高）
  const degreePriority: Record<string, number> = {
    'phd': 1, 'doctor': 1, 'doctorate': 1, 'ph.d': 1, 'ph.d.': 1,
    'master': 2, 'm.s': 2, 'm.s.': 2, 'm.a': 2, 'm.a.': 2, 'mba': 2, 'm.b.a': 2, 'm.b.a.': 2, 'ms': 2, 'ma': 2,
    'bachelor': 3, 'b.s': 3, 'b.s.': 3, 'b.a': 3, 'b.a.': 3, 'bs': 3, 'ba': 3,
    'associate': 4, 'a.s': 4, 'a.s.': 4, 'a.a': 4, 'a.a.': 4, 'as': 4, 'aa': 4,
    'certificate': 5, 'cert': 5, 'diploma': 5
  };

  return fields.sort((a, b) => {
    const getDegreeLevel = (field: any): number => {
      const points = field.points || [];
      const degreePoint = points.find((point: any) =>
        point.content && point.content.toLowerCase().includes('degree:')
      );

      if (degreePoint) {
        const degreeText = degreePoint.content.toLowerCase();
        for (const [degree, priority] of Object.entries(degreePriority)) {
          if (degreeText.includes(degree)) {
            return priority;
          }
        }
      }
      const fieldName = (field.name || '').toLowerCase();
      for (const [degree, priority] of Object.entries(degreePriority)) {
        if (fieldName.includes(degree)) {
          return priority;
        }
      }
      return 999; // Default lowest priority
    };

    const priorityA = getDegreeLevel(a);
    const priorityB = getDegreeLevel(b);

    if (priorityA === priorityB) {
      const getDate = (field: any): number => {
        const points = field.points || [];
        const datePoint = points.find((point: any) =>
          point.content && point.content.toLowerCase().includes('date:')
        );
        if (datePoint) {
          const dateText = datePoint.content.toLowerCase();
          const yearMatch = dateText.match(/\b(19|20)\d{2}\b/g);
          if (yearMatch && yearMatch.length > 0) {
            return parseInt(yearMatch[yearMatch.length - 1]);
          }
        }
        return 0;
      };
      return getDate(b) - getDate(a); // Newer dates first
    }
    return priorityA - priorityB; // Higher degree priority first
  });
}

/**
 * 根据section类型自动选择合适的排序函数
 * @param sectionTitle section标题
 * @param fields 字段数组
 * @param newField 新添加的字段
 * @returns 排序后的字段数组
 */
export function sortFieldsBySectionType(sectionTitle: string, fields: any[], newField: any): any[] {
  const allFields = [...fields, newField];
  
  if (sectionTitle.toLowerCase().includes('education')) {
    return sortEducationFields(allFields);
  } else if (sectionTitle.toLowerCase().includes('work') || sectionTitle.toLowerCase().includes('experience')) {
    return sortWorkExperienceFields(allFields);
  }
  
  // 其他section类型不需要排序，直接返回
  return allFields;
}

/**
 * 检查section是否需要排序
 * @param sectionTitle section标题
 * @returns 是否需要排序
 */
export function shouldSortSection(sectionTitle: string): boolean {
  const title = sectionTitle.toLowerCase();
  return title.includes('education') || title.includes('work') || title.includes('experience');
}
