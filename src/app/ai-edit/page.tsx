import Navbar from "../components/Navbar";
import SectionList from "../components/section/SectionList";
import ResumePreview from "../components/resumePreview/ResumePreview";
import { AiPanel } from "../components/aiPanel";   // ✅ 改这里

export default function AiEditPage() {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <SectionList />
        <ResumePreview />
        <AiPanel />   {/* ✅ 替换掉旧的 AiChat */}
      </div>
    </div>
  );
}
