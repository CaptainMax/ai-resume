import { NextResponse } from "next/server";
import { openai } from "../openai-client";
import JSON5 from "json5";
import { LearningSystem } from "../../agents/learningSystem";
import { ConfidenceEvolution } from "../../agents/confidenceEvolution";
import { buildParserPrompt } from "@/prompts/parser";

// 合并Work Experience sections的函数
function mergeWorkExperienceSections(sections: any[]): any[] {
  // 找到所有Work Experience sections
  const workExperienceSections = sections.filter(section => 
    section.title.toLowerCase().includes('work') || 
    section.title.toLowerCase().includes('experience') ||
    section.title.toLowerCase().includes('employment')
  );

  if (workExperienceSections.length <= 1) {
    return sections; // 不需要合并
  }

  // 创建合并后的Work Experience section
  const mergedSection = {
    id: `section-${Date.now()}`,
    title: 'Work Experience',
    fields: [] as any[]
  };

  // 收集所有fields
  workExperienceSections.forEach(section => {
    if (section.fields) {
      section.fields.forEach((field: any) => {
        // 为每个field添加唯一ID
        const mergedField = {
          ...field,
          id: field.id || `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
        mergedSection.fields.push(mergedField);
      });
    }
  });

  // 移除原来的Work Experience sections，添加合并后的section
  const otherSections = sections.filter(section => 
    !section.title.toLowerCase().includes('work') && 
    !section.title.toLowerCase().includes('experience') &&
    !section.title.toLowerCase().includes('employment')
  );

  return [...otherSections, mergedSection];
}

export async function POST(req: Request) {
  const { resumeText } = await req.json();
  
  console.log("📥 收到简历解析请求");
  console.log("📝 简历文本长度:", resumeText?.length || 0);
  console.log("📝 简历文本前200字符:", resumeText?.slice(0, 200) || "无内容");

  if (!resumeText) {
    return NextResponse.json({ success: false, error: "Missing resume text" }, { status: 400 });
  }

  // 🚀 AI-First 解析：使用模块化Prompt系统
  console.log("🤖 使用模块化AI进行智能解析...");
  
  // 初始化学习系统和置信度进化（简化版以提升性能）
  // const learningSystem = new LearningSystem();
  // const confidenceEvolution = new ConfidenceEvolution();
  
  // 🧱 使用模块化Prompt构建器（不包含Few-shot示例以提升性能）
  const systemPrompt = buildParserPrompt({ includeExamples: false });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // 使用更快的模型
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: resumeText },
      ],
      temperature: 0.1,
      max_tokens: 6000, // 减少token数量
    });

    const response = completion.choices[0].message.content || "";
    console.log("🤖 ChatGPT原始响应长度:", response.length);
    console.log("🤖 ChatGPT响应前200字符:", response.slice(0, 200));

    // 清理和提取JSON
    let cleanJson = response.trim();
    
    // 移除markdown代码块标记
    cleanJson = cleanJson.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // 移除零宽度字符
    cleanJson = cleanJson.replace(/[\u200B-\u200D\uFEFF]/g, '');
    
    // 移除开头的非JSON字符
    cleanJson = cleanJson.replace(/^[^\[{]*/, "").trim();
    
    console.log("🧹 清理后的JSON长度:", cleanJson.length);
    console.log("🧹 清理后的JSON前200字符:", cleanJson.slice(0, 200));

    // 尝试多种解析策略
    let result = null;
    let parseError = null;

    // 策略1: 直接解析
    try {
      result = JSON.parse(cleanJson);
      console.log("✅ 策略1成功: 直接JSON解析");
    } catch (err1) {
      console.log("❌ 策略1失败:", err1 instanceof Error ? err1.message : String(err1));
      parseError = err1;

      // 策略2: 使用JSON5解析
      try {
        result = JSON5.parse(cleanJson);
        console.log("✅ 策略2成功: JSON5解析");
      } catch (err2) {
        console.log("❌ 策略2失败:", err2 instanceof Error ? err2.message : String(err2));
        parseError = err2;

        // 策略3: 尝试修复常见的JSON问题
        try {
          let fixedJson = cleanJson;
          
          // 修复尾随逗号
          fixedJson = fixedJson.replace(/,(\s*[}\]])/g, '$1');
          
          // 修复未闭合的括号
          const openBraces = (fixedJson.match(/\{/g) || []).length;
          const closeBraces = (fixedJson.match(/\}/g) || []).length;
          const openBrackets = (fixedJson.match(/\[/g) || []).length;
          const closeBrackets = (fixedJson.match(/\]/g) || []).length;
          
          if (openBraces > closeBraces) {
            fixedJson += '}'.repeat(openBraces - closeBraces);
          }
          if (openBrackets > closeBrackets) {
            fixedJson += ']'.repeat(openBrackets - closeBrackets);
          }
          
          result = JSON.parse(fixedJson);
          console.log("✅ 策略3成功: 修复后解析");
        } catch (err3) {
          console.log("❌ 策略3失败:", err3 instanceof Error ? err3.message : String(err3));
          parseError = err3;
        }
      }
    }

    if (result) {
      // 🧠 应用学习系统优化（暂时禁用以提升性能）
      console.log("🔧 跳过学习系统优化以提升性能...");
      const optimizedResult = result; // 直接使用原始结果
      
      // 格式统一函数（数组 or 对象 → 标准结构）
      function normalizeToSectionArray(data: any) {
        if (Array.isArray(data)) {
          // 如果已经是数组，转换为标准格式
          return data.map((item, index) => {
            const sectionId = `section-${index}`;
            const fields = (item.fields || []).map((field: any, fieldIndex: number) => {
              const fieldId = `field-${index}-${fieldIndex}`;
              const points = (field.points || []).map((point: any, pointIndex: number) => {
                let content = '';
                if (typeof point === 'string') {
                  content = point;
                } else if (typeof point === 'object' && point !== null) {
                  console.log('🔍 处理复杂point对象:', point);
                  
                  // 尝试提取有意义的内容
                  if (point.description) {
                    content = point.description;
                  } else if (point.content) {
                    content = point.content;
                  } else if (point.responsibilities && Array.isArray(point.responsibilities)) {
                    content = point.responsibilities.join('; ');
                  } else if (point.company && point.date_range) {
                    content = `${point.company} - ${point.date_range}`;
                  } else {
                    // 更宽松的降级处理：显示所有可用的键值对
                    const keyInfo = [];
                    for (const [key, value] of Object.entries(point)) {
                      if (typeof value === 'string' && value.trim()) {
                        keyInfo.push(`${key}: ${value}`);
                      } else if (Array.isArray(value) && value.length > 0) {
                        keyInfo.push(`${key}: ${value.join(', ')}`);
                      }
                    }
                    content = keyInfo.length > 0 ? keyInfo.join(' | ') : JSON.stringify(point);
                  }
                }
                
                console.log('📝 最终content:', content);
                return {
                  id: `point-${index}-${fieldIndex}-${pointIndex}`,
                  content: content || 'No content'
                };
              });
              
              // 🎯 特殊处理：如果字段名是 "Company Name" 或 "University Name" 且有实际值，用实际值替换字段名
              let fieldName = field.name || 'Unnamed Field';
              if (fieldName === 'Company Name' && field.value) {
                fieldName = field.value; // 用实际公司名替换默认字段名
              } else if (fieldName === 'University Name' && field.value) {
                fieldName = field.value; // 用实际大学名替换默认字段名
              }
              
              return {
                id: fieldId,
                name: fieldName,
                value: field.value || null, // 🎯 保留value字段
                points: points
              };
            });
            
            return {
              id: sectionId,
              title: item.section || item.title || 'Unnamed Section',
              fields: fields
            };
          });
        } else if (data && typeof data === 'object') {
          // 如果是单个对象，包装成数组
          return [{
            id: 'section-0',
            title: data.section || data.title || 'Main Section',
            fields: (data.fields || []).map((field: any, fieldIndex: number) => {
              // 🎯 特殊处理：如果字段名是 "Company Name" 或 "University Name" 且有实际值，用实际值替换字段名
              let fieldName = field.name || 'Unnamed Field';
              if (fieldName === 'Company Name' && field.value) {
                fieldName = field.value; // 用实际公司名替换默认字段名
              } else if (fieldName === 'University Name' && field.value) {
                fieldName = field.value; // 用实际大学名替换默认字段名
              }
              
              return {
                id: `field-0-${fieldIndex}`,
                name: fieldName,
                value: field.value || null, // 🎯 保留value字段
                points: (field.points || []).map((point: any, pointIndex: number) => ({
                  id: `point-0-${fieldIndex}-${pointIndex}`,
                  content: typeof point === 'string' ? point : JSON.stringify(point)
                }))
              };
            })
          }];
        } else {
          // 如果数据格式不符合预期，返回空数组
          console.log('⚠️ 数据格式不符合预期:', typeof data, data);
          return [];
        }
      }

      const normalizedData = normalizeToSectionArray(optimizedResult);
      console.log("📊 标准化后的数据结构:", normalizedData.length, "个sections");
      
      // 🔄 合并Work Experience sections
      const mergedData = mergeWorkExperienceSections(normalizedData);
      console.log("🔄 合并Work Experience后:", mergedData.length, "个sections");
      
      // 🎯 计算动态置信度（简化版以提升性能）
      const confidenceMetrics = {
        baseConfidence: 0.7,
        userAccuracy: 0.8,
        feedbackQuality: 0.7,
        patternMatch: 0.8,
        historicalPerformance: 0,
        finalConfidence: 0.7
      };
      
      console.log("🎯 使用简化置信度计算:", confidenceMetrics);
      
      return NextResponse.json({ 
        success: true, 
        data: mergedData,
        source: 'AI-Parser-with-Learning',
        confidence: {
          base: confidenceMetrics.baseConfidence,
          final: confidenceMetrics.finalConfidence,
          userAccuracy: confidenceMetrics.userAccuracy,
          feedbackQuality: confidenceMetrics.feedbackQuality,
          patternMatch: confidenceMetrics.patternMatch,
          historicalPerformance: confidenceMetrics.historicalPerformance
        }
      });
    } else {
      console.error("❌ 所有解析策略都失败了");
      return NextResponse.json({
        success: false,
        error: "AI 输出不是合法 JSON，已尝试多种解析策略",
        details: {
          jsonParseError: parseError instanceof Error ? parseError.message : String(parseError),
        },
        raw: cleanJson,
      });
    }
  } catch (error) {
    console.error("❌ ChatGPT API调用失败:", error);
    return NextResponse.json({ 
      success: false, 
      error: "AI服务暂时不可用，请稍后重试" 
    }, { status: 500 });
  }
}