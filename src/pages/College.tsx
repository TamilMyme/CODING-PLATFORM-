import React, { useState, useEffect } from "react";
import { TrashIcon, EyeIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import LabelInput from "../components/UI/LabelInput";
import CollegeApis from "../apis/CollegeApis";

interface CollegeRow {
  _id: string; // API ID
  name: string;
  studentCount: string;
  course: string;
  duration: string;
}

const College: React.FC = () => {
  const [rows, setRows] = useState<CollegeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<CollegeRow, "_id">>({
    name: "",
    studentCount: "",
    course: "",
    duration: "",
  });

  // Fetch colleges on mount
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const data = await CollegeApis.getAllCollege();
        setRows(data.data.colleges);
      } catch (error) {
        console.error("Failed to fetch colleges", error);
      } finally {
        setLoading(false);
      }
    };
    fetchColleges();
  }, []);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Open form for adding new college
  const handleAddClick = () => {
    setEditingId(null);
    setFormData({ name: "", studentCount: "", course: "", duration: "" });
    setIsFormOpen(true);
  };

  // Open form for editing existing college
  const handleEditClick = (college: CollegeRow) => {
    setEditingId(college._id);
    setFormData({
      name: college.name,
      studentCount: college.studentCount,
      course: college.course,
      duration: college.duration,
    });
    setIsFormOpen(true);
  };

  // Add or update college
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.studentCount || !formData.course || !formData.duration) return;

    try {
      if (editingId) {
        // Update
        const updatedCollege = await CollegeApis.updateCollege(editingId, formData);
        setRows((prev) => prev.map((row) => (row._id === editingId ? updatedCollege : row)));
      } else {
        // Create
        const newCollege = await CollegeApis.createCollege(formData);
        setRows((prev) => [...prev, newCollege.data]);
      }
      setIsFormOpen(false);
      setFormData({ name: "", studentCount: "", course: "", duration: "" });
      setEditingId(null);
    } catch (error) {
      console.error("Failed to save college", error);
    }
  };

  // Delete college
  const handleDelete = async (id: string) => {
    try {
      await CollegeApis.deleteCollege(id, {});
      setRows((prev) => prev.filter((row) => row._id !== id));
    } catch (error) {
      console.error("Failed to delete college", error);
    }
  };

  return (
    <div className="bg-white m-2 p-4 rounded-xl shadow flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Colleges</h2>
          <p className="text-sm text-gray-500">Manage the list of colleges and their course details.</p>
        </div>
        <button
          type="button"
          onClick={handleAddClick}
          className="self-start sm:self-auto inline-flex items-center gap-2 rounded-lg bg-[#465D96] px-4 py-2 text-sm font-medium text-white shadow hover:bg-[#3a4d7d] transition"
        >
          <span className="text-lg leading-none">+</span>
          <span>Add</span>
        </button>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-2xl mx-4 bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{editingId ? "Edit College" : "Add College"}</h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LabelInput
                label="College Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter college name"
                required
              />
              {/* <LabelInput
                label="Student Count"
                name="studentCount"
                type="number"
                value={formData.studentCount}
                onChange={handleInputChange}
                placeholder="Enter student count"
                required
              /> */}
              <LabelInput
                label="Course"
                name="course"
                value={formData.course}
                onChange={handleInputChange}
                placeholder="Enter course"
                required
              />
              <LabelInput
                label="Duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="e.g. 12 days"
                required
              />

              <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-lg bg-[#465D96] px-4 py-2 text-sm font-medium text-white hover:bg-[#3a4d7d] transition"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-2 text-left font-medium uppercase tracking-wide">S.No</th>
              <th className="px-4 py-2 text-left font-medium uppercase tracking-wide">College Name</th>
              <th className="px-4 py-2 text-left font-medium uppercase tracking-wide">Stu Count</th>
              <th className="px-4 py-2 text-left font-medium uppercase tracking-wide">Course</th>
              <th className="px-4 py-2 text-left font-medium uppercase tracking-wide">Duration</th>
              <th className="px-4 py-2 text-right font-medium uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-800">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">Loading...</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  No records available. Click "Add" to create one.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={row._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap">{index + 1}</td>
                  <td className="px-4 py-2">{row.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{row.studentCount}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{row.course}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{row.duration}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2 text-gray-500">
                      <button
                        type="button"
                        className="p-1 rounded-full hover:bg-gray-100 hover:text-[#465D96] transition"
                        aria-label="Preview"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditClick(row)}
                        className="p-1 rounded-full hover:bg-gray-100 hover:text-[#465D96] transition"
                        aria-label="Edit"
                      >
                        <PencilSquareIcon className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(row._id)}
                        className="p-1 rounded-full hover:bg-red-50 hover:text-red-600 transition"
                        aria-label="Delete"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default College;