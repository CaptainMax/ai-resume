export interface ParsedResponse {
  success: boolean;
  response: string;
  action?: any;
  data?: any;
}

export function extractJsonFromResponse(response: string): ParsedResponse | null {
  try {
    // 尝试多种方式提取JSON
    let jsonMatch = null;
    
    // 方法1: 查找完整的JSON对象
    jsonMatch = response.match(/\{[\s\S]*\}/);
    
    // 方法2: 如果方法1失败，尝试查找以{开头，以}结尾的内容
    if (!jsonMatch) {
      const startIndex = response.indexOf('{');
      const lastIndex = response.lastIndexOf('}');
      if (startIndex !== -1 && lastIndex !== -1 && lastIndex > startIndex) {
        jsonMatch = [response.substring(startIndex, lastIndex + 1)];
      }
    }
    
    if (jsonMatch) {
      const jsonStr = jsonMatch[0];
      console.log("🔍 提取的JSON字符串:", jsonStr);
      
      const parsedResponse = JSON.parse(jsonStr);
      if (parsedResponse.action && parsedResponse.data) {
        console.log("🔧 检测到结构化操作:", parsedResponse);
        return {
          success: true,
          response: response,
          action: parsedResponse.action,
          data: parsedResponse.data
        };
      }
    }
    
    return null;
  } catch (e) {
    console.log("📝 JSON解析失败:", e);
    console.log("📝 原始响应:", response);
    return null;
  }
}
