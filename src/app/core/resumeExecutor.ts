// 简单的简历执行器 - 直接修改JSON
export interface ResumeData {
  header?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  summary?: string;
  skills?: string[];
  work_experience?: WorkExperience[];
  education?: Education[];
}

export interface WorkExperience {
  company: string;
  title: string;
  date: string;
  location: string;
  responsibilities: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  date: string;
  location: string;
}

export class ResumeExecutor {
  
  /**
   * 执行简历操作
   */
  static executeAction(intent: string, section: string, content: any, resume: ResumeData): ResumeData {
    const updatedResume = JSON.parse(JSON.stringify(resume)); // 深拷贝
    
    switch (intent) {
      case 'add':
        return this.addToResume(updatedResume, section, content);
      case 'edit':
        return this.editResume(updatedResume, section, content);
      case 'delete':
        return this.deleteFromResume(updatedResume, section, content);
      case 'improve':
        return this.improveResume(updatedResume, section, content);
      default:
        return updatedResume;
    }
  }

  /**
   * 添加到简历
   */
  private static addToResume(resume: ResumeData, section: string, content: any): ResumeData {
    switch (section) {
      case 'work_experience':
        if (!resume.work_experience) resume.work_experience = [];
        resume.work_experience.push({
          company: content.company || 'Company',
          title: content.title || 'Position',
          date: content.date || '2024 - Present',
          location: content.location || 'Remote',
          responsibilities: content.responsibilities || ['Worked on various projects']
        });
        break;
        
      case 'education':
        if (!resume.education) resume.education = [];
        resume.education.push({
          institution: content.institution || 'University',
          degree: content.degree || 'Degree',
          field: content.field || 'Field of Study',
          date: content.date || '2020 - 2024',
          location: content.location || 'City, State'
        });
        break;
        
      case 'skills':
        if (!resume.skills) resume.skills = [];
        resume.skills.push(...(content.skills || ['New Skill']));
        break;
        
      case 'summary':
        resume.summary = content.summary || resume.summary;
        break;
        
      case 'header':
        if (!resume.header) resume.header = {};
        Object.assign(resume.header, content);
        break;
    }
    
    return resume;
  }

  /**
   * 编辑简历
   */
  private static editResume(resume: ResumeData, section: string, content: any): ResumeData {
    if (resume[section as keyof ResumeData]) {
      Object.assign(resume[section as keyof ResumeData], content);
    }
    return resume;
  }

  /**
   * 从简历删除
   */
  private static deleteFromResume(resume: ResumeData, section: string, content: any): ResumeData {
    if (content.index !== undefined && resume[section as keyof ResumeData]) {
      const sectionData = resume[section as keyof ResumeData] as any[];
      if (Array.isArray(sectionData)) {
        sectionData.splice(content.index, 1);
      }
    }
    return resume;
  }

  /**
   * 优化简历 - 保持原有数据
   */
  private static improveResume(resume: ResumeData, section: string, content: any): ResumeData {
    // 优化逻辑 - 不修改原有数据，只返回建议
    return resume;
  }
}
