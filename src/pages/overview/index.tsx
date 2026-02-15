import { useEffect, useState } from "react";
import KpiCard from "../../components/UI/KpiCard";
import { useAuth } from "../../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import Dashui from "../../components/Dashui";
import LeetCodeDashboard from "../../components/LeetCodeDashboard";
import StudentDashboard from "../../components/StudentDashboard";
import UserApis from "../../apis/UserApis";
import OrganisationApis from "../../apis/OrganisationApis";
import {
  ChartBarIcon,
  UserGroupIcon,
  BuildingLibraryIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  CalendarIcon,
  PlusIcon,
  DocumentArrowDownIcon,
  ChartPieIcon,
} from "@heroicons/react/24/outline";

interface DashboardData {
  totalStudents: number;
  activeCourses: number;
  totalOrganizations: number;
  recentActivity: ActivityItem[];
}

interface ActivityItem {
  id: number;
  type: "student" | "course";
  title: string;
  description: string;
  time: string;
  icon: "UserGroup" | "AcademicCap";
}

export default function OverviewPage() {
  const { user, isLogin } = useAuth();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalStudents: 0,
    activeCourses: 0,
    totalOrganizations: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user && !isLogin) {
      navigate("/login");
    }
  }, [user, isLogin, navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch real data from APIs
        const [studentsRes, orgsRes] = await Promise.all([
          UserApis.getAllUsersByRole("STUDENT"),
          OrganisationApis.getAllOrganisations(),
        ]);

        const students = studentsRes.data || [];
        const allOrgs = orgsRes.data || [];

        // Split organisations into colleges and other organisations
        const courses = allOrgs.filter((org: any) => org.type === "COLLEGE");
        const organizations = allOrgs.filter(
          (org: any) => org.type !== "COLLEGE",
        );

        // Calculate metrics
        const totalStudents = students.length;
        const activeCourses = courses.filter((c: any) => !c.isDeleted).length;
        const totalOrganizations = organizations.filter(
          (o: any) => !o.isDeleted,
        ).length;

        // Mock recent activity
        const recentActivity: ActivityItem[] = [
          {
            id: 1,
            type: "student",
            title: "New student registration",
            description: `${students[0]?.name || "John Doe"} joined Computer Science course`,
            time: "2 hours ago",
            icon: "UserGroup",
          },
          {
            id: 2,
            type: "course",
            title: "New course created",
            description: "Advanced React Patterns course added",
            time: "5 hours ago",
            icon: "AcademicCap",
          },
        ];

        setDashboardData({
          totalStudents,
          activeCourses,
          totalOrganizations,
          recentActivity,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (user && user?.role === "STUDENT") {
    return <StudentDashboard />;
  }

  const getActivityIcon = (iconType: string) => {
    switch (iconType) {
      case "UserGroup":
        return <UserGroupIcon className="w-5 h-5 text-indigo-600" />;
      case "AcademicCap":
        return <AcademicCapIcon className="w-5 h-5 text-green-600" />;
      default:
        return null;
    }
  };

  const getActivityBg = (type: string) => {
    switch (type) {
      case "student":
        return "bg-indigo-100";
      case "course":
        return "bg-green-100";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="mb-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="text-white">
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome back, {user?.name?.split(" ")[0] || "Admin"}!
              </h1>
              <p className="text-indigo-100 mt-1 text-sm md:text-base">
                Here's what's happening with your platform today
              </p>
            </div>

            {/* <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="block w-full px-4 py-2.5 border border-white/20 bg-white/10 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 sm:text-sm transition-all"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
              <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all font-medium text-sm shadow-md hover:shadow-lg">
                <DocumentArrowDownIcon className="w-5 h-5" />
                <span>Generate Report</span>
              </button>
            </div> */}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-50 to-transparent rounded-bl-full opacity-50"></div>
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <UserGroupIcon className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {dashboardData.totalStudents.toLocaleString()}
                </p>
                <p className="text-sm font-medium text-gray-600">
                  Total Students
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-50 to-transparent rounded-bl-full opacity-50"></div>
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <AcademicCapIcon className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {dashboardData.activeCourses.toLocaleString()}
                </p>
                <p className="text-sm font-medium text-gray-600">
                  Active Courses
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full opacity-50"></div>
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <BuildingLibraryIcon className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {dashboardData.totalOrganizations.toLocaleString()}
                </p>
                <p className="text-sm font-medium text-gray-600">
                  Organizations
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Student Growth Chart */}
        <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-indigo-100">
            <h2 className="text-xl font-semibold text-gray-900">
              Student Growth
            </h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Student Growth Analytics
              </h3>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors">
                  Week
                </button>
                <button className="px-3 py-1.5 text-sm bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Month
                </button>
                <button className="px-3 py-1.5 text-sm bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Year
                </button>
              </div>
            </div>
            <div className="h-64 bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg flex items-center justify-center relative">
              {loading ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-r-2 border-indigo-600"></div>
                  <p className="text-gray-500 mt-2">Loading chart data...</p>
                </div>
              ) : (
                <div className="w-full h-full">
                  {/* Simple Bar Chart Visualization */}
                  <div className="flex items-end justify-center h-full gap-2 px-4">
                    {/* Mock bars representing growth over time */}
                    <div className="flex items-end gap-1 h-full">
                      <div
                        className="w-8 bg-indigo-200 rounded-t"
                        style={{ height: "30%" }}
                      ></div>
                      <div
                        className="w-8 bg-indigo-300 rounded-t"
                        style={{ height: "45%" }}
                      ></div>
                      <div
                        className="w-8 bg-indigo-400 rounded-t"
                        style={{ height: "60%" }}
                      ></div>
                      <div
                        className="w-8 bg-indigo-500 rounded-t"
                        style={{ height: "75%" }}
                      ></div>
                      <div
                        className="w-8 bg-indigo-600 rounded-t"
                        style={{ height: "90%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 text-xs text-gray-500">
                    <span>Jan</span>
                    <span>Feb</span>
                    <span>Mar</span>
                    <span>Apr</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 border-b border-purple-100">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Activity
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {dashboardData.recentActivity.map((activity: any) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-b-0"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityBg(activity.type)}`}
                  >
                    {getActivityIcon(activity.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Quick Actions */}
        <div className=" bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-amber-100">
            <h2 className="text-xl font-semibold text-gray-900">
              Quick Actions
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <button className="group p-5 bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-xl hover:from-indigo-100 hover:to-indigo-200 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1">
                <UserGroupIcon className="w-8 h-8 text-indigo-600 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                <p className="text-sm font-medium text-indigo-900">
                  Add Student
                </p>
              </button>
              <button className="group p-5 bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl hover:from-emerald-100 hover:to-emerald-200 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1">
                <AcademicCapIcon className="w-8 h-8 text-emerald-600 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                <p className="text-sm font-medium text-emerald-900">
                  Create Course
                </p>
              </button>
              <button className="group p-5 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1">
                <BuildingLibraryIcon className="w-8 h-8 text-blue-600 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                <p className="text-sm font-medium text-blue-900">
                  Add Organization
                </p>
              </button>
              <button className="group p-5 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1">
                <DocumentTextIcon className="w-8 h-8 text-purple-600 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                <p className="text-sm font-medium text-purple-900">
                  Create Assessment
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
