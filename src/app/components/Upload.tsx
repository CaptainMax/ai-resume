"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setSuccess(false);
    }
  };

  const handleUpload = () => {
    if (!file) {
      alert("请先选择文件！");
      return;
    }

    console.log("上传的文件:", file.name);

    // 模拟上传成功
    setSuccess(true);

    // 1 秒后跳转到 ai-edit 页面
    setTimeout(() => {
      router.push("/ai-edit");
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">上传简历文件</h1>

        {/* 上传区域 */}
        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition">
          <span className="text-gray-500">拖拽文件到这里，或点击选择</span>
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {/* 文件名 */}
        {file && (
          <p className="mt-3 text-gray-700">已选择: {file.name}</p>
        )}

        {/* 上传按钮 */}
        <button
          onClick={handleUpload}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          上传
        </button>

        {/* 上传成功提示 */}
        {success && (
          <div className="mt-4 p-3 text-green-700 bg-green-100 border border-green-300 rounded">
            ✅ 文件已成功上传: {file?.name}，即将跳转...
          </div>
        )}
      </div>
    </div>
  );
}
