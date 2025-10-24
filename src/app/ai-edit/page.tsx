"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import SectionList from "../components/section/SectionList";
import ResumePreview from "../components/resumePreview/ResumePreview";
import { AiPanel } from "../components/aiPanel";
import { useResumeStore } from "../store/useResumeStore";
import { useFeedbackCollection } from "../components/aiPanel/hooks/useFeedbackCollection";

export default function AiEditPage() {
  const [loading, setLoading] = useState(true);
  const { setSections } = useResumeStore();
  const { recordOriginalData } = useFeedbackCollection();

  useEffect(() => {
    const resumeText = localStorage.getItem("resumeText");

    if (!resumeText) {
      alert("请先上传简历文件！");
      window.location.href = "/";
      return;
    }

    const parseResume = async () => {
      try {
        console.log("📤 正在调用 /api/parseResume ...");
        console.log("📝 发送的简历文本长度:", resumeText.length);
        console.log("📝 简历文本前200字符:", resumeText.slice(0, 200));

        const res = await fetch("/api/parseResume?" + Date.now(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeText }),
        });

        const data = await res.json();
        console.log("🧠 AI 原始响应:", data);

        // ⚠️ 检查是否返回错误
        if (!data.success) {
          alert("AI 解析失败：" + (data.error || "未知错误"));
          setLoading(false);
          return;
        }

        // 🎯 显示解析来源信息
        const parseSource = data.source || 'Unknown';
        const confidence = data.data?.metadata?.confidence || 'N/A';
        console.log(`📊 解析来源: ${parseSource}, 置信度: ${confidence}`);
        
        // 在控制台显示解析信息
        if (parseSource === 'ParseResumeAgent') {
          console.log('🚀 使用了快速规则解析');
        } else if (parseSource === 'ChatGPT') {
          console.log('🤖 使用了AI智能解析');
        }

        let parsedData = [];

        try {
          // ✅ 新API返回的是 data.data (直接是数组)
          if (data.data && Array.isArray(data.data)) {
            parsedData = data.data;
            console.log("✅ 使用新API格式，解析到", parsedData.length, "个sections");
          }
          // ✅ 兼容旧格式：如果 result 已经是数组（后端已 JSON.parse）
          else if (Array.isArray(data.result)) {
            parsedData = data.result;
            console.log("✅ 使用旧API格式，解析到", parsedData.length, "个sections");
          }
          // ✅ 如果是字符串形式的 JSON（容错）
          else if (typeof data.result === "string") {
            let content = data.result.trim();

            // 移除 markdown 包裹符号（例如 ```json）
            if (content.startsWith("```")) {
              content = content
                .replace(/^```[a-zA-Z]*\n?/, "")
                .replace(/```$/, "")
                .trim();
            }

            parsedData = JSON.parse(content);
            console.log("✅ 解析字符串JSON，解析到", parsedData.length, "个sections");
          } else {
            console.error("❌ 数据格式异常:", data);
            throw new Error("AI 输出为空或格式异常");
          }

          console.log("✅ 最终解析结果:", parsedData);
        } catch (err) {
          console.error("⚠️ 数据解析失败:", err);
          console.error("⚠️ 原始数据:", data);
          alert("AI 解析失败：数据格式异常");
          parsedData = [];
        }

        // ✅ 存入全局 store
        setSections(parsedData);
        
        // 🧠 记录原始数据用于反馈收集
        recordOriginalData(resumeText, parsedData);
        
        setLoading(false);
      } catch (err) {
        console.error("❌ 调用 /api/parseResume 出错:", err);
        alert("AI 解析失败，请检查网络或后端日志。");
        setLoading(false);
      }
    };

    parseResume();
  }, [setSections]);

  // 🕐 加载中状态
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-gray-600">
        <p className="text-lg font-medium">正在调用 AI 解析简历，请稍候...</p>
        <div className="mt-4 animate-spin h-8 w-8 border-4 border-blue-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  // ✅ 页面主结构
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <SectionList />
        <div className="flex-1 min-w-0 overflow-hidden">
          <ResumePreview />
        </div>
        <div className="flex-[0.4] min-w-0">
          <AiPanel />
        </div>
      </div>
    </div>
  );
}
