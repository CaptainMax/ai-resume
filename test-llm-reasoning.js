// test-llm-reasoning.js
// 🧪 测试新的 LLM 推理引擎

const testCases = [
  {
    input: "I just got my master degree from MIT with cs major from sep 2023 to sep 2025",
    expected: {
      action: "add",
      entity: "education",
      data: {
        institution: "MIT",
        degree: "master",
        major: "cs",
        time: "sep 2023 to sep 2025"
      }
    }
  },
  {
    input: "can you replace mit to mit university full name",
    expected: {
      action: "replace",
      entity: "existing",
      data: {
        content: "Massachusetts Institute of Technology"
      }
    }
  },
  {
    input: "add my work experience at Apple as Software Engineer from 2022 to 2025",
    expected: {
      action: "add",
      entity: "experience",
      data: {
        company: "Apple",
        position: "Software Engineer",
        duration: "2022 to 2025"
      }
    }
  }
];

async function testLLMReasoning() {
  console.log("🧪 开始测试 LLM 推理引擎...\n");

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`📝 测试用例 ${i + 1}:`);
    console.log(`输入: "${testCase.input}"`);
    console.log(`期望: ${JSON.stringify(testCase.expected, null, 2)}`);

    try {
      const response = await fetch('http://localhost:3000/api/llm-reasoning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput: testCase.input,
          currentResume: { sections: [] },
          userId: 'test-user'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ 实际结果: ${JSON.stringify(result.data.reasoning, null, 2)}`);
        console.log(`🎯 置信度: ${result.data.reasoning.confidence}`);
        console.log(`🧠 推理过程: ${result.data.reasoning.reasoning}`);
      } else {
        console.log(`❌ 测试失败: ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ 请求失败: ${error.message}`);
    }

    console.log("─".repeat(80));
  }

  console.log("🎉 测试完成！");
}

// 运行测试
testLLMReasoning().catch(console.error);
