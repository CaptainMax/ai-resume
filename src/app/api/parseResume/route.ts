import { NextResponse } from "next/server";
import { openai } from "../openai-client";
import JSON5 from "json5";
import { LearningSystem } from "../../agents/learningSystem";
import { ConfidenceEvolution } from "../../agents/confidenceEvolution";

export async function POST(req: Request) {
  const { resumeText } = await req.json();
  
  console.log("📥 收到简历解析请求");
  console.log("📝 简历文本长度:", resumeText?.length || 0);
  console.log("📝 简历文本前200字符:", resumeText?.slice(0, 200) || "无内容");

  if (!resumeText) {
    return NextResponse.json({ success: false, error: "Missing resume text" }, { status: 400 });
  }

  // 🚀 AI-First 解析：直接使用ChatGPT进行智能解析
  console.log("🤖 使用AI进行智能解析...");
  
  // 初始化学习系统和置信度进化
  const learningSystem = new LearningSystem();
  const confidenceEvolution = new ConfidenceEvolution();
  
  const systemPrompt = `
    你是一名专业的简历解析专家，具备深度语义理解能力。请将用户提供的简历文本转换为结构化 JSON。

    🧠 核心能力要求：
    - 深度语义理解：理解每个内容的真实含义和上下文
    - 智能分类：准确识别内容应该归属的section
    - 结构分析：理解简历的整体层次结构
    - 行业感知：考虑不同行业的表达习惯

    📋 解析要求：
    1. 必须输出一个JSON数组，以 [ 开始，以 ] 结束
    2. 只能输出纯 JSON，不要任何多余的文字、Markdown 格式、注释或代码块
    3. 确保 JSON 格式完全正确，所有括号、引号、逗号都要匹配
    4. 所有字符串必须用双引号包围
    5. 数组和对象必须正确闭合
    6. 不要有尾随逗号

    IMPORTANT PARSING RULES:
    - 仔细阅读整个简历，不要遗漏任何信息
    - 必须提取所有部分：Header, Work Experience, Education, Technical Skills, Projects, Certifications等
    - 对于工作经历，每个工作都要完整提取，包括公司名称、职位、时间、地点、描述、职责等
    - 公司名称要放在field的value字段中，不要放在points中
    - 对于每个职责点，都要单独作为一个point
    - 不要合并或简化内容，保持原始信息的完整性
    - 如果有多段工作经历，每段都要单独处理
    - 确保提取所有技能、教育背景、项目经验等
    - 工作经历格式：Company Name的value字段放公司全名，points放其他详细信息
    - 确保公司名称完整提取，不要截断或遗漏
    - 每个工作经历都要有独立的Company Name field，value字段包含完整公司名称
    - 重要：Company Name字段必须有value属性，包含完整的公司名称
    
    🎯 工作经历解析特别规则：
    - 当遇到 "Apple (Apple Online Store - Onsite-Vendor)" 这种格式时：
      * Company Name的value应该是 "Apple"
      * 职位信息应该作为单独的point，格式为 "Position: Apple Online Store - Onsite-Vendor"
    - 当遇到 "Apple Inc." 这种格式时：
      * Company Name的value应该是 "Apple Inc."
    - 当遇到 "Apple" 这种格式时：
      * Company Name的value应该是 "Apple"
    - 职位信息（如Software Engineer）应该作为 "Position: [职位名称]" 的point
    - 时间信息应该作为 "Date: [时间范围]" 的point
    - 描述信息应该作为 "Description: [描述内容]" 的point
    - 职责信息应该作为 "Responsibility: [职责内容]" 的point
    
    ⚠️ 重要：Company Name字段的value属性是必须的，不能为空或null！
    - 如果公司名称是 "Apple (Apple Online Store - Onsite-Vendor)"，那么value应该是 "Apple"
    - 如果公司名称是 "Apple Inc."，那么value应该是 "Apple Inc."
    - 如果公司名称是 "Apple"，那么value应该是 "Apple"
    - 公司名称必须从原始文本中准确提取，不能遗漏或截断

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
        "section": "Work Experience",
        "fields": [
          { 
            "name": "Company Name", 
            "value": "eBay",
            "points": [
              "Location: Austin, TX",
              "Date: Aug 2024 to Current",
              "Project: eBay Migration Project",
              "Description: Worked on eBay's API migration initiative...",
              "Responsibility: Migrated eBay's legacy APIs to new RESTful APIs",
              "Responsibility: Developed, tested, and deployed new API integrations",
              "Responsibility: Optimized API performance and improved data exchange efficiency"
            ]
          }
        ]
      },
      {
        "section": "Work Experience",
        "fields": [
          { 
            "name": "Company Name", 
            "value": "Apple",
            "points": [
              "Position: Apple Online Store - Onsite-Vendor",
              "Date: Mar. 2022 - Feb. 2025",
              "Description: Apple's online store is a premier destination for purchasing a wide range of Apple products and accessories. It provides easy navigation, detailed product info, and secure shopping. Customers enjoy fast, free shipping, AppleCare support, and a user-friendly interface for a seamless, convenient shopping experience.",
              "Responsibility: Participated in all phases of the software development lifecycle, including analysis, design, development, integration, and testing.",
              "Responsibility: Revamped the interaction service by incorporating a thread pool, significantly improving its performance. This enhancement increased upload speeds by 90%, resulting in faster data transfers and a more efficient system overall."
            ]
          }
        ]
      },
      {
        "section": "Education",
        "fields": [
          { "name": "University Name", "points": ["University Name", "Location", "Date Range", "Degree"] }
        ]
      },
      {
        "section": "Technical Skills",
        "fields": [
          { "name": "Skills", "points": ["Java", "Spring Boot", "AWS", "Kubernetes", "Docker"] }
        ]
      },
      {
        "section": "Projects",
        "fields": [
          { "name": "Project Name", "points": ["Project Description", "Technologies Used", "Key Achievements"] }
        ]
      }
    ]

    IMPORTANT: 
    - 输出必须以 [ 开始，以 ] 结束
    - 每个工作经历都要完整提取所有信息
    - 每个职责点都要单独列出
    - 不要遗漏任何内容
    请直接输出 JSON 数组，不要添加任何说明文字。
    `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: resumeText },
      ],
      temperature: 0.1,
      max_tokens: 4000,
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
      // 🧠 应用学习系统优化
      console.log("🔧 应用学习系统优化...");
      const optimizedResult = await learningSystem.applyLearning(result);
      
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
              
              // 🎯 特殊处理：如果字段名是 "Company Name" 且有实际值，用实际值替换字段名
              let fieldName = field.name || 'Unnamed Field';
              if (fieldName === 'Company Name' && field.value) {
                fieldName = field.value; // 用实际公司名替换默认字段名
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
              // 🎯 特殊处理：如果字段名是 "Company Name" 且有实际值，用实际值替换字段名
              let fieldName = field.name || 'Unnamed Field';
              if (fieldName === 'Company Name' && field.value) {
                fieldName = field.value; // 用实际公司名替换默认字段名
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
      
      // 🎯 计算动态置信度
      const userId = "user-123"; // TODO: 从实际用户ID获取
      const baseConfidence = 0.7;
      const userAccuracy = 0.8; // TODO: 从用户历史数据获取
      const feedbackQuality = 0.7; // TODO: 从反馈质量分析获取
      const patternMatch = 0.8; // TODO: 从模式匹配分析获取
      
      const confidenceMetrics = confidenceEvolution.calculateDynamicConfidence(
        userId,
        baseConfidence,
        userAccuracy,
        feedbackQuality,
        patternMatch
      );
      
      console.log("🎯 置信度计算完成:", confidenceMetrics);
      
      return NextResponse.json({ 
        success: true, 
        data: normalizedData,
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