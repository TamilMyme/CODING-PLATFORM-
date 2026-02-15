import React, { useState, useEffect, useCallback } from "react";
import {
  TrophyIcon,
  FireIcon,
  CheckCircleIcon,
  ClockIcon,
  CalendarIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  ChartBarIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlayIcon,
  BookmarkIcon,
  StarIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XCircleIcon,
  ArrowPathIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";
import Avatar from "./UI/Avatar";
import StreakCalendar from "./UI/StreakCalendar";
import { Line, Doughnut } from "react-chartjs-2";
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
  ArcElement,
} from "chart.js";
import MockTestApis from "../apis/MockTestApis";
import LeaderboardApis from "../apis/LeaderboardApis";
import MockTestSubmissionApis from "../apis/MockTestSubmissionApis";
import QuestionApis from "../apis/QuestionApis";
import UserApis from "../apis/UserApis";
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
  Filler,
  ArcElement
);

// Types
interface Problem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  acceptanceRate: number;
  tags: string[];
  status: "solved" | "attempted" | "not_started";
}

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

// Utility function to strip HTML tags
const stripHtmlTags = (html: string): string => {
  if (!html) return "";
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const LeetCodeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upcomingTests, setUpcomingTests] = useState<IMockTest[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<"All" | "Easy" | "Medium" | "Hard">("All");
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [allTopics, setAllTopics] = useState<string[]>([]);
  const [streakData, setStreakData] = useState<{ date: string; count: number }[]>([]);

  // Get unique tags from fetched problems
  const allTags = ["All", ...allTopics];

  // Filter problems based on search, difficulty, and tags
  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         problem.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDifficulty = selectedDifficulty === "All" || problem.difficulty === selectedDifficulty;
    const matchesTag = selectedTag === "All" || problem.tags.includes(selectedTag);
    return matchesSearch && matchesDifficulty && matchesTag;
  });

  // Calculate stats from real data
  const totalProblems = problems.length;
  const solvedProblems = problems.filter(p => p.status === "solved").length;
  const attemptedProblems = problems.filter(p => p.status === "attempted").length;
  const acceptanceRate = totalProblems > 0 ? ((solvedProblems / totalProblems) * 100).toFixed(1) : "0";
  const streak = user?.streak || 0;
  const points = user?.points || 0;
  const maxStreak = user?.maxStreak || 0;

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all questions from backend
      const questionsResponse = await QuestionApis.getAllQuestions();
      const questions = Array.isArray(questionsResponse?.data?.questions) ? questionsResponse.data?.questions :
                       Array.isArray(questionsResponse) ? questionsResponse : [];
      
      // Fetch all topics for filtering
      const topicsResponse = await QuestionApis.getAllTopics();
      const topics = Array.isArray(topicsResponse?.data) ? topicsResponse.data :
                      Array.isArray(topicsResponse) ? topicsResponse : [];
      setAllTopics(topics);

      // Transform questions to Problem format with status
      // Note: In a real implementation, you'd fetch user's question submissions to determine status
      // Filter only coding questions (type === "coding")
      const codingQuestions = questions.filter((q: any) => q.type === "coding");
      
      const transformedProblems: Problem[] = codingQuestions.map((q: any, index: number) => ({
        id: String(index + 1), // Use index + 1 as display ID (1, 2, 3...)
        title: stripHtmlTags(q.title || q.question || "Untitled Problem"),
        difficulty: q.difficulty || "Medium",
        acceptanceRate: q.acceptanceRate || 50,
        tags: q.topics || q.tags || [],
        status: "not_started", // Default status, would be updated from user submissions
      }));

      // TODO: Fetch user's question submissions to update status
      // For now, we'll randomly assign some statuses for demo purposes
      const problemsWithStatus = transformedProblems.map((p, index) => {
        if (index < 3) return { ...p, status: "solved" as const };
        if (index < 6) return { ...p, status: "attempted" as const };
        return p;
      });

      setProblems(problemsWithStatus);

      // Fetch user's streak activity log
      if (user?._id) {
        try {
          const activityLogResponse = await UserApis.getUserActivityLog(user._id);
          const activityData = Array.isArray(activityLogResponse?.data) ? activityLogResponse.data :
                             Array.isArray(activityLogResponse) ? activityLogResponse : [];
          setStreakData(activityData);
        } catch (err) {
          console.error("Error fetching streak data:", err);
          // Set empty streak data on error
          setStreakData([]);
        }
      }

      // Fetch mock tests by batch (if user has a batch)
      if (user?.batch?._id) {
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
                borderColor: "#ffa116",
                backgroundColor: "rgba(255, 161, 22, 0.1)",
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: "#ffa116",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: "#ffa116",
                pointHoverBorderColor: "#fff",
                pointHoverBorderWidth: 3,
              },
            ],
          });
        } else {
          // No performance data available
          setPerformanceData(null);
        }
      }

    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  }, [user?._id, user?.batch?._id]);

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

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        cornerRadius: 8,
      },
    },
    cutout: "70%",
  };

  const doughnutData = {
    labels: ["Solved", "Attempted", "Not Started"],
    datasets: [
      {
        data: [solvedProblems, attemptedProblems, totalProblems - solvedProblems - attemptedProblems],
        backgroundColor: ["#2cba6e", "#ffc01e", "#eff1f6"],
        borderColor: ["#2cba6e", "#ffc01e", "#eff1f6"],
        borderWidth: 0,
      },
    ],
  };

  // Helper functions
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "text-[#00b8a3]";
      case "Medium": return "text-[#ffc01e]";
      case "Hard": return "text-[#ef4743]";
      default: return "text-gray-600";
    }
  };

  const getDifficultyBg = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-[#00b8a3]/10";
      case "Medium": return "bg-[#ffc01e]/10";
      case "Hard": return "bg-[#ef4743]/10";
      default: return "bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "solved":
        return <CheckCircleIcon className="w-5 h-5 text-[#2cba6e]" />;
      case "attempted":
        return <ClockIcon className="w-5 h-5 text-[#ffc01e]" />;
      default:
        return null;
    }
  };

  // Loading skeleton component
  const SkeletonCard = () => (
    <div className="bg-white rounded-lg p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  );

  // Error state component
  const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
    <div className="col-span-full bg-red-50 border border-red-200 rounded-lg p-6 text-center">
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
    <div className="min-h-screen bg-[#f7f8fa]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Track your progress and compete with others</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-[#f7f8fa] px-4 py-2 rounded-lg">
              <FireIcon className="w-5 h-5 text-[#ffa116]" />
              <span className="font-semibold text-gray-900">{streak}</span>
              <span className="text-sm text-gray-500">day streak</span>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-[#f7f8fa] px-4 py-2 rounded-lg">
              <StarIcon className="w-5 h-5 text-[#ffc01e]" />
              <span className="font-semibold text-gray-900">{points}</span>
              <span className="text-sm text-gray-500">points</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Problems Solved */}
          <div className="bg-white rounded-lg p-5 border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-[#2cba6e]" />
                <span className="text-sm text-gray-500">Problems Solved</span>
              </div>
              <span className="text-xs text-gray-400">Total: {totalProblems}</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-gray-900">{solvedProblems}</span>
              <span className="text-sm text-gray-500 mb-1">/ {totalProblems}</span>
            </div>
            <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#2cba6e] rounded-full transition-all duration-500"
                style={{ width: `${(solvedProblems / totalProblems) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Acceptance Rate */}
          <div className="bg-white rounded-lg p-5 border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5 text-[#00b8a3]" />
                <span className="text-sm text-gray-500">Acceptance Rate</span>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-gray-900">{acceptanceRate}%</span>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-gray-500">
              <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
              <span>Top 25% of your batch</span>
            </div>
          </div>

          {/* Streak */}
          <div className="bg-white rounded-lg p-5 border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FireIcon className="w-5 h-5 text-[#ffa116]" />
                <span className="text-sm text-gray-500">Current Streak</span>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-gray-900">{streak}</span>
              <span className="text-sm text-gray-500 mb-1">days</span>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-gray-500">
              <span>Keep it up! 🔥</span>
            </div>
          </div>

          {/* Points */}
          <div className="bg-white rounded-lg p-5 border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <StarIcon className="w-5 h-5 text-[#ffc01e]" />
                <span className="text-sm text-gray-500">Total Points</span>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-gray-900">{points}</span>
              <span className="text-sm text-gray-500 mb-1">pts</span>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-gray-500">
              <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
              <span>+{Math.floor(points * 0.1)} this week</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Problems List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Problems Section */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="border-b border-gray-200 px-5 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Problems</h2>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      showFilters ? 'bg-[#f7f8fa] text-gray-900' : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <FunnelIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Filters</span>
                  </button>
                </div>

                {/* Search and Filters */}
                <div className={`mt-4 space-y-3 ${showFilters ? 'block' : 'hidden'}`}>
                  {/* Search */}
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search problems..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00b8a3] focus:ring-1 focus:ring-[#00b8a3]"
                    />
                  </div>

                  {/* Filter Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {/* Difficulty Filter */}
                    <div className="flex items-center gap-1 bg-[#f7f8fa] rounded-lg p-1">
                      {["All", "Easy", "Medium", "Hard"].map((diff) => (
                        <button
                          key={diff}
                          onClick={() => setSelectedDifficulty(diff as any)}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                            selectedDifficulty === diff
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-500 hover:text-gray-900'
                          }`}
                        >
                          {diff}
                        </button>
                      ))}
                    </div>

                    {/* Tag Filter */}
                    <select
                      value={selectedTag}
                      onChange={(e) => setSelectedTag(e.target.value)}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-500 focus:outline-none focus:border-[#00b8a3]"
                    >
                      {allTags.map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Problems List */}
              <div className="divide-y divide-gray-100">
                {filteredProblems.length > 0 ? (
                  filteredProblems.map((problem) => (
                    <div
                      key={problem.id}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-[#f7f8fa] transition-colors cursor-pointer group"
                    >
                      {/* Status Icon */}
                      <div className="w-6 flex justify-center">
                        {getStatusIcon(problem.status)}
                      </div>

                      {/* Problem Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900 group-hover:text-[#00b8a3] transition-colors">
                            {problem.id}. {problem.title}
                          </h3>
                          {problem.status === "solved" && (
                            <span className="px-2 py-0.5 bg-[#2cba6e]/10 text-[#2cba6e] text-xs font-medium rounded-full">
                              Solved
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className={`font-medium ${getDifficultyColor(problem.difficulty)}`}>
                            {problem.difficulty}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500">{problem.acceptanceRate}% Acceptance</span>
                          <span className="text-gray-400">•</span>
                          <div className="flex items-center gap-1 text-gray-500">
                            {problem.tags.map((tag, idx) => (
                              <span key={idx}>{tag}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-100 rounded-lg">
                        <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="px-5 py-12 text-center">
                    <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">No problems found</h3>
                    <p className="text-xs text-gray-500">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>

              {/* View All Link */}
              <div className="border-t border-gray-200 px-5 py-3">
                <button className="flex items-center gap-2 text-sm font-medium text-[#00b8a3] hover:text-[#009a8a] transition-colors">
                  View All Problems
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Performance Chart */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 px-5 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Performance</h2>
                  {performanceTrend !== null && (
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
                  )}
                </div>
              </div>
              <div className="p-5">
                <div className="h-64">
                  {performanceData ? (
                    <Line data={performanceData} options={chartOptions} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <p>No performance data available yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Streak Calendar */}
            <StreakCalendar
              streakData={streakData}
              currentStreak={streak}
              maxStreak={maxStreak}
              totalSolved={solvedProblems}
            />

            {/* Progress Doughnut */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 px-5 py-4">
                <h2 className="text-lg font-semibold text-gray-900">Progress</h2>
              </div>
              <div className="p-5">
                <div className="h-48 relative">
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-3xl font-bold text-gray-900">{solvedProblems}</span>
                      <p className="text-xs text-gray-500 mt-1">Solved</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="w-3 h-3 bg-[#2cba6e] rounded-full mx-auto mb-1"></div>
                    <p className="text-xs text-gray-500">Solved</p>
                    <p className="text-sm font-semibold text-gray-900">{solvedProblems}</p>
                  </div>
                  <div>
                    <div className="w-3 h-3 bg-[#ffc01e] rounded-full mx-auto mb-1"></div>
                    <p className="text-xs text-gray-500">Attempted</p>
                    <p className="text-sm font-semibold text-gray-900">{attemptedProblems}</p>
                  </div>
                  <div>
                    <div className="w-3 h-3 bg-[#eff1f6] rounded-full mx-auto mb-1"></div>
                    <p className="text-xs text-gray-500">Todo</p>
                    <p className="text-sm font-semibold text-gray-900">{totalProblems - solvedProblems - attemptedProblems}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Test */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 px-5 py-4">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Test</h2>
              </div>
              <div className="p-5">
                {isLoading ? (
                  <SkeletonCard />
                ) : currentTest ? (
                  <div>
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#00b8a3] to-[#009a8a] rounded-xl flex items-center justify-center flex-shrink-0">
                        <AcademicCapIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{currentTest.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{currentTest.description || "No description"}</p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <ClockIcon className="w-4 h-4" />
                        <span>{currentTest.duration} minutes</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DocumentTextIcon className="w-4 h-4" />
                        <span>{currentTest.questions?.length || 0} questions</span>
                      </div>
                      {currentTest.startTime && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{new Date(currentTest.startTime).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    <button className="w-full py-2.5 bg-[#00b8a3] hover:bg-[#009a8a] text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
                      <PlayIcon className="w-4 h-4" />
                      Start Test
                    </button>
                  </div>
                ) : (
                  <EmptyState
                    icon={CalendarIcon}
                    title="No Upcoming Tests"
                    description="Check back later for new tests"
                  />
                )}
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 px-5 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Leaderboard</h2>
                  <TrophyIcon className="w-5 h-5 text-[#ffc01e]" />
                </div>
              </div>
              <div className="p-5">
                {isLoading ? (
                  <SkeletonCard />
                ) : leaderboardData.length > 0 ? (
                  <>
                    {/* Top 3 */}
                    <div className="space-y-3 mb-4">
                      {topThree.map((entry) => (
                        <div
                          key={entry.id}
                          className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                            entry.rank === 1
                              ? "bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200"
                              : entry.rank === 2
                              ? "bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200"
                              : "bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200"
                          }`}
                        >
                          {/* Rank */}
                          <div
                            className={`w-7 h-7 flex items-center justify-center rounded-full font-bold text-sm shrink-0 ${
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
                            <p className="text-xs text-gray-600">{entry.score} pts</p>
                          </div>

                          {/* Avatar */}
                          <Avatar
                            name={entry.name}
                            email={entry.email}
                            size="sm"
                            collapsed={true}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Current User Position */}
                    {currentUser && (
                      <div className="pt-3 border-t border-gray-200">
                        <p className="text-xs font-medium text-gray-500 mb-2">Your Position</p>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-[#00b8a3]/10 to-[#009a8a]/10 border border-[#00b8a3]/20">
                          {/* Rank */}
                          <div className="w-7 h-7 flex items-center justify-center rounded-full font-bold text-sm bg-gradient-to-br from-[#00b8a3] to-[#009a8a] text-white shrink-0">
                            {currentUser.rank}
                          </div>

                          {/* Name and Score */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {currentUser.name}
                            </p>
                            <p className="text-xs text-gray-600">{currentUser.score} pts</p>
                          </div>

                          {/* Avatar */}
                          <Avatar
                            name={currentUser.name}
                            email={currentUser.email}
                            size="sm"
                            collapsed={true}
                          />
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
            </div>

            {/* Recent Submissions */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 px-5 py-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Submissions</h2>
              </div>
              <div className="p-5">
                {isLoading ? (
                  <SkeletonCard />
                ) : testResults.length > 0 ? (
                  <div className="space-y-3">
                    {testResults.map((result) => (
                      <div
                        key={result.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#f7f8fa] transition-colors"
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          result.score >= 80 ? 'bg-green-50' : result.score >= 60 ? 'bg-yellow-50' : 'bg-red-50'
                        }`}>
                          <span className={`font-bold ${
                            result.score >= 80 ? 'text-green-600' : result.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {result.score}%
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {result.subject}
                          </p>
                          <p className="text-xs text-gray-500">{result.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={DocumentTextIcon}
                    title="No Submissions Yet"
                    description="Start solving problems to see your submissions"
                  />
                )}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-gradient-to-br from-[#00b8a3]/10 to-[#009a8a]/10 rounded-lg border border-[#00b8a3]/20 overflow-hidden">
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-3">
                  <LightBulbIcon className="w-5 h-5 text-[#00b8a3]" />
                  <h2 className="text-lg font-semibold text-gray-900">Quick Tip</h2>
                </div>
                <p className="text-sm text-gray-700">
                  Solve at least one problem daily to maintain your streak and improve your problem-solving skills!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeetCodeDashboard;
