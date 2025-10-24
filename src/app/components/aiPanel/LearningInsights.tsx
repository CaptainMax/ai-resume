// src/app/components/aiPanel/LearningInsights.tsx
// 🧠 学习洞察组件 - 显示AI学习进度和优化建议

import { useState, useEffect } from 'react';

interface UserProfile {
  userId: string;
  preferences: {
    sectionNaming: Record<string, string>;
    fieldNaming: Record<string, string>;
    contentStyle: 'concise' | 'detailed';
    language: 'en' | 'zh';
  };
  accuracyHistory: number[];
  commonCorrections: string[];
  lastActive: Date;
}

interface OptimizationSuggestion {
  type: 'prompt_enhancement' | 'pattern_recognition' | 'user_preference';
  description: string;
  impact: 'high' | 'medium' | 'low';
  implementation: string;
}

interface LearningStats {
  totalFeedback: number;
  userFeedback: number;
  averageAccuracy: number;
  recentAccuracy: number[];
}

interface LearningInsightsProps {
  userId: string;
  isVisible: boolean;
  onClose: () => void;
}

export default function LearningInsights({ userId, isVisible, onClose }: LearningInsightsProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'suggestions' | 'stats'>('profile');

  useEffect(() => {
    if (isVisible && userId) {
      loadLearningData();
    }
  }, [isVisible, userId]);

  const loadLearningData = async () => {
    setLoading(true);
    try {
      // 加载用户分析
      const analyzeResponse = await fetch(`/api/learning?userId=${userId}&action=analyze`);
      const analyzeData = await analyzeResponse.json();
      
      if (analyzeData.success) {
        setUserProfile(analyzeData.data.userProfile);
        setSuggestions(analyzeData.data.optimizationSuggestions);
      }

      // 加载统计数据
      const statsResponse = await fetch(`/api/learning?userId=${userId}&action=stats`);
      const statsData = await statsResponse.json();
      
      if (statsData.success) {
        setStats(statsData.data);
      }
    } catch (error) {
      console.error('❌ 加载学习数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            🧠 AI 学习洞察
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* 标签页 */}
        <div className="flex space-x-1 mb-6 border-b">
          {[
            { id: 'profile', label: '用户画像', icon: '👤' },
            { id: 'suggestions', label: '优化建议', icon: '💡' },
            { id: 'stats', label: '学习统计', icon: '📊' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">分析中...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 用户画像标签页 */}
            {activeTab === 'profile' && userProfile && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-800">用户偏好分析</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-700 mb-2">内容风格</h5>
                    <span className={`px-2 py-1 rounded text-sm ${
                      userProfile.preferences.contentStyle === 'concise' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {userProfile.preferences.contentStyle === 'concise' ? '简洁风格' : '详细风格'}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-700 mb-2">语言偏好</h5>
                    <span className={`px-2 py-1 rounded text-sm ${
                      userProfile.preferences.language === 'zh' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {userProfile.preferences.language === 'zh' ? '中文' : 'English'}
                    </span>
                  </div>
                </div>

                {Object.keys(userProfile.preferences.fieldNaming).length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-700 mb-2">字段命名偏好</h5>
                    <div className="space-y-1">
                      {Object.entries(userProfile.preferences.fieldNaming).map(([original, preferred]) => (
                        <div key={original} className="text-sm text-gray-600">
                          <span className="font-medium">{original}</span> → <span className="text-blue-600">{preferred}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-700 mb-2">准确率历史</h5>
                  <div className="flex space-x-2">
                    {userProfile.accuracyHistory.slice(-10).map((accuracy, index) => (
                      <div
                        key={index}
                        className={`h-8 w-8 rounded flex items-center justify-center text-xs font-medium ${
                          accuracy >= 8 ? 'bg-green-100 text-green-800' :
                          accuracy >= 6 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}
                        title={`准确率: ${accuracy}/10`}
                      >
                        {accuracy}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 优化建议标签页 */}
            {activeTab === 'suggestions' && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-800">AI 优化建议</h4>
                
                {suggestions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">🎯</div>
                    <p>暂无优化建议</p>
                    <p className="text-sm">继续使用系统，AI将学习您的偏好</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className={`border rounded-lg p-4 ${
                          suggestion.impact === 'high' ? 'border-red-200 bg-red-50' :
                          suggestion.impact === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                          'border-green-200 bg-green-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                suggestion.impact === 'high' ? 'bg-red-100 text-red-800' :
                                suggestion.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {suggestion.impact === 'high' ? '高影响' : 
                                 suggestion.impact === 'medium' ? '中影响' : '低影响'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {suggestion.type === 'prompt_enhancement' ? '提示词优化' :
                                 suggestion.type === 'pattern_recognition' ? '模式识别' : '用户偏好'}
                              </span>
                            </div>
                            <p className="text-gray-800 mb-2">{suggestion.description}</p>
                            <p className="text-sm text-gray-600">{suggestion.implementation}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 学习统计标签页 */}
            {activeTab === 'stats' && stats && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-800">学习统计</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalFeedback}</div>
                    <div className="text-sm text-gray-600">总反馈数</div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.userFeedback}</div>
                    <div className="text-sm text-gray-600">您的反馈数</div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {stats.averageAccuracy.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">平均准确率</div>
                  </div>
                </div>

                {stats.recentAccuracy.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-700 mb-3">最近准确率趋势</h5>
                    <div className="flex space-x-2">
                      {stats.recentAccuracy.map((accuracy, index) => (
                        <div
                          key={index}
                          className={`h-12 w-12 rounded flex items-center justify-center text-sm font-medium ${
                            accuracy >= 8 ? 'bg-green-100 text-green-800' :
                            accuracy >= 6 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}
                          title={`第${index + 1}次: ${accuracy}/10`}
                        >
                          {accuracy}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 底部操作按钮 */}
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
          <button
            onClick={loadLearningData}
            disabled={loading}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? '刷新中...' : '🔄 刷新数据'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
