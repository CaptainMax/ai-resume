// src/app/components/aiPanel/hooks/useFeedbackCollection.ts
// 🧠 反馈收集Hook - 自动收集用户修正操作

import { useCallback, useRef } from 'react';
import { useResumeStore } from '@/app/store/useResumeStore';

export interface UserCorrection {
  type: 'field_edit' | 'field_rename' | 'section_move' | 'point_edit' | 'point_add' | 'point_remove';
  sectionId: string;
  fieldId?: string;
  pointId?: string;
  originalContent: string;
  newContent: string;
  timestamp: Date;
}

export interface FeedbackData {
  userId: string;
  originalText: string;
  aiParse: any;
  userCorrections: UserCorrection[];
  accuracy?: number;
}

export function useFeedbackCollection() {
  const corrections = useRef<UserCorrection[]>([]);
  const originalText = useRef<string>('');
  const aiParse = useRef<any>(null);
  
  const { sections } = useResumeStore();

  // 🎯 记录原始数据
  const recordOriginalData = useCallback((text: string, parseResult: any) => {
    originalText.current = text;
    aiParse.current = parseResult;
    corrections.current = []; // 重置修正记录
    console.log('📝 记录原始数据:', { textLength: text.length, sectionsCount: parseResult?.length });
  }, []);

  // 🎯 记录字段编辑
  const recordFieldEdit = useCallback((sectionId: string, fieldId: string, originalContent: string, newContent: string) => {
    const correction: UserCorrection = {
      type: 'field_edit',
      sectionId,
      fieldId,
      originalContent,
      newContent,
      timestamp: new Date()
    };
    
    corrections.current.push(correction);
    console.log('📝 记录字段编辑:', correction);
  }, []);

  // 🎯 记录字段重命名
  const recordFieldRename = useCallback((sectionId: string, fieldId: string, oldName: string, newName: string) => {
    const correction: UserCorrection = {
      type: 'field_rename',
      sectionId,
      fieldId,
      originalContent: oldName,
      newContent: newName,
      timestamp: new Date()
    };
    
    corrections.current.push(correction);
    console.log('📝 记录字段重命名:', correction);
  }, []);

  // 🎯 记录点编辑
  const recordPointEdit = useCallback((sectionId: string, fieldId: string, pointId: string, originalContent: string, newContent: string) => {
    const correction: UserCorrection = {
      type: 'point_edit',
      sectionId,
      fieldId,
      pointId,
      originalContent,
      newContent,
      timestamp: new Date()
    };
    
    corrections.current.push(correction);
    console.log('📝 记录点编辑:', correction);
  }, []);

  // 🎯 记录点添加
  const recordPointAdd = useCallback((sectionId: string, fieldId: string, pointId: string, newContent: string) => {
    const correction: UserCorrection = {
      type: 'point_add',
      sectionId,
      fieldId,
      pointId,
      originalContent: '',
      newContent,
      timestamp: new Date()
    };
    
    corrections.current.push(correction);
    console.log('📝 记录点添加:', correction);
  }, []);

  // 🎯 记录点删除
  const recordPointRemove = useCallback((sectionId: string, fieldId: string, pointId: string, originalContent: string) => {
    const correction: UserCorrection = {
      type: 'point_remove',
      sectionId,
      fieldId,
      pointId,
      originalContent,
      newContent: '',
      timestamp: new Date()
    };
    
    corrections.current.push(correction);
    console.log('📝 记录点删除:', correction);
  }, []);

  // 🎯 获取当前反馈数据
  const getFeedbackData = useCallback((): FeedbackData => {
    return {
      userId: 'user-' + Date.now(), // 临时用户ID
      originalText: originalText.current,
      aiParse: aiParse.current,
      userCorrections: corrections.current
    };
  }, []);

  // 🎯 发送反馈到后端
  const sendFeedback = useCallback(async (accuracy?: number) => {
    const feedbackData = getFeedbackData();
    if (accuracy !== undefined) {
      feedbackData.accuracy = accuracy;
    }

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });

      if (response.ok) {
        console.log('✅ 反馈发送成功');
        corrections.current = []; // 清空已发送的修正记录
        return true;
      } else {
        console.error('❌ 反馈发送失败:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ 反馈发送错误:', error);
      return false;
    }
  }, [getFeedbackData]);

  // 🎯 重置反馈收集
  const resetFeedback = useCallback(() => {
    corrections.current = [];
    originalText.current = '';
    aiParse.current = null;
    console.log('🔄 反馈收集已重置');
  }, []);

  return {
    recordOriginalData,
    recordFieldEdit,
    recordFieldRename,
    recordPointEdit,
    recordPointAdd,
    recordPointRemove,
    getFeedbackData,
    sendFeedback,
    resetFeedback,
    hasCorrections: corrections.current.length > 0
  };
}
