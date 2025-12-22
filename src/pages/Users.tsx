import React, { useState, useEffect } from "react";
import { TrashIcon, PencilSquareIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import LabelInput from "../components/UI/LabelInput";
import UserApis from "../apis/UserApis";

/* =========================
   Types
========================= */
interface UserRow {
  _id: string;
  name: string;
  email: string;
  role: "super-admin" | "admin" | "mentor";
}

/* =========================
   Component
========================= */
const Users: React.FC = () => {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "mentor",
  });

  /* =========================
     Fetch Users
  ========================= */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await UserApis.getAllUsers();
        setRows(res.data.users);
      } catch (error) {
        console.error("Failed to fetch users", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

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
    setFormData({ name: "", email: "", password: "", role: "mentor" });
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
    try {
      await UserApis.deleteUser(id);
      setRows(prev => prev.filter(u => u._id !== id));
    } catch (error) {
      console.error("Failed to delete user", error);
    }
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className=" rounded-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-[#465D96]">User Management</h2>
          <p className="text-sm text-gray-500">
            Manage admins, mentors, and system users
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 bg-[#465D96] text-white px-4 py-2 rounded-lg hover:bg-[#3a4d7d] transition"
        >
          + Add User
        </button>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? "Edit User" : "Add User"}
            </h3>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
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
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="mentor">Mentor</option>
                  <option value="admin">Admin</option>
                  <option value="super-admin">Super Admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#465D96] text-white rounded-lg hover:bg-[#3a4d7d]"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid View */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading users...</div>
      ) : rows.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No users found. Click “Add User” to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {rows.map(user => (
            <div
              key={user._id}
              className=" relative border border-[#465D96] rounded-xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between bg-white"
            >
              {/* User Info */}
              <div className="flex items-start gap-3">
                <UserCircleIcon className="w-14 h-14 text-gray-400" />

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {user.name}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>

                  <span
                    className={`inline-block mt-2 px-2 py-0.5 text-xs rounded-full font-medium
                      ${
                        user.role === "super-admin"
                          ? "bg-purple-100 text-purple-700"
                          : user.role === "admin"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}
                  >
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Actions */}
             <div className=" absolute flex justify-end gap-1 right-2 top-2">
                <button
                  onClick={() => handleEdit(user)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-[#465D96]"
                  title="Edit"
                >
                  <PencilSquareIcon className="w-5 h-5" />
                </button>

                <button
                  onClick={() => handleDelete(user._id)}
                  className="p-2 rounded-lg hover:bg-red-50 text-gray-600 hover:text-red-600"
                  title="Delete"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Users;
