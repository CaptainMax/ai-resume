// src/app/components/aiPanel/utils/infoExtractors.ts
// 🔍 信息提取工具函数

/**
 * 🏢 提取公司名称
 */
export const extractCompany = (input: string): string | null => {
  const companyPatterns = [
    /(?:at|for|with)\s+([A-Z][a-zA-Z\s&]+?)(?:\s|$|,|\.)/i,
    /company[:\s]+([A-Z][a-zA-Z\s&]+?)(?:\s|$|,|\.)/i
  ];
  
  for (const pattern of companyPatterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
};

/**
 * 💼 提取职位
 */
export const extractPosition = (input: string): string | null => {
  const positionPatterns = [
    /(?:as|position|role)[:\s]+([A-Z][a-zA-Z\s]+?)(?:\s|$|,|\.)/i,
    /(?:engineer|developer|manager|analyst|specialist)/i
  ];
  
  for (const pattern of positionPatterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
};

/**
 * ⏰ 提取时间
 */
export const extractTime = (input: string): string | null => {
  const timePatterns = [
    /(?:from|since|started)\s+([A-Za-z]+\s+\d{4})/i,
    /(\d{4}[-–]\d{4})/,
    /(\d{4}[-–]present)/i
  ];
  
  for (const pattern of timePatterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
};

/**
 * 🏫 提取学校名称
 */
export const extractInstitution = (input: string): string | null => {
  const institutionPatterns = [
    /(?:at|from|in)\s+([A-Z][a-zA-Z\s&]+?)(?:\s|$|,|\.)/i,
    /university[:\s]+([A-Z][a-zA-Z\s&]+?)(?:\s|$|,|\.)/i,
    /college[:\s]+([A-Z][a-zA-Z\s&]+?)(?:\s|$|,|\.)/i
  ];
  
  for (const pattern of institutionPatterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
};

/**
 * 🎓 提取学位
 */
export const extractDegree = (input: string): string | null => {
  const degreePatterns = [
    /(?:master|bachelor|phd|doctorate)[:\s]+([A-Z][a-zA-Z\s]+?)(?:\s|$|,|\.)/i,
    /(?:M\.S\.|B\.S\.|Ph\.D\.|M\.A\.|B\.A\.)/i
  ];
  
  for (const pattern of degreePatterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
};

/**
 * 📚 提取专业
 */
export const extractMajor = (input: string): string | null => {
  const majorPatterns = [
    /(?:in|major|field)[:\s]+([A-Z][a-zA-Z\s]+?)(?:\s|$|,|\.)/i,
    /(?:computer science|engineering|business|medicine)/i
  ];
  
  for (const pattern of majorPatterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
};
