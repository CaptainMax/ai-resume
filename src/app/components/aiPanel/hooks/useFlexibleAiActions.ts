// src/app/components/aiPanel/hooks/useFlexibleAiActions.ts
"use client";

import { useResumeStore } from "@/app/store/useResumeStore";

export function useFlexibleAiActions() {
  const { sections, addField, addPoint, removeField, removePoint, updatePoint, updateFieldName, setLastAddedFieldId, setLastAddedPointId } = useResumeStore();

  // 通用的AI动作执行器
  const executeAiAction = async (action: any) => {
    console.log("🔧 执行AI动作:", action);

    try {
      switch (action.type) {
        case 'add_field':
          return await addFieldAction(action.data);
        case 'remove_field':
          return await removeFieldAction(action.data);
        case 'update_field':
          return await updateFieldAction(action.data);
        case 'add_point':
          return await addPointAction(action.data);
        case 'remove_point':
          return await removePointAction(action.data);
        case 'update_point':
          return await updatePointAction(action.data);
        case 'move_field':
          return await moveFieldAction(action.data);
        case 'move_point':
          return await movePointAction(action.data);
        default:
          console.warn("未知的AI动作类型:", action.type);
          return false;
      }
    } catch (error) {
      console.error("执行AI动作失败:", error);
      return false;
    }
  };

  // 添加字段
  const addFieldAction = async (data: any) => {
    const { sectionId, fieldName, points = [] } = data;
    const newField = {
      id: `field-${Date.now()}`,
      name: fieldName,
      points: points.map((point: any, index: number) => ({
        id: `point-${Date.now()}-${index}`,
        content: point
      }))
    };
    
    addField(sectionId, newField);
    setLastAddedFieldId(newField.id);
    return true;
  };

  // 删除字段
  const removeFieldAction = async (data: any) => {
    const { sectionId, fieldId } = data;
    removeField(sectionId, fieldId);
    return true;
  };

  // 更新字段
  const updateFieldAction = async (data: any) => {
    const { sectionId, fieldId, fieldName } = data;
    updateFieldName(sectionId, fieldId, fieldName);
    return true;
  };

  // 添加点
  const addPointAction = async (data: any) => {
    const { sectionId, fieldId, content } = data;
    const newPoint = {
      id: `point-${Date.now()}`,
      content: content
    };
    
    addPoint(sectionId, fieldId, newPoint);
    setLastAddedPointId(newPoint.id);
    return true;
  };

  // 删除点
  const removePointAction = async (data: any) => {
    const { sectionId, fieldId, pointId } = data;
    removePoint(sectionId, fieldId, pointId);
    return true;
  };

  // 更新点
  const updatePointAction = async (data: any) => {
    const { sectionId, fieldId, pointId, content } = data;
    updatePoint(sectionId, fieldId, pointId, content);
    return true;
  };

  // 移动字段（未来实现）
  const moveFieldAction = async (data: any) => {
    // TODO: 实现字段移动逻辑
    console.log("移动字段功能待实现:", data);
    return false;
  };

  // 移动点（未来实现）
  const movePointAction = async (data: any) => {
    // TODO: 实现点移动逻辑
    console.log("移动点功能待实现:", data);
    return false;
  };

  return { executeAiAction };
}
