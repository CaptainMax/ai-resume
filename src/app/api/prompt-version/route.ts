import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const REGISTRY_PATH = path.join(process.cwd(), "src/prompts/shared/promptRegistry.json");

export async function GET() {
  try {
    const registryData = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
    
    // 提取当前版本信息
    const versionInfo = registryData.modules.map((module: any) => ({
      name: module.name,
      version: module.version || "v1",
      description: module.description,
      always: module.always || false,
      trigger: module.trigger || []
    }));

    return NextResponse.json({
      success: true,
      currentVersions: versionInfo,
      metadata: registryData.metadata
    });
  } catch (error) {
    console.error("❌ 读取版本信息失败:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to read version information"
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { moduleName, version } = await req.json();
    
    if (!moduleName || !version) {
      return NextResponse.json({
        success: false,
        error: "Missing moduleName or version"
      }, { status: 400 });
    }

    // 读取当前配置
    const registryData = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
    
    // 查找并更新模块版本
    const moduleIndex = registryData.modules.findIndex((m: any) => m.name === moduleName);
    if (moduleIndex === -1) {
      return NextResponse.json({
        success: false,
        error: `Module ${moduleName} not found`
      }, { status: 404 });
    }

    // 更新版本
    registryData.modules[moduleIndex].version = version;
    registryData.metadata.lastUpdated = new Date().toISOString();

    // 写回文件
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registryData, null, 2));

    console.log(`🔄 版本切换: ${moduleName} -> ${version}`);

    return NextResponse.json({
      success: true,
      message: `Successfully switched ${moduleName} to version ${version}`,
      updatedModule: {
        name: moduleName,
        version: version,
        description: registryData.modules[moduleIndex].description
      }
    });
  } catch (error) {
    console.error("❌ 版本切换失败:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to switch version"
    }, { status: 500 });
  }
}
