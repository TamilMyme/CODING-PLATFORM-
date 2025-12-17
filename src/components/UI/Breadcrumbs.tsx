import { Link } from "react-router-dom";
import { HomeIcon } from "@heroicons/react/24/outline";
import formatSegment from "../../utils/formatSegment";

export interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: React.ElementType;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean; // optional home link
}

export default function Breadcrumbs({
  items,
  showHome = true,
}: BreadcrumbsProps) {
  const allItems = items;

  return (
    <nav className="flex items-center text-sm text-gray-500 select-none space-x-1">
      {showHome && (
        <Link to="/" className="flex items-center gap-1 hover:text-gray-700">
          <HomeIcon className="w-4 h-4" />
          Home
        </Link>
      )}
      {allItems.map((item, idx) => {
        const isLast = idx === allItems.length;
        const Icon = item.icon;

        return (
          <span key={item.path} className="flex items-center gap-1">
            {!isLast && <span className="text-gray-400">/</span>}

            {isLast ? (
              <span className="flex items-center gap-1 text-gray-700 font-medium">
                {Icon && <Icon className="w-4 h-4 text-gray-500" />}
                {formatSegment(item.label)}
              </span>
            ) : (
              <Link
                to={item.path}
                className="flex items-center gap-1 hover:text-gray-700 transition-colors"
              >
                {Icon && <Icon className="w-4 h-4 text-gray-400" />}
                {formatSegment(item.label)}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
