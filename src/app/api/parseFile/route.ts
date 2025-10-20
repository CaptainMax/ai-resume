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
    const pdfParseModule: any = await import("pdf-parse"); // 👈 关键改动
    const pdfParse = pdfParseModule.default || pdfParseModule; // ✅ 通吃两种导出形式
    const parsed = await pdfParse(buffer);
    text = parsed.text;
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

  const cleaned = text.replace(/\s+/g, " ").trim();
  return NextResponse.json({ text: cleaned });
}
