// src/app/components/aiPanel/FeedbackConfirmation.tsx
// 🧠 反馈确认组件 - 让用户确认AI修改并收集反馈

import { useState } from 'react';
import { useFeedbackCollection } from './hooks/useFeedbackCollection';

interface FeedbackConfirmationProps {
  isVisible: boolean;
  onConfirm: () => void;
  onUndo: () => void;
  aiModifiedContent: string;
  originalContent: string;
  fieldName: string;
}

export default function FeedbackConfirmation({
  isVisible,
  onConfirm,
  onUndo,
  aiModifiedContent,
  originalContent,
  fieldName
}: FeedbackConfirmationProps) {
  const [accuracy, setAccuracy] = useState<number>(8); // 默认8分
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { sendFeedback } = useFeedbackCollection();

  if (!isVisible) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      // 发送反馈（用户确认保留）
      await sendFeedback(accuracy);
      onConfirm();
    } catch (error) {
      console.error('❌ 发送反馈失败:', error);
      onConfirm(); // 即使反馈失败，也继续确认
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUndo = async () => {
    setIsSubmitting(true);
    try {
      // 发送反馈（用户撤销）
      await sendFeedback(3); // 低分表示不满意
      onUndo();
    } catch (error) {
      console.error('❌ 发送反馈失败:', error);
      onUndo(); // 即使反馈失败，也继续撤销
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🤖 AI 修改确认
        </h3>
        
        <div className="space-y-4">
          {/* 字段信息 */}
          <div className="text-sm text-gray-600">
            <span className="font-medium">字段：</span>
            {fieldName}
          </div>

          {/* 原始内容 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              原始内容：
            </label>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800 line-through">
              {originalContent}
            </div>
          </div>

          {/* AI修改内容 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI 修改后：
            </label>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
              {aiModifiedContent}
            </div>
          </div>

          {/* 满意度评分 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              对AI修改的满意度 (1-10分)：
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="1"
                max="10"
                value={accuracy}
                onChange={(e) => setAccuracy(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-medium text-gray-700 w-8">
                {accuracy}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              1分=很不满意，10分=非常满意
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleUndo}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '撤销中...' : '撤销'}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '确认中...' : '保留'}
          </button>
        </div>

        {/* 说明文字 */}
        <div className="text-xs text-gray-500 mt-4 text-center">
          您的反馈将帮助AI学习，提高未来的解析准确性
        </div>
      </div>
    </div>
  );
}
