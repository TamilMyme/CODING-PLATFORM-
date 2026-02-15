import React, { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  UsersIcon,
  TrophyIcon,
  AcademicCapIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { useNavigate, useParams } from "react-router-dom";
import MockTestApis from "../apis/MockTestApis";
import MockTestSubmissionApis from "../apis/MockTestSubmissionApis";

interface MockTest {
  _id: string;
  title: string;
  description?: string;
  duration: number;
  totalMarks: number;
  questions?: any[];
}

interface Submission {
  _id: string;
  mockTest: string;
  student: {
    _id: string;
    name: string;
    email: string;
  };
  totalScore: number;
  status: string;
  submittedAt: string;
  answers: any[];
}

const MockTestSubmissions: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  
  const [mockTest, setMockTest] = useState<MockTest | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"score" | "date" | "name">("score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const fetchData = async () => {
      if (!testId) return;
      
      setIsLoading(true);
      try {
        // Fetch mock test details
        const testResponse = await MockTestApis.getMockTest(testId);
        setMockTest(testResponse.data);

        // Fetch all submissions
        const allSubmissions = await MockTestSubmissionApis.getAllMockTestSubmissions();
        const submissions = Array.isArray(allSubmissions) ? allSubmissions : [];
        
        // Filter submissions for this specific test
        const testSubmissions = submissions.filter((sub: Submission) => sub.mockTest === testId);
        setSubmissions(testSubmissions);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [testId]);

  // Filter and sort submissions
  const filteredSubmissions = submissions
    .filter((sub) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        sub.student?.name?.toLowerCase().includes(term) ||
        sub.student?.email?.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === "score") {
        comparison = (a.totalScore || 0) - (b.totalScore || 0);
      } else if (sortBy === "date") {
        comparison = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
      } else if (sortBy === "name") {
        comparison = (a.student?.name || "").localeCompare(b.student?.name || "");
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });

  // Calculate statistics
  const totalSubmissions = filteredSubmissions.length;
  const averageScore = totalSubmissions > 0
    ? Math.round(filteredSubmissions.reduce((acc, sub) => acc + (sub.totalScore || 0), 0) / totalSubmissions)
    : 0;
  const highestScore = totalSubmissions > 0
    ? Math.max(...filteredSubmissions.map(sub => sub.totalScore || 0))
    : 0;
  const passRate = totalSubmissions > 0
    ? Math.round((filteredSubmissions.filter(sub => {
        const percentage = (mockTest?.totalMarks||0) > 0 ? (sub.totalScore / (mockTest?.totalMarks||0)) * 100 : 0;
        return percentage >= 50;
      }).length / totalSubmissions) * 100)
    : 0;

  const getScoreColor = (score: number) => {
    if (!mockTest?.totalMarks) return "text-gray-600";
    const percentage = mockTest.totalMarks > 0 ? (score / mockTest.totalMarks) * 100 : 0;
    if (percentage >= 70) return "text-emerald-600";
    if (percentage >= 50) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (!mockTest?.totalMarks) return "bg-gray-500";
    const percentage = mockTest.totalMarks > 0 ? (score / mockTest.totalMarks) * 100 : 0;
    if (percentage >= 70) return "bg-emerald-500";
    if (percentage >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  const getScoreBadge = (score: number) => {
    if (!mockTest?.totalMarks) return "bg-gray-100 text-gray-700 border-gray-200";
    const percentage = mockTest.totalMarks > 0 ? (score / mockTest.totalMarks) * 100 : 0;
    if (percentage >= 70) return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (percentage >= 50) return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 lg:p-6 font-['DM_Sans']">
      {/* Header */}
      <div className="mb-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold tracking-tight">
                  Test Submissions
                </h1>
              </div>
              <p className="text-indigo-100 text-sm">
                {mockTest?.title}
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by student name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
              />
            </div>

            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "score" | "date" | "name")}
                className="block px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
              >
                <option value="score">Sort by Score</option>
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all font-medium"
              >
                {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading submissions...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-50 to-transparent rounded-bl-full opacity-50"></div>
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <UsersIcon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{totalSubmissions}</p>
                    <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full opacity-50"></div>
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <AcademicCapIcon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{averageScore}</p>
                    <p className="text-sm font-medium text-gray-600">Average Score</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-50 to-transparent rounded-bl-full opacity-50"></div>
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <TrophyIcon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{highestScore}</p>
                    <p className="text-sm font-medium text-gray-600">Highest Score</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-50 to-transparent rounded-bl-full opacity-50"></div>
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <CheckCircleIcon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{passRate}%</p>
                    <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submissions Table */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Percentage
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Submitted At
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <DocumentTextIcon className="w-20 h-20 text-gray-300 mb-4" />
                          <h3 className="text-xl font-semibold text-gray-700 mb-2">No submissions found</h3>
                          <p className="text-gray-500">
                            {searchTerm
                              ? "No submissions match your search criteria"
                              : "Students haven't submitted this test yet"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((submission, idx) => (
                      <tr key={submission._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                              {(submission.student?.name || 'S')[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{submission.student?.name || 'Unknown'}</p>
                              <p className="text-sm text-gray-500">{submission.student?.email || ''}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`text-lg font-bold ${getScoreColor(submission.totalScore || 0)}`}>
                              {submission.totalScore || 0}
                            </span>
                            <span className="text-gray-500">/ {mockTest?.totalMarks || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-gray-200 rounded-full h-2 w-24">
                              <div
                                className={`h-2 rounded-full ${getScoreBg(submission.totalScore || 0)}`}
                                style={{ width: `${mockTest && mockTest.totalMarks > 0 ? ((submission.totalScore || 0) / mockTest.totalMarks) * 100 : 0}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              {mockTest && mockTest.totalMarks > 0
                                ? Math.round(((submission.totalScore || 0) / mockTest.totalMarks) * 100)
                                : 0}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                            <span>
                              {submission.submittedAt 
                                ? new Date(submission.submittedAt).toLocaleString()
                                : 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                            submission.status === 'submitted'
                              ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                              : 'bg-amber-100 text-amber-700 border-amber-200'
                          }`}>
                            {submission.status === 'submitted' ? (
                              <>
                                <CheckCircleIcon className="w-3.5 h-3.5" />
                                Submitted
                              </>
                            ) : (
                              <>
                                <ClockIcon className="w-3.5 h-3.5" />
                                In Progress
                              </>
                            )}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MockTestSubmissions;
