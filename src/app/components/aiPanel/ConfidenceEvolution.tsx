// src/app/components/aiPanel/ConfidenceEvolution.tsx
// 🎯 置信度进化组件 - 显示AI学习进化和置信度调整

import { useState, useEffect } from 'react';

interface ConfidenceMetrics {
  baseConfidence: number;
  userAccuracy: number;
  feedbackQuality: number;
  patternMatch: number;
  historicalPerformance: number;
  finalConfidence: number;
}

interface ConfidenceHistory {
  timestamp: Date;
  confidence: number;
  accuracy: number;
  feedback: number;
  rule: string;
}

interface ConfidenceReport {
  overallConfidence: number;
  trend: 'improving' | 'stable' | 'declining';
  topRules: string[];
  recommendations: string[];
}

interface ConfidenceEvolutionProps {
  userId: string;
  isVisible: boolean;
  onClose: () => void;
}

export default function ConfidenceEvolution({ userId, isVisible, onClose }: ConfidenceEvolutionProps) {
  const [metrics, setMetrics] = useState<ConfidenceMetrics | null>(null);
  const [report, setReport] = useState<ConfidenceReport | null>(null);
  const [history, setHistory] = useState<ConfidenceHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'metrics' | 'report' | 'history'>('metrics');

  useEffect(() => {
    if (isVisible && userId) {
      loadConfidenceData();
    }
  }, [isVisible, userId]);

  const loadConfidenceData = async () => {
    setLoading(true);
    try {
      // 加载置信度指标
      const metricsResponse = await fetch(`/api/confidence?userId=${userId}&action=calculate&baseConfidence=0.7&userAccuracy=0.8&feedbackQuality=0.7&patternMatch=0.8`);
      const metricsData = await metricsResponse.json();
      
      if (metricsData.success) {
        setMetrics(metricsData.data.metrics);
      }

      // 加载置信度报告
      const reportResponse = await fetch(`/api/confidence?userId=${userId}&action=report`);
      const reportData = await reportResponse.json();
      
      if (reportData.success) {
        setReport(reportData.data.report);
      }

      // 加载历史数据
      const historyResponse = await fetch(`/api/confidence?userId=${userId}&action=history`);
      const historyData = await historyResponse.json();
      
      if (historyData.success) {
        setHistory(historyData.data.history);
      }
    } catch (error) {
      console.error('❌ 加载置信度数据失败:', error);
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
            🎯 置信度进化
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
            { id: 'metrics', label: '置信度指标', icon: '📊' },
            { id: 'report', label: '进化报告', icon: '📈' },
            { id: 'history', label: '历史趋势', icon: '📅' }
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
            {/* 置信度指标标签页 */}
            {activeTab === 'metrics' && metrics && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-800">动态置信度指标</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-700 mb-2">基础置信度</h5>
                    <div className="text-2xl font-bold text-blue-600">
                      {(metrics.baseConfidence * 100).toFixed(1)}%
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-700 mb-2">最终置信度</h5>
                    <div className="text-2xl font-bold text-green-600">
                      {(metrics.finalConfidence * 100).toFixed(1)}%
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-700 mb-2">用户准确率</h5>
                    <div className="text-2xl font-bold text-purple-600">
                      {(metrics.userAccuracy * 100).toFixed(1)}%
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-700 mb-2">反馈质量</h5>
                    <div className="text-2xl font-bold text-orange-600">
                      {(metrics.feedbackQuality * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-700 mb-3">置信度调整详情</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">模式匹配度:</span>
                      <span className="font-medium">{(metrics.patternMatch * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">历史性能:</span>
                      <span className="font-medium">{(metrics.historicalPerformance * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">置信度调整:</span>
                      <span className={`font-medium ${
                        metrics.finalConfidence > metrics.baseConfidence ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metrics.finalConfidence > metrics.baseConfidence ? '+' : ''}
                        {((metrics.finalConfidence - metrics.baseConfidence) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 进化报告标签页 */}
            {activeTab === 'report' && report && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-800">AI 进化报告</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-700 mb-2">整体置信度</h5>
                    <div className="text-3xl font-bold text-blue-600">
                      {(report.overallConfidence * 100).toFixed(1)}%
                    </div>
                  </div>

                  <div className={`rounded-lg p-4 ${
                    report.trend === 'improving' ? 'bg-green-50' :
                    report.trend === 'declining' ? 'bg-red-50' : 'bg-gray-50'
                  }`}>
                    <h5 className="font-medium text-gray-700 mb-2">进化趋势</h5>
                    <div className={`text-2xl font-bold ${
                      report.trend === 'improving' ? 'text-green-600' :
                      report.trend === 'declining' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {report.trend === 'improving' ? '📈 改善中' :
                       report.trend === 'declining' ? '📉 下降中' : '📊 稳定'}
                    </div>
                  </div>
                </div>

                {report.topRules.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-700 mb-3">最有效的进化规则</h5>
                    <div className="space-y-2">
                      {report.topRules.map((rule, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <span className="text-gray-700">{rule}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {report.recommendations.length > 0 && (
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-700 mb-3">优化建议</h5>
                    <div className="space-y-2">
                      {report.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <span className="text-yellow-600 mt-1">💡</span>
                          <span className="text-gray-700">{recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 历史趋势标签页 */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-800">置信度历史趋势</h4>
                
                {history.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📊</div>
                    <p>暂无历史数据</p>
                    <p className="text-sm">继续使用系统，AI将学习并记录置信度变化</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-medium text-gray-700 mb-3">置信度变化图表</h5>
                      <div className="flex space-x-2 overflow-x-auto">
                        {history.slice(-20).map((entry, index) => (
                          <div
                            key={index}
                            className="flex flex-col items-center space-y-1"
                            title={`${new Date(entry.timestamp).toLocaleDateString()}: ${(entry.confidence * 100).toFixed(1)}%`}
                          >
                            <div
                              className={`w-8 rounded-t ${
                                entry.confidence >= 0.8 ? 'bg-green-400' :
                                entry.confidence >= 0.6 ? 'bg-yellow-400' : 'bg-red-400'
                              }`}
                              style={{ height: `${entry.confidence * 100}px` }}
                            ></div>
                            <span className="text-xs text-gray-500">
                              {new Date(entry.timestamp).toLocaleDateString().slice(-5)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-medium text-gray-700 mb-3">最近记录</h5>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {history.slice(-10).map((entry, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <div>
                              <span className="font-medium">{(entry.confidence * 100).toFixed(1)}%</span>
                              <span className="text-gray-500 ml-2">
                                {new Date(entry.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <div className="text-gray-500">
                              准确率: {(entry.accuracy * 100).toFixed(1)}%
                            </div>
                          </div>
                        ))}
                      </div>
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
            onClick={loadConfidenceData}
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
