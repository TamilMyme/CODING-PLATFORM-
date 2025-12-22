import React, { useState, useEffect } from "react";
import {
  TrashIcon,
  EyeIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import LabelInput from "../components/UI/LabelInput";
import StudentApis from "../apis/StudentApis";
import CollegeApis from "../apis/CollegeApis";
import SelectDropDown from "../components/UI/SelectDropDown";
import { MdClose } from "react-icons/md";

interface StudentRow {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  department: string;
  college: any; // Can be ObjectId or populated name
  isDeleted?: boolean;
}

const Student: React.FC = () => {
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [colleges, setColleges] = useState<StudentRow[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<StudentRow>({
    name: "",
    email: "",
    password: "",
    department: "",
    college: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Fetch students from API
  const fetchStudents = async () => {
    try {
      const data = await StudentApis.getAllStudent();
      // Filter out deleted students
      const activeStudents = data.data.students.filter(
        (s: StudentRow) => !s.isDeleted
      );
      setRows(activeStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchColleges = async () => {
    try {
      const data = await CollegeApis.getAllCollege();
      const activeStudents = data.data.colleges;
      setColleges(activeStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchColleges();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update student, only include password if provided
        const dataToUpdate = { ...formData };
        if (!formData.password) delete dataToUpdate.password;
        const updateData = await StudentApis.updateStudent(editingId, dataToUpdate);
        setRows([...rows,updateData.data])
      } else {
        const newData = await StudentApis.createStudent(formData);
        setRows([...rows,newData.data])
      }
      setFormData({
        name: "",
        email: "",
        password: "",
        department: "",
        college: "",
      });
      setEditingId(null);
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error saving student:", error);
    }
  };

  const handleEdit = (student: StudentRow & { _id?: string }) => {
    setFormData({
      name: student.name,
      email: student.email,
      password: "",
      department: student.department,
      college: student.college._id || student.college,
    });
    setEditingId(student._id || null);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    try {
      // Soft delete by setting isDeleted: true
      await StudentApis.updateStudent(id, { isDeleted: true });
      fetchStudents();
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  return (
    <div className="bg-white m-2 p-4 rounded-xl shadow flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Students</h2>
          <p className="text-sm text-gray-500">
            Manage the list of students with their college details.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setFormData({
              name: "",
              email: "",
              password: "",
              department: "",
              college: "",
            });
            setEditingId(null);
            setIsFormOpen((prev) => !prev);
          }}
          className="self-start sm:self-auto inline-flex items-center gap-2 rounded-lg bg-[#465D96] px-4 py-2 text-sm font-medium text-white shadow hover:bg-[#3a4d7d] transition"
        >
          <span className="text-lg leading-none">+</span>
          <span>Add</span>
        </button>
      </div>

      {/* Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-2xl mx-4 bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingId ? "Edit Student" : "Add Student"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setFormData({
                    name: "",
                    email: "",
                    password: "",
                    department: "",
                    college: "",
                  });
                  setEditingId(null);
                }}
                className="text-gray-500 hover:text-gray-700 transition"
                aria-label="Close"
              >
                <MdClose/>
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <LabelInput
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter name"
                required
              />
              <LabelInput
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email"
                required
              />
              <LabelInput
                label="Password"
                name="password"
                // type="password"
                value={formData.password || ""}
                onChange={handleInputChange}
                placeholder="Enter password"
                required={!editingId}
              />
              <LabelInput
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                placeholder="Enter department"
                required
              />
              <SelectDropDown
                label="College"
                name="college"
                value={formData.college}
                onChange={(_, value) => setFormData({ ...formData, college: value })}
                placeholder="Selcted College"
                required 
                options={colleges.map(c=>({label:c.name,value:c._id!}))}
              />

              <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setFormData({
                      name: "",
                      email: "",
                      password: "",
                      department: "",
                      college: "",
                    });
                    setEditingId(null);
                  }}
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
              <th className="px-4 py-2 text-left font-medium uppercase tracking-wide">
                S.No
              </th>
              <th className="px-4 py-2 text-left font-medium uppercase tracking-wide">
                Name
              </th>
              <th className="px-4 py-2 text-left font-medium uppercase tracking-wide">
                Email
              </th>
              <th className="px-4 py-2 text-left font-medium uppercase tracking-wide">
                Department
              </th>
              <th className="px-4 py-2 text-left font-medium uppercase tracking-wide">
                College
              </th>
              <th className="px-4 py-2 text-right font-medium uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-800">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  No records available. Click &quot;Add&quot; to create one.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={row._id || index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap">{index + 1}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{row.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <a
                      href={`mailto:${row.email}`}
                      className="text-[#465D96] hover:underline break-all"
                    >
                      {row.email}
                    </a>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {row.department}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">{row.college?.name}</td>
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
                        onClick={() => handleEdit(row)}
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

export default Student;
