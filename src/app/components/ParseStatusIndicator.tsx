// src/app/components/ParseStatusIndicator.tsx

interface ParseStatusIndicatorProps {
  source: string;
  confidence?: number;
  parseTime?: number;
}

export default function ParseStatusIndicator({ source, confidence, parseTime }: ParseStatusIndicatorProps) {
  const getSourceInfo = () => {
    switch (source) {
      case 'ParseResumeAgent':
        return {
          icon: '🚀',
          label: '快速解析',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'ChatGPT':
        return {
          icon: '🤖',
          label: 'AI智能解析',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      default:
        return {
          icon: '❓',
          label: '未知来源',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const sourceInfo = getSourceInfo();
  const confidencePercent = confidence ? Math.round(confidence * 100) : 0;
  const parseTimeSeconds = parseTime ? ((Date.now() - parseTime) / 1000).toFixed(1) : 'N/A';

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${sourceInfo.bgColor} ${sourceInfo.borderColor} ${sourceInfo.color}`}>
      <span className="text-lg">{sourceInfo.icon}</span>
      <div className="flex flex-col">
        <span className="text-sm font-medium">{sourceInfo.label}</span>
        <div className="flex items-center gap-2 text-xs">
          <span>置信度: {confidencePercent}%</span>
          <span>•</span>
          <span>耗时: {parseTimeSeconds}s</span>
        </div>
      </div>
    </div>
  );
}
