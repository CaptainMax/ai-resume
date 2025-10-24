// src/app/agents/summarizeResumeAgent.ts
// 🤖 简历总结Agent - 生成简历摘要

export interface SummarizeInput {
  resumeData: {
    sections: Array<{
      id: string;
      title: string;
      fields: Array<{
        id: string;
        name: string;
        value?: string;
        points?: Array<{
          id: string;
          content: string;
        }>;
      }>;
    }>;
  };
  options?: {
    summaryType: 'brief' | 'detailed' | 'executive' | 'technical';
    length: 'short' | 'medium' | 'long';
    focusAreas?: string[];
    targetAudience?: 'recruiter' | 'hiring_manager' | 'technical_lead';
    language: 'en' | 'zh';
  };
}

export interface SummarizeOutput {
  success: boolean;
  data?: {
    summary: {
      overview: string;
      keyPoints: string[];
      highlights: string[];
      skills: string[];
      experience: string;
      education: string;
    };
    metadata: {
      summaryType: string;
      length: string;
      wordCount: number;
      generatedAt: Date;
      confidence: number;
    };
    insights: {
      strengths: string[];
      uniqueSellingPoints: string[];
      recommendations: string[];
    };
  };
  error?: string;
}

export interface SummaryTemplate {
  type: string;
  structure: {
    overview: string;
    keyPoints: string;
    highlights: string;
    skills: string;
    experience: string;
    education: string;
  };
  maxLength: number;
  focusAreas: string[];
}

export class SummarizeResumeAgent {
  private name = 'SummarizeResumeAgent';
  private version = '1.0.0';
  private isHealthy = true;
  private successCount = 0;
  private errorCount = 0;

  /**
   * 执行Agent任务
   * @param parameters 执行参数
   * @returns 执行结果
   */
  async execute(parameters: Record<string, any>): Promise<any> {
    console.log('🤖 SummarizeResumeAgent 执行:', parameters);
    
    const { action, input, context } = parameters;
    
    try {
      switch (action) {
        case 'extract':
          return await this.extractKeyPoints(input, context);
        case 'format':
          return await this.formatSummary(input, context);
        default:
          return await this.summarizeResume(input, context);
      }
    } catch (error) {
      console.error('❌ SummarizeResumeAgent 执行失败:', error);
      this.errorCount++;
      throw error;
    }
  }

