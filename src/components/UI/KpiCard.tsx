interface KpiCardProps {
  title: string;
  value: string;
  change?: string;
  positive?: boolean;
}

export default function KpiCard({ title, value, change, positive }: KpiCardProps) {
  return (
    <div className="bg-white p-4 rounded-xl shadow flex flex-col">
      <span className="text-gray-500 text-sm">{title}</span>
      <span className="text-2xl font-bold">{value}</span>

      { change &&<span className={`text-sm mt-1 ${positive ? "text-green-600" : "text-red-600"}`}>
        {change} than last week
      </span>}
    </div>
  );
}
