import { useState } from "react";
import Header from "./UI/Header";
import Sidebar from "./UI/Sidebar";
// import { useLocation } from "react-router-dom";

export default function Layout({ children }: { children: React.ReactNode }) {
  // const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Generate breadcrumbs based on path segments
  // const pathSegments = location.pathname.split("/").filter(Boolean); // remove empty segments

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header collapsed={collapsed} setCollapsed={setCollapsed} />

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
