import { useLocation, useNavigate } from "react-router-dom";
import {
  BellIcon,
  CreditCardIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import Breadcrumbs, { type BreadcrumbItem } from "./Breadcrumbs";
import { Squares2X2Icon } from "@heroicons/react/24/outline";
import Avatar from "./Avatar";
import { GoSidebarExpand } from "react-icons/go";
import { useState } from "react";
import MenuPopup from "./MenuPopup";
import { LuLogOut } from "react-icons/lu";
import formatSegment from "../../utils/formatSegment";
import UserApis from "../../apis/UserApis";
import { useAuth } from "../../context/AuthProvider";

const Header: React.FC<{
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, setLogin, setUser } = useAuth();
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
            <div 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="cursor-pointer hover:scale-105 transition-all duration-200"
            >
              <div className="relative">
                <Avatar
                  name={user?.name || "User"}
                  email={user?.email || "john@example.com"}
                  collapsed={true}
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
            </div>
            {dropdownOpen && (
              <MenuPopup
                onClose={() => setDropdownOpen(false)}
                className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl z-50 border border-gray-100 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={user?.name || "User"}
                      email={user?.email || "john@example.com"}
                      collapsed={true}
                    />
                    <div>
                      <p className="font-semibold">{user?.name || 'User'}</p>
                      <p className="text-sm opacity-90">{user?.email || 'user@example.com'}</p>
                    </div>
                  </div>
                </div>
                <ul className="space-y-1 text-gray-700 p-2">
                  <li className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer transition-colors rounded-lg">
                    <div className="flex items-center gap-3">
                      <UserIcon className="w-5 h-5 text-gray-500" />
                      <span>Profile Settings</span>
                    </div>
                    <span className="text-xs text-gray-400">Ctrl+P</span>
                  </li>
                  <li className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer transition-colors rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCardIcon className="w-5 h-5 text-gray-500" />
                      <span>Billing & Plans</span>
                    </div>
                    <span className="text-xs text-gray-400">Ctrl+B</span>
                  </li>
                  <li className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer transition-colors rounded-lg">
                    <div className="flex items-center gap-3">
                      <BellIcon className="w-5 h-5 text-gray-500" />
                      <span>Notifications</span>
                    </div>
                    <span className="text-xs text-gray-400">Ctrl+N</span>
                  </li>
                  <div className="border-t border-gray-100 my-2"></div>
                  <li
                    className="flex items-center justify-between p-3 hover:bg-red-50 cursor-pointer transition-colors rounded-lg"
                    onClick={() => {
                      UserApis.signOut()
                        .then(() => {
                          setLogin(false);
                          setUser(null);
                          navigate("/login");
                        })
                        .catch(() => alert("Logout failed"));
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <LuLogOut className="w-5 h-5 text-red-500" />
                      <span className="text-red-500 font-medium">Sign Out</span>
                    </div>
                    <span className="text-xs text-gray-400">Ctrl+Q</span>
                  </li>
                </ul>
              </MenuPopup>
            )}
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
