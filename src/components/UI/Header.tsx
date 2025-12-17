import { useLocation } from "react-router-dom";
import { BellIcon, CreditCardIcon, UserIcon } from "@heroicons/react/24/outline";
import Breadcrumbs, { type BreadcrumbItem } from "./Breadcrumbs";
import { Squares2X2Icon } from "@heroicons/react/24/outline";
import Avatar from "./Avatar";
import { GoSidebarExpand } from "react-icons/go";
import { useState } from "react";
import MenuPopup from "./MenuPopup";
import { LuLogOut } from "react-icons/lu";
import formatSegment from "../../utils/formatSegment";

const Header: React.FC<{
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
      <div className="flex items-center justify-between px-6 py-4 bg-white m-2 shadow-md rounded-lg">
        {collapsed && (
          <button onClick={() => setCollapsed(false)}>
            <GoSidebarExpand className="w-6 h-6 mr-4" />
          </button>
        )}
        <div className="flex flex-col mr-auto">
          <h1 className="text-2xl font-semibold text-gray-900">
            {formatSegment(pageTitle)}
          </h1>
          {/* Optional: Small description or subtitle */}
          {/* <span className="text-sm text-gray-500 mt-1">
            {`Welcome to the ${formatSegment(pageTitle)} page`}
          </span> */}
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button
            className="p-2 rounded-full hover:bg-gray-100 transition"
            aria-label="Notifications"
          >
            <BellIcon className="w-6 h-6 text-gray-600" />
          </button>

          {/* User Avatar */}
          <div className=" relative">
            <div onClick={() => setDropdownOpen(true)}>
              <Avatar
                name="John Doe"
                email="john@example.com"
                collapsed={true}
              />
            </div>
            {dropdownOpen && (
              <MenuPopup
                onClose={() => setDropdownOpen(false)}
                className="absolute right-0 mt-5 w-64 bg-white rounded-md shadow-lg z-10"
              >
                <ul className="space-y-1 text-[#1d1d1f] p-2">
                  <li>
                    <Avatar name="John Doe" email="john@example.com" />
                  </li>
                  <hr />
                  <li className="flex items-center space-x-2 hover:bg-gray-200 p-2 rounded-md">
                    <UserIcon className="w-5 h-5" />
                    <span>Account</span>
                  </li>
                  <li className="flex items-center space-x-2 hover:bg-gray-200 p-2 rounded-md cursor-pointer">
                    <CreditCardIcon className="w-5 h-5" />
                    <span>Billing</span>
                  </li>
                  <li className="flex items-center space-x-2 hover:bg-gray-200 p-2 rounded-md cursor-pointer">
                    <BellIcon className="w-5 h-5" />
                    <span>Notifications</span>
                  </li>
                  <hr />
                  <li className="flex items-center space-x-2 hover:bg-gray-200 p-2 rounded-md cursor-pointer">
                    <LuLogOut className="w-5 h-5 text-red-500" />
                    <span>Log out</span>
                  </li>
                </ul>
              </MenuPopup>
            )}
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="px-6 py-2  border-gray-200">
        <Breadcrumbs items={breadcrumbs} />
      </div>
    </header>
  );
};

export default Header;
