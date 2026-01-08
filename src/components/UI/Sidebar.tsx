// import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Squares2X2Icon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  BuildingLibraryIcon,
} from "@heroicons/react/24/outline";
import { GoSidebarCollapse } from "react-icons/go";
import Tooltip from "./Tooltip";
import { PiExam, PiRowsFill } from "react-icons/pi";
import { BiNotepad } from "react-icons/bi";
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
    user?.role === "super-admin"
      ? [
          { icon: Squares2X2Icon, label: "Dashboard", path: "/" },
          { icon: PiRowsFill, label: "Students", path: "/students" },
          { icon: BuildingLibraryIcon, label: "Colleges", path: "/colleges" },
          { icon: BiNotepad, label: "Questions", path: "/questions" },
          { icon: BiNotepad, label: "Mock Tests", path: "/tests" },
          { icon: BiNotepad, label: "Users", path: "/users" },
        ]
      : user?.role === "student"
      ? [
          { icon: Squares2X2Icon, label: "Dashboard", path: "/" },
          { icon: MdCastForEducation, label: "My Course", path: "/my-course" },
          { icon: PiExam, label: "Mock Tests", path: "/mock-tests" },

          // { icon: MdAssignment, label: "My Assignments", path: "/my-assignments" },
        ]
      : [{ icon: Squares2X2Icon, label: "Dashboard", path: "/" }];

  return (
    <aside
      className={`
        flex flex-col h-screen bg-[#465D96] border-r border-[#2E4173] relative
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-20" : "w-64"}
        text-white
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#2E4173]">
        <div
          className={`flex items-center gap-3 ${
            collapsed ? "justify-center w-full" : ""
          }`}
        >
          <div className="flex items-center justify-center h-10 w-full rounded-lg bg-white/30 shadow">
            <img
              src="./logo.png"
              alt="logo"
              className=" w-full h-full object-cover"
            />
          </div>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`
            py-2 rounded-lg transition text-white
          `}
          aria-label="Toggle Sidebar"
        >
          {!collapsed && <GoSidebarCollapse className="w-8 h-8" />}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        {!collapsed && (
          <h2 className="px-3 text-xs font-semibold uppercase mb-2 select-none tracking-wider text-white/70">
            Menu
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
                    <>
                      <span className="flex-1 text-sm select-none">
                        {label}
                      </span>
                      {badge && (
                        <span className="text-xs bg-white/40 text-white rounded-full px-2 py-0.5 font-semibold">
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
      {/* <div className="p-4 border-t border-[#2E4173] flex items-center relative w-full text-white">
        <div onClick={() => setDropdownOpen(true)} className="cursor-pointer">
          <Avatar
            name="John Doe"
            email="john@example.com"
            collapsed={collapsed}
          />
        </div>

        {dropdownOpen && (
          <MenuPopup
            onClose={() => setDropdownOpen(false)}
            className="absolute -right-64 bottom-2 mt-2 w-64 bg-white rounded-md shadow-lg z-10"
          >
            <ul className="space-y-1 text-[#1d1d1f] p-2">
              <li>
                <Avatar name="John Doe" email="john@example.com" />
              </li>
              <hr />
              <li className="hover:bg-gray-200 p-2 rounded-md">Account</li>
              <li className="hover:bg-gray-200 p-2 rounded-md">Billing</li>
              <li className="hover:bg-gray-200 p-2 rounded-md">
                Notifications
              </li>
              <hr />
              <li className="hover:bg-gray-200 p-2 rounded-md">Log out</li>
            </ul>
          </MenuPopup>
        )}
      </div> */}
    </aside>
  );
}

export default Sidebar;
