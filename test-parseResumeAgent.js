// test-parseResumeAgent.js
// 测试 ParseResumeAgent 功能

const { ParseResumeAgent } = require('./src/app/agents/parseResumeAgent.ts');

async function testParseResumeAgent() {
  console.log('🚀 开始测试 ParseResumeAgent...\n');
  
  const agent = new ParseResumeAgent();
  
  // 测试用例1：英文简历
  console.log('📝 测试用例1：英文简历');
  const englishResume = `
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
  
  try {
    const result1 = await agent.parseResume(englishResume, 'text');
    console.log('✅ 英文简历解析结果:');
    console.log('成功:', result1.success);
    console.log('Section数量:', result1.data?.sections.length || 0);
    console.log('置信度:', result1.data?.metadata.confidence);
    console.log('语言:', result1.data?.metadata.language);
    console.log('解析时间:', result1.data?.metadata.parseTime);
    console.log('数据:', JSON.stringify(result1.data, null, 2));
  } catch (error) {
    console.error('❌ 英文简历解析失败:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 测试用例2：中文简历
  console.log('📝 测试用例2：中文简历');
  const chineseResume = `
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
    
    技能
    JavaScript, Python, React, Node.js
    AWS, Docker, Git
  `;
  
  try {
    const result2 = await agent.parseResume(chineseResume, 'text');
    console.log('✅ 中文简历解析结果:');
    console.log('成功:', result2.success);
    console.log('Section数量:', result2.data?.sections.length || 0);
    console.log('置信度:', result2.data?.metadata.confidence);
    console.log('语言:', result2.data?.metadata.language);
    console.log('解析时间:', result2.data?.metadata.parseTime);
    console.log('数据:', JSON.stringify(result2.data, null, 2));
  } catch (error) {
    console.error('❌ 中文简历解析失败:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 测试用例3：空内容
  console.log('📝 测试用例3：空内容');
  try {
    const result3 = await agent.parseResume('', 'text');
    console.log('✅ 空内容解析结果:');
    console.log('成功:', result3.success);
    console.log('Section数量:', result3.data?.sections.length || 0);
  } catch (error) {
    console.error('❌ 空内容解析失败:', error.message);
  }
  
  console.log('\n🎉 测试完成！');
}

// 运行测试
testParseResumeAgent().catch(console.error);
