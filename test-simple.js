// test-simple.js
// 简单测试 ParseResumeAgent 功能

console.log('🚀 开始测试 ParseResumeAgent...\n');

// 模拟测试数据
const testResume = `
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

SKILLS
JavaScript, Python, React, Node.js
AWS, Docker, Git
`;

console.log('📝 测试简历内容:');
console.log(testResume);
console.log('\n' + '='.repeat(50) + '\n');

// 模拟解析逻辑
function mockParseResume(text) {
  console.log('🔍 开始解析简历...');
  
  // 1. 文本预处理
  const cleanedText = text.replace(/\s+/g, ' ').trim();
  console.log('📝 文本预处理完成，长度:', cleanedText.length);
  
  // 2. 结构识别
  const sectionPatterns = [
    /^(EDUCATION|教育背景|教育经历)/i,
    /^(EXPERIENCE|工作经历|工作经验|职业经历)/i,
    /^(SKILLS|技能|专业技能|技术技能)/i,
  ];
  
  const lines = text.split('\n');
  const sections = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.length < 3) continue;
    
    for (const pattern of sectionPatterns) {
      if (pattern.test(trimmedLine)) {
        sections.push(trimmedLine);
        break;
      }
    }
  }
  
  console.log('🏗️ 结构识别完成，发现', sections.length, '个section:', sections);
  
  // 3. 内容解析
  const parsedSections = sections.map((sectionTitle, index) => ({
    id: `section-${index + 1}`,
    title: sectionTitle,
    fields: [{
      id: `field-${index + 1}-1`,
      name: sectionTitle,
      value: sectionTitle,
      points: []
    }]
  }));
  
  console.log('📊 内容解析完成，提取', parsedSections.length, '个section');
  
  // 4. 格式标准化
  const result = {
    sections: parsedSections,
    metadata: {
      language: 'en',
      confidence: 0.8,
      parseTime: Date.now(),
      source: 'parseResumeAgent'
    }
  };
  
  console.log('✨ 格式标准化完成');
  
  return {
    success: true,
    data: result,
    warnings: []
  };
}

// 运行测试
try {
  const result = mockParseResume(testResume);
  
  console.log('\n✅ 解析结果:');
  console.log('成功:', result.success);
  console.log('Section数量:', result.data.sections.length);
  console.log('置信度:', result.data.metadata.confidence);
  console.log('语言:', result.data.metadata.language);
  console.log('解析时间:', result.data.metadata.parseTime);
  
  console.log('\n📋 详细数据:');
  console.log(JSON.stringify(result.data, null, 2));
  
  console.log('\n🎉 测试完成！');
  
} catch (error) {
  console.error('❌ 测试失败:', error.message);
}
