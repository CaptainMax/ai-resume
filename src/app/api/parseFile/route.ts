import { NextResponse } from "next/server";
import mammoth from "mammoth";

// ✅ 允许 FormData 文件上传
export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let text = "";

  // ✅ 动态导入 pdf-parse（TypeScript 不会报错）
  if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
    try {
      const pdfParseModule: any = await import("pdf-parse");
      const pdfParse = pdfParseModule.default || pdfParseModule;
      
      // 检查是否是函数
      if (typeof pdfParse === 'function') {
        const parsed = await pdfParse(buffer);
        text = parsed.text;
      } else {
        console.error('pdfParse is not a function:', typeof pdfParse);
        return NextResponse.json(
          { error: "PDF parsing failed: pdfParse is not a function" },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error('PDF parsing error:', error);
      return NextResponse.json(
        { error: "PDF parsing failed: " + (error instanceof Error ? error.message : String(error)) },
        { status: 500 }
      );
    }
  }

  // ✅ Word 文件解析
  else if (
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.name.endsWith(".docx")
  ) {
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  }

  // ❌ 其他文件类型
  else {
    return NextResponse.json(
      { error: "Unsupported file type. Please upload PDF or Word file." },
      { status: 400 }
    );
  }

  // 只清理多余的空格，但保留换行符结构
  const cleaned = text
    .replace(/\r\n/g, '\n')  // 标准化换行符
    .replace(/\r/g, '\n')    // 标准化换行符
    .replace(/[ \t]+/g, ' ') // 只压缩空格和制表符
    .replace(/\n\s*\n/g, '\n') // 移除多余空行
    .trim();
  
  return NextResponse.json({ text: cleaned });
}
