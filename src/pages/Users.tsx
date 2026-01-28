import React, { useState, useEffect } from "react";
import { TrashIcon, PencilSquareIcon, UserCircleIcon, MagnifyingGlassIcon, FunnelIcon, UserPlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import LabelInput from "../components/UI/LabelInput";
import UserApis from "../apis/UserApis";
import type { UserRole } from "../types/interfaces";

/* =========================
   Types
========================= */
interface UserRow {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
}

/* =========================
   Component
========================= */
const Users: React.FC = () => {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [filteredRows, setFilteredRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "ADMIN",
  });

  /* =========================
     Fetch Users
  ========================= */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await UserApis.getAllUsers();
        setRows(res.data.users);
        setFilteredRows(res.data.users);
      } catch (error) {
        console.error("Failed to fetch users", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  /* =========================
     Filter Users
  ========================= */
  useEffect(() => {
    let filtered = rows;

    // Only show admin and superadmin users
    filtered = filtered.filter(user => user.role === "ADMIN" || user.role === "SUPER_ADMIN");

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        user =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredRows(filtered);
  }, [rows, searchTerm, roleFilter]);

  /* =========================
     Handlers
  ========================= */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({ name: "", email: "", password: "", role: "admin" });
    setIsFormOpen(true);
  };

  const handleEdit = (user: UserRow) => {
    setEditingId(user._id);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        const res = await UserApis.updateUser(editingId, formData);
        setRows(prev =>
          prev.map(u => (u._id === editingId ? res.data.user : u))
        );
      } else {
        const res = await UserApis.createUser(formData);
        setRows(prev => [...prev, res.data]);
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error("Failed to save user", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await UserApis.deleteUser(id);
        setRows(prev => prev.filter(u => u._id !== id));
      } catch (error) {
        console.error("Failed to delete user", error);
      }
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "admin":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "mentor":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      case "admin":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
            <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
          </svg>
        );
      case "mentor":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
          </svg>
        );
      default:
        return null;
    }
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="rounded-xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">User Management</h2>
            <p className="text-indigo-100">
              Manage administrators and super administrators
            </p>
          </div>

          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition font-medium shadow-sm"
          >
            <UserPlusIcon className="w-5 h-5" />
            Add User
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border-x border-gray-200 px-6 py-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>
      </div>

      {/* User Grid */}
      <div className="bg-gray-50 border-x border-b border-gray-200 rounded-b-xl p-6">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading users...</div>
        ) : filteredRows.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            {rows.length === 0 ? (
              <>
                <UserCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No users</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new user.</p>
                <div className="mt-6">
                  <button
                    onClick={handleAdd}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <UserPlusIcon className="h-5 w-5 mr-2" />
                    Add User
                  </button>
                </div>
              </>
            ) : (
              <>
                <FunnelIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No matching users</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredRows.map(user => (
              <div
                key={user._id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group h-56 relative"
              >
                {/* Header with actions */}
                <div className="relative h-20 bg-gradient-to-r from-indigo-500 to-purple-600">
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      onClick={() => handleEdit(user)}
                      className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white"
                      title="Edit"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* User Info */}
                <div className="p-5 -mt-15 absolute w-full">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center mb-3">
                      <UserCircleIcon className="w-14 h-14 text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-500 mb-3">{user.email}</p>

                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${getRoleBadgeClass(user.role)}`}>
                      {getRoleIcon(user.role)}
                      {user.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingId ? "Edit User" : "Add User"}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <LabelInput
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

                <LabelInput
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

                {!editingId && (
                  <LabelInput
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
