// test-integration.js
// 测试集成后的解析功能

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

async function testParseResumeAPI() {
  console.log('🚀 测试集成后的解析API...\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/parseResume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeText: testResume
      })
    });
    
    const result = await response.json();
    
    console.log('📊 API响应:');
    console.log('成功:', result.success);
    console.log('数据源:', result.source);
    
    if (result.success && result.data) {
      console.log('Section数量:', result.data.length);
      console.log('详细数据:', JSON.stringify(result.data, null, 2));
    } else {
      console.log('错误:', result.error);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 等待服务器启动
setTimeout(() => {
  testParseResumeAPI();
}, 3000);