  /**
   * 总结简历
   * @param input 输入数据
   * @param context 上下文
   * @returns 总结结果
   */
  private async summarizeResume(input: SummarizeInput, context: any): Promise<SummarizeOutput> {
    console.log('📝 总结简历:', { input, context });
    
    try {
      // 1. 提取关键信息
      const keyPoints = await this.extractKeyPoints(input, context);
      
      // 2. 格式化总结
      const formattedSummary = await this.formatSummary(keyPoints, context);
      
      // 3. 生成洞察
      const insights = this.generateInsights(input, keyPoints);
      
      // 4. 计算置信度
      const confidence = this.calculateConfidence(input, keyPoints);
      
      this.successCount++;
      
      return {
        success: true,
        data: {
          summary: formattedSummary,
          metadata: {
            summaryType: input.options?.summaryType || 'brief',
            length: input.options?.length || 'medium',
            wordCount: this.countWords(formattedSummary.overview),
            generatedAt: new Date(),
            confidence
          },
          insights
        }
      };
      
    } catch (error) {
      console.error('❌ 简历总结失败:', error);
      this.errorCount++;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 提取关键信息
   */
  private async extractKeyPoints(input: SummarizeInput, context: any): Promise<any> {
    console.log('🔍 提取关键信息:', input);
    
    const resumeData = input.resumeData;
    const keyPoints = {
      personalInfo: this.extractPersonalInfo(resumeData),
      experience: this.extractExperience(resumeData),
      education: this.extractEducation(resumeData),
      skills: this.extractSkills(resumeData),
      achievements: this.extractAchievements(resumeData),
      projects: this.extractProjects(resumeData)
    };
    
    return keyPoints;
  }

  /**
   * 格式化总结
   */
  private async formatSummary(keyPoints: any, context: any): Promise<any> {
    console.log('📋 格式化总结:', keyPoints);
    
    const template = this.getSummaryTemplate(context);
    const summary = {
      overview: this.generateOverview(keyPoints, template),
      keyPoints: this.generateKeyPoints(keyPoints, template),
      highlights: this.generateHighlights(keyPoints, template),
      skills: this.generateSkillsSummary(keyPoints, template),
      experience: this.generateExperienceSummary(keyPoints, template),
      education: this.generateEducationSummary(keyPoints, template)
    };
    
    return summary;
  }

  /**
   * 提取个人信息
   */
  private extractPersonalInfo(resumeData: any): any {
    const headerSection = resumeData.sections.find((s: any) => 
      s.title.toLowerCase().includes('header') || 
      s.title.toLowerCase().includes('personal')
    );
    
    if (!headerSection) return null;
    
    const personalInfo: any = {};
    
    for (const field of headerSection.fields) {
      const fieldName = field.name.toLowerCase();
      
      if (fieldName.includes('name') || fieldName.includes('姓名')) {
        personalInfo.name = field.value || field.points?.[0]?.content;
      } else if (fieldName.includes('email') || fieldName.includes('邮箱')) {
        personalInfo.email = field.value || field.points?.[0]?.content;
      } else if (fieldName.includes('phone') || fieldName.includes('电话')) {
        personalInfo.phone = field.value || field.points?.[0]?.content;
      } else if (fieldName.includes('location') || fieldName.includes('地址')) {
        personalInfo.location = field.value || field.points?.[0]?.content;
      }
    }
    
    return personalInfo;
  }

  /**
   * 提取工作经历
   */
  private extractExperience(resumeData: any): any[] {
    const experienceSection = resumeData.sections.find((s: any) => 
      s.title.toLowerCase().includes('work') || 
      s.title.toLowerCase().includes('experience') ||
      s.title.toLowerCase().includes('工作')
    );
    
    if (!experienceSection) return [];
    
    const experiences = [];
    
    for (const field of experienceSection.fields) {
      const experience: any = {
        title: field.name,
        details: []
      };
      
      if (field.points) {
        for (const point of field.points) {
          experience.details.push(point.content);
        }
      }
      
      experiences.push(experience);
    }
    
    return experiences;
  }

  /**
   * 提取教育背景
   */
  private extractEducation(resumeData: any): any[] {
    const educationSection = resumeData.sections.find((s: any) => 
      s.title.toLowerCase().includes('education') ||
      s.title.toLowerCase().includes('教育')
    );
    
    if (!educationSection) return [];
    
    const education = [];
    
    for (const field of educationSection.fields) {
      const edu: any = {
        degree: field.name,
        details: []
      };
      
      if (field.points) {
        for (const point of field.points) {
          edu.details.push(point.content);
        }
      }
      
      education.push(edu);
    }
    
    return education;
  }

  /**
   * 提取技能
   */
  private extractSkills(resumeData: any): string[] {
    const skillsSection = resumeData.sections.find((s: any) => 
      s.title.toLowerCase().includes('skill') ||
      s.title.toLowerCase().includes('技能')
    );
    
    if (!skillsSection) return [];
    
    const skills = [];
    
    for (const field of skillsSection.fields) {
      if (field.points) {
        for (const point of field.points) {
          skills.push(point.content);
        }
      } else if (field.value) {
        skills.push(field.value);
      }
    }
    
    return skills;
  }

  /**
   * 提取成就
   */
  private extractAchievements(resumeData: any): string[] {
    const achievements = [];
    
    // 从各个section中提取成就信息
    for (const section of resumeData.sections) {
      for (const field of section.fields) {
        if (field.points) {
          for (const point of field.points) {
            if (this.isAchievement(point.content)) {
              achievements.push(point.content);
            }
          }
        }
      }
    }
    
    return achievements;
  }

  /**
   * 提取项目
   */
  private extractProjects(resumeData: any): any[] {
    const projectsSection = resumeData.sections.find((s: any) => 
      s.title.toLowerCase().includes('project') ||
      s.title.toLowerCase().includes('项目')
    );
    
    if (!projectsSection) return [];
    
    const projects = [];
    
    for (const field of projectsSection.fields) {
      const project: any = {
        name: field.name,
        details: []
      };
      
      if (field.points) {
        for (const point of field.points) {
          project.details.push(point.content);
        }
      }
      
      projects.push(project);
    }
    
    return projects;
  }

  /**
   * 生成概述
   */
  private generateOverview(keyPoints: any, template: SummaryTemplate): string {
    const { personalInfo, experience, education, skills } = keyPoints;
    
    let overview = '';
    
    if (personalInfo?.name) {
      overview += `${personalInfo.name} `;
    }
    
    if (experience.length > 0) {
      overview += `is a professional with ${experience.length} years of experience `;
    }
    
    if (education.length > 0) {
      overview += `holding a ${education[0]?.degree || 'degree'} `;
    }
    
    if (skills.length > 0) {
      overview += `with expertise in ${skills.slice(0, 3).join(', ')}.`;
    }
    
    return overview || 'Professional with diverse experience and skills.';
  }

  /**
   * 生成关键点
   */
  private generateKeyPoints(keyPoints: any, template: SummaryTemplate): string[] {
    const keyPointsList = [];
    
    // 添加经验关键点
    if (keyPoints.experience.length > 0) {
      keyPointsList.push(`${keyPoints.experience.length} years of professional experience`);
    }
    
    // 添加技能关键点
    if (keyPoints.skills.length > 0) {
      keyPointsList.push(`Proficient in ${keyPoints.skills.length} technical skills`);
    }
    
    // 添加教育关键点
    if (keyPoints.education.length > 0) {
      keyPointsList.push(`Educational background in ${keyPoints.education[0]?.degree || 'relevant field'}`);
    }
    
    // 添加成就关键点
    if (keyPoints.achievements.length > 0) {
      keyPointsList.push(`${keyPoints.achievements.length} notable achievements`);
    }
    
    return keyPointsList;
  }

  /**
   * 生成亮点
   */
  private generateHighlights(keyPoints: any, template: SummaryTemplate): string[] {
    const highlights = [];
    
    // 从成就中提取亮点
    for (const achievement of keyPoints.achievements.slice(0, 3)) {
      highlights.push(achievement);
    }
    
    // 从项目中提取亮点
    for (const project of keyPoints.projects.slice(0, 2)) {
      highlights.push(`Led project: ${project.name}`);
    }
    
    return highlights;
  }

  /**
   * 生成技能总结
   */
  private generateSkillsSummary(keyPoints: any, template: SummaryTemplate): string[] {
    return keyPoints.skills.slice(0, 10); // 限制为前10个技能
  }

  /**
   * 生成经历总结
   */
  private generateExperienceSummary(keyPoints: any, template: SummaryTemplate): string {
    if (keyPoints.experience.length === 0) {
      return 'No work experience listed';
    }
    
    const latestExperience = keyPoints.experience[0];
    return `Most recent role: ${latestExperience.title}`;
  }

  /**
   * 生成教育总结
   */
  private generateEducationSummary(keyPoints: any, template: SummaryTemplate): string {
    if (keyPoints.education.length === 0) {
      return 'No education information provided';
    }
    
    const latestEducation = keyPoints.education[0];
    return `Education: ${latestEducation.degree}`;
  }

  /**
   * 生成洞察
   */
  private generateInsights(input: SummarizeInput, keyPoints: any): any {
    const insights = {
      strengths: [],
      uniqueSellingPoints: [],
      recommendations: []
    };
    
    // 分析优势
    if (keyPoints.experience.length > 3) {
      insights.strengths.push('Extensive work experience');
    }
    
    if (keyPoints.skills.length > 10) {
      insights.strengths.push('Diverse skill set');
    }
    
    if (keyPoints.achievements.length > 0) {
      insights.strengths.push('Track record of achievements');
    }
    
    // 生成独特卖点
    if (keyPoints.projects.length > 0) {
      insights.uniqueSellingPoints.push('Project leadership experience');
    }
    
    // 生成建议
    if (keyPoints.experience.length === 0) {
      insights.recommendations.push('Consider adding work experience or internships');
    }
    
    if (keyPoints.skills.length < 5) {
      insights.recommendations.push('Expand skill set to increase marketability');
    }
    
    return insights;
  }

  /**
   * 计算置信度
   */
  private calculateConfidence(input: SummarizeInput, keyPoints: any): number {
    let confidence = 0.5; // 基础置信度
    
    // 基于数据完整性调整置信度
    if (keyPoints.personalInfo) confidence += 0.1;
    if (keyPoints.experience.length > 0) confidence += 0.2;
    if (keyPoints.education.length > 0) confidence += 0.1;
    if (keyPoints.skills.length > 0) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  /**
   * 获取总结模板
   */
  private getSummaryTemplate(context: any): SummaryTemplate {
    // TODO: 根据上下文选择合适的模板
    return {
      type: 'brief',
      structure: {
        overview: 'overview',
        keyPoints: 'keyPoints',
        highlights: 'highlights',
        skills: 'skills',
        experience: 'experience',
        education: 'education'
      },
      maxLength: 500,
      focusAreas: ['experience', 'skills', 'achievements']
    };
  }

  /**
   * 计算字数
   */
  private countWords(text: string): number {
    return text.split(/\s+/).length;
  }

  /**
   * 判断是否为成就
   */
  private isAchievement(content: string): boolean {
    // 简单的成就识别逻辑
    const achievementKeywords = [
      'achieved', 'accomplished', 'increased', 'improved', 'reduced',
      'led', 'managed', 'delivered', 'created', 'developed',
      '成功', '完成', '提升', '改进', '减少', '领导', '管理', '交付', '创建', '开发'
    ];
    
    const lowerContent = content.toLowerCase();
    return achievementKeywords.some(keyword => lowerContent.includes(keyword));
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      // 简单的健康检查
      const testInput: SummarizeInput = {
        resumeData: {
          sections: [{
            id: 'test',
            title: 'Test',
            fields: []
          }]
        }
      };
      
      const result = await this.extractKeyPoints(testInput, {});
      return result !== null;
    } catch (error) {
      console.error('❌ 健康检查失败:', error);
      return false;
    }
  }

  /**
   * 获取Agent信息
   */
  getInfo(): any {
    return {
      name: this.name,
      version: this.version,
      isHealthy: this.isHealthy,
      successCount: this.successCount,
      errorCount: this.errorCount,
      successRate: this.successCount + this.errorCount > 0 ? 
        this.successCount / (this.successCount + this.errorCount) : 0
    };
  }
}
