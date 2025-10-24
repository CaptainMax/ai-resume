// src/app/agents/parseResumeAgent.ts

/**
 * ParseResumeAgent - 简历解析智能代理
 * 负责将各种格式的简历文件解析为结构化JSON数据
 */

// ==================== 类型定义 ====================

export interface ParsedResume {
  sections: ResumeSection[];
  metadata: {
    language: 'en' | 'zh' | 'auto';
    confidence: number;
    parseTime: number;
    source: string;
  };
}

export interface ResumeSection {
  id: string;
  title: string;
  fields: ResumeField[];
}

export interface ResumeField {
  id: string;
  name: string;
  value?: string;
  points?: ResumePoint[];
}

export interface ResumePoint {
  id: string;
  content: string;
}

export interface ParseResult {
  success: boolean;
  data?: ParsedResume;
  error?: string;
  warnings?: string[];
}

// ==================== 核心类 ====================

export class ParseResumeAgent {
  private textPreprocessor: TextPreprocessor;
  private structureRecognizer: StructureRecognizer;
  private contentParser: ContentParser;
  private formatStandardizer: FormatStandardizer;

  constructor() {
    this.textPreprocessor = new TextPreprocessor();
    this.structureRecognizer = new StructureRecognizer();
    this.contentParser = new ContentParser();
    this.formatStandardizer = new FormatStandardizer();
  }

