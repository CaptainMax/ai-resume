"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // 📂 选择文件
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setSuccess(false);
    }
  };

  // 🚀 上传并解析文件
  const handleUpload = async () => {
    if (!file) {
      alert("请先选择文件！");
      return;
    }

    setLoading(true);
    console.log("上传的文件:", file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // 🔥 调用后端解析 API
      const res = await fetch("/api/parseFile", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.error) {
        alert("解析失败：" + data.error);
        setLoading(false);
        return;
      }

      // ✅ 保存提取的文本到 localStorage
      localStorage.setItem("resumeText", data.text);

      setSuccess(true);
      setLoading(false);

      // ✅ 1.5 秒后跳转到 /ai-edit 页面
      setTimeout(() => {
        router.push("/ai-edit");
      }, 1500);
    } catch (err) {
      console.error(err);
      alert("上传失败，请重试。");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">上传简历文件</h1>

        {/* 上传区域 */}
        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition">
          <span className="text-gray-500">
            拖拽文件到这里，或点击选择
          </span>
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {/* 文件名 */}
        {file && <p className="mt-3 text-gray-700">已选择: {file.name}</p>}

        {/* 上传按钮 */}
        <button
          onClick={handleUpload}
          disabled={loading}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400"
        >
          {loading ? "正在解析中..." : "上传并解析"}
        </button>

        {/* 上传成功提示 */}
        {success && (
          <div className="mt-4 p-3 text-green-700 bg-green-100 border border-green-300 rounded">
            ✅ 文件已成功上传并解析: {file?.name}，即将跳转...
          </div>
        )}
      </div>
    </div>
  );
}
