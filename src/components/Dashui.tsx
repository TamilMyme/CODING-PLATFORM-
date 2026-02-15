import React, { useState, useEffect, useCallback } from "react";
import {
  DocumentTextIcon,
  TrophyIcon,
  ClockIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowPathIcon,
  XCircleIcon,
  AcademicCapIcon
} from "@heroicons/react/24/outline";
import Avatar from "./UI/Avatar";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import MockTestApis from "../apis/MockTestApis";
import LeaderboardApis from "../apis/LeaderboardApis";
import MockTestSubmissionApis from "../apis/MockTestSubmissionApis";
import { useAuth } from "../context/AuthProvider";
import type { IMockTest, ILeaderboard } from "../types/interfaces";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  email: string;
  score: number;
  isCurrentUser?: boolean;
}

interface TestResult {
  id: string;
  subject: string;
  chapter: string;
  date: string;
  score: number;
  totalMarks: number;
}

const Dashui: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upcomingTests, setUpcomingTests] = useState<IMockTest[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!user?.batch?._id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch mock tests by batch
      const testsResponse = await MockTestApis.getMockTestsByBatch(user.batch._id);
      const tests = testsResponse?.data || testsResponse || [];
      
      // Filter for upcoming tests (startTime is in the future)
      const upcoming = tests.filter((test: IMockTest) => {
        if (!test.startTime) return false;
        return new Date(test.startTime) > new Date();
      }).slice(0, 3);
      
      setUpcomingTests(upcoming);

      // Fetch leaderboard by batch
      const leaderboardResponse = await LeaderboardApis.getLeaderboardByBatch(user.batch._id);
      const leaderboard = leaderboardResponse?.data || leaderboardResponse;
      
      if (leaderboard && leaderboard.rankings) {
        const entries: LeaderboardEntry[] = leaderboard.rankings.map((ranking: any, index: number) => ({
          id: ranking.user?._id || ranking.user,
          rank: index + 1,
          name: ranking.user?.name || 'Unknown',
          email: ranking.user?.email || '',
          score: ranking.score,
          isCurrentUser: ranking.user?._id === user._id || ranking.user === user._id,
        }));
        setLeaderboardData(entries);
      }

      // Fetch test submissions for current student
      const submissionsResponse = await MockTestSubmissionApis.getAllMockTestSubmissions();
      const submissions = submissionsResponse?.data?.mockTestSubmissions || submissionsResponse?.mockTestSubmissions || submissionsResponse || [];
      
      // Filter submissions for current student and populate test details
      const studentSubmissions = Array.isArray(submissions)
        ? submissions.filter((sub: any) => {
            const studentId = sub.student?._id || sub.student;
            return studentId === user._id && sub.status === 'evaluated';
          })
        : [];
      
      // Transform submissions to test results format
      const results: TestResult[] = await Promise.all(
        studentSubmissions.slice(0, 5).map(async (sub: any) => {
          let mockTestTitle = "Unknown Test";
          let mockTestTotalMarks = 100;
          
          // Fetch mock test details if not populated
          if (sub.mockTest && typeof sub.mockTest === 'object') {
            mockTestTitle = sub.mockTest.title || "Unknown Test";
            mockTestTotalMarks = sub.mockTest.totalMarks || 100;
          } else if (sub.mockTest) {
            try {
              const testResponse = await MockTestApis.getMockTest(sub.mockTest);
              const test = testResponse?.data || testResponse;
              mockTestTitle = test?.title || "Unknown Test";
              mockTestTotalMarks = test?.totalMarks || 100;
            } catch (e) {
              console.error("Error fetching mock test details:", e);
            }
          }
          
          const percentage = mockTestTotalMarks > 0
            ? Math.round((sub.totalScore / mockTestTotalMarks) * 100)
            : 0;
          
          return {
            id: sub._id,
            subject: mockTestTitle,
            chapter: sub.mockTest?.description || "Test",
            date: sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }) : new Date(sub.startedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }),
            score: percentage,
            totalMarks: mockTestTotalMarks,
          };
        })
      );
      
      setTestResults(results);

      // Performance data - Calculate from actual test results
      if (results.length > 0) {
        // Group results by month and calculate average scores
        const monthlyData: { [key: string]: number[] } = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        results.forEach((result: TestResult) => {
          const date = new Date(result.date);
          const monthKey = months[date.getMonth()];
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = [];
          }
          monthlyData[monthKey].push(result.score);
        });
        
        // Get last 6 months of data
        const labels: string[] = [];
        const data: number[] = [];
        const now = new Date();
        
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthKey = months[date.getMonth()];
          labels.push(monthKey);
          
          if (monthlyData[monthKey] && monthlyData[monthKey].length > 0) {
            const avg = monthlyData[monthKey].reduce((sum: number, score: number) => sum + score, 0) / monthlyData[monthKey].length;
            data.push(Math.round(avg * 10) / 10);
          } else if (data.length > 0) {
            // Use previous month's data if no data for current month
            data.push(data[data.length - 1]);
          } else {
            data.push(0);
          }
        }
        
        setPerformanceData({
          labels,
          datasets: [
            {
              label: "Performance",
              data,
              borderColor: "#465D96",
              backgroundColor: "rgba(70, 93, 150, 0.1)",
              fill: true,
              tension: 0.4,
              pointRadius: 4,
              pointBackgroundColor: "#465D96",
              pointBorderColor: "#fff",
              pointBorderWidth: 2,
              pointHoverRadius: 6,
              pointHoverBackgroundColor: "#465D96",
              pointHoverBorderColor: "#fff",
              pointHoverBorderWidth: 3,
            },
          ],
        });
      } else {
        // No performance data available
        setPerformanceData(null);
      }

    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  }, [user?.batch?._id, user?._id]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRetry = () => {
    setIsRetrying(true);
    fetchDashboardData();
  };

  const topThree = leaderboardData.filter((entry) => entry.rank <= 3);
  const currentUser = leaderboardData.find((entry) => entry.isCurrentUser);
  const currentTest = upcomingTests[0];
  
  // Calculate performance trend
  const performanceTrend = performanceData && performanceData.datasets[0].data.length >= 2
    ? (() => {
        const currentMonth = performanceData.datasets[0].data[performanceData.datasets[0].data.length - 1];
        const lastMonth = performanceData.datasets[0].data[performanceData.datasets[0].data.length - 2];
        return lastMonth !== 0 ? ((currentMonth - lastMonth) / lastMonth) * 100 : 0;
      })()
    : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: { size: 13 },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 50,
        max: 100,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
          drawBorder: false,
        },
        ticks: {
          font: { size: 11 },
          color: "#6B7280",
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 11 },
          color: "#6B7280",
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
  };

  // Loading skeleton component
  const SkeletonCard = () => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  );

  // Error state component
  const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
    <div className="col-span-full bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <XCircleIcon className="w-12 h-12 text-red-400 mx-auto mb-3" />
      <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Dashboard</h3>
      <p className="text-red-600 mb-4">{message}</p>
      <button
        onClick={onRetry}
        disabled={isRetrying}
        className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        <ArrowPathIcon className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`} />
        {isRetrying ? "Retrying..." : "Retry"}
      </button>
    </div>
  );

  // Empty state component
  const EmptyState = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Icon className="w-12 h-12 text-gray-300 mb-3" />
      <h3 className="text-sm font-semibold text-gray-700 mb-1">{title}</h3>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );

  if (error) {
    return <ErrorState message={error} onRetry={handleRetry} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {/* New Solved Papers Card */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-4 md:p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">New Solved Papers</h2>
        
        {isLoading ? (
          <SkeletonCard />
        ) : (
          <EmptyState
            icon={DocumentTextIcon}
            title="No Solved Papers"
            description="Solved papers will appear here once available"
          />
        )}
      </div>

      {/* Leaderboard Card */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-4 md:p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Leaderboard</h2>
          <TrophyIcon className="w-5 h-5 text-[#465D96]" />
        </div>

        {isLoading ? (
          <SkeletonCard />
        ) : leaderboardData.length > 0 ? (
          <>
            {/* Top 3 */}
            <div className="space-y-3 mb-4">
              {topThree.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                    entry.rank === 1
                      ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 shadow-sm"
                      : entry.rank === 2
                      ? "bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200"
                      : "bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200"
                  }`}
                >
                  {/* Rank */}
                  <div
                    className={`w-7 h-7 flex items-center justify-center rounded-full font-bold text-sm shrink-0 shadow-sm ${
                      entry.rank === 1
                        ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-white"
                        : entry.rank === 2
                        ? "bg-gradient-to-br from-gray-400 to-slate-500 text-white"
                        : "bg-gradient-to-br from-orange-400 to-amber-500 text-white"
                    }`}
                  >
                    {entry.rank}
                  </div>

                  {/* Name and Score */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {entry.name}
                    </p>
                    <p className="text-xs text-gray-600 font-medium">{entry.score} pts</p>
                  </div>

                  {/* Avatar with Medal */}
                  <div className="shrink-0 relative">
                    {entry.rank <= 3 && (
                      <div className="absolute -left-7 top-1/2 -translate-y-1/2 z-10">
                        <TrophyIcon
                          className={`w-6 h-6 ${
                            entry.rank === 1
                              ? "text-yellow-500 drop-shadow-sm"
                              : entry.rank === 2
                              ? "text-gray-400"
                              : "text-orange-500"
                          }`}
                        />
                      </div>
                    )}
                    <Avatar
                      name={entry.name}
                      email={entry.email}
                      size="sm"
                      collapsed={true}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Current User Position */}
            {currentUser && (
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-500 mb-2">Your Position</p>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-200 shadow-sm">
                  {/* Rank */}
                  <div className="w-7 h-7 flex items-center justify-center rounded-full font-bold text-sm bg-gradient-to-br from-indigo-500 to-blue-600 text-white shrink-0 shadow-sm">
                    {currentUser.rank}
                  </div>

                  {/* Name and Score */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-xs text-gray-600 font-medium">{currentUser.score} pts</p>
                  </div>
                  {/* Avatar */}
                  <div className="shrink-0">
                    <Avatar
                      name={currentUser.name}
                      email={currentUser.email}
                      size="sm"
                      collapsed={true}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <EmptyState 
            icon={TrophyIcon}
            title="No Rankings Yet"
            description="Complete tests to appear on the leaderboard"
          />
        )}
      </div>

      {/* Performance Card */}
      <div className="bg-white h-96 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-4 md:p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Performance</h2>
          <div className="flex items-center gap-2">
            {performanceTrend !== null ? (
              <>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                  performanceTrend >= 0 ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  {performanceTrend >= 0 ? (
                    <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowTrendingDownIcon className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-sm font-semibold ${
                    performanceTrend >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Math.abs(performanceTrend).toFixed(1)}%
                  </span>
                </div>
                <span className="text-xs text-gray-500">vs last month</span>
              </>
            ) : null}
          </div>
        </div>
        
        {isLoading ? (
          <div className="h-64 animate-pulse bg-gray-100 rounded-lg"></div>
        ) : performanceData ? (
          <div className="h-64">
            <Line data={performanceData} options={chartOptions} />
          </div>
        ) : (
          <EmptyState
            icon={ArrowTrendingUpIcon}
            title="No Performance Data"
            description="Complete tests to see your progress"
          />
        )}
      </div>
      
      {/* Calendar Card */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-4 md:p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Calendar</h2>
          <CalendarIcon className="w-5 h-5 text-[#465D96]" />
        </div>
        
        {isLoading ? (
          <SkeletonCard />
        ) : (
          <EmptyState
            icon={CalendarIcon}
            title="No Upcoming Events"
            description="Your schedule will appear here"
          />
        )}
      </div>

      {/* Recent Test Results Card */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-4 md:p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Test Results</h2>
        
        {isLoading ? (
          <SkeletonCard />
        ) : testResults.length > 0 ? (
          <div className="space-y-3">
            {testResults.map((result) => (
              <div
                key={result.id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg hover:from-gray-100 hover:to-slate-100 transition-all duration-200 border border-gray-100"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {result.subject}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">{result.chapter}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3" />
                    {result.date}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16">
                    <svg className="transform -rotate-90 w-16 h-16">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="#e5e7eb"
                        strokeWidth="6"
                        fill="none"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke={result.score >= 70 ? "#10B981" : result.score >= 50 ? "#F59E0B" : "#EF4444"}
                        strokeWidth="6"
                        fill="none"
                        strokeDasharray={`${result.score * 1.76} ${100 * 1.76}`}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-900">
                        {result.score}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState 
            icon={DocumentTextIcon}
            title="No Test Results"
            description="Complete tests to see your results"
          />
        )}
      </div>
    </div>
  );
};

export default Dashui;
