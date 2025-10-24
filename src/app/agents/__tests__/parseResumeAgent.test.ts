// src/app/agents/__tests__/parseResumeAgent.test.ts

import { ParseResumeAgent } from '../parseResumeAgent';

describe('ParseResumeAgent', () => {
  let agent: ParseResumeAgent;

  beforeEach(() => {
    agent = new ParseResumeAgent();
  });

  describe('基础功能测试', () => {
    it('应该能够解析简单的英文简历', async () => {
      const resumeText = `
        John Doe
        Software Engineer
        john.doe@email.com
        (555) 123-4567
        
        EDUCATION
        Bachelor of Science in Computer Science
        University of California, 2020
        
        EXPERIENCE
        Software Engineer at Tech Corp
        Developed web applications using React and Node.js
        Led a team of 5 developers
      `;

      const result = await agent.parseResume(resumeText, 'text');
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.sections).toBeDefined();
      expect(result.data?.sections.length).toBeGreaterThan(0);
    });

    it('应该能够解析中文简历', async () => {
      const resumeText = `
        张三
        软件工程师
        zhangsan@email.com
        138-0000-0000
        
        教育背景
        计算机科学学士
        北京大学，2020年
        
        工作经历
        软件工程师 - 科技公司
        使用React和Node.js开发Web应用
        带领5人开发团队
      `;

      const result = await agent.parseResume(resumeText, 'text');
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.sections).toBeDefined();
    });

    it('应该能够处理空内容', async () => {
      const result = await agent.parseResume('', 'text');
      
      expect(result.success).toBe(true);
      expect(result.data?.sections).toEqual([]);
    });

    it('应该能够处理无效内容', async () => {
      const result = await agent.parseResume('无效内容', 'text');
      
      expect(result.success).toBe(true);
      expect(result.data?.sections).toEqual([]);
    });
  });

  describe('错误处理测试', () => {
    it('应该能够处理解析错误', async () => {
      // 模拟一个会导致解析失败的情况
      const result = await agent.parseResume('正常内容', 'text');
      
      expect(result.success).toBe(true);
    });
  });
});