import React, { useState, useEffect } from "react";
import {
  UserGroupIcon,
  AcademicCapIcon,
  TrashIcon,
  EyeIcon,
  PencilSquareIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  PlusIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import BatchApis from "../apis/BatchApis";
import CourseApis from "../apis/CourseApis";
import UserApis from "../apis/UserApis";
import type { IBatch, ICourse, IUser } from "../types/interfaces";
import { MdClose } from "react-icons/md";

interface BatchRow extends IBatch {
  selected?: boolean;
}

const Batch: React.FC = () => {
  const [batches, setBatches] = useState<BatchRow[]>([]);
  const [filteredBatches, setFilteredBatches] = useState<BatchRow[]>([]);
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [students, setStudents] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBatch, setEditingBatch] = useState<IBatch | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    course: "",
    students: [] as string[],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    fetchBatches();
    fetchCourses();
    fetchStudents();
  }, []);

  useEffect(() => {
    let filtered = [...batches];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(batch =>
        batch.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getCourseTitle(batch.course).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply course filter
    if (filterCourse) {
      filtered = filtered.filter(batch => {
        const courseId = typeof batch.course === 'string' ? batch.course : batch.course._id;
        return courseId === filterCourse;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof BatchRow] || "";
      const bValue = b[sortBy as keyof BatchRow] || "";
      
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredBatches(filtered);
  }, [searchTerm, filterCourse, sortBy, sortOrder, batches]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const data = await BatchApis.getAll();
      const batchRows = data.map(batch => ({ ...batch, selected: false }));
      setBatches(batchRows);
      setFilteredBatches(batchRows);
    } catch (error) {
      console.error("Error fetching batches:", error);
    } finally {
      setLoading(false);
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

  const fetchStudents = async () => {
    try {
      const data = await UserApis.getAllUsersByRole("STUDENT");
      setStudents(data.data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleCreateBatch = async () => {
    setIsSubmitting(true);
    try {
      await BatchApis.create(formData);
      setFormData({ name: "", course: "", students: [] });
      setShowCreateForm(false);
      fetchBatches();
    } catch (error) {
      console.error("Error creating batch:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateBatch = async () => {
    if (!editingBatch) return;
    
    setIsSubmitting(true);
    try {
      await BatchApis.update(editingBatch._id, formData);
      setFormData({ name: "", course: "", students: [] });
      setEditingBatch(null);
      setShowCreateForm(false);
      fetchBatches();
    } catch (error) {
      console.error("Error updating batch:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBatch = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this batch? This action cannot be undone.")) return;
    
    try {
      await BatchApis.delete(id);
      fetchBatches();
    } catch (error) {
      console.error("Error deleting batch:", error);
    }
  };

  const handleView = async (batch: IBatch) => {
    alert(`Batch Details:\n\nName: ${batch.name}\nCourse: ${getCourseTitle(batch.course)}\nStudents: ${batch.students?.length || 0}\nCreated: ${new Date(batch.createdAt).toLocaleDateString()}\nUpdated: ${new Date(batch.updatedAt).toLocaleDateString()}`);
  };

  const openEditForm = (batch: IBatch) => {
    setEditingBatch(batch);
    setFormData({
      name: batch.name,
      course: typeof batch.course === 'string' ? batch.course : batch.course._id,
      students: batch.students?.map(s => typeof s === 'string' ? s : s._id) || [],
    });
    setShowCreateForm(true);
  };

  const cancelForm = () => {
    setFormData({ name: "", course: "", students: [] });
    setShowCreateForm(false);
    setEditingBatch(null);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterCourse("");
    setShowFilters(false);
  };

  const getCourseTitle = (course: ICourse | string) => {
    if (typeof course === 'string') {
      const foundCourse = courses.find(c => c._id === course);
      return foundCourse?.title || course;
    }
    return course.title;
  };

  const totalPages = Math.ceil(filteredBatches.length / itemsPerPage);
  const paginatedBatches = filteredBatches.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="mb-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="text-white">
              <h1 className="text-3xl font-bold tracking-tight">
                Batch Management
              </h1>
              <p className="text-indigo-100 mt-1 text-sm md:text-base">
                Manage course batches and student assignments
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
              {/* Search Bar */}
              <div className="relative flex-1 sm:max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search batches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  showFilters
                    ? 'bg-white text-indigo-600 shadow-md'
                    : 'bg-white/20 text-white border border-white/30 hover:bg-white/30'
                }`}
              >
                <FunnelIcon className="w-4 h-4" />
                <span>Filters</span>
                <MdClose className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-45' : ''}`} />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all font-medium text-sm shadow-md hover:shadow-lg"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Add Batch</span>
            </button>
            
            <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/20 text-white border border-white/30 rounded-lg hover:bg-white/30 transition-all font-medium text-sm">
              <DocumentArrowDownIcon className="w-4 h-4" />
              <span>Export</span>
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
                  {[searchTerm && 'Search', filterCourse && 'Course'].filter(Boolean).length} active
                </span>
              </div>
              <button
                onClick={clearFilters}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear All
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Search */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Search</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Enter search term..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                  />
                </div>
              </div>

              {/* Course Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Course</label>
                <select
                  value={filterCourse}
                  onChange={(e) => setFilterCourse(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                >
                  <option value="">All courses</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>{course.title}</option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                >
                  <option value="name">Name</option>
                  <option value="createdAt">Created Date</option>
                </select>
              </div>

              {/* Sort Order */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Sort Order</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSortOrder('asc')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      sortOrder === 'asc'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Ascending
                  </button>
                  <button
                    onClick={() => setSortOrder('desc')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      sortOrder === 'desc'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Descending
                  </button>
                </div>
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
                    <UserGroupIcon className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{filteredBatches.length}</p>
                  <p className="text-sm font-medium text-gray-600">Total Batches</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  +8.2%
                </span>
                <span className="text-xs text-gray-500">from last month</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-50 to-transparent rounded-bl-full opacity-50"></div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <AcademicCapIcon className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {filteredBatches.reduce((acc, batch) => acc + (batch.students?.length || 0), 0)}
                  </p>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-blue-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  +15.3%
                </span>
                <span className="text-xs text-gray-500">from last month</span>
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
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{courses.length}</p>
                  <p className="text-sm font-medium text-gray-600">Active Courses</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-orange-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  +3.1%
                </span>
                <span className="text-xs text-gray-500">from last month</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-50 to-transparent rounded-bl-full opacity-50"></div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <UserGroupIcon className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {filteredBatches.length > 0 
                      ? Math.round(filteredBatches.reduce((acc, batch) => acc + (batch.students?.length || 0), 0) / filteredBatches.length)
                      : 0}
                  </p>
                  <p className="text-sm font-medium text-gray-600">Avg Students/Batch</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-purple-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  +5.7%
                </span>
                <span className="text-xs text-gray-500">from last month</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">
                    {editingBatch ? "Edit Batch" : "Add New Batch"}
                  </h3>
                  <p className="text-indigo-100 mt-1">
                    {editingBatch ? "Update batch information and student assignments" : "Fill in details to create a new batch"}
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200"
                >
                  <MdClose className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="space-y-8">
                {/* Batch Information Section */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <UserGroupIcon className="w-4 h-4 text-indigo-600" />
                    </div>
                    Batch Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Batch Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter batch name"
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Course</label>
                      <select
                        value={formData.course}
                        onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        required
                      >
                        <option value="">Select a course</option>
                        {courses.map((course) => (
                          <option key={course._id} value={course._id}>
                            {course.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Student Selection Section */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <AcademicCapIcon className="w-4 h-4 text-purple-600" />
                    </div>
                    Student Selection
                  </h4>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Select Students</label>
                    <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto">
                      {students.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">
                          No students available. Please add students first.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {students.map((student) => (
                            <div key={student._id} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`student-${student._id}`}
                                checked={formData.students.includes(student._id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData({
                                      ...formData,
                                      students: [...formData.students, student._id]
                                    });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      students: formData.students.filter(id => id !== student._id)
                                    });
                                  }
                                }}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <label htmlFor={`student-${student._id}`} className="ml-3 flex items-center cursor-pointer">
                                <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                                  {student.name?.charAt(0).toUpperCase() || 'S'}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                  <div className="text-xs text-gray-500">{student.email}</div>
                                </div>
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      {formData.students.length} student{formData.students.length !== 1 ? 's' : ''} selected
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={cancelForm}
                    className="px-6 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={editingBatch ? handleUpdateBatch : handleCreateBatch}
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                  >
                    {isSubmitting && (
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {editingBatch ? "Update Batch" : "Add Batch"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BATCHES TABLE */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Batch List</h2>
          <p className="text-sm text-gray-600">Manage and view all batch information</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setBatches(batches.map(batch => ({ ...batch, selected: checked })));
                    }}
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <button
                    onClick={() => {
                      setSortBy("name");
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    }}
                    className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition-colors font-semibold"
                  >
                    <span>Batch Name</span>
                    <span className="flex flex-col">
                      <svg className={`w-3 h-3 ${sortBy === "name" && sortOrder === "asc" ? "text-indigo-600" : "text-gray-400"}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414 1.414l4 4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <svg className={`w-3 h-3 -mt-1 ${sortBy === "name" && sortOrder === "desc" ? "text-indigo-600" : "text-gray-400"}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293 3.293a1 1 0 011.414-1.414l-4 4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Students
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <button
                    onClick={() => {
                      setSortBy("createdAt");
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    }}
                    className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition-colors font-semibold"
                  >
                    <span>Created Date</span>
                    <span className="flex flex-col">
                      <svg className={`w-3 h-3 ${sortBy === "createdAt" && sortOrder === "asc" ? "text-indigo-600" : "text-gray-400"}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414 1.414l4 4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <svg className={`w-3 h-3 -mt-1 ${sortBy === "createdAt" && sortOrder === "desc" ? "text-indigo-600" : "text-gray-400"}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293 3.293a1 1 0 011.414-1.414l-4 4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </button>
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                        <svg className="w-8 h-8 text-indigo-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Loading batches...</h3>
                      <p className="text-sm text-gray-500 max-w-md">Please wait while we fetch batch data.</p>
                    </div>
                  </td>
                </tr>
              ) : filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-4">
                        <MagnifyingGlassIcon className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No batches found</h3>
                      <p className="text-sm text-gray-500 max-w-md">
                        {batches.length === 0 
                          ? "Get started by creating your first batch. Assign it to a course and start adding students."
                          : "Try adjusting your filters or search to find batches you're looking for."}
                      </p>
                      {batches.length === 0 && (
                        <button
                          onClick={() => setShowCreateForm(true)}
                          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                        >
                          Create First Batch
                        </button>
                      )}
                      {batches.length > 0 && (
                        <button
                          onClick={clearFilters}
                          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedBatches.map((batch) => (
                  <tr 
                    key={batch._id} 
                    className={`hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 ${batch.selected ? 'bg-gradient-to-r from-indigo-50 to-purple-50' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={batch.selected || false}
                        onChange={() => {
                          const updatedBatches = batches.map(b => 
                            b._id === batch._id ? { ...b, selected: !b.selected } : b
                          );
                          setBatches(updatedBatches);
                        }}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {batch.name?.charAt(0).toUpperCase() || 'B'}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{batch.name}</div>
                          <div className="text-xs text-gray-500">ID: {batch._id?.slice(-8) || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <AcademicCapIcon className="h-4 w-4 text-gray-400" />
                        <div className="text-sm text-gray-900">{getCourseTitle(batch.course)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <UserGroupIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{batch.students?.length || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{new Date(batch.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleView(batch)}
                          className="p-2 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 group"
                          aria-label="View"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditForm(batch)}
                          className="p-2 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 group"
                          aria-label="Edit"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBatch(batch._id)}
                          className="p-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
                          aria-label="Delete"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-gray-700">
                Showing <span className="font-semibold">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-semibold">{Math.min(currentPage * itemsPerPage, filteredBatches.length)}</span> of <span className="font-semibold">{filteredBatches.length}</span> batches
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="ml-1">Previous</span>
                </button>
               
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    // Show current page and 2 pages before and after
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                   
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center justify-center w-10 h-10 text-sm font-medium rounded-lg transition-all duration-200 ${
                          currentPage === pageNum
                            ? 'bg-indigo-600 text-white shadow-md z-10'
                            : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 5 && (
                    <>
                      <span className="px-2 text-gray-500">...</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className={`relative inline-flex items-center justify-center w-10 h-10 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-all duration-200 ${
                          currentPage === totalPages ? 'bg-indigo-600 text-white shadow-md z-10' : ''
                        }`}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
               
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <span className="mr-1">Next</span>
                  <span className="sr-only">Next</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Batch;