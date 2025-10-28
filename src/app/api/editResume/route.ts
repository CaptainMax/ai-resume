import { NextResponse } from "next/server";
import { sortFieldsBySectionType, shouldSortSection } from "../../utils/sortUtils";

export async function POST(req: Request) {
  try {
    const { message, resumeContext } = await req.json();

    console.log("🧩 editResume 收到请求:", message);
    console.log("📝 简历上下文:", resumeContext);

    if (!message) {
      return NextResponse.json({ success: false, error: "Missing message" }, { status: 400 });
    }

    if (!resumeContext?.resume) {
      return NextResponse.json({ success: false, error: "Missing resume context" }, { status: 400 });
    }

    // 调用 aiChat 获取 GPT 的结构化响应
    const aiRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/aiChat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        context: resumeContext
      }),
    });

    if (!aiRes.ok) {
      throw new Error(`aiChat API failed: ${aiRes.status}`);
    }

    const data = await aiRes.json();
    console.log("🧩 editResume 收到 aiChat 输出:", data);

    // 克隆当前简历
    let updatedResume = JSON.parse(JSON.stringify(resumeContext.resume));

    // 根据 AI 返回的动作执行修改
    let actionsToExecute = [];
    
    // 检查直接返回的action
    if (data.action && data.data) {
      actionsToExecute = [data.action];
    }
    // 检查response中的JSON action
    else if (data.response) {
      try {
        let jsonStr = data.response;
        
        // 移除markdown代码块标记
        jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        
        // 查找JSON对象
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedResponse = JSON.parse(jsonMatch[0]);
          
          // 检查是否是批量操作
          if (parsedResponse.actions && Array.isArray(parsedResponse.actions)) {
            actionsToExecute = parsedResponse.actions;
            console.log("🔄 检测到批量操作:", actionsToExecute.length, "个动作");
          }
          // 检查是否是单个操作
          else if (parsedResponse.action) {
            actionsToExecute = [parsedResponse.action];
          }
        }
      } catch (e) {
        console.log("📝 解析response中的JSON失败:", e);
      }
    }
    
    if (actionsToExecute.length > 0) {
      console.log(`🔧 准备执行 ${actionsToExecute.length} 个动作`);
      
      // 执行所有动作
      for (let i = 0; i < actionsToExecute.length; i++) {
        const actionToExecute = actionsToExecute[i];
        const { type, data: payload } = actionToExecute;
        console.log(`🔧 执行动作 ${i + 1}/${actionsToExecute.length}: ${type}`, payload);

      switch (type) {
        case "add_field":
          if (updatedResume.sections) {
            const targetSection = updatedResume.sections.find((s: any) => s.id === payload.sectionId);
            if (targetSection) {
              const newField = {
                id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: payload.fieldName || 'New Field',
                value: payload.fieldValue || null,
                points: (payload.points || []).map((point: any, index: number) => ({
                  id: `point-${Date.now()}-${index}`,
                  content: typeof point === 'string' ? point : JSON.stringify(point)
                }))
              };
              targetSection.fields = targetSection.fields || [];
              
              // 使用统一的排序工具函数
              if (shouldSortSection(targetSection.title)) {
                const sortedFields = sortFieldsBySectionType(targetSection.title, targetSection.fields, newField);
                targetSection.fields = sortedFields;
                console.log("✅ 添加字段并按规则排序:", newField);
              } else {
                targetSection.fields.push(newField);
                console.log("✅ 添加新字段:", newField);
              }
            } else {
              console.warn("⚠️ 未找到目标section:", payload.sectionId);
            }
          }
          break;

        case "update_field":
          updatedResume.sections?.forEach((s: any) => {
            const field = s.fields?.find((f: any) => f.id === payload.fieldId);
            if (field) {
              if (payload.fieldName) field.name = payload.fieldName;
              if (payload.fieldValue !== undefined) field.value = payload.fieldValue;
              console.log("✅ 更新字段:", field);
            }
          });
          break;

        case "add_point":
          updatedResume.sections?.forEach((s: any) => {
            const field = s.fields?.find((f: any) => f.id === payload.fieldId);
            if (field) {
              field.points = field.points || [];
              const newPoint = {
                id: `point-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                content: payload.content || 'New point'
              };
              field.points.push(newPoint);
              console.log("✅ 添加新点:", newPoint);
            }
          });
          break;

        case "update_point":
          updatedResume.sections?.forEach((s: any) => {
            const field = s.fields?.find((f: any) => f.id === payload.fieldId);
            const point = field?.points?.find((p: any) => p.id === payload.pointId);
            if (point) {
              point.content = payload.content || point.content;
              console.log("✅ 更新点:", point);
            }
          });
          break;

        case "remove_field":
          updatedResume.sections = updatedResume.sections?.map((s: any) => ({
            ...s,
            fields: s.fields?.filter((f: any) => f.id !== payload.fieldId) || []
          }));
          console.log("✅ 删除字段:", payload.fieldId);
          break;

        case "remove_point":
          updatedResume.sections = updatedResume.sections?.map((s: any) => ({
            ...s,
            fields: s.fields?.map((f: any) => ({
              ...f,
              points: f.points?.filter((p: any) => p.id !== payload.pointId) || []
            }))
          }));
          console.log("✅ 删除点:", payload.pointId);
          break;

        case "move_field":
          // 移动字段到不同的section
          if (payload.fromSectionId && payload.toSectionId && payload.fieldId) {
            let fieldToMove: any = null;
            
            // 从源section移除字段
            updatedResume.sections = updatedResume.sections?.map((s: any) => {
              if (s.id === payload.fromSectionId) {
                const fieldIndex = s.fields?.findIndex((f: any) => f.id === payload.fieldId);
                if (fieldIndex !== -1 && fieldIndex !== undefined) {
                  fieldToMove = s.fields[fieldIndex];
                  s.fields.splice(fieldIndex, 1);
                }
              }
              return s;
            });
            
            // 添加到目标section
            if (fieldToMove) {
              const targetSection = updatedResume.sections?.find((s: any) => s.id === payload.toSectionId);
              if (targetSection) {
                targetSection.fields = targetSection.fields || [];
                targetSection.fields.push(fieldToMove);
                console.log("✅ 移动字段:", fieldToMove);
              }
            }
          }
          break;

        case "move_point":
          // 移动点到不同的字段
          if (payload.fromFieldId && payload.toFieldId && payload.pointId) {
            let pointToMove: any = null;
            
            // 从源字段移除点
            updatedResume.sections?.forEach((s: any) => {
              const field = s.fields?.find((f: any) => f.id === payload.fromFieldId);
              if (field) {
                const pointIndex = field.points?.findIndex((p: any) => p.id === payload.pointId);
                if (pointIndex !== -1 && pointIndex !== undefined) {
                  pointToMove = field.points[pointIndex];
                  field.points.splice(pointIndex, 1);
                }
              }
            });
            
            // 添加到目标字段
            if (pointToMove) {
              updatedResume.sections?.forEach((s: any) => {
                const field = s.fields?.find((f: any) => f.id === payload.toFieldId);
                if (field) {
                  field.points = field.points || [];
                  field.points.push(pointToMove);
                  console.log("✅ 移动点:", pointToMove);
                }
              });
            }
          }
          break;

        case "remove_section":
          // 删除整个section
          if (payload.sectionId) {
            updatedResume.sections = updatedResume.sections?.filter((s: any) => s.id !== payload.sectionId);
            console.log("✅ 删除section:", payload.sectionId);
          }
          break;

        default:
          console.log("⚠️ 未知动作类型:", type);
      }
      }
      
      console.log(`✅ 批量操作完成: ${actionsToExecute.length} 个动作执行完毕`);
    }

    // 返回结果
    return NextResponse.json({
      success: true,
      message: data.response || "Edit applied successfully.",
      updatedResume,
      aiAction: actionsToExecute.length === 1 ? actionsToExecute[0] : null,
      aiActions: actionsToExecute.length > 1 ? actionsToExecute : null,
      originalResponse: data.response
    });

  } catch (err) {
    console.error("❌ editResume 错误:", err);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to edit resume",
        details: err instanceof Error ? err.message : String(err)
      },
      { status: 500 }
    );
  }
}
