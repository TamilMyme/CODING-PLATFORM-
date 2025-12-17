import KpiCard from "../../components/UI/KpiCard";

export default function OverviewPage() {
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard
          title="Total Courses"
          value="120"
        />
        <KpiCard
          title="Total Organization"
          value="57"
          
        />
        <KpiCard title="Total Sales" value="$217,027"/>
        <KpiCard
          title="Total Students"
          value="7,273"
          change="200"
          positive

        />
      </div>
    </div>
  );
}
