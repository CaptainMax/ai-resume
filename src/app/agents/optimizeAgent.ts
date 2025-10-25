// src/app/agents/optimizeAgent.ts
// 🚀 优化Agent

// Simple UUID generator without external dependencies
const generateId = () => {
  return 'id-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
};

export class OptimizeAgent {
  async execute(entities: any, context: any): Promise<{ success: boolean; message: string; updatedResume?: any }> {
    console.log('🚀 OptimizeAgent执行:', { entities, context });
    
    try {
      const { sections } = context;
      let optimizedCount = 0;
      
      // 优化所有section的内容
      sections.forEach((section: any) => {
        if (section.fields) {
          section.fields.forEach((field: any) => {
            if (field.points) {
              field.points.forEach((point: any) => {
                // 基本的文本优化
                if (point.content) {
                  // 移除多余的空格
                  point.content = point.content.replace(/\s+/g, ' ').trim();
                  
                  // 确保句子以句号结尾（如果不是问号或感叹号）
                  if (!point.content.match(/[.!?]$/)) {
                    point.content += '.';
                  }
                  
                  // 首字母大写
                  point.content = point.content.charAt(0).toUpperCase() + point.content.slice(1);
                  
                  optimizedCount++;
                }
              });
            }
          });
        }
      });
      
      // 如果有特定的优化指令
      if (entities.optimizationType) {
        switch (entities.optimizationType.toLowerCase()) {
          case 'format':
            // 格式化优化
            sections.forEach((section: any) => {
              if (section.title) {
                section.title = section.title.charAt(0).toUpperCase() + section.title.slice(1).toLowerCase();
              }
            });
            break;
            
          case 'content':
            // 内容优化 - 添加更多描述性词汇
            sections.forEach((section: any) => {
              if (section.fields) {
                section.fields.forEach((field: any) => {
                  if (field.points) {
                    field.points.forEach((point: any) => {
                      if (point.content && !point.content.includes('successfully') && !point.content.includes('effectively')) {
                        point.content = point.content.replace(/developed/g, 'successfully developed');
                        point.content = point.content.replace(/managed/g, 'effectively managed');
                      }
                    });
                  }
                });
              }
            });
            break;
        }
      }
      
      console.log(`✅ 优化完成，处理了 ${optimizedCount} 个项目`);
      
      return {
        success: true,
        message: `✅ 成功优化简历内容，处理了 ${optimizedCount} 个项目`,
        updatedResume: {
          sections: sections
        }
      };
      
    } catch (error) {
      console.error('❌ OptimizeAgent执行失败:', error);
      return {
        success: false,
        message: `❌ 优化操作失败: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}