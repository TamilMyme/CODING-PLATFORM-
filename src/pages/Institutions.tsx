import React, { useState, useEffect } from "react";
import {
  TrashIcon,
  EyeIcon,
  PencilSquareIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  UserGroupIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import LabelInput from "../components/UI/LabelInput";
import OrganisationApis from "../apis/OrganisationApis";
import UserApis from "../apis/UserApis";
import SelectDropDown from "../components/UI/SelectDropDown";
import { MdClose, MdFilterList } from "react-icons/md";
import { useAuth } from "../context/AuthProvider";

interface InstitutionRow {
  _id?: string;
  name?: string;
  address?: string;
  admins?: string[]; // Array of user IDs
  studentCount?: number;
  type?: "COLLEGE" | "ORGANISATION";
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  selected?: boolean;
}

const Institutions: React.FC = () => {
  const [rows, setRows] = useState<InstitutionRow[]>([]);
  const [filteredRows, setFilteredRows] = useState<InstitutionRow[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Omit<InstitutionRow, "_id">>({
    name: "",
    address: "",
    admins: [],
    type: "COLLEGE",
    studentCount: 0,
    isDeleted: false,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"COLLEGE" | "ORGANISATION" | "ALL">("ALL");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [activeTab, setActiveTab] = useState<"COLLEGE" | "ORGANISATION">("COLLEGE");
  const [users, setUsers] = useState<any[]>([]);

  const { user } = useAuth();

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [orgsRes, usersRes] = await Promise.all([
          OrganisationApis.getAllOrganisations(),
          UserApis.getAllUsersByRole("ADMIN")
        ]);

        // Split organisations into colleges and other organisations based on a type field or similar
        const allOrgs = orgsRes.data || [];
        const colleges = allOrgs
          .filter((org: any) => org.type === "COLLEGE")
          .map((college: any) => ({
            ...college,
            type: "COLLEGE" as const,
            studentCount: college.studentCount || 0,
            address: college.address || "",
            admins: college.admins || [],
            isDeleted: college.isDeleted || false
          }));
        
        const organisations = allOrgs
          .filter((org: any) => org.type !== "COLLEGE")
          .map((org: any) => ({
            ...org,
            type: "ORGANISATION" as const,
            studentCount: org.studentCount || 0,
            address: org.address || "",
            admins: org.admins || [],
            isDeleted: org.isDeleted || false
          }));

        const allInstitutions = [...colleges, ...organisations];
        setRows(allInstitutions);
        setFilteredRows(allInstitutions);
        setUsers(usersRes.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...rows];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(institution =>
        institution.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        institution.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== "ALL") {
      filtered = filtered.filter(institution => institution.type === filterType);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof InstitutionRow] || "";
      const bValue = b[sortBy as keyof InstitutionRow] || "";
      
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredRows(filtered);
  }, [searchTerm, filterType, sortBy, sortOrder, rows]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleAdminsChange = (selectedAdmins: string[]) => {
    setFormData((prev) => ({ ...prev, admins: selectedAdmins }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        // Update institution
        const dataToUpdate = { ...formData };
        await OrganisationApis.updateOrganisation(editingId, dataToUpdate);
      } else {
        // Create new institution
        await OrganisationApis.createOrganisation({ ...formData, type: activeTab });
      }
      
      // Refresh data
      const orgsRes = await OrganisationApis.getAllOrganisations();
      
      // Split organisations into colleges and other organisations based on a type field or similar
      const allOrgs = orgsRes.data || [];
      const colleges = allOrgs
        .filter((org: any) => org.type === "COLLEGE")
        .map((college: any) => ({
          ...college,
          type: "COLLEGE" as const,
          studentCount: college.studentCount || 0,
          address: college.address || "",
          admins: college.admins || [],
          isDeleted: college.isDeleted || false
        }));
      
      const organisations = allOrgs
        .filter((org: any) => org.type !== "COLLEGE")
        .map((org: any) => ({
          ...org,
          type: "ORGANISATION" as const,
          studentCount: org.studentCount || 0,
          address: org.address || "",
          admins: org.admins || [],
          isDeleted: org.isDeleted || false
        }));

      const allInstitutions = [...colleges, ...organisations];
      setRows(allInstitutions);
      setFilteredRows(allInstitutions);
      
      // Reset form
      setFormData({
        name: "",
        address: "",
        admins: [],
        type: activeTab,
        studentCount: 0,
        isDeleted: false,
      });
      setEditingId(null);
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error saving institution:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (institution: InstitutionRow & { _id?: string }) => {
    setFormData({
      name: institution.name,
      address: institution.address || "",
      admins: institution.admins || [],
      type: institution.type,
      studentCount: institution.studentCount || 0,
      isDeleted: institution.isDeleted || false,
    });
    setEditingId(institution._id || null);
    setActiveTab(institution.type || "COLLEGE");
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this institution? This action cannot be undone.")) return;
    
    try {
      const institution = rows.find(r => r._id === id);
      await OrganisationApis.deleteOrganisation(id);
      
      setRows(rows.filter(r => r._id !== id));
      setFilteredRows(filteredRows.filter(r => r._id !== id));
    } catch (error) {
      console.error("Error deleting institution:", error);
    }
  };

  const handleView = async (id: string | undefined) => {
    if (!id) return;
    try {
      const institution = rows.find(r => r._id === id);
      if (institution) {
        alert(`Institution Details:\n\nName: ${institution.name}\nAddress: ${institution.address || 'Not specified'}\nType: ${institution.type === "COLLEGE" ? "College" : "Organization"}\nAdmins: ${institution.admins?.length || 0}\nStudent Count: ${institution.studentCount || 0}\nStatus: ${institution.isActive ? 'Active' : 'Inactive'}\nDeleted: ${institution.isDeleted ? 'Yes' : 'No'}\nJoined: ${new Date(institution.createdAt || "").toLocaleDateString()}`);
      }
    } catch (error) {
      console.error("Error fetching institution details:", error);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterType("ALL");
    setShowFilters(false);
  };

  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);
  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const collegesCount = rows.filter(r => r.type === "COLLEGE").length;
  const organisationsCount = rows.filter(r => r.type === "ORGANISATION").length;
  const activeInstitutionsCount = rows.filter(r => r.isActive).length;

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="mb-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="text-white">
              <h1 className="text-3xl font-bold tracking-tight">
                Institutions Management
              </h1>
              <p className="text-indigo-100 mt-1 text-sm md:text-base">
                Manage colleges and organizations in the education system
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
                  placeholder="Search by name or address..."
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
              onClick={() => {
                setFormData({
                  name: "",
                  address: "",
                  admins: [],
                  type: activeTab,
                  studentCount: 0,
                  isDeleted: false,
                });
                setEditingId(null);
                setIsFormOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all font-medium shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H8" />
              </svg>
              <span>Add Institution</span>
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
                  {[
                    searchTerm && 'Search',
                    filterType !== 'ALL' && 'Type'
                  ].filter(Boolean).length} active
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Search */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Search</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or address..."
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                />
              </div>

              {/* Type Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as "COLLEGE" | "ORGANISATION" | "ALL")}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                >
                  <option value="ALL">All Types</option>
                  <option value="COLLEGE">Colleges</option>
                  <option value="ORGANISATION">Organizations</option>
                </select>
              </div>

              {/* Sort */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                >
                  <option value="name">Name</option>
                  <option value="studentCount">Student Count</option>
                  <option value="createdAt">Created Date</option>
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
                    <BuildingOfficeIcon className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{filteredRows.length}</p>
                  <p className="text-sm font-medium text-gray-600">Total Institutions</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0 0l-8 8-4-4-6 6" />
                  </svg>
                  +12.5%
                </span>
                <span className="text-xs text-gray-500">from last month</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full opacity-50"></div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <AcademicCapIcon className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{collegesCount}</p>
                  <p className="text-sm font-medium text-gray-600">Total Colleges</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-blue-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0 0l-8 8-4-4-6 6" />
                  </svg>
                  +8.2%
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
                    <MdFilterList className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{organisationsCount}</p>
                  <p className="text-sm font-medium text-gray-600">Total Organizations</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-orange-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0 0l-8 8-4-4-6 6" />
                  </svg>
                  +5.1%
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
                    <UserGroupIcon className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{activeInstitutionsCount}</p>
                  <p className="text-sm font-medium text-gray-600">Active Institutions</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0 0l-8 8-4-4-6 6" />
                  </svg>
                  +15.3%
                </span>
                <span className="text-xs text-gray-500">from last month</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-6 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("COLLEGE")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "COLLEGE"
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300'
            }`}
          >
            <AcademicCapIcon className="w-5 h-5 mr-2" />
            Colleges
          </button>
          <button
            onClick={() => setActiveTab("ORGANISATION")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "ORGANISATION"
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300'
            }`}
          >
            <BuildingOfficeIcon className="w-5 h-5 mr-2" />
            Organizations
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {activeTab === "COLLEGE" ? "College List" : "Organization List"}
          </h2>
          <p className="text-sm text-gray-600">Manage and view all {activeTab === "COLLEGE" ? "college" : "organization"} information</p>
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
                      const tabFilteredRows = filteredRows.filter(r => 
                        activeTab === "COLLEGE" ? r.type === "COLLEGE" : r.type === "ORGANISATION"
                      );
                      setRows(rows.map(row => 
                        tabFilteredRows.includes(row) ? { ...row, selected: checked } : { ...row, selected: false }
                      ));
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
                    <span>Name</span>
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
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Admins
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Student Count
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                        <svg className="w-8 h-8 text-indigo-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Loading institutions...</h3>
                      <p className="text-sm text-gray-500 max-w-md">Please wait while we fetch institution data.</p>
                    </div>
                  </td>
                </tr>
              ) : filteredRows.filter(r => 
                activeTab === "COLLEGE" ? r.type === "COLLEGE" : r.type === "ORGANISATION"
              ).length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-4">
                        <MagnifyingGlassIcon className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No {activeTab === "COLLEGE" ? "colleges" : "organizations"} found</h3>
                      <p className="text-sm text-gray-500 max-w-md">Try adjusting your filters or search by name or address to find {activeTab === "COLLEGE" ? "colleges" : "organizations"} you're looking for.</p>
                      <button
                        onClick={clearFilters}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRows
                  .filter(r => activeTab === "COLLEGE" ? r.type === "COLLEGE" : r.type === "ORGANISATION")
                  .map((row, index) => (
                    <tr 
                      key={row._id} 
                      className={`hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 ${row.selected ? 'bg-gradient-to-r from-indigo-50 to-purple-50' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={row.selected || false}
                          onChange={() => {
                            const updatedRows = rows.map(r => 
                              r._id === row._id ? { ...r, selected: !r.selected } : r
                            );
                            setRows(updatedRows);
                          }}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {row.name?.charAt(0).toUpperCase() || 'I'}
                            </div>
                            {row.isActive && (
                              <div className="absolute -bottom-0 -right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{row.name}</div>
                            <div className="text-xs text-gray-500">ID: {row._id?.slice(-8) || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full ${
                          row.type === "COLLEGE" 
                            ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                            : 'bg-purple-100 text-purple-800 border border-purple-200'
                        }`}>
                          {row.type === "COLLEGE" ? "College" : "Organization"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={row.address || 'No address'}>
                          {row.address || 'No address'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {row.admins?.length || 0} admin{(row.admins?.length || 0) !== 1 ? 's' : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{row.studentCount || 0}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full ${
                          row.isActive 
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border border-green-200' 
                            : 'bg-gradient-to-r from-red-50 to-pink-50 text-red-800 border border-red-200'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            row.isActive ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          {row.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleView(row._id)}
                            className="p-2 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 group"
                            aria-label="View"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(row)}
                            className="p-2 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 group"
                            aria-label="Edit"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(row._id)}
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
                Showing <span className="font-semibold">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-semibold">{Math.min(currentPage * itemsPerPage, filteredRows.length)}</span> of <span className="font-semibold">{filteredRows.length}</span> {activeTab === "COLLEGE" ? "colleges" : "organizations"}
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

      {/* Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">
                    {editingId ? `Edit ${activeTab === "COLLEGE" ? "College" : "Organization"}` : `Add New ${activeTab === "COLLEGE" ? "College" : "Organization"}`}
                  </h3>
                  <p className="text-indigo-100 mt-1">
                    {editingId ? `Update ${activeTab === "COLLEGE" ? "college" : "organization"} information and details` : `Fill in details to create a new ${activeTab === "COLLEGE" ? "college" : "organization"} account`}
                  </p>
                </div>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200"
                >
                  <MdClose className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Institution Information Section */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      {activeTab === "COLLEGE" ? (
                        <AcademicCapIcon className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <BuildingOfficeIcon className="w-4 h-4 text-indigo-600" />
                      )}
                    </div>
                    {activeTab === "COLLEGE" ? "College Information" : "Organization Information"}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder={`Enter ${activeTab === "COLLEGE" ? "college" : "organization"} name`}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Type</label>
                      <select
                        name="type"
                        value={editingId ? formData.type : activeTab}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as "COLLEGE" | "ORGANISATION" })}
                        disabled={!!editingId}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                        required
                      >
                        <option value="" disabled> -- SELECT -- </option>
                        <option value="COLLEGE">College</option>
                        <option value="ORGANISATION">Organization</option>
                      </select>
                      {editingId && (
                        <p className="text-xs text-gray-500">Type cannot be changed when editing</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Enter address"
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Student Count</label>
                      <input
                        type="number"
                        name="studentCount"
                        value={formData.studentCount}
                        onChange={handleInputChange}
                        placeholder="Enter student count"
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Admins</label>
                      <select
                        multiple
                        value={formData.admins || []}
                        onChange={(e) => {
                          const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                          handleAdminsChange(selectedOptions);
                        }}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        size={4}
                      >
                        {users.map((user) => (
                          <option key={user._id} value={user._id}>
                            {user.name || user.email} ({user.email})
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500">Hold Ctrl/Cmd to select multiple admins</p>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                  >
                    {isSubmitting && (
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {editingId ? `Update ${activeTab === "COLLEGE" ? "College" : "Organization"}` : `Add ${activeTab === "COLLEGE" ? "College" : "Organization"}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Institutions;