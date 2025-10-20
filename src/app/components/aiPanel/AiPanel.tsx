// src/app/components/aiPanel/AiPanel.tsx
"use client";

import { useState } from "react";
import SelectionEditor from "./SelectionEditor"; // ✅ 替换 BlockEditor
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import { useResumeStore } from "@/app/store/useResumeStore";

type ChatMsg = { role: "user" | "assistant"; content: string };

export default function AiPanel() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUndoPrompt, setShowUndoPrompt] = useState(false); // 控制是否显示undo提示
  
  const { sections, selectedId, selectedField, selectedPoint, addField, addPoint, lastAddedFieldId, setLastAddedFieldId, removeField, updatePoint, lastModifiedPoint, setLastModifiedPoint } = useResumeStore();

  // 处理结构化操作
  const handleStructuredAction = async (action: string, data: any) => {
    console.log("🔧 执行结构化操作:", action, data);
    
    const useEnglish = shouldUseEnglish();
    
    if (action === 'add_education') {
      // 找到Education section
      const educationSection = sections.find(s => 
        s.title.toLowerCase().includes('education') || 
        s.title.toLowerCase().includes('教育')
      );
      
      if (educationSection) {
        // 创建新的教育经历field
        const newField = {
          id: `education-${Date.now()}`,
          name: `${data.degree} - ${data.school}`,
          points: [
            {
              id: `point-${Date.now()}-1`,
              content: useEnglish ? `School: ${data.school}` : `学校: ${data.school}`
            },
            {
              id: `point-${Date.now()}-2`,
              content: useEnglish ? `Major: ${data.major}` : `专业: ${data.major}`
            },
            {
              id: `point-${Date.now()}-3`,
              content: useEnglish ? `Duration: ${data.startDate} - ${data.endDate}` : `时间: ${data.startDate} - ${data.endDate}`
            }
          ]
        };
        
        addField(educationSection.id, newField);
        console.log("✅ 已添加教育经历:", newField);
      } else {
        console.error("❌ 未找到Education section");
      }
    } else if (action === 'add_work') {
      // 找到Work Experience section
      const workSection = sections.find(s => 
        s.title.toLowerCase().includes('work') || 
        s.title.toLowerCase().includes('experience') ||
        s.title.toLowerCase().includes('工作')
      );
      
      if (workSection) {
        // 创建新的工作经历field
        const newField = {
          id: `work-${Date.now()}`,
          name: `${data.position} - ${data.company}`,
          points: [
            {
              id: `point-${Date.now()}-1`,
              content: useEnglish ? `Company: ${data.company}` : `公司: ${data.company}`
            },
            {
              id: `point-${Date.now()}-2`,
              content: useEnglish ? `Position: ${data.position}` : `职位: ${data.position}`
            },
            {
              id: `point-${Date.now()}-3`,
              content: useEnglish ? `Duration: ${data.startDate} - ${data.endDate}` : `时间: ${data.startDate} - ${data.endDate}`
            },
            {
              id: `point-${Date.now()}-4`,
              content: data.description || (useEnglish ? "Job Description" : "工作描述")
            }
          ]
        };
        
        addField(workSection.id, newField);
        console.log("✅ 已添加工作经历:", newField);
      } else {
        console.error("❌ 未找到Work Experience section");
      }
    }
  };

  // 检查用户是否要求英文回复
  const shouldUseEnglish = () => {
    const lastUserMessage = messages.filter(m => m.role === "user").pop();
    return lastUserMessage?.content.includes("不要出现中文") || lastUserMessage?.content.includes("no Chinese");
  };

  // 检查是否是重写请求
  const isRewriteRequest = (message: string) => {
    const rewriteKeywords = ['re-write', 'rewrite', 'improve', 'optimize', '重写', '改进', '优化'];
    return rewriteKeywords.some(keyword => message.toLowerCase().includes(keyword.toLowerCase()));
  };

  // 处理AI的重写回复
  const handleRewriteResponse = (aiResponse: string) => {
    const lastUserMessage = messages.filter(m => m.role === "user").pop()?.content || "";
    console.log("🔍 检查重写请求:", lastUserMessage);
    console.log("🔍 是否有选中的point:", !!selectedPoint);
    console.log("🔍 是否是重写请求:", isRewriteRequest(lastUserMessage));
    
    if (selectedPoint && isRewriteRequest(lastUserMessage)) {
      // 提取AI回复中的重写内容（去掉可能的引号或格式）
      let rewrittenContent = aiResponse.trim();
      
      // 移除可能的markdown格式或引号
      rewrittenContent = rewrittenContent.replace(/^[-•]\s*/, ''); // 移除开头的bullet point
      rewrittenContent = rewrittenContent.replace(/^["']|["']$/g, ''); // 移除首尾引号
      
      // 保存原始内容和重写内容，显示确认对话框
      const { sectionId, fieldId, pointId } = selectedPoint;
      const section = sections.find((s) => s.id === sectionId);
      const field = section?.fields.find((f) => f.id === fieldId);
      const point = field?.points?.find((p) => p.id === pointId);
      
      if (point) {
        // 先保存原始内容用于撤销
        const originalContent = point.content;
        
        // 然后更新内容
        updatePoint(sectionId, fieldId, pointId, rewrittenContent);
        
        // 保存原始内容用于撤销
        setLastModifiedPoint({
          sectionId,
          fieldId,
          pointId,
          originalContent: originalContent
        });
        
        // 显示确认对话框
        setShowUndoPrompt(true);
        
        console.log("✅ 已更新point内容，等待用户确认:", rewrittenContent);
        console.log("📝 原始内容已保存:", originalContent);
      }
    }
  };

  // 用户确认保留AI生成的修改
  const handleConfirmKeep = () => {
    setShowUndoPrompt(false);
    setLastAddedFieldId(null); // 清除最后添加的field ID
    setLastModifiedPoint(null); // 清除最后修改的point信息
    const message = shouldUseEnglish() 
      ? "👍 AI-generated changes have been kept." 
      : "👍 已保留AI生成的修改。";
    setMessages((m) => [
      ...m,
      { role: "assistant", content: message },
    ]);
  };

  // 用户选择撤销AI生成的修改
  const handleUndoLastAction = () => {
    // 处理撤销添加的field
    if (lastAddedFieldId) {
      // 找到对应的sectionId
      let sectionIdToRemoveFrom: string | null = null;
      for (const section of sections) {
        if (section.fields.some(field => field.id === lastAddedFieldId)) {
          sectionIdToRemoveFrom = section.id;
          break;
        }
      }

      if (sectionIdToRemoveFrom) {
        removeField(sectionIdToRemoveFrom, lastAddedFieldId);
        const message = shouldUseEnglish()
          ? "↩️ AI-generated field has been removed."
          : "↩️ 已撤销AI生成的field。";
        setMessages((m) => [
          ...m,
          { role: "assistant", content: message },
        ]);
      }
    }
    
    // 处理撤销修改的point
    if (lastModifiedPoint) {
      const { sectionId, fieldId, pointId, originalContent } = lastModifiedPoint;
      updatePoint(sectionId, fieldId, pointId, originalContent);
      const message = shouldUseEnglish()
        ? "↩️ AI-generated changes have been undone."
        : "↩️ 已撤销AI生成的修改。";
      setMessages((m) => [
        ...m,
        { role: "assistant", content: message },
      ]);
    }
    
    setShowUndoPrompt(false);
    setLastAddedFieldId(null); // 清除最后添加的field ID
    setLastModifiedPoint(null); // 清除最后修改的point信息
  };

  const handleSend = async (msg: string) => {
    setMessages((m) => [...m, { role: "user", content: msg }]);
    setIsLoading(true);

    try {
      // 构建上下文信息
      let context = null;
      
      if (selectedPoint) {
        const { sectionId, fieldId, pointId } = selectedPoint;
        const section = sections.find((s) => s.id === sectionId);
        const field = section?.fields.find((f) => f.id === fieldId);
        const point = field?.points?.find((p) => p.id === pointId);
        
        if (point) {
          context = {
            type: "point",
            sectionTitle: section?.title,
            fieldName: field?.name,
            content: point.content
          };
        }
      } else if (selectedField) {
        const { sectionId, fieldId } = selectedField;
        const section = sections.find((s) => s.id === sectionId);
        const field = section?.fields.find((f) => f.id === fieldId);
        
        if (field) {
          context = {
            type: "field",
            sectionTitle: section?.title,
            fieldName: field.name,
            points: field.points?.map(p => p.content)
          };
        }
      } else if (selectedId) {
        const section = sections.find((s) => s.id === selectedId);
        if (section) {
          context = {
            type: "section",
            sectionTitle: section.title,
            fields: section.fields.map(f => ({
              name: f.name,
              points: f.points?.map(p => p.content)
            }))
          };
        }
      }

      console.log("📤 发送AI请求，上下文:", context);

      const res = await fetch("/api/aiChat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, context }),
      });

      const data = await res.json();
      
      if (data.success) {
        // 检查是否是结构化操作
        if (data.action && data.data) {
          await handleStructuredAction(data.action, data.data);
          setShowUndoPrompt(true); // 显示undo提示
          const useEnglish = shouldUseEnglish();
          const message = useEnglish
            ? `✅ AI has generated new ${data.action === 'add_education' ? 'education experience' : 'work experience'} based on your instructions. Please confirm whether to keep it.`
            : `✅ AI已根据您的指令生成了新的${data.action === 'add_education' ? '教育经历' : '工作经历'}。请确认是否保留。`;
          setMessages((m) => [
            ...m,
            { role: "assistant", content: message },
          ]);
        } else {
          setMessages((m) => [
            ...m,
            { role: "assistant", content: data.response },
          ]);
          
          // 检查是否是重写回复，如果是则自动更新选中的point并显示确认对话框
          handleRewriteResponse(data.response);
        }
      } else {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: `❌ 错误: ${data.error}` },
        ]);
      }
    } catch (err) {
      console.error("❌ AI聊天请求失败:", err);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "❌ 网络错误，请检查连接后重试" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside className="w-[460px] h-full flex flex-col bg-white border-l">
      {/* 顶部：所选 Section/Field/Point 编辑 */}
      <div className="p-4 border-b">
        <SelectionEditor />
      </div>

      {/* 中间：消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <ChatMessages 
          messages={messages} 
          showUndoPrompt={showUndoPrompt}
          onConfirmKeep={handleConfirmKeep}
          onUndoLastAction={handleUndoLastAction}
        />
      </div>

      {/* 底部：输入框 */}
      <div className="border-t p-3 bg-white">
        <ChatInput onSend={handleSend} isLoading={isLoading} />
      </div>
    </aside>
  );
}
