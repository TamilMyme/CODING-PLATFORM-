"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrashIcon,
  PencilSquareIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  CalendarIcon,
  PlusIcon,
  XCircleIcon,
  SparklesIcon,
  BookOpenIcon,
  DocumentIcon,
  UserGroupIcon,
  GlobeAltIcon,
  ArrowRightIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import {
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/solid";
import { MdClose, MdFilterList } from "react-icons/md";
import MockTestApis from "../apis/MockTestApis";
import QuestionApis from "../apis/QuestionApis";
import BatchApis from "../apis/BatchApis";
import CourseApis from "../apis/CourseApis";
import LabelInput from "../components/UI/LabelInput";
import LabelTextArea from "../components/UI/LabelTextArea";
import SelectDropDown from "../components/UI/SelectDropDown";
import CustomDatePicker from "../components/UI/CustomDatePicker";
import type { ICourse, IBatch } from "../types/interfaces";

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
  batch?: string;
  course?: string;
  testType?: 'general' | 'batch' | 'course';
  batchName?: string;
  courseTitle?: string;
}

const MockTest: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<MockTestRow[]>([]);
  const [questions, setQuestions] = useState<QuestionOption[]>([]);
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [batches, setBatches] = useState<IBatch[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingTest, setViewingTest] = useState<MockTestRow | null>(null);
  const [activeTab, setActiveTab] = useState<string>("details");
  const [questionSearch, setQuestionSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [selectedTestType, setSelectedTestType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [formData, setFormData] = useState<MockTestRow>({
    title: "",
    description: "",
    duration: 0,
    totalMarks: 0,
    isPublished: false,
    allowedAttempts: 1,
    questions: [],
    testType: "general",
    batch: "",
    course: "",
    startTime: "",
    endTime: "",
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchMockTests();
    fetchQuestions();
    fetchCourses();
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchBatchesByCourse(selectedCourse);
    } else {
      fetchBatches();
    }
  }, [selectedCourse]);

  const fetchMockTests = async () => {
    try {
      const params: { batchId?: string; courseId?: string; testType?: string } = {};
      if (selectedBatch) params.batchId = selectedBatch;
      if (selectedCourse) params.courseId = selectedCourse;
      if (selectedTestType && selectedTestType !== "all") params.testType = selectedTestType;
      
      const data = await MockTestApis.getAllMockTests(params);
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

  const fetchCourses = async () => {
    try {
      const data = await CourseApis.getAll();
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
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

  const fetchBatchesByCourse = async (courseId: string) => {
    try {
      const data = await BatchApis.getAll(courseId);
      setBatches(data);
    } catch (error) {
      console.error("Error fetching batches by course:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

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
      // Prepare data to send - only include batch/course based on testType
      const dataToSend = {
        ...formData,
        // Only include batch if testType is 'batch' and batch has a value
        batch: formData.testType === 'batch' ? formData.batch : undefined,
        // Only include course if testType is 'course' and course has a value
        course: formData.testType === 'course' ? formData.course : undefined,
      };

      if (editingId) {
        // Update existing mock test
        const response = await MockTestApis.updateMockTest(
          editingId,
          dataToSend
        );
        // API returns { data: { ... } } or the data directly
        const updatedTest = response.data || response;
        setRows(
          rows.map((r) => (r._id === editingId ? updatedTest : r))
        );
      } else {
        // Create new mock test
        const response = await MockTestApis.createMockTest(dataToSend);
        // API returns { data: { ... } } or the data directly
        const newTest = response.data || response;
        setRows([...rows, newTest]);
      }
      resetForm();
      fetchMockTests();
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
      testType: "general",
      batch: "",
      course: "",
      startTime: "",
      endTime: "",
    });
    setEditingId(null);
    setIsEditMode(false);
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
      testType: test.testType || "general",
      batch: test.batch || "",
      course: test.course || "",
    });
    setEditingId(test._id || null);
    setIsEditMode(true);
    setIsFormOpen(true);
    setActiveTab("details");
  };

  const handleView = (test: MockTestRow) => {
    setViewingTest(test);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    setTestToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!testToDelete) return;
    try {
      // Use proper DELETE endpoint for hard delete
      await MockTestApis.deleteMockTest(testToDelete);
      // Remove the deleted test from local state
      setRows(rows.filter((r) => r._id !== testToDelete));
      setDeleteConfirmOpen(false);
      setTestToDelete(null);
      fetchMockTests();
    } catch (error) {
      console.error("Error deleting mock test:", error);
      // If hard delete fails, try soft delete as fallback
      try {
        await MockTestApis.updateMockTest(testToDelete, { isDeleted: true });
        setRows(rows.filter((r) => r._id !== testToDelete));
        setDeleteConfirmOpen(false);
        setTestToDelete(null);
        fetchMockTests();
      } catch (softDeleteError) {
        console.error("Error with soft delete fallback:", softDeleteError);
      }
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setTestToDelete(null);
  };

  const handleViewSubmissions = (test: MockTestRow) => {
    navigate(`/mock-test-submissions/${test._id}`);
  };

  const filteredQuestions = questions.filter((q) =>
    q.title.toLowerCase().includes(questionSearch.toLowerCase())
  );

  // Filtering logic
  let filteredRows = rows.filter(r => !r.isDeleted);

  if (searchTerm) {
    filteredRows = filteredRows.filter((row) =>
      row.title.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }

  if (selectedTestType !== "all") {
    filteredRows = filteredRows.filter((row) => row.testType === selectedTestType);
  }

  if (selectedStatus !== "all") {
    if (selectedStatus === "published") {
      filteredRows = filteredRows.filter((row) => row.isPublished);
    } else if (selectedStatus === "draft") {
      filteredRows = filteredRows.filter((row) => !row.isPublished);
    }
  }

  if (selectedCourse) {
    filteredRows = filteredRows.filter((row) => row.course === selectedCourse);
  }

  if (selectedBatch) {
    filteredRows = filteredRows.filter((row) => row.batch === selectedBatch);
  }

  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);
  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTestType("all");
    setSelectedStatus("all");
    setSelectedCourse("");
    setSelectedBatch("");
    setShowFilters(false);
    fetchMockTests();
  };

  // Badges
  const StatusBadge = ({ isPublished }: { isPublished?: boolean }) => {
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border shadow-sm ${
          isPublished
            ? "bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200"
            : "bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-200"
        }`}
      >
        {isPublished ? (
          <>
            <CheckCircleIcon className="w-3.5 h-3.5 mr-1" />
            Published
          </>
        ) : (
          <>
            <ClockIcon className="w-3.5 h-3.5 mr-1" />
            Draft
          </>
        )}
      </span>
    );
  };

  const TestTypeBadge = ({ testType }: { testType?: string }) => {
    const config = {
      general: {
        label: "General",
        colors: "bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 border-indigo-200",
      },
      course: {
        label: "Course",
        colors: "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-purple-200",
      },
      batch: {
        label: "Batch",
        colors: "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200",
      },
    };
    const { label, colors } = config[testType as keyof typeof config] || config.general;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border shadow-sm ${colors}`}>
        {testType === 'general' && <span className="text-base">🎯</span>}
        {testType === 'course' && <span className="text-base">📚</span>}
        {testType === 'batch' && <span className="text-base">👥</span>}
        {label}
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
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <SparklesIcon className="w-8 h-8" />
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
                <MdClose
                  className={`w-4 h-4 transition-transform ${showFilters ? "rotate-45" : ""}`}
                />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-4">
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all font-medium text-sm shadow-md hover:shadow-lg"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Create Mock Test</span>
            </button>
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
                  {[
                    searchTerm && "Search",
                    selectedTestType !== "all" && "Test Type",
                    selectedStatus !== "all" && "Status",
                    selectedCourse && "Course",
                    selectedBatch && "Batch",
                  ].filter(Boolean).length}{" "}
                  active
                </span>
              </div>
              <button
                onClick={clearFilters}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors flex items-center gap-1"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Clear All
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Test Type</label>
                <select
                  value={selectedTestType}
                  onChange={(e) => {
                    setSelectedTestType(e.target.value);
                    fetchMockTests();
                  }}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                >
                  <option value="all">All Types</option>
                  <option value="general">General</option>
                  <option value="course">Course-wise</option>
                  <option value="batch">Batch-wise</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    fetchMockTests();
                  }}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Course</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => {
                    setSelectedCourse(e.target.value);
                    setSelectedBatch("");
                    fetchMockTests();
                    if (e.target.value) {
                      fetchBatchesByCourse(e.target.value);
                    } else {
                      fetchBatches();
                    }
                  }}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                >
                  <option value="">All Courses</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Batch</label>
                <select
                  value={selectedBatch}
                  onChange={(e) => {
                    setSelectedBatch(e.target.value);
                    fetchMockTests();
                  }}
                  disabled={!selectedCourse}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">All Batches</option>
                  {batches.map((batch) => (
                    <option key={batch._id} value={batch._id}>
                      {batch.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Sort By</label>
                <select
                  value="title"
                  onChange={() => {}}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                >
                  <option value="title">Title</option>
                  <option value="createdAt">Created Date</option>
                  <option value="duration">Duration</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-50 to-transparent rounded-bl-full opacity-50"></div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <DocumentTextIcon className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{rows.filter(r => !r.isDeleted).length}</p>
                  <p className="text-sm font-medium text-gray-600">Total Tests</p>
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
                    <CheckCircleIcon className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{rows.filter(r => r.isPublished && !r.isDeleted).length}</p>
                  <p className="text-sm font-medium text-gray-600">Published</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-50 to-transparent rounded-bl-full opacity-50"></div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <ClockIcon className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{rows.filter(r => !r.isPublished && !r.isDeleted).length}</p>
                  <p className="text-sm font-medium text-gray-600">Drafts</p>
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
                    <AcademicCapIcon className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{rows.filter(r => r.testType === 'course' && !r.isDeleted).length}</p>
                  <p className="text-sm font-medium text-gray-600">Course Tests</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mock Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedRows.map((row, idx) => (
          <div
            key={row._id}
            className="bg-white rounded-2xl border border-gray-200/60 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
          >
            <div className="p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="inline-flex items-center justify-center w-8 h-8 rounded-xl text-sm font-bold shadow-sm bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700"
                  >
                    {idx + 1}
                  </span>
                  <TestTypeBadge testType={row.testType} />
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleView(row)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 flex-shrink-0"
                    title="View test details"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(row)}
                    className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-200 flex-shrink-0"
                    title="Edit test"
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleViewSubmissions(row)}
                    className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 flex-shrink-0"
                    title="View submissions"
                  >
                    <UsersIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(row._id)}
                    className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-200 flex-shrink-0"
                    title="Delete test"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                {row.title}
              </h3>

              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <StatusBadge isPublished={row.isPublished} />
                <span className="inline-flex items-center px-2 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-medium border border-amber-100">
                  <span className="font-bold">{row.totalMarks}</span>{" "}
                  {row.totalMarks === 1 ? "mark" : "marks"}
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                  <ClockIcon className="w-3 h-3 mr-1" />
                  {row.duration} min
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-medium border border-green-100">
                  <DocumentTextIcon className="w-3 h-3 mr-1" />
                  {row.questions?.length || 0} qs
                </span>
              </div>

              {row.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {row.description}
                </p>
              )}

              {row.startTime && (
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    <span>
                      {new Date(row.startTime).toLocaleDateString()} {new Date(row.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredRows.length === 0 && (
          <div className="col-span-full bg-gradient-to-br from-white to-blue-50/30 border-2 border-dashed border-blue-200 rounded-3xl p-16 text-center shadow-sm">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                <QuestionMarkCircleIcon className="w-10 h-10 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No tests found
              </h3>
              <p className="text-base text-gray-600 leading-relaxed mb-8 max-w-sm mx-auto">
                {rows.filter(r => !r.isDeleted).length === 0
                  ? "Get started by creating your first mock test for your courses."
                  : "Try adjusting your filters to find what you're looking for."}
              </p>
              {rows.filter(r => !r.isDeleted).length === 0 && (
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-600/95 hover:to-purple-600/95 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  <PlusIcon className="w-5 h-5" />
                  Create Your First Test
                </button>
              )}
            </div>
          </div>
        )}
      </div>

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
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* View Test Modal */}
      {isViewModalOpen && viewingTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-100">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-purple-600">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  Test Details
                </h3>
                <p className="text-sm text-indigo-100 mt-1">
                  Review test information
                </p>
              </div>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setViewingTest(null);
                }}
                className="p-2.5 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200 shadow-sm"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-6">
              <div className="space-y-6">
                <div className="flex items-center gap-4 flex-wrap">
                  <TestTypeBadge testType={viewingTest.testType} />
                  <StatusBadge isPublished={viewingTest.isPublished} />
                  <span className="inline-flex items-center px-3 py-2 rounded-lg bg-amber-50 text-amber-700 text-sm font-medium border border-amber-100">
                    <span className="font-bold">{viewingTest.totalMarks}</span>{" "}
                    {viewingTest.totalMarks === 1 ? "mark" : "marks"}
                  </span>
                  <span className="inline-flex items-center px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100">
                    <ClockIcon className="w-4 h-4 mr-1.5" />
                    {viewingTest.duration} minutes
                  </span>
                  <span className="inline-flex items-center px-3 py-2 rounded-lg bg-green-50 text-green-700 text-sm font-medium border border-green-100">
                    <DocumentTextIcon className="w-4 h-4 mr-1.5" />
                    {viewingTest.questions?.length || 0} questions
                  </span>
                  <span className="inline-flex items-center px-3 py-2 rounded-lg bg-purple-50 text-purple-700 text-sm font-medium border border-purple-100">
                    <span className="font-bold">{viewingTest.allowedAttempts || 1}</span>{" "}
                    attempts
                  </span>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                    Test Title
                  </h4>
                  <div className="text-gray-900 text-lg font-semibold">
                    {viewingTest.title}
                  </div>
                </div>

                {viewingTest.description && (
                  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                      Description
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      {viewingTest.description}
                    </p>
                  </div>
                )}

                {(viewingTest.courseTitle || viewingTest.batchName) && (
                  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                      Assignment
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {viewingTest.courseTitle && (
                        <span className="inline-flex items-center px-3 py-2 rounded-lg bg-purple-50 text-purple-700 text-sm font-medium border border-purple-100">
                          <BookOpenIcon className="w-4 h-4 mr-1.5" />
                          {viewingTest.courseTitle}
                        </span>
                      )}
                      {viewingTest.batchName && (
                        <span className="inline-flex items-center px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100">
                          <span className="text-base">👥</span>
                          {viewingTest.batchName}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {viewingTest.startTime && (
                  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                      Schedule
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-700">
                        <CalendarIcon className="w-4 h-4 text-indigo-500" />
                        <span className="font-medium">Starts:</span>
                        <span>{new Date(viewingTest.startTime).toLocaleString()}</span>
                      </div>
                      {viewingTest.endTime && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <CalendarIcon className="w-4 h-4 text-indigo-500" />
                          <span className="font-medium">Ends:</span>
                          <span>{new Date(viewingTest.endTime).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {viewingTest.questions && viewingTest.questions.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                      Questions ({viewingTest.questions.length})
                    </h4>
                    <div className="space-y-3">
                      {viewingTest.questions.map((q, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-lg flex items-center justify-center text-sm font-bold shadow-md">
                            {i + 1}
                          </span>
                          <div className="flex-1">
                            <span className="text-sm text-gray-700 line-clamp-1">
                              {questions.find(qq => qq._id === q.question)?.title || `Question ${i + 1}`}
                            </span>
                          </div>
                          <span className="inline-flex items-center px-2 py-1 rounded bg-amber-50 text-amber-700 text-xs font-medium border border-amber-100">
                            {q.marks} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 px-8 py-5 border-t border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
              <button
                onClick={() => handleEdit(viewingTest)}
                className="px-6 py-3 text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-all duration-200 shadow-sm"
              >
                Edit Test
              </button>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setViewingTest(null);
                }}
                className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-rose-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrashIcon className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Delete Test?
              </h3>
              <p className="text-gray-600 leading-relaxed mb-8">
                Are you sure you want to delete this mock test? This action cannot be undone.
              </p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={cancelDelete}
                  className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-rose-600 rounded-xl hover:from-rose-600 hover:to-rose-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-100">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-purple-600">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {isEditMode ? "Edit Mock Test" : "Create New Mock Test"}
                </h3>
                <p className="text-sm text-indigo-100 mt-1">
                  {isEditMode 
                    ? "Modify the test details below" 
                    : "Add a mock test to your assessment bank"
                  }
                </p>
              </div>
              <button
                onClick={() => {
                  setIsFormOpen(false);
                  resetForm();
                }}
                className="p-2.5 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200 shadow-sm"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto px-8 py-6"
            >
              <div className="space-y-7">
                {/* Test Type Selection */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-4">
                    Select Test Type
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'general', label: '🎯 General', desc: 'Available to everyone' },
                      { value: 'course', label: '📚 Course-wise', desc: 'All students in a course' },
                      { value: 'batch', label: '👥 Batch-wise', desc: 'Specific batch only' },
                    ].map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, testType: type.value as 'general' | 'batch' | 'course', batch: '', course: '' })}
                        className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                          formData.testType === type.value
                            ? "border-indigo-600 bg-gradient-to-br from-indigo-50 to-indigo-100 shadow-md"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                          formData.testType === type.value
                            ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg"
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          <span className="text-xl">{type.label.split(' ')[0]}</span>
                        </div>
                        <span className={`text-sm font-medium ${
                          formData.testType === type.value ? "text-indigo-600" : "text-gray-700"
                        }`}>
                          {type.label.split(' ')[1]}
                        </span>
                        {formData.testType === type.value && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                            <CheckCircleIcon className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Course & Batch Selection */}
                {(formData.testType === 'course' || formData.testType === 'batch') && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                      <LabelInput
                        label="Course"
                        name="course"
                        value={formData.course}
                        onChange={(e) => {
                          setFormData({ ...formData, course: e.target.value, batch: '' });
                          if (e.target.value) {
                            fetchBatchesByCourse(e.target.value);
                          } else {
                            fetchBatches();
                          }
                        }}
                        required
                        select
                        options={[
                          { value: "", label: "Select a course" },
                          ...courses.map(c => ({ value: c._id, label: c.title })),
                        ]}
                      />
                    </div>

                    {formData.testType === 'batch' && (
                      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <LabelInput
                          label="Batch"
                          name="batch"
                          value={formData.batch}
                          onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                          required
                          select
                          options={[
                            { value: "", label: "Select a batch" },
                            ...batches.map(b => ({ value: b._id, label: b.name })),
                          ]}
                          disabled={!formData.course}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Basic Info */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <LabelInput
                    label="Title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <LabelTextArea
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Add a brief description of the test..."
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <LabelInput
                      label="Duration (minutes)"
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      min="1"
                      required
                    />
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <LabelInput
                      label="Total Marks"
                      type="number"
                      name="totalMarks"
                      value={formData.totalMarks}
                      onChange={handleInputChange}
                      min="1"
                      required
                    />
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <LabelInput
                      label="Allowed Attempts"
                      type="number"
                      name="allowedAttempts"
                      value={formData.allowedAttempts}
                      onChange={handleInputChange}
                      min="1"
                      required
                    />
                  </div>
                </div>

                {/* Start Date & End Date */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <CustomDatePicker
                      label="Start Date & Time"
                      placeholder="Select start date and time"
                      selected={formData.startTime ? new Date(formData.startTime) : null}
                      onChange={(date) => setFormData({ ...formData, startTime: date ? date.toISOString() : '' })}
                      showTimeSelect={true}
                      prefixIcon={<CalendarIcon className="w-4 h-4" />}
                    />
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <CustomDatePicker
                      label="End Date & Time"
                      placeholder="Select end date and time"
                      selected={formData.endTime ? new Date(formData.endTime) : null}
                      onChange={(date) => setFormData({ ...formData, endTime: date ? date.toISOString() : '' })}
                      showTimeSelect={true}
                      prefixIcon={<CalendarIcon className="w-4 h-4" />}
                    />
                  </div>
                </div>

                {/* Publish Toggle */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${
                        formData.isPublished ? 'bg-emerald-500' : 'bg-gray-300'
                      }`}>
                        <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                          formData.isPublished ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {formData.isPublished ? '📢 Published' : '📝 Draft'}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={handleInputChange}
                      name="isPublished"
                      className="sr-only"
                    />
                  </label>
                </div>

                {/* Questions Selection */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-semibold text-gray-900">
                      Select Questions
                    </label>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {formData.questions.length} selected
                    </span>
                  </div>

                  {/* Search */}
                  <div className="mb-4">
                    <LabelInput
                      label="Search Questions"
                      name="questionSearch"
                      value={questionSearch}
                      onChange={(e) => setQuestionSearch(e.target.value)}
                      placeholder="Search available questions..."
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Available Questions */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-3 border-b border-indigo-100">
                        <h4 className="text-sm font-semibold text-gray-900 flex items-center justify-between">
                          <span>📚 Available</span>
                          <span className="text-xs text-gray-500">{filteredQuestions.length} found</span>
                        </h4>
                      </div>
                      <div className="p-4 max-h-80 overflow-y-auto space-y-2">
                        {filteredQuestions.map((q) => (
                          <label
                            key={q._id}
                            className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                              formData.questions.some((i) => i.question === q._id)
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={formData.questions.some(
                                (i) => i.question === q._id
                              )}
                              onChange={() => handleQuestionToggle(q._id)}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <span
                                className="text-sm text-gray-700 leading-relaxed line-clamp-2"
                                dangerouslySetInnerHTML={{ __html: q.title }}
                              />
                            </div>
                          </label>
                        ))}
                        {filteredQuestions.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <p>No questions found matching your search</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Selected Questions */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3 border-b border-emerald-200">
                        <h4 className="text-sm font-semibold text-gray-900 flex items-center justify-between">
                          <span>✅ Selected</span>
                          <span className="text-xs text-gray-500">{formData.questions.length} questions</span>
                        </h4>
                      </div>
                      <div className="p-4 max-h-80 overflow-y-auto space-y-2">
                        {formData.questions.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <p className="mb-2">No questions selected yet</p>
                            <p className="text-sm">Select questions from the list to add them to your test</p>
                          </div>
                        ) : (
                          formData.questions.map((q, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 group">
                              <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-lg flex items-center justify-center text-sm font-bold shadow-md">
                                {index + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm text-gray-700 line-clamp-1">
                                  {questions.find(qq => qq._id === q.question)?.title || `Question ${index + 1}`}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={q.marks}
                                  onChange={(e) => handleQuestionMarksChange(index, parseInt(e.target.value) || 0)}
                                  min="1"
                                  className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...formData.questions];
                                    updated.splice(index, 1);
                                    setFormData({ ...formData, questions: updated });
                                  }}
                                  className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                  title="Remove question"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 px-8 py-5 border-t border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    resetForm();
                  }}
                  className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-600/95 hover:to-purple-600/95 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  {isEditMode ? "Update Test" : "Create Test"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockTest;
