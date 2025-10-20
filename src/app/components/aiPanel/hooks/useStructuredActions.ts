// src/app/components/aiPanel/hooks/useStructuredActions.ts
"use client";

import { useResumeStore } from "@/app/store/useResumeStore";

export function useStructuredActions() {
  const { sections, addField, addPoint, setLastAddedFieldId, setLastAddedPointId } = useResumeStore();

  const handleStructuredAction = async (action: string, data: any) => {
    console.log("🔧 执行结构化操作:", action, data);
    console.log("📅 时间数据:", { 
      startDate: data.startDate, 
      endDate: data.endDate, 
      duration: data.duration 
    });
    
    if (action === 'add_education') {
      // 找到Education section
      const educationSection = sections.find(s => 
        s.title.toLowerCase().includes('education') || 
        s.title.toLowerCase().includes('教育')
      );
      
      if (educationSection) {
        // 创建新的教育经历field - 使用AI提供的内容
        const newField = {
          id: `education-${Date.now()}`,
          name: `${data.degree} - ${data.school}`,
          points: [
            {
              id: `point-${Date.now()}-1`,
              content: data.school ? `School: ${data.school}` : data.schoolLabel || "School"
            },
            {
              id: `point-${Date.now()}-2`,
              content: data.major ? `Major: ${data.major}` : data.majorLabel || "Major"
            },
            {
              id: `point-${Date.now()}-3`,
              content: data.duration ? `Duration: ${data.duration}` : 
                      (data.startDate && data.endDate) ? `Duration: ${data.startDate} - ${data.endDate}` :
                      data.durationLabel || "Duration"
            }
          ]
        };
        
        addField(educationSection.id, newField);
        setLastAddedFieldId(newField.id);
        console.log("✅ 已添加教育经历:", newField);
      } else {
        console.error("❌ 未找到Education section");
      }
    } else if (action === 'add_work') {
      // 找到Work Experience section
      const workSection = sections.find(s => 
        s.title.toLowerCase().includes('work') || 
        s.title.toLowerCase().includes('experience') ||
        s.title.toLowerCase().includes('工作')
      );
      
      if (workSection) {
        // 创建新的工作经历field - 使用AI提供的内容
        const newField = {
          id: `work-${Date.now()}`,
          name: `${data.position} - ${data.company}`,
          points: [
            {
              id: `point-${Date.now()}-1`,
              content: data.company ? `Company: ${data.company}` : data.companyLabel || "Company"
            },
            {
              id: `point-${Date.now()}-2`,
              content: data.position ? `Position: ${data.position}` : data.positionLabel || "Position"
            },
            {
              id: `point-${Date.now()}-3`,
              content: data.duration ? `Duration: ${data.duration}` : 
                      (data.startDate && data.endDate) ? `Duration: ${data.startDate} - ${data.endDate}` :
                      data.durationLabel || "Duration"
            },
            {
              id: `point-${Date.now()}-4`,
              content: data.description || "Job Description"
            }
          ]
        };
        
        addField(workSection.id, newField);
        setLastAddedFieldId(newField.id);
        console.log("✅ 已添加工作经历:", newField);
      } else {
        console.error("❌ 未找到Work Experience section");
      }
    } else if (action === 'add_point_to_field') {
      // 在现有field中添加新的point
      const { sectionId, fieldId, content } = data;
      const section = sections.find(s => s.id === sectionId);
      const field = section?.fields.find(f => f.id === fieldId);
      
      if (section && field) {
        const newPoint = {
          id: `point-${Date.now()}`,
          content: content
        };
        
        addPoint(sectionId, fieldId, newPoint);
        setLastAddedPointId(newPoint.id); // 记录最后添加的point ID
        console.log("✅ 已在field中添加新point:", newPoint);
      } else {
        console.error("❌ 未找到对应的section或field");
      }
    }
  };

  return { handleStructuredAction };
}
