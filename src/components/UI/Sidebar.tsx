// import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Squares2X2Icon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  BuildingLibraryIcon,
  ChartBarIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { HiMenuAlt2, HiX } from "react-icons/hi";
import Tooltip from "./Tooltip";
import { PiExam } from "react-icons/pi";
import { useAuth } from "../../context/AuthProvider";
import { MdAssignment, MdCastForEducation } from "react-icons/md";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: string;
}

// const secondaryNavItems: NavItem[] = [
//   { icon: Cog6ToothIcon, label: "Settings", path: "/settings" },
//   { icon: QuestionMarkCircleIcon, label: "Help", path: "/help" },
// ];

function Sidebar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  // const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const mainNavItems: NavItem[] =
    user?.role === "SUPER_ADMIN"
      ? [
          { icon: ChartBarIcon, label: "Dashboard", path: "/" },
          { icon: UserGroupIcon, label: "Students", path: "/students" },
          { icon: BuildingOfficeIcon, label: "Institutions", path: "/institutions" },
          { icon: MdCastForEducation, label: "Courses", path: "/my-course" },
          { icon: Squares2X2Icon, label: "Batches", path: "/batches" },
          { icon: DocumentTextIcon, label: "Questions", path: "/questions" },
          { icon: AcademicCapIcon, label: "Mock Tests", path: "/tests" },
          { icon: UserGroupIcon, label: "Users", path: "/users" },
        ]
      : user?.role === "STUDENT"
      ? [
          { icon: ChartBarIcon, label: "Dashboard", path: "/" },
          { icon: MdCastForEducation, label: "My Course", path: "/my-course" },
          { icon: PiExam, label: "Mock Tests", path: "/mock-tests" },
        ]
      : [{ icon: ChartBarIcon, label: "Dashboard", path: "/" }];

  return (
    <aside
      className={`
        flex flex-col h-screen bg-gradient-to-b from-indigo-700 to-indigo-900 border-r border-indigo-800/50 relative
        transition-all duration-300 ease-in-out shadow-xl
        ${collapsed ? "w-20" : "w-72"}
        text-white
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-indigo-600/30">
        <div
          className={`flex items-center gap-3 ${
            collapsed ? "justify-center w-full" : ""
          }`}
        >
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-wide text-white">Code Platform</span>
              <span className="text-xs text-white/70 font-medium">Skills & Brains</span>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`
            p-2 rounded-lg transition-all duration-200 text-white hover:bg-white/10
          `}
          aria-label="Toggle Sidebar"
        >
          {collapsed ? <HiMenuAlt2 className="w-6 h-6" /> : <HiX className="w-6 h-6" />}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        {!collapsed && (
          <h2 className="px-4 text-xs font-semibold uppercase mb-6 select-none tracking-wider text-white/60">
            Main Menu
          </h2>
        )}

        <ul className="space-y-2">
          {mainNavItems.map(({ icon: Icon, label, path, badge }) => {
            const isActive = location.pathname === path;
            return (
              <li key={path}>
                <NavLink
                  to={path}
                  className={`
                    group flex items-center gap-4 px-4 py-3 rounded-xl
                    transition-all duration-200 relative overflow-hidden
                    ${
                      isActive
                        ? "bg-white/20 shadow-lg backdrop-blur-sm border border-white/10"
                        : "hover:bg-white/10 hover:translate-x-1"
                    }
                    ${collapsed ? "justify-center" : ""}
                  `}
                >
                  {isActive && !collapsed && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>
                  )}
                  
                  {!collapsed ? (
                    <Icon
                      className={`w-5 h-5 shrink-0 ${
                        isActive
                          ? "text-white"
                          : "text-white/80 group-hover:text-white"
                      }`}
                    />
                  ) : (
                    <Tooltip text={label} place="right">
                      <Icon
                        className={`w-5 h-5 shrink-0 ${
                          isActive
                            ? "text-white"
                            : "text-white/80 group-hover:text-white"
                        }`}
                      />
                    </Tooltip>
                  )}

                  {!collapsed && (
                    <>
                      <span className={`flex-1 text-sm font-medium select-none ${
                        isActive ? "text-white" : "text-white/80 group-hover:text-white"
                      }`}>
                        {label}
                      </span>
                      {badge && (
                        <span className="text-xs bg-white/20 backdrop-blur-sm text-white rounded-full px-2 py-1 font-semibold border border-white/20">
                          {badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>

        {/* {!collapsed && (
          <h2 className="mt-8 px-3 text-xs font-semibold uppercase mb-2 select-none tracking-wider text-white/70">
            Support
          </h2>
        )}

        <ul className="space-y-2">
          {secondaryNavItems.map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path;

            return (
              <li key={path}>
                <NavLink
                  to={path}
                  className={`
                    group flex items-center gap-3 px-3 py-2 rounded-md
                    transition-colors duration-200
                    ${
                      isActive
                        ? "bg-white/30 text-white font-semibold"
                        : "hover:bg-white/20 hover:text-white"
                    }
                    ${collapsed ? "justify-center" : ""}
                  `}
                >
                  {!collapsed ? (
                    <Icon
                      className={`w-6 h-6 shrink-0 ${
                        isActive
                          ? "text-white"
                          : "text-white group-hover:text-white"
                      }`}
                    />
                  ) : (
                    <Tooltip text={label} place="right">
                      <Icon
                        className={`w-6 h-6 shrink-0 ${
                          isActive
                            ? "text-white"
                            : "text-white group-hover:text-white"
                        }`}
                      />
                    </Tooltip>
                  )}

                  {!collapsed && (
                    <span className="flex-1 text-sm select-none">{label}</span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul> */}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-indigo-600/30">
        {!collapsed ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-white/70 truncate">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-white/60">Role</span>
              <span className="text-xs font-medium text-white bg-white/10 px-2 py-1 rounded-full">
                {user?.role === 'SUPER_ADMIN' ? 'Admin' : user?.role || 'User'}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <Tooltip text={`${user?.name || 'User'} (${user?.role === 'SUPER_ADMIN' ? 'Admin' : user?.role || 'User'})`} place="right">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white font-semibold cursor-pointer hover:scale-105 transition-transform">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </Tooltip>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
