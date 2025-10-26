// src/core/semanticInfrastructure.ts
// 🧠 语义基础设施初始化

import { initializeCoreActions } from './actionHandlers';

/**
 * 🧠 初始化语义推理基础设施
 */
export function initializeSemanticInfrastructure(): void {
  console.log('🧠 初始化语义推理基础设施');
  
  try {
    // 初始化核心动作处理器
    initializeCoreActions();
    
    console.log('✅ 语义推理基础设施初始化完成');
    console.log('🎯 现在系统支持真正的语义推理，不再依赖硬编码模板');
    
  } catch (error) {
    console.error('❌ 语义基础设施初始化失败:', error);
    throw error;
  }
}

// 自动初始化
initializeSemanticInfrastructure();
