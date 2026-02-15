import { useLocation, useNavigate } from "react-router-dom";
import {
  BellIcon,
} from "@heroicons/react/24/outline";
import Breadcrumbs, { type BreadcrumbItem } from "./Breadcrumbs";
import { Squares2X2Icon } from "@heroicons/react/24/outline";
import Avatar from "./Avatar";
import { GoSidebarExpand } from "react-icons/go";
import formatSegment from "../../utils/formatSegment";
import { useAuth } from "../../context/AuthProvider";

const Header: React.FC<{
}> = () => {
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const pathSegments = location.pathname.split("/").filter(Boolean);

  const breadcrumbMap: Record<
    string,
    { label: string; icon: React.ElementType }
  > = {
    "": { label: "Dashboard", icon: Squares2X2Icon },
  };

  const breadcrumbs: BreadcrumbItem[] = pathSegments.map((segment, idx) => {
    const path = "/" + pathSegments.slice(0, idx + 1).join("/");
    const map = breadcrumbMap[segment];
    return {
      path,
      label: map?.label || segment,
      icon: map?.icon,
    };
  });

  const pageTitle =
    breadcrumbs.length > 0
      ? breadcrumbs[breadcrumbs.length - 1].label
      : "Dashboard";

  return (
    <header className="flex flex-col w-full">
      {/* Top Header: Title + Actions */}
      <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-white to-gray-50/90 backdrop-blur-md m-3 shadow-xl rounded-2xl border border-gray-100/50">
        {/* {collapsed && (
          <button 
            onClick={() => setCollapsed(false)}
            className="p-3 rounded-xl hover:bg-white/80 transition-all duration-300 mr-4 shadow-sm"
          >
            <GoSidebarExpand className="w-6 h-6 text-indigo-600" />
          </button>
        )} */}
        <div className="flex flex-col mr-auto">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {formatSegment(pageTitle)}
              </h1>
              <p className="text-sm text-gray-500 font-medium">
                {`Manage and control your ${formatSegment(pageTitle).toLowerCase()} from here`}
              </p>
            </div>
          </div>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 w-64 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
            />
            <div className="absolute left-3 top-2.5">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Notifications */}
          <button
            className="relative p-3 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
            aria-label="Notifications"
          >
            <BellIcon className="w-6 h-6 text-gray-600 group-hover:text-indigo-600 transition-colors" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">3</span>
          </button>

          {/* User Avatar */}
          <div className="relative">
            <div className="relative">
              <Avatar
                name={user?.name || "User"}
                email={user?.email || "john@example.com"}
                collapsed={true}
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      {/* <div className="px-6 py-3">
        <Breadcrumbs items={breadcrumbs} />
      </div> */}
    </header>
  );
};

export default Header;
