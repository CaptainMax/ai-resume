// 简单的AI简历编辑API - 使用Function Calling
import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are an intelligent Resume Editor.  
Your goal is to understand user requests and output structured JSON
for resume editing operations. Do not explain your reasoning.
Return only valid JSON.`;

const ANALYZE_INTENT_FUNCTION = {
  name: "analyze_user_intent",
  description: "Analyze user's input and extract action for resume editing",
  parameters: {
    type: "object",
    properties: {
      intent: { 
        type: "string", 
        enum: ["add", "edit", "delete", "improve"],
        description: "The action to perform on the resume"
      },
      section: { 
        type: "string", 
        enum: ["summary", "skills", "work_experience", "education", "header"],
        description: "The section of the resume to modify"
      },
      content: { 
        type: "object",
        description: "The content to add or modify"
      }
    },
    required: ["intent", "section"]
  }
};

export async function POST(request: NextRequest) {
  try {
    const { userInput, currentResume } = await request.json();

    // 调用OpenAI with Function Calling
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: `Current resume: ${JSON.stringify(currentResume)}\n\nUser request: ${userInput}`
          }
        ],
        functions: [ANALYZE_INTENT_FUNCTION],
        function_call: { name: "analyze_user_intent" },
        temperature: 0.1
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    const functionCall = data.choices[0].message.function_call;
    if (!functionCall) {
      throw new Error('No function call returned');
    }

    const intentData = JSON.parse(functionCall.arguments);
    
    // 执行简历修改
    const updatedResume = executeResumeAction(intentData, currentResume);

    return NextResponse.json({
      success: true,
      intent: intentData,
      updatedResume: updatedResume,
      message: `✅ ${intentData.intent} operation completed`
    });

  } catch (error) {
    console.error('AI Resume API Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// 执行简历操作
function executeResumeAction(intentData: any, currentResume: any) {
  const { intent, section, content } = intentData;
  
  // 深拷贝简历数据
  const updatedResume = JSON.parse(JSON.stringify(currentResume));
  
  switch (intent) {
    case 'add':
      return addToResume(updatedResume, section, content);
    case 'edit':
      return editResume(updatedResume, section, content);
    case 'delete':
      return deleteFromResume(updatedResume, section, content);
    case 'improve':
      return improveResume(updatedResume, section, content);
    default:
      return updatedResume;
  }
}

function addToResume(resume: any, section: string, content: any) {
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
  }
  
  return resume;
}

function editResume(resume: any, section: string, content: any) {
  // 简单的编辑逻辑
  if (resume[section]) {
    Object.assign(resume[section], content);
  }
  return resume;
}

function deleteFromResume(resume: any, section: string, content: any) {
  // 简单的删除逻辑
  if (content.index !== undefined && resume[section]) {
    resume[section].splice(content.index, 1);
  }
  return resume;
}

function improveResume(resume: any, section: string, content: any) {
  // 简单的优化逻辑 - 保持原有数据
  return resume;
}
