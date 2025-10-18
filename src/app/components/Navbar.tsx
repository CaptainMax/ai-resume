"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between px-8 py-4 bg-white shadow-md">
      {/* 左边 - Logo */}
      <div className="text-xl font-bold text-blue-600 cursor-pointer">
        aiResume
      </div>

      {/* 中间 - 导航菜单 */}
      <div className="flex space-x-8">
        <Link href="/" className="text-gray-700 hover:text-blue-600">
          Home
        </Link>
        <Link href="/ai-edit" className="text-gray-700 hover:text-blue-600">
          AiEdit
        </Link>
        <Link href="/about-us" className="text-gray-700 hover:text-blue-600">
          About Us
        </Link>
      </div>

      {/* 右边 - 预留区域 */}
      <div className="text-gray-500">{/* Download 按钮以后加这里 */}</div>
    </nav>
  );
}
