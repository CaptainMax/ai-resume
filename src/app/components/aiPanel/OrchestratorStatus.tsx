// src/app/components/aiPanel/OrchestratorStatus.tsx
// 🎯 Agent编排器状态显示组件

import React, { useState, useEffect } from 'react';

interface OrchestratorStatusProps {
  userId: string;
  onClose: () => void;
}

interface SystemStatus {
  activeAgents: number;
  activeExecutions: number;
  systemHealth: 'healthy' | 'degraded' | 'unhealthy';
}

interface UserStats {
  totalExecutions: number;
  successRate: number;
  averageExecutionTime: number;
  mostUsedAgents: string[];
  complexTaskCount: number;
}

export default function OrchestratorStatus({ userId, onClose }: OrchestratorStatusProps) {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
  }, [userId]);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      
      // 获取系统状态
      const systemResponse = await fetch('/api/orchestrator?action=status');
      const systemData = await systemResponse.json();
      
      if (systemData.success) {
        setSystemStatus(systemData.data);
      }
      
      // 获取用户统计
      const statsResponse = await fetch(`/api/orchestrator?action=stats&userId=${userId}`);
      const statsData = await statsResponse.json();
      
      if (statsData.success) {
        setUserStats(statsData.data);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取状态失败');
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'unhealthy': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return '🟢';
      case 'degraded': return '🟡';
      case 'unhealthy': return '🔴';
      default: return '⚪';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3">加载编排器状态...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-red-600 text-center">
            <div className="text-2xl mb-2">❌</div>
            <div className="font-medium">加载失败</div>
            <div className="text-sm mt-1">{error}</div>
            <button 
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* 标题 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">🎯 Agent编排器状态</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* 系统状态 */}
        {systemStatus && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">系统状态</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">活跃Agent</div>
                <div className="text-2xl font-bold text-blue-800">{systemStatus.activeAgents}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">活跃执行</div>
                <div className="text-2xl font-bold text-green-800">{systemStatus.activeExecutions}</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium">系统健康</div>
                <div className={`text-2xl font-bold ${getHealthColor(systemStatus.systemHealth)}`}>
                  {getHealthIcon(systemStatus.systemHealth)} {systemStatus.systemHealth}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 用户统计 */}
        {userStats && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">用户统计</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 font-medium">总执行次数</div>
                <div className="text-2xl font-bold text-gray-800">{userStats.totalExecutions}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">成功率</div>
                <div className="text-2xl font-bold text-green-800">{userStats.successRate.toFixed(1)}%</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">平均执行时间</div>
                <div className="text-2xl font-bold text-blue-800">{userStats.averageExecutionTime.toFixed(0)}ms</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium">复杂任务数</div>
                <div className="text-2xl font-bold text-purple-800">{userStats.complexTaskCount}</div>
              </div>
            </div>
            
            {/* 最常用Agent */}
            {userStats.mostUsedAgents.length > 0 && (
              <div className="mt-4 bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm text-yellow-600 font-medium mb-2">最常用Agent</div>
                <div className="flex flex-wrap gap-2">
                  {userStats.mostUsedAgents.map((agent, index) => (
                    <span 
                      key={agent}
                      className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      #{index + 1} {agent}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex justify-end space-x-3">
          <button 
            onClick={fetchStatus}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            刷新状态
          </button>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