  /**
   * 解析简历文件
   * @param fileContent 文件内容
   * @param fileType 文件类型
   * @returns 解析结果
   */
  async parseResume(fileContent: string, fileType: string): Promise<ParseResult> {
    try {
      console.log(`🔍 ParseResumeAgent: 开始解析 ${fileType} 文件`);
      
      // 1. 文本预处理
      const cleanedText = this.textPreprocessor.cleanText(fileContent);
      console.log(`📝 文本预处理完成，长度: ${cleanedText.length}`);
      
      // 2. 结构识别
      const structure = this.structureRecognizer.identifyStructure(cleanedText);
      console.log(`🏗️ 结构识别完成，发现 ${structure.sections.length} 个section`);
      
      // 3. 内容解析
      const parsedContent = this.contentParser.parseContent(cleanedText, structure);
      console.log(`📊 内容解析完成，提取 ${parsedContent.sections.length} 个section`);
      
      // 4. 格式标准化
      const standardizedResult = this.formatStandardizer.standardize(parsedContent);
      console.log(`✨ 格式标准化完成`);
      
      return {
        success: true,
        data: standardizedResult,
        warnings: []
      };
      
    } catch (error) {
      console.error(`❌ ParseResumeAgent 解析失败:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
        warnings: []
      };
    }
  }
}

// ==================== 文本预处理器 ====================

class TextPreprocessor {
  /**
   * 清理和标准化文本
   */
  cleanText(text: string): string {
    // 标准化换行符
    let cleaned = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // 移除多余的空行，但保留单行内容
    cleaned = cleaned.replace(/\n\s*\n/g, '\n');
    
    // 移除行首行尾的空白，但保留换行符
    cleaned = cleaned.split('\n').map(line => line.trim()).join('\n');
    
    // 只移除控制字符和不可见字符，保留所有可见字符和换行符
    cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
    return cleaned;
  }

  /**
   * 检测语言
   */
  detectLanguage(text: string): 'en' | 'zh' | 'auto' {
    const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    const totalChars = text.length;
    
    if (chineseChars / totalChars > 0.3) {
      return 'zh';
    } else if (chineseChars / totalChars > 0.1) {
      return 'auto';
    } else {
      return 'en';
    }
  }
}

// ==================== 结构识别器 ====================

class StructureRecognizer {
  /**
   * 识别简历结构
   */
  identifyStructure(text: string): { sections: string[] } {
    // 常见的section标题模式 - 优化正则表达式
    const sectionPatterns = [
      { pattern: /^(EDUCATION|教育背景|教育经历|Education)/i, name: 'EDUCATION' },
      { pattern: /^(EXPERIENCE|工作经历|工作经验|职业经历|Work Experience|Professional Experience)/i, name: 'EXPERIENCE' },
      { pattern: /^(SKILLS|技能|专业技能|技术技能|Technical Skills|Core Competencies)/i, name: 'SKILLS' },
      { pattern: /^(PROJECTS|项目经历|项目经验|Projects|Portfolio)/i, name: 'PROJECTS' },
      { pattern: /^(CERTIFICATIONS|证书|认证|Certifications|Licenses)/i, name: 'CERTIFICATIONS' },
      { pattern: /^(LANGUAGES|语言能力|外语能力|Languages)/i, name: 'LANGUAGES' },
      { pattern: /^(AWARDS|获奖|荣誉|Awards|Honors|Achievements)/i, name: 'AWARDS' },
      { pattern: /^(INTERESTS|兴趣爱好|个人兴趣|Interests|Hobbies)/i, name: 'INTERESTS' },
      { pattern: /^(SUMMARY|概述|个人简介|Profile|About)/i, name: 'SUMMARY' },
      { pattern: /^(OBJECTIVE|目标|求职意向|Career Objective)/i, name: 'OBJECTIVE' }
    ];

    const lines = text.split('\n');
    const sections: string[] = [];
    const foundSections = new Set<string>();
    
    console.log('🔍 开始识别section结构...');
    console.log('📝 文本行数:', lines.length);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      if (trimmedLine.length < 3) continue;
      
      console.log(`📄 检查第${i+1}行: "${trimmedLine}"`);
      
      for (const { pattern, name } of sectionPatterns) {
        if (pattern.test(trimmedLine) && !foundSections.has(name)) {
          sections.push(trimmedLine);
          foundSections.add(name);
          console.log(`✅ 发现section: ${name} - "${trimmedLine}"`);
          break;
        }
      }
    }
    
    console.log(`🏗️ 总共发现 ${sections.length} 个section:`, sections);
    return { sections };
  }
}

// ==================== 内容解析器 ====================

class ContentParser {
  /**
   * 解析简历内容
   */
  parseContent(text: string, structure: { sections: string[] }): ParsedResume {
    const sections: ResumeSection[] = [];
    
    // 为每个识别的section创建基础结构
    structure.sections.forEach((sectionTitle, index) => {
      const section: ResumeSection = {
        id: `section-${index + 1}`,
        title: sectionTitle,
        fields: this.parseSectionContent(text, sectionTitle, index)
      };
      
      sections.push(section);
    });
    
    return {
      sections,
      metadata: {
        language: 'auto',
        confidence: 0.8,
        parseTime: Date.now(),
        source: 'parseResumeAgent'
      }
    };
  }

  /**
   * 解析特定section的内容
   */
  private parseSectionContent(text: string, sectionTitle: string, sectionIndex: number): ResumeField[] {
    const fields: ResumeField[] = [];
    
    // 根据section类型进行不同的解析
    if (this.isEducationSection(sectionTitle)) {
      return this.parseEducationSection(text, sectionIndex);
    } else if (this.isExperienceSection(sectionTitle)) {
      return this.parseExperienceSection(text, sectionIndex);
    } else if (this.isSkillsSection(sectionTitle)) {
      return this.parseSkillsSection(text, sectionIndex);
    } else {
      // 默认解析
      return this.parseGenericSection(text, sectionTitle, sectionIndex);
    }
  }

  /**
   * 判断是否为教育section
   */
  private isEducationSection(title: string): boolean {
    return /^(EDUCATION|教育背景|教育经历)/i.test(title);
  }

  /**
   * 判断是否为工作经历section
   */
  private isExperienceSection(title: string): boolean {
    return /^(EXPERIENCE|工作经历|工作经验|职业经历)/i.test(title);
  }

  /**
   * 判断是否为技能section
   */
  private isSkillsSection(title: string): boolean {
    return /^(SKILLS|技能|专业技能|技术技能)/i.test(title);
  }

  /**
   * 解析教育section
   */
  private parseEducationSection(text: string, sectionIndex: number): ResumeField[] {
    const fields: ResumeField[] = [];
    
    // 查找教育相关信息 - 优化关键词
    const educationPatterns = [
      /(Bachelor|Master|PhD|学士|硕士|博士|B\.S\.|M\.S\.|Ph\.D\.)/i,
      /(University|College|大学|学院|Institute|School)/i,
      /(Computer Science|Engineering|计算机科学|工程|Business|Management)/i,
      /(2020|2021|2022|2023|2024|2025)/i
    ];
    
    console.log('🎓 开始解析教育section...');
    const lines = text.split('\n');
    let currentField: ResumeField | null = null;
    let fieldIndex = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      if (trimmedLine.length < 3) continue;
      
      console.log(`📄 教育解析第${i+1}行: "${trimmedLine}"`);
      
      // 检查是否包含教育关键词
      const hasEducationKeywords = educationPatterns.some(pattern => pattern.test(trimmedLine));
      
      if (hasEducationKeywords) {
        if (currentField) {
          fields.push(currentField);
          fieldIndex++;
        }
        
        currentField = {
          id: `field-${sectionIndex + 1}-${fieldIndex + 1}`,
          name: 'Education',
          value: trimmedLine,
          points: []
        };
        console.log(`✅ 发现教育信息: "${trimmedLine}"`);
      } else if (currentField && trimmedLine.length > 5) {
        // 添加相关描述
        currentField.points?.push({
          id: `point-${sectionIndex + 1}-${fieldIndex + 1}-${(currentField.points?.length || 0) + 1}`,
          content: trimmedLine
        });
        console.log(`📝 添加教育描述: "${trimmedLine}"`);
      }
    }
    
    if (currentField) {
      fields.push(currentField);
    }
    
    console.log(`🎓 教育section解析完成，发现 ${fields.length} 个教育记录`);
    return fields;
  }

  /**
   * 解析工作经历section
   */
  private parseExperienceSection(text: string, sectionIndex: number): ResumeField[] {
    const fields: ResumeField[] = [];
    
    // 查找工作相关信息
    const workPatterns = [
      /(Software Engineer|Developer|工程师|开发)/i,
      /(Company|Corp|公司)/i,
      /(2020|2021|2022|2023|2024)/i
    ];
    
    // 简单的工作信息提取
    const lines = text.split('\n');
    let currentField: ResumeField | null = null;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.length < 3) continue;
      
      // 检查是否包含工作关键词
      const hasWorkKeywords = workPatterns.some(pattern => pattern.test(trimmedLine));
      
      if (hasWorkKeywords) {
        if (currentField) {
          fields.push(currentField);
        }
        
        currentField = {
          id: `field-${sectionIndex + 1}-${fields.length + 1}`,
          name: 'Work Experience',
          value: trimmedLine,
          points: []
        };
      } else if (currentField && trimmedLine.length > 10) {
        // 添加相关描述
        currentField.points?.push({
          id: `point-${sectionIndex + 1}-${fields.length + 1}-${(currentField.points?.length || 0) + 1}`,
          content: trimmedLine
        });
      }
    }
    
    if (currentField) {
      fields.push(currentField);
    }
    
    return fields;
  }

  /**
   * 解析技能section
   */
  private parseSkillsSection(text: string, sectionIndex: number): ResumeField[] {
    const fields: ResumeField[] = [];
    
    // 查找技能相关信息
    const skillPatterns = [
      /(JavaScript|Python|Java|React|Node.js|TypeScript)/i,
      /(AWS|Docker|Kubernetes|Git)/i,
      /(HTML|CSS|SQL|MongoDB)/i
    ];
    
    // 简单的技能信息提取
    const lines = text.split('\n');
    let currentField: ResumeField | null = null;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.length < 3) continue;
      
      // 检查是否包含技能关键词
      const hasSkillKeywords = skillPatterns.some(pattern => pattern.test(trimmedLine));
      
      if (hasSkillKeywords) {
        if (currentField) {
          fields.push(currentField);
        }
        
        currentField = {
          id: `field-${sectionIndex + 1}-${fields.length + 1}`,
          name: 'Technical Skills',
          value: trimmedLine,
          points: []
        };
      } else if (currentField && trimmedLine.length > 5) {
        // 添加相关技能
        currentField.points?.push({
          id: `point-${sectionIndex + 1}-${fields.length + 1}-${(currentField.points?.length || 0) + 1}`,
          content: trimmedLine
        });
      }
    }
    
    if (currentField) {
      fields.push(currentField);
    }
    
    return fields;
  }

  /**
   * 解析通用section
   */
  private parseGenericSection(text: string, sectionTitle: string, sectionIndex: number): ResumeField[] {
    const fields: ResumeField[] = [];
    
    // 简单的通用信息提取
    const lines = text.split('\n');
    let currentField: ResumeField | null = null;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.length < 3) continue;
      
      if (!currentField) {
        currentField = {
          id: `field-${sectionIndex + 1}-1`,
          name: sectionTitle,
          value: trimmedLine,
          points: []
        };
      } else if (trimmedLine.length > 10) {
        // 添加相关描述
        currentField.points?.push({
          id: `point-${sectionIndex + 1}-1-${(currentField.points?.length || 0) + 1}`,
          content: trimmedLine
        });
      }
    }
    
    if (currentField) {
      fields.push(currentField);
    }
    
    return fields;
  }
}

// ==================== 格式标准化器 ====================

class FormatStandardizer {
  /**
   * 标准化输出格式
   */
  standardize(parsedContent: ParsedResume): ParsedResume {
    // 确保所有section都有唯一的ID
    parsedContent.sections.forEach((section, index) => {
      if (!section.id) {
        section.id = `section-${index + 1}`;
      }
      
      // 确保所有field都有唯一的ID
      section.fields.forEach((field, fieldIndex) => {
        if (!field.id) {
          field.id = `field-${index + 1}-${fieldIndex + 1}`;
        }
        
        // 确保所有point都有唯一的ID
        field.points?.forEach((point, pointIndex) => {
          if (!point.id) {
            point.id = `point-${index + 1}-${fieldIndex + 1}-${pointIndex + 1}`;
          }
        });
      });
    });
    
    return parsedContent;
  }
}
