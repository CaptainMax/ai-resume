import { NextResponse } from "next/server";
import mammoth from "mammoth";
const pdfParse = require("pdf-parse");

export const runtime = "nodejs";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let text = "";

  if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
    try {
      const data = await pdfParse(buffer);
      text = data.text;
      console.log("✅ PDF parsed successfully, text length:", text.length);
    } catch (error) {
      console.error("❌ PDF parse failed:", error);
      return NextResponse.json(
        { error: "PDF parsing failed: " + (error as Error).message },
        { status: 500 }
      );
    }
  } else if (
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.name.endsWith(".docx")
  ) {
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  } else {
    return NextResponse.json(
      { error: "Unsupported file type. Please upload PDF or Word file." },
      { status: 400 }
    );
  }

  const cleaned = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
  
  return NextResponse.json({ text: cleaned });
}