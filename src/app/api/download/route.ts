import { NextResponse } from "next/server";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import jsPDF from "jspdf";

export async function POST(req: Request) {
  try {
    const { resumeData, format } = await req.json();

    if (!resumeData || !format) {
      return NextResponse.json({ error: "Missing resume data or format" }, { status: 400 });
    }

    console.log("📥 收到下载请求:", format);

    if (format === "pdf") {
      return await generatePDF(resumeData);
    } else if (format === "docx") {
      return await generateDOCX(resumeData);
    } else {
      return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
    }

  } catch (error) {
    console.error("❌ 下载功能失败:", error);
    return NextResponse.json({ 
      error: "Download failed", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}

async function generatePDF(resumeData: any) {
  try {
    const pdf = new jsPDF();
    let yPosition = 20;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 20;
    const lineHeight = 7;

    // 设置字体
    pdf.setFont("helvetica");

    // 处理每个section
    for (const section of resumeData.sections) {
      // 检查是否需要新页面
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = 20;
      }

      // Section标题
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text(section.title, margin, yPosition);
      yPosition += lineHeight * 2;

      // 处理fields
      for (const field of section.fields) {
        // 检查是否需要新页面
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }

        // Field名称
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text(field.name, margin + 10, yPosition);
        yPosition += lineHeight;

        // Field值（如果有）
        if (field.value) {
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "normal");
          const valueLines = pdf.splitTextToSize(field.value, 170);
          pdf.text(valueLines, margin + 20, yPosition);
          yPosition += lineHeight * valueLines.length;
        }

        // Points（如果有）
        if (field.points && field.points.length > 0) {
          for (const point of field.points) {
            // 检查是否需要新页面
            if (yPosition > pageHeight - 20) {
              pdf.addPage();
              yPosition = 20;
            }

            pdf.setFontSize(10);
            pdf.setFont("helvetica", "normal");
            
            // 特殊处理技能标签
            if (section.title.toLowerCase().includes('technical') || section.title.toLowerCase().includes('skills')) {
              // 技能标签在同一行显示
              const skillsText = field.points.map((p: any) => p.content).join(', ');
              const skillsLines = pdf.splitTextToSize(skillsText, 170);
              pdf.text(skillsLines, margin + 20, yPosition);
              yPosition += lineHeight * skillsLines.length;
              break; // 只处理一次技能
            } else {
              // 普通列表项
              pdf.text(`• ${point.content}`, margin + 20, yPosition);
              yPosition += lineHeight;
            }
          }
        }

        yPosition += lineHeight; // 字段间距
      }

      yPosition += lineHeight; // Section间距
    }

    // 生成PDF buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="resume.pdf"',
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error("❌ PDF生成失败:", error);
    throw error;
  }
}

async function generateDOCX(resumeData: any) {
  try {
    const children: Paragraph[] = [];

    // 处理每个section
    for (const section of resumeData.sections) {
      // Section标题
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: section.title,
              bold: true,
              size: 32, // 16pt
            }),
          ],
          heading: HeadingLevel.HEADING_1,
          spacing: {
            after: 200,
          },
        })
      );

      // 处理fields
      for (const field of section.fields) {
        // Field名称
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: field.name,
                bold: true,
                size: 24, // 12pt
              }),
            ],
            spacing: {
              before: 100,
              after: 100,
            },
          })
        );

        // Field值（如果有）
        if (field.value) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: field.value,
                  size: 20, // 10pt
                }),
              ],
              spacing: {
                after: 100,
              },
            })
          );
        }

        // Points（如果有）
        if (field.points && field.points.length > 0) {
          // 特殊处理技能标签
          if (section.title.toLowerCase().includes('technical') || section.title.toLowerCase().includes('skills')) {
            // 技能标签在同一行显示
            const skillsText = field.points.map((p: any) => p.content).join(', ');
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: skillsText,
                    size: 20, // 10pt
                  }),
                ],
                spacing: {
                  after: 200,
                },
              })
            );
          } else {
            // 普通列表项
            for (const point of field.points) {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `• ${point.content}`,
                      size: 20, // 10pt
                    }),
                  ],
                  spacing: {
                    after: 50,
                  },
                })
              );
            }
          }
        }
      }
    }

    // 创建文档
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: children,
        },
      ],
    });

    // 生成DOCX buffer
    const buffer = await Packer.toBuffer(doc);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="resume.docx"',
        'Content-Length': buffer.length.toString(),
      },
    });

  } catch (error) {
    console.error("❌ DOCX生成失败:", error);
    throw error;
  }
}
