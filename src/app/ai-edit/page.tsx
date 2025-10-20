"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import SectionList from "../components/section/SectionList";
import ResumePreview from "../components/resumePreview/ResumePreview";
import { AiPanel } from "../components/aiPanel";
import { useResumeStore } from "../store/useResumeStore";

export default function AiEditPage() {
  const [loading, setLoading] = useState(true);
  const { setSections } = useResumeStore();

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

        let parsedData = [];

        try {
          // ✅ 如果 result 已经是数组（后端已 JSON.parse）
          if (Array.isArray(data.result)) {
            parsedData = data.result;
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
          } else {
            throw new Error("AI 输出为空或格式异常");
          }

          console.log("✅ 最终解析结果:", parsedData);
        } catch (err) {
          console.error("⚠️ AI 输出不是标准 JSON:", err);
          alert("AI 解析失败：AI 输出不是合法 JSON");
          parsedData = [];
        }

        // ✅ 存入全局 store
        setSections(parsedData);
        setLoading(false);

        // ✅ 提示成功
        alert("✅ 简历解析成功！");
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
        <ResumePreview />
        <AiPanel />
      </div>
    </div>
  );
}
