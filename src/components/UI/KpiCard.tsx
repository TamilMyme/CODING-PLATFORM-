import { type ReactElement } from "react";

interface KpiCardProps {
  title: string;
  value: string;
  change?: string;
  positive?: boolean;
  icon?: ReactElement;
}

export default function KpiCard({ title, value, change, positive, icon }: KpiCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-500 text-sm font-medium">{title}</span>
        {icon && <div className="text-indigo-600">{icon}</div>}
      </div>
      <span className="text-3xl font-bold text-gray-900">{value}</span>
      {change && (
        <div className={`flex items-center mt-2 text-sm ${positive ? "text-green-600" : "text-red-600"}`}>
          <span className="mr-1">{positive ? '↑' : '↓'}</span>
          <span>{change} from last period</span>
        </div>
      )}
    </div>
  );
}
