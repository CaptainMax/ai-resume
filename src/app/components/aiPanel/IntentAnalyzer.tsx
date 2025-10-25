// src/app/components/aiPanel/IntentAnalyzer.tsx
// 🧠 智能意图分析组件 - 显示AI对用户意图的理解

import { useState, useEffect } from 'react';
import { useResumeStore } from '@/app/store/useResumeStore';

interface ReasoningResult {
  intent: {
    action: string;
    target: string;
    entity: string;
    data: Record<string, any>;
    confidence: number;
  };
  extractedInfo: {
    type: string;
    details: Record<string, any>;
    confidence: number;
  };
  suggestedActions: string[];
  confidence: number;
}

interface IntentAnalyzerProps {
  userInput: string;
  isVisible: boolean;
  onClose: () => void;
  onExecuteAction: (action: string) => void;
}

export default function IntentAnalyzer({ 
  userInput, 
  isVisible, 
  onClose, 
  onExecuteAction 
}: IntentAnalyzerProps) {
  const [reasoning, setReasoning] = useState<ReasoningResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { sections } = useResumeStore();

  useEffect(() => {
    if (isVisible && userInput) {
      analyzeIntent();
    }
  }, [isVisible, userInput]);

  const analyzeIntent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/llm-reasoning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput,
          currentResume: { sections },
          userId: 'user-123' // TODO: 从实际用户ID获取
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setReasoning(data.data.reasoning);
      } else {
        throw new Error(data.error || '分析失败');
      }
    } catch (err) {
      console.error('❌ 意图分析失败:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            🧠 智能意图分析
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm font-medium text-gray-600 mb-1">用户输入：</p>
          <p className="text-sm text-gray-800">"{userInput}"</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">分析中...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <div className="text-4xl mb-2">❌</div>
            <p>分析失败: {error}</p>
          </div>
        ) : reasoning ? (
          <div className="space-y-4">
            {/* 意图识别 */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">🎯 意图识别</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">操作类型:</span>
                  <span className="text-sm font-medium">{reasoning.action}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">目标对象:</span>
                  <span className="text-sm font-medium">{reasoning.target}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">实体类型:</span>
                  <span className="text-sm font-medium">{reasoning.entity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">置信度:</span>
                  <span className="text-sm font-medium">{(reasoning.confidence * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* 信息提取 */}
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">📊 信息提取</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">类型:</span>
                  <span className="text-sm font-medium">{reasoning.entity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">置信度:</span>
                  <span className="text-sm font-medium">{(reasoning.confidence * 100).toFixed(1)}%</span>
                </div>
                {Object.keys(reasoning.data).length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-1">提取的详细信息:</p>
                    <div className="space-y-1">
                      {Object.entries(reasoning.data).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-gray-600">{key}:</span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 建议操作 */}
            <div className="bg-yellow-50 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">💡 建议操作</h4>
              <div className="space-y-2">
                {[
                  `执行${reasoning.action}操作`,
                  `目标: ${reasoning.target}`,
                  `实体: ${reasoning.entity}`,
                  reasoning.reasoning
                ].map((action, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-700">{action}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 整体置信度 */}
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-medium text-purple-800 mb-2">🎯 整体分析结果</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">分析置信度:</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${reasoning.confidence * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{(reasoning.confidence * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* 操作按钮 */}
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            取消
          </button>
          {reasoning && reasoning.confidence > 0.7 && (
            <button
              onClick={() => {
                onExecuteAction('auto-execute');
                onClose();
              }}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              🤖 自动执行
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
