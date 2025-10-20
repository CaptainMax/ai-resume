import { NextResponse } from "next/server";
import { openai } from "../openai-client";
import JSON5 from "json5";

export async function POST(req: Request) {
  const { resumeText } = await req.json();

  if (!resumeText) {
    return NextResponse.json({ success: false, error: "Missing resume text" }, { status: 400 });
  }

  const systemPrompt = `
你是一名专业的简历解析助手。请将用户提供的简历文本转换为结构化 JSON。
不要输出任何多余的文字、Markdown 格式、注释或代码块，只能输出纯 JSON。

JSON 格式示例：
[
  {
    "section": "Header",
    "fields": [
      { "name": "Email", "points": ["max.jian.ma@gmail.com"] },
      { "name": "Phone No", "points": ["214-796-0666"] },
      { "name": "Web", "points": ["http://maxonboard.com"] }
    ]
  }
]
请直接输出 JSON，不要添加说明文字。
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: resumeText },
      ],
      temperature: 0.2,
    });

    let result = completion.choices[0].message.content || "";
    console.log("🧠 AI 原始返回结果:\n", result);

    // ✅ 彻底清理格式化字符
    result = result
      .replace(/^[^\[{]*/, "") // 去掉开头非 { 或 [
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .replace(/[\u200B-\u200D\uFEFF]/g, "") // 删除零宽字符
      .trim();

    // ✅ 优先提取 JSON 数组或对象体
    const jsonMatch = result.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (!jsonMatch) {
      console.error("❌ 未找到 JSON 结构:", result.slice(0, 200));
      return NextResponse.json({
        success: false,
        error: "AI 输出中未检测到 JSON 结构",
        raw: result,
      });
    }

    const cleanJson = jsonMatch[0];
    let parsedJSON: any;

    // 🧩 尝试多层容错解析
    try {
      parsedJSON = JSON.parse(cleanJson);
      console.log("✅ JSON.parse 成功");
    } catch (err1) {
      console.warn("⚠️ JSON.parse 失败，尝试 JSON5:", err1);
      try {
        parsedJSON = JSON5.parse(cleanJson);
        console.log("✅ JSON5.parse 成功");
      } catch (err2) {
        console.error("❌ JSON5 解析失败:", err2);
        return NextResponse.json({
          success: false,
          error: "AI 输出不是合法 JSON",
          raw: cleanJson,
        });
      }
    }

    // ✅ 格式统一函数（数组 or 对象 → 标准结构）
    function normalizeToSectionArray(data: any) {
      if (Array.isArray(data)) return data;

      const sections = [];
      for (const [section, content] of Object.entries(data)) {
        const fields = [];

        if (typeof content === "string") {
          fields.push({ name: section, points: [content] });
        } else if (typeof content === "object" && content !== null) {
          for (const [name, value] of Object.entries(content)) {
            if (Array.isArray(value)) {
              fields.push({ name, points: value });
            } else if (typeof value === "string") {
              fields.push({ name, points: [value] });
            } else if (typeof value === "object" && value !== null) {
              // 深层对象 flatten
              const innerPoints = Object.entries(value).map(
                ([k, v]) => `${k}: ${JSON.stringify(v)}`
              );
              fields.push({ name, points: innerPoints });
            }
          }
        }
        sections.push({ section, fields });
      }
      return sections;
    }

    const normalized = normalizeToSectionArray(parsedJSON);
    console.log("✅ 已统一为标准结构:", normalized);

    return NextResponse.json({ success: true, result: normalized });
  } catch (err) {
    console.error("❌ OpenAI 调用错误:", err);
    return NextResponse.json({ success: false, error: "AI 调用失败" }, { status: 500 });
  }
}
