import { NextResponse } from "next/server";
import { openai } from "../openai-client";
import JSON5 from "json5";

export async function POST(req: Request) {
  const { resumeText } = await req.json();
  
  console.log("📥 收到简历解析请求");
  console.log("📝 简历文本长度:", resumeText?.length || 0);
  console.log("📝 简历文本前200字符:", resumeText?.slice(0, 200) || "无内容");

  if (!resumeText) {
    return NextResponse.json({ success: false, error: "Missing resume text" }, { status: 400 });
  }

  const systemPrompt = `
你是一名专业的简历解析助手。请将用户提供的简历文本转换为结构化 JSON。

CRITICAL REQUIREMENTS:
1. 必须输出一个JSON数组，以 [ 开始，以 ] 结束
2. 只能输出纯 JSON，不要任何多余的文字、Markdown 格式、注释或代码块
3. 确保 JSON 格式完全正确，所有括号、引号、逗号都要匹配
4. 所有字符串必须用双引号包围
5. 数组和对象必须正确闭合
6. 不要有尾随逗号

REQUIRED JSON FORMAT (MUST BE AN ARRAY):
[
  {
    "section": "Header",
    "fields": [
      { "name": "Email", "points": ["max.jian.ma@gmail.com"] },
      { "name": "Phone No", "points": ["214-796-0666"] },
      { "name": "Web", "points": ["http://maxonboard.com"] }
    ]
  },
  {
    "section": "Education",
    "fields": [
      { 
        "name": "University Name", 
        "points": ["Location", "Date Range", "Degree"] 
      }
    ]
  }
]

IMPORTANT: 输出必须以 [ 开始，以 ] 结束。不要输出单个对象，必须是数组格式。
请直接输出 JSON 数组，不要添加任何说明文字。
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: resumeText },
      ],
      temperature: 0.1, // 降低随机性
      max_tokens: 4000, // 确保有足够token
      top_p: 0.9, // 增加确定性
    });

    let result = completion.choices[0].message.content || "";
    console.log("🧠 AI 原始返回结果:\n", result);

    // ✅ 改进的清理逻辑
    console.log("🔍 清理前的result:", result.slice(0, 100));
    
    // 先移除markdown代码块标记和零宽字符
    result = result
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .replace(/[\u200B-\u200D\uFEFF]/g, "") // 删除零宽字符
      .trim();
    
    // 移除开头非JSON字符（但保留JSON结构）
    result = result.replace(/^[^\[{]*/, "").trim();
    
    console.log("🔍 清理后的result:", result.slice(0, 100));

    // ✅ 改进的 JSON 提取逻辑
    let cleanJson = "";
    
    // 尝试多种提取策略
    const strategies = [
      // 策略1: 处理多个 JSON 对象/数组的情况（优先处理）
      () => {
        console.log("🔍 策略1: 尝试多结构检测");
        
        // 首先检查是否已经是完整的JSON数组
        const trimmedResult = result.trim();
        if (trimmedResult.startsWith('[') && trimmedResult.endsWith(']')) {
          // 验证数组是否完整
          let bracketCount = 0;
          let inString = false;
          let escaped = false;
          
          for (let i = 0; i < trimmedResult.length; i++) {
            const char = trimmedResult[i];
            if (escaped) {
              escaped = false;
              continue;
            }
            if (char === '\\') {
              escaped = true;
              continue;
            }
            if (char === '"' && !escaped) {
              inString = !inString;
              continue;
            }
            if (!inString) {
              if (char === '[') bracketCount++;
              if (char === ']') bracketCount--;
            }
          }
          
          if (bracketCount === 0) {
            console.log("🔍 策略1: 发现完整JSON数组");
            return trimmedResult;
          }
        }
        
        // 如果包含多个 JSON 结构，尝试将它们合并为一个数组
        const jsonStructures = [];
        
        // 查找所有完整的 JSON 结构
        let currentPos = 0;
        while (currentPos < result.length) {
          const remaining = result.slice(currentPos);
          
          // 查找下一个 JSON 结构的开始
          const nextBracket = remaining.search(/[\[\{]/);
          if (nextBracket === -1) break;
          
          const startPos = currentPos + nextBracket;
          const startChar = result[startPos];
          const endChar = startChar === '[' ? ']' : '}';
          
          // 找到匹配的结束字符
          let depth = 0;
          let inString = false;
          let escaped = false;
          let endPos = -1;
          
          for (let i = startPos; i < result.length; i++) {
            const char = result[i];
            if (escaped) {
              escaped = false;
              continue;
            }
            if (char === '\\') {
              escaped = true;
              continue;
            }
            if (char === '"' && !escaped) {
              inString = !inString;
              continue;
            }
            if (!inString) {
              if (char === startChar) depth++;
              if (char === endChar) depth--;
              if (depth === 0) {
                endPos = i;
                break;
              }
            }
          }
          
          if (endPos !== -1) {
            const jsonStr = result.slice(startPos, endPos + 1);
            jsonStructures.push(jsonStr);
            console.log(`🔍 找到结构 ${jsonStructures.length}:`, jsonStr.slice(0, 50) + "...");
            currentPos = endPos + 1;
          } else {
            break;
          }
        }
        
        console.log(`🔍 总共找到 ${jsonStructures.length} 个结构`);
        
        // 如果有多个结构，将它们合并为一个数组
        if (jsonStructures.length > 1) {
          const merged = '[' + jsonStructures.join(',') + ']';
          console.log("🔍 合并为数组:", merged.slice(0, 100) + "...");
          return merged;
        } else if (jsonStructures.length === 1) {
          console.log("🔍 返回单个结构");
          return jsonStructures[0];
        }
        
        console.log("🔍 策略1: 未找到有效结构");
        return null;
      },
      
      // 策略2: 寻找完整的 JSON 数组
      () => {
        const arrayMatch = result.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          const jsonStr = arrayMatch[0];
          // 验证括号是否匹配
          let bracketCount = 0;
          let inString = false;
          let escaped = false;
          
          for (let i = 0; i < jsonStr.length; i++) {
            const char = jsonStr[i];
            if (escaped) {
              escaped = false;
              continue;
            }
            if (char === '\\') {
              escaped = true;
              continue;
            }
            if (char === '"' && !escaped) {
              inString = !inString;
              continue;
            }
            if (!inString) {
              if (char === '[') bracketCount++;
              if (char === ']') bracketCount--;
            }
          }
          
          if (bracketCount === 0) {
            return jsonStr;
          }
        }
        return null;
      },
      
      // 策略3: 寻找完整的 JSON 对象
      () => {
        const objectMatch = result.match(/\{[\s\S]*\}/);
        if (objectMatch) {
          const jsonStr = objectMatch[0];
          // 验证大括号是否匹配
          let braceCount = 0;
          let inString = false;
          let escaped = false;
          
          for (let i = 0; i < jsonStr.length; i++) {
            const char = jsonStr[i];
            if (escaped) {
              escaped = false;
              continue;
            }
            if (char === '\\') {
              escaped = true;
              continue;
            }
            if (char === '"' && !escaped) {
              inString = !inString;
              continue;
            }
            if (!inString) {
              if (char === '{') braceCount++;
              if (char === '}') braceCount--;
            }
          }
          
          if (braceCount === 0) {
            return jsonStr;
          }
        }
        return null;
      },
      
      // 策略4: 尝试修复常见的 JSON 错误
      () => {
        // 修复未闭合的数组和对象
        let fixedJson = result;
        
        // 计算括号匹配
        let bracketCount = 0;
        let braceCount = 0;
        let inString = false;
        let escaped = false;
        
        for (let i = 0; i < fixedJson.length; i++) {
          const char = fixedJson[i];
          if (escaped) {
            escaped = false;
            continue;
          }
          if (char === '\\') {
            escaped = true;
            continue;
          }
          if (char === '"' && !escaped) {
            inString = !inString;
            continue;
          }
          if (!inString) {
            if (char === '[') bracketCount++;
            if (char === ']') bracketCount--;
            if (char === '{') braceCount++;
            if (char === '}') braceCount--;
          }
        }
        
        // 添加缺失的闭合括号
        if (bracketCount > 0) {
          fixedJson += ']'.repeat(bracketCount);
        }
        if (braceCount > 0) {
          fixedJson += '}'.repeat(braceCount);
        }
        
        return fixedJson;
      }
    ];
    
    // 尝试每种策略
    for (let i = 0; i < strategies.length; i++) {
      const extracted = strategies[i]();
      if (extracted) {
        cleanJson = extracted;
        console.log(`✅ 策略 ${i + 1} 成功提取 JSON`);
        break;
      }
    }
    
    if (!cleanJson) {
      console.error("❌ 未找到有效的 JSON 结构:", result.slice(0, 200));
      return NextResponse.json({
        success: false,
        error: "AI 输出中未检测到有效的 JSON 结构",
        raw: result,
      });
    }
    let parsedJSON: any;

    // 🧩 尝试多层容错解析
    console.log("🔍 尝试解析 JSON:", cleanJson.slice(0, 200) + "...");
    
    try {
      parsedJSON = JSON.parse(cleanJson);
      console.log("✅ JSON.parse 成功");
    } catch (err1) {
      console.warn("⚠️ JSON.parse 失败，尝试 JSON5:", err1);
      console.log("🔍 问题 JSON 内容:", cleanJson);
      
      try {
        parsedJSON = JSON5.parse(cleanJson);
        console.log("✅ JSON5.parse 成功");
      } catch (err2) {
        console.error("❌ JSON5 解析失败:", err2);
        console.log("🔍 最终失败的 JSON:", cleanJson);
        
        // 尝试最后的修复策略
        try {
          // 移除可能的尾随逗号
          let finalJson = cleanJson.replace(/,(\s*[}\]])/g, '$1');
          // 尝试再次解析
          parsedJSON = JSON5.parse(finalJson);
          console.log("✅ 修复后 JSON5.parse 成功");
        } catch (err3) {
          console.error("❌ 最终解析失败:", err3);
          return NextResponse.json({
            success: false,
            error: "AI 输出不是合法 JSON，已尝试多种解析策略",
            details: {
              jsonParseError: err1 instanceof Error ? err1.message : String(err1),
              json5ParseError: err2 instanceof Error ? err2.message : String(err2),
              finalError: err3 instanceof Error ? err3.message : String(err3)
            },
            raw: cleanJson,
          });
        }
      }
    }

    // ✅ 格式统一函数（数组 or 对象 → 标准结构）
    function normalizeToSectionArray(data: any) {
      if (Array.isArray(data)) {
        // 如果已经是数组，转换为标准格式
        return data.map((item, index) => {
          const sectionId = `section-${index}`;
          const fields = (item.fields || []).map((field: any, fieldIndex: number) => {
            const fieldId = `field-${index}-${fieldIndex}`;
            const points = (field.points || []).map((point: any, pointIndex: number) => ({
              id: `point-${index}-${fieldIndex}-${pointIndex}`,
              content: typeof point === 'string' ? point : JSON.stringify(point)
            }));
            
            return {
              id: fieldId,
              name: field.name || `Field ${fieldIndex + 1}`,
              points: points
            };
          });
          
          return {
            id: sectionId,
            title: item.section || `Section ${index + 1}`,
            fields: fields
          };
        });
      }

      // 如果是对象，转换为数组格式
      const sections = [];
      for (const [section, content] of Object.entries(data)) {
        const fields = [];

        if (typeof content === "string") {
          fields.push({ 
            id: `field-${section}-0`,
            name: section, 
            points: [{ id: `point-${section}-0`, content }] 
          });
        } else if (typeof content === "object" && content !== null) {
          for (const [name, value] of Object.entries(content)) {
            if (Array.isArray(value)) {
              const points = value.map((point, index) => ({
                id: `point-${section}-${name}-${index}`,
                content: typeof point === 'string' ? point : JSON.stringify(point)
              }));
              fields.push({ 
                id: `field-${section}-${name}`,
                name, 
                points 
              });
            } else if (typeof value === "string") {
              fields.push({ 
                id: `field-${section}-${name}`,
                name, 
                points: [{ id: `point-${section}-${name}-0`, content: value }] 
              });
            } else if (typeof value === "object" && value !== null) {
              // 深层对象 flatten
              const innerPoints = Object.entries(value).map(
                ([k, v], index) => ({
                  id: `point-${section}-${name}-${index}`,
                  content: `${k}: ${JSON.stringify(v)}`
                })
              );
              fields.push({ 
                id: `field-${section}-${name}`,
                name, 
                points: innerPoints 
              });
            }
          }
        }
        sections.push({ 
          id: `section-${section}`,
          title: section, 
          fields 
        });
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
