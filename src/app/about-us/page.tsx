import Navbar from "../components/Navbar";

export default function AboutUsPage() {
  return (
    <div>
      <Navbar />
      <div className="p-6">
        <h1 className="text-2xl font-bold">About Us</h1>
        <p className="mt-2 text-gray-600">这里可以写项目介绍或团队介绍。</p>
      </div>
    </div>
  );
}
