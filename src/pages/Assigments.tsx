import React, { useEffect, useState } from "react";
import {
  ClockIcon,
  DocumentTextIcon,
  PlayCircleIcon,
  SparklesIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  TrophyIcon,
  UsersIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import MockTestApis from "../apis/MockTestApis";
import type { IMockTest } from "../types/interfaces";
import { useNavigate } from "react-router-dom";

const MockTestList = () => {
  const [mockTests, setMockTests] = useState<IMockTest[]>([]);
  const [filteredTests, setFilteredTests] = useState<IMockTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMockTests = async () => {
      try {
        const res = await MockTestApis.getAllMockTests();
        setMockTests(res.data.mockTests);
        setFilteredTests(res.data.mockTests);
      } catch (err) {
        setError("Failed to load mock tests");
      } finally {
        setLoading(false);
      }
    };

    fetchMockTests();
  }, []);

  useEffect(() => {
    let filtered = mockTests;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((test) =>
        test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (test.description && test.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by status
    if (selectedStatus !== "all") {
      const now = new Date();
      filtered = filtered.filter((test) => {
        const isLive =
          test.isPublished &&
          (!test.startTime || new Date(test.startTime) <= now) &&
          (!test.endTime || new Date(test.endTime) >= now);
        
        if (selectedStatus === "live") return isLive;
        if (selectedStatus === "upcoming") return !isLive && test.startTime && new Date(test.startTime) > now;
        if (selectedStatus === "ended") return !isLive && test.endTime && new Date(test.endTime) < now;
        return true;
      });
    }

    setFilteredTests(filtered);
  }, [searchTerm, selectedStatus, mockTests]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
  };

  const getStatusBadge = (test: IMockTest) => {
    const now = new Date();
    const isLive =
      test.isPublished &&
      (!test.startTime || new Date(test.startTime) <= now) &&
      (!test.endTime || new Date(test.endTime) >= now);
    const isUpcoming = !isLive && test.startTime && new Date(test.startTime) > now;
    const isEnded = !isLive && test.endTime && new Date(test.endTime) < now;

    if (isLive) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm">
          <CheckCircleIcon className="w-3.5 h-3.5" />
          Live Now
        </span>
      );
    } else if (isUpcoming) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border border-amber-200 shadow-sm">
          <ClockIcon className="w-3.5 h-3.5" />
          Upcoming
        </span>
      );
    } else if (isEnded) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 border border-gray-200 shadow-sm">
          <XCircleIcon className="w-3.5 h-3.5" />
          Ended
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 border border-gray-200 shadow-sm">
          <ClockIcon className="w-3.5 h-3.5" />
          Draft
        </span>
      );
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-medium">Loading mock tests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-md">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-semibold text-lg mb-2">Error Loading Tests</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="">
        {/* HEADER */}
        <div className="mb-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="text-white">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                  <SparklesIcon className="w-8 h-8" />
                  Mock Tests
                </h1>
                <p className="text-indigo-100 mt-2 text-sm md:text-base">
                  Attempt mock tests to evaluate your preparation
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
                <div className="relative flex-1 sm:max-w-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search tests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                  />
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                    showFilters
                      ? "bg-white text-indigo-600 shadow-md"
                      : "bg-white/20 text-white border border-white/30 hover:bg-white/30"
                  }`}
                >
                  <FunnelIcon className="w-4 h-4" />
                  <span>Filters</span>
                </button>
              </div>
            </div>

            {/* FILTERS PANEL */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-indigo-400/30 animate-in slide-in-from-top duration-300">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-white">Status:</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="px-3 py-2 rounded-lg border-0 bg-white/90 text-gray-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="all">All Tests</option>
                      <option value="live">Live Now</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="ended">Ended</option>
                    </select>
                  </div>

                  {(searchTerm || selectedStatus !== "all") && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <XCircleIcon className="w-4 h-4" />
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* STATS BAR */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-indigo-100">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <DocumentTextIcon className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Total Tests</p>
                  <p className="text-lg font-bold text-gray-900">{mockTests.length}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Live Tests</p>
                  <p className="text-lg font-bold text-gray-900">
                    {mockTests.filter((test) => {
                      const now = new Date();
                      return (
                        test.isPublished &&
                        (!test.startTime || new Date(test.startTime) <= now) &&
                        (!test.endTime || new Date(test.endTime) >= now)
                      );
                    }).length}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <ClockIcon className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Upcoming</p>
                  <p className="text-lg font-bold text-gray-900">
                    {mockTests.filter((test) => {
                      const now = new Date();
                      return (
                        !test.isPublished ||
                        (test.startTime && new Date(test.startTime) > now)
                      );
                    }).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TEST LIST */}
        {filteredTests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTests.map((test, index) => (
              <div
                key={test._id}
                className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/20 overflow-hidden transform hover:-translate-y-1"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* CARD HEADER */}
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-5 py-4 border-b border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    {getStatusBadge(test)}
                  </div>
                  <h2 className="font-bold text-xl text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {test.title}
                  </h2>
                  {test.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {test.description}
                    </p>
                  )}
                </div>

                {/* CARD BODY */}
                <div className="p-5">
                  {/* METRICS */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 p-3 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl">
                      <ClockIcon className="w-5 h-5 text-indigo-600" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Duration</p>
                        <p className="text-sm font-bold text-gray-900">{test.duration} mins</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                      <TrophyIcon className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Total Marks</p>
                        <p className="text-sm font-bold text-gray-900">{test.totalMarks}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl">
                      <UsersIcon className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Attempts</p>
                        <p className="text-sm font-bold text-gray-900">{test.allowedAttempts}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
                      <DocumentTextIcon className="w-5 h-5 text-amber-600" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Questions</p>
                        <p className="text-sm font-bold text-gray-900">{test.questions?.length || 0}</p>
                      </div>
                    </div>
                  </div>

                  {/* TIME INFO */}
                  {(test.startTime || test.endTime) && (
                    <div className="space-y-2 mb-4 p-3 bg-gray-50 rounded-xl">
                      {test.startTime && (
                        <div className="flex items-center gap-2 text-sm">
                          <CalendarIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">
                            Start: {new Date(test.startTime).toLocaleString()}
                          </span>
                        </div>
                      )}
                      {test.endTime && (
                        <div className="flex items-center gap-2 text-sm">
                          <CalendarIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">
                            End: {new Date(test.endTime).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ACTION BUTTON */}
                  <button
                    onClick={() => navigate(`/skill-brains/${test._id}`)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-[#465D96] to-[#5a7bc4] hover:from-[#3b4f85] hover:to-[#4a6ab3] text-white rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                  >
                    <PlayCircleIcon className="w-5 h-5" />
                    Start Test
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mb-6">
              <DocumentTextIcon className="w-10 h-10 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Mock Tests Found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedStatus !== "all"
                ? "Try adjusting your filters or search terms"
                : "There are no mock tests available at the moment"}
            </p>
            {(searchTerm || selectedStatus !== "all") && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
              >
                <FunnelIcon className="w-5 h-5" />
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MockTestList;
