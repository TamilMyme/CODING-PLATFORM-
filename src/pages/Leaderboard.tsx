"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XCircleIcon,
  UserGroupIcon,
  TrophyIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { MdClose } from "react-icons/md";
import LeaderboardApis from "../apis/LeaderboardApis";
import BatchApis from "../apis/BatchApis";
import UserApis from "../apis/UserApis";
import LabelInput from "../components/UI/LabelInput";
import type { ILeaderboard, IBatch, IUser } from "../types/interfaces";

const Leaderboard: React.FC = () => {
  const [leaderboards, setLeaderboards] = useState<ILeaderboard[]>([]);
  const [batches, setBatches] = useState<IBatch[]>([]);
  const [students, setStudents] = useState<IUser[]>([]);
  const [selectedLeaderboard, setSelectedLeaderboard] = useState<ILeaderboard | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);

  useEffect(() => {
    fetchLeaderboards();
    fetchBatches();
    fetchStudents();
  }, []);

  const fetchLeaderboards = async () => {
    try {
      const data = await LeaderboardApis.getAllLeaderboards();
      setLeaderboards(data.data.leaderboards || []);
    } catch (error) {
      console.error("Error fetching leaderboards:", error);
    }
  };

  const fetchBatches = async () => {
    try {
      const data = await BatchApis.getAll();
      setBatches(data);
    } catch (error) {
      console.error("Error fetching batches:", error);
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await UserApis.getAllUsersByRole('STUDENT');
      setStudents(data.data.users || data.data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleViewLeaderboard = async (leaderboard: ILeaderboard) => {
    try {
      const data = await LeaderboardApis.getLeaderboardById(leaderboard._id);
      setSelectedLeaderboard(data.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  };

  const handleCreateLeaderboard = async (batchId: string) => {
    try {
      await LeaderboardApis.createLeaderboard({ batch: batchId, rankings: [] });
      fetchLeaderboards();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating leaderboard:", error);
    }
  };

  const handleDeleteLeaderboard = async (id: string) => {
    try {
      await LeaderboardApis.deleteLeaderboard(id);
      fetchLeaderboards();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error deleting leaderboard:", error);
    }
  };

  const handleAddUserToLeaderboard = async (userId: string, score: number) => {
    if (!selectedLeaderboard) return;
    try {
      await LeaderboardApis.addOrUpdateUserRanking(selectedLeaderboard._id, { userId, score });
      const data = await LeaderboardApis.getLeaderboardById(selectedLeaderboard._id);
      setSelectedLeaderboard(data.data);
    } catch (error) {
      console.error("Error adding user to leaderboard:", error);
    }
  };

  const handleRemoveUserFromLeaderboard = async (userId: string) => {
    if (!selectedLeaderboard) return;
    try {
      await LeaderboardApis.removeUserFromLeaderboard(selectedLeaderboard._id, userId);
      const data = await LeaderboardApis.getLeaderboardById(selectedLeaderboard._id);
      setSelectedLeaderboard(data.data);
    } catch (error) {
      console.error("Error removing user from leaderboard:", error);
    }
  };

  // Filtering logic
  let filteredLeaderboards = leaderboards;

  if (searchTerm) {
    filteredLeaderboards = filteredLeaderboards.filter((lb) => {
      const batchName = typeof lb.batch === 'object' ? lb.batch.name : 'Unknown Batch';
      return batchName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }

  const totalPages = Math.ceil(filteredLeaderboards.length / itemsPerPage);
  const paginatedLeaderboards = filteredLeaderboards.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="mb-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="text-white">
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <TrophyIcon className="w-8 h-8" />
                Leaderboards
              </h1>
              <p className="text-indigo-100 mt-1 text-sm md:text-base">
                Manage student rankings for your batches
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 sm:max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search leaderboards..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                />
              </div>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all font-medium text-sm shadow-md hover:shadow-lg"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Create Leaderboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-50 to-transparent rounded-bl-full opacity-50"></div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <TrophyIcon className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{leaderboards.length}</p>
                  <p className="text-sm font-medium text-gray-600">Total Leaderboards</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-50 to-transparent rounded-bl-full opacity-50"></div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <UserGroupIcon className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {leaderboards.reduce((total, lb) => total + (lb.rankings?.length || 0), 0)}
                  </p>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-50 to-transparent rounded-bl-full opacity-50"></div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <ChartBarIcon className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {leaderboards.length > 0
                      ? Math.round(
                          leaderboards.reduce((total, lb) => total + (lb.rankings?.length || 0), 0) /
                          leaderboards.length
                        )
                      : 0}
                  </p>
                  <p className="text-sm font-medium text-gray-600">Avg Students/LB</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboards Grid */}
      {filteredLeaderboards.length === 0 ? (
        <div className="bg-gradient-to-br from-white to-blue-50/30 border-2 border-dashed border-blue-200 rounded-3xl p-16 text-center shadow-sm">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
              <TrophyIcon className="w-10 h-10 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No leaderboards found
            </h3>
            <p className="text-base text-gray-600 leading-relaxed mb-8">
              {searchTerm
                ? "Try adjusting your search to find what you're looking for."
                : "Create leaderboards for your batches to track student rankings"}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-600/95 hover:to-purple-600/95 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <PlusIcon className="w-5 h-5" />
                Create Your First Leaderboard
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedLeaderboards.map((leaderboard) => (
            <div
              key={leaderboard._id}
              className="bg-white rounded-2xl border border-gray-200/60 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl text-sm font-bold shadow-sm bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700">
                      🏆
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                      {leaderboard.rankings?.length || 0} students
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleViewLeaderboard(leaderboard)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 flex-shrink-0"
                      title="View leaderboard"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteLeaderboard(leaderboard._id)}
                      className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-200 flex-shrink-0"
                      title="Delete leaderboard"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {typeof leaderboard.batch === 'object' && leaderboard.batch.name
                    ? leaderboard.batch.name
                    : 'Batch Leaderboard'}
                </h3>

                {leaderboard.rankings && leaderboard.rankings.length > 0 && (
                  <div className="space-y-2">
                    {leaderboard.rankings.slice(0, 3).map((ranking, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0
                            ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white'
                            : index === 1
                            ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white'
                            : index === 2
                            ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {index + 1}
                        </span>
                        <span className="flex-1 text-sm text-gray-700 truncate">
                          {typeof ranking.user === 'object' ? ranking.user.name : 'Student'}
                        </span>
                        <span className="text-sm font-semibold text-indigo-600">
                          {ranking.score} pts
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg transition-colors ${
                  currentPage === page
                    ? "bg-indigo-600 text-white"
                    : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Leaderboard View Modal */}
      {isModalOpen && selectedLeaderboard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-100">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-purple-600">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  🏆 Leaderboard
                </h3>
                <p className="text-sm text-indigo-100 mt-1">
                  {typeof selectedLeaderboard.batch === 'object' && selectedLeaderboard.batch.name
                    ? selectedLeaderboard.batch.name
                    : 'Batch Leaderboard'}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedLeaderboard(null);
                }}
                className="p-2.5 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200 shadow-sm"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-6">
              <div className="space-y-6">
                {/* Add Student to Leaderboard */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">
                    Add Student to Leaderboard
                  </h4>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <LabelInput
                        label="Select Student"
                        name="student"
                        select
                        options={[
                          { value: "", label: "Select a student" },
                          ...students
                            .filter(s => !selectedLeaderboard.rankings?.some(r => 
                              typeof r.user === 'object' ? r.user._id === s._id : r.user === s._id
                            ))
                            .map(s => ({ value: s._id, label: s.name })),
                        ]}
                      />
                    </div>
                    <div className="w-32">
                      <LabelInput
                        label="Score"
                        type="number"
                        name="score"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => {
                          const studentSelect = document.querySelector('select[name="student"]') as HTMLSelectElement;
                          const scoreInput = document.querySelector('input[name="score"]') as HTMLInputElement;
                          if (studentSelect?.value && scoreInput?.value) {
                            handleAddUserToLeaderboard(studentSelect.value, parseInt(scoreInput.value));
                            studentSelect.value = "";
                            scoreInput.value = "";
                          }
                        }}
                        className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-600/95 hover:to-purple-600/95 transition-all duration-200 shadow-md"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Rankings List */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-gray-900">
                      Rankings ({selectedLeaderboard.rankings?.length || 0})
                    </h4>
                  </div>

                  {selectedLeaderboard.rankings && selectedLeaderboard.rankings.length > 0 ? (
                    <div className="space-y-3">
                      {selectedLeaderboard.rankings.map((ranking, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 group"
                        >
                          <span className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                            index === 0
                              ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white'
                              : index === 1
                              ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white'
                              : index === 2
                              ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}>
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <span className="text-base font-medium text-gray-900">
                              {typeof ranking.user === 'object' ? ranking.user.name : 'Student'}
                            </span>
                            {typeof ranking.user === 'object' && ranking.user.email && (
                              <span className="text-sm text-gray-500 block">
                                {ranking.user.email}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold text-indigo-600">
                              {ranking.score}
                            </span>
                            <span className="text-sm text-gray-500">
                              points
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveUserFromLeaderboard(
                                typeof ranking.user === 'object' ? ranking.user._id : ranking.user as string
                              )}
                              className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              title="Remove from leaderboard"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <UserGroupIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-base">No students in this leaderboard yet</p>
                      <p className="text-sm mt-1">Add students above to start tracking rankings</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 px-8 py-5 border-t border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedLeaderboard(null);
                }}
                className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Leaderboard Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-100">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-purple-600">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  Create Leaderboard
                </h3>
                <p className="text-sm text-indigo-100 mt-1">
                  Select a batch to create a leaderboard
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2.5 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200 shadow-sm"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8">
              <div className="space-y-6">
                <div>
                  <LabelInput
                    label="Select Batch"
                    name="batch"
                    select
                    required
                    options={[
                      { value: "", label: "Select a batch" },
                      ...batches
                        .filter(b => !leaderboards.some(lb => 
                          typeof lb.batch === 'object' ? lb.batch._id === b._id : lb.batch === b._id
                        ))
                        .map(b => ({ value: b._id, label: b.name })),
                    ]}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 px-8 py-5 border-t border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const batchSelect = document.querySelector('select[name="batch"]') as HTMLSelectElement;
                  if (batchSelect?.value) {
                    handleCreateLeaderboard(batchSelect.value);
                  }
                }}
                className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-600/95 hover:to-purple-600/95 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Create Leaderboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
