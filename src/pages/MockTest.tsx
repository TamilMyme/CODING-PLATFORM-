"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  TrashIcon,
  PencilSquareIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { MdClose, MdFilterList } from "react-icons/md";
import MockTestApis from "../apis/MockTestApis";
import QuestionApis from "../apis/QuestionApis";
import LabelInput from "../components/UI/LabelInput";
import LabelTextArea from "../components/UI/LabelTextArea";
import SelectDropDown from "../components/UI/SelectDropDown";

interface QuestionOption {
  _id: string;
  title: string;
}

interface MockTestRow {
  _id?: string;
  title: string;
  description?: string;
  duration: number;
  totalMarks: number;
  isPublished?: boolean;
  startTime?: string;
  endTime?: string;
  allowedAttempts?: number;
  questions: { question: string; type: string; marks: number }[];
  isDeleted?: boolean;
}

const MockTest: React.FC = () => {
  const [rows, setRows] = useState<MockTestRow[]>([]);
  const [questions, setQuestions] = useState<QuestionOption[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("details");
  const [questionSearch, setQuestionSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [formData, setFormData] = useState<MockTestRow>({
    title: "",
    description: "",
    duration: 0,
    totalMarks: 0,
    isPublished: false,
    allowedAttempts: 1,
    questions: [],
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchMockTests();
    fetchQuestions();
  }, []);

  const fetchMockTests = async () => {
    try {
      const data = await MockTestApis.getAllMockTests();
      setRows(data.data.mockTests);
    } catch (error) {
      console.error("Error fetching mock tests:", error);
    }
  };

  const fetchQuestions = async () => {
    try {
      const data = await QuestionApis.getAllQuestions();
      setQuestions(data.data.questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    let newValue: string | boolean = value;

    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      newValue = e.target.checked;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    } as MockTestRow));
  };

  const handleQuestionToggle = (id: string) => {
    const exists = formData.questions?.some((q) => q.question === id);
    const updatedQuestions = exists
      ? formData.questions?.filter((q) => q.question !== id)
      : [
          ...(formData.questions || []),
          { question: id, type: "MCQ", marks: 1 },
        ];
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const handleQuestionMarksChange = (index: number, marks: number) => {
    const updated = [...(formData.questions || [])];
    updated[index].marks = marks;
    setFormData({ ...formData, questions: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const updateData = await MockTestApis.updateMockTest(
          editingId,
          formData
        );
        setRows(
          rows.map((r) => (r._id === editingId ? updateData.data : r))
        );
      } else {
        const newData = await MockTestApis.createMockTest(formData);
        setRows([...rows, newData.data]);
      }
      resetForm();
    } catch (error) {
      console.error("Error saving mock test:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      duration: 0,
      totalMarks: 0,
      isPublished: false,
      allowedAttempts: 1,
      questions: [],
    });
    setEditingId(null);
    setIsFormOpen(false);
    setActiveTab("details");
    setQuestionSearch("");
  };

  const handleEdit = (test: MockTestRow) => {
    setFormData({
      title: test.title,
      description: test.description || "",
      duration: test.duration,
      totalMarks: test.totalMarks,
      isPublished: test.isPublished || false,
      allowedAttempts: test.allowedAttempts || 1,
      startTime: test.startTime,
      endTime: test.endTime,
      questions: test.questions || [],
    });
    setEditingId(test._id || null);
    setIsFormOpen(true);
    setActiveTab("questions");
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    try {
      await MockTestApis.updateMockTest(id, { isDeleted: true });
      fetchMockTests();
    } catch (error) {
      console.error("Error deleting mock test:", error);
    }
  };

  const filteredQuestions = questions.filter((q) =>
    q.title.toLowerCase().includes(questionSearch.toLowerCase())
  );

  const getStatusBadge = (isPublished?: boolean) => {
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
          isPublished
            ? "bg-emerald-100 text-emerald-700"
            : "bg-amber-100 text-amber-700"
        }`}
      >
        {isPublished ? (
          <>
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Published
          </>
        ) : (
          <>
            <ClockIcon className="w-3 h-3 mr-1" />
            Draft
          </>
        )}
      </span>
    );
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="mb-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="text-white">
              <h1 className="text-3xl font-bold tracking-tight">
                Mock Tests
              </h1>
              <p className="text-indigo-100 mt-1 text-sm md:text-base">
                Create and manage assessment tests for your courses
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
                  value={questionSearch}
                  onChange={(e) => setQuestionSearch(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-white/20 bg-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 sm:text-sm transition-all"
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
                <FunnelIcon className="w-5 h-5" />
                <span>Filters</span>
                <MdClose
                  className={`w-4 h-4 transition-transform ${showFilters ? "rotate-45" : ""}`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden animate-in slide-in-from-top duration-300">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-indigo-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FunnelIcon className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                  {rows.filter(r => !r.isDeleted).length} active
                </span>
              </div>
              <button
                onClick={() => setRows(rows.filter(r => !r.isDeleted))}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors flex items-center gap-1"
              >
                <MdFilterList className="w-4 h-4" />
                Clear All
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="flex gap-2">
                  {["all", "published", "draft"].map((status) => (
                    <label key={status} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value={status}
                        checked={
                          status === "all"
                            ? true
                            : status === "published"
                            ? rows.some(r => r.isPublished && !r.isDeleted)
                            : rows.some(r => !r.isPublished && !r.isDeleted)
                        }
                        onChange={() => {
                          if (status === "all") {
                            setRows(rows.filter(r => !r.isDeleted));
                          } else if (status === "published") {
                            setRows(rows.filter(r => r.isPublished && !r.isDeleted));
                          } else {
                            setRows(rows.filter(r => !r.isPublished && !r.isDeleted));
                          }
                        }}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700 capitalize">{status}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="mb-8 flex justify-center">
        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 font-medium"
        >
          <DocumentTextIcon className="w-5 h-5" />
          <span>Create Mock Test</span>
        </button>
      </div>

      {/* Mock Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rows.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white/50 p-16">
            <DocumentTextIcon className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tests yet</h3>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              Get started by creating your first mock test
            </p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 font-medium"
            >
              <DocumentTextIcon className="w-5 h-5" />
              <span>Create Your First Test</span>
            </button>
          </div>
        ) : (
          rows.filter(row => !row.isDeleted).map((row) => (
            <div
              key={row._id}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden group hover:shadow-2xl hover:border-indigo-300 transition-all duration-300"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-gray-900 truncate max-w-xs sm:max-w-md lg:max-w-lg">
                      {row.title}
                    </h3>
                    {getStatusBadge(row.isPublished)}
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(row)}
                      className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit test"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(row._id)}
                      className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete test"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(row)}
                      className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                      title="View test details"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4 text-indigo-500" />
                      <span>{row.duration} mins</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <AcademicCapIcon className="w-4 h-4 text-purple-500" />
                      <span>{row.totalMarks} marks</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400">•</span>
                      <span>{row.questions?.length || 0} questions</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400">•</span>
                      <span>{row.allowedAttempts} attempts</span>
                    </div>
                  </div>
                </div>

                {row.startTime && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <CalendarIcon className="w-4 h-4" />
                      <span>
                        Starts: {new Date(row.startTime).toLocaleString()}
                      </span>
                    </div>
                    {row.endTime && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>
                          Ends: {new Date(row.endTime).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col border border-white/20">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-blue-50">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {editingId ? "Edit Mock Test" : "Create Mock Test"}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {editingId
                    ? "Update test details and questions"
                    : "Set up a new assessment test"}
                </p>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setIsFormOpen(false);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircleIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6">
              {/* Tabs */}
              <div className="flex border-b border-gray-100">
                {["details", "questions"].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`relative pb-3 pt-4 text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? "text-indigo-600 border-b-2 border-indigo-600"
                        : "text-gray-500 border-b-2 border-transparent hover:text-gray-700"
                    }`}
                  >
                    {tab === "details" ? "Test Details" : `Questions (${formData.questions.length})`}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
                    )}
                  </button>
                ))}
              </div>

              {/* DETAILS TAB */}
              {activeTab === "details" && (
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <LabelInput
                      label="Title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <LabelTextArea
                      label="Description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                    />
                  </div>

                  {/* Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Duration */}
                    <LabelInput
                      label="Duration (minutes)"
                      name="duration"
                      type="number"
                      value={formData.duration}
                      onChange={handleInputChange}
                      min="1"
                    />

                    {/* Total Marks */}
                    <LabelInput
                      label="Total Marks"
                      name="totalMarks"
                      type="number"
                      value={formData.totalMarks}
                      onChange={handleInputChange}
                      min="1"
                    />

                    {/* Allowed Attempts */}
                    <LabelInput
                      label="Allowed Attempts"
                      name="allowedAttempts"
                      type="number"
                      value={formData.allowedAttempts}
                      onChange={handleInputChange}
                      min="1"
                    />
                  </div>

                  {/* Publish */}
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isPublished}
                        onChange={handleInputChange}
                        name="isPublished"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Publish Test
                      </span>
                    </label>
                  </div>
                </div>
              )}
              
              {/* QUESTIONS TAB */}
              {activeTab === "questions" && (
                <div className="space-y-6">
                  {/* Search */}
                  <div className="mb-6">
                    <LabelInput
                      label="Search Questions"
                      name="questionSearch"
                      value={questionSearch}
                      onChange={(e) => setQuestionSearch(e.target.value)}
                      placeholder="Search available questions..."
                      prefixIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
                    />
                  </div>

                  {/* Available Questions */}
                  <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 max-h-64 overflow-y-auto">
                    {filteredQuestions.map((q) => (
                      <label
                        key={q._id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.questions.some(
                            (i) => i.question === q._id
                          )}
                          onChange={() => handleQuestionToggle(q._id)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span
                          className="text-sm text-gray-700 flex-1"
                          dangerouslySetInnerHTML={{ __html: q.title }}
                        />
                      </label>
                    ))}
                  </div>

                  {/* Selected Questions */}
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Selected Questions ({formData.questions.length})
                    </h4>
                    <div className="space-y-3">
                      {formData.questions.map((q, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <span className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </span>
                          <LabelInput
                            value={q.marks}
                            onChange={(e) => handleQuestionMarksChange(index, parseInt(e.target.value) || 0)}
                            type="number"
                            min="1"
                            className="flex-1"
                            name=""
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...formData.questions];
                              updated.splice(index, 1);
                              setFormData({ ...formData, questions: updated });
                            }}
                            className="p-1 text-red-600 hover:text-red-800 rounded-lg transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </form>

            {/* Footer */}
            <div className="flex items-center justify-end gap-4 px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("details");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
              >
                {editingId ? "Update Test" : "Create Test"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockTest;
