"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  TrashIcon,
  PencilSquareIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { MdClose } from "react-icons/md";
import MockTestApis from "../apis/MockTestApis";
import QuestionApis from "../apis/QuestionApis";

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
    }));
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#465D96]">
              Mock Tests
            </h1>
            <p className="mt-2 text-sm text-">
              Manage and organize your assessment tests
            </p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="rounded-lg bg-[#465D96] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#465D96]/90"
          >
            + Create Test
          </button>
        </div>

        {/* Modal Form */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-12 ">
            <div className="w-full max-w-3xl rounded-2xl border border-gray-200 bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]">
              {/* Header */}
              <div className="flex items-center justify-between rounded-t-2xl bg-white px-6 py-4 text-[#465D96]">
                <div>
                  <h3 className="text-lg font-semibold">
                    {editingId ? "Edit Mock Test" : "Create Mock Test"}
                  </h3>
                  <p className="mt-0.5 text-sm text-gray-400">
                    {editingId
                      ? "Update test details and questions"
                      : "Set up a new assessment test"}
                  </p>
                </div>
                <button
                  onClick={resetForm}
                  className="rounded-lg p-2 text-white/80 transition hover:bg-white/20"
                >
                  <MdClose className="h-5 w-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 px-6">
                <div className="flex gap-6">
                  {["details", "questions"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`relative pb-3 pt-4 text-sm font-medium transition ${
                        activeTab === tab
                          ? "text-[#465D96]"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {tab === "details"
                        ? "Test Details"
                        : `Questions (${formData.questions.length})`}
                      {activeTab === tab && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#465D96]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="max-h-[calc(100vh-16rem)] overflow-y-auto px-6 py-6">
                  {/* DETAILS TAB */}
                  {activeTab === "details" && (
                    <div className="space-y-5">
                      {/* Title */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter test title"
                          className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-[#465D96] focus:ring-2 focus:ring-[#465D96]/30"
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <textarea
                          name="description"
                          rows={3}
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Test instructions"
                          className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-[#465D96] focus:ring-2 focus:ring-[#465D96]/30"
                        />
                      </div>

                      {/* Grid */}
                      <div className="grid gap-5 sm:grid-cols-2">
                        {[
                          {
                            label: "Duration (minutes)",
                            name: "duration",
                            type: "number",
                          },
                          {
                            label: "Total Marks",
                            name: "totalMarks",
                            type: "number",
                          },
                          {
                            label: "Allowed Attempts",
                            name: "allowedAttempts",
                            type: "number",
                          },
                        ].map((item) => (
                          <div key={item.name}>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                              {item.label}
                            </label>
                            <input
                              type={item.type}
                              name={item.name}
                              value={formData[item.name] || ""}
                              onChange={handleInputChange}
                              min="1"
                              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-[#465D96] focus:ring-2 focus:ring-[#465D96]/30"
                            />
                          </div>
                        ))}

                        {/* Publish */}
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Status
                          </label>
                          <label className="flex h-[42px] items-center gap-3 rounded-lg border border-gray-300 bg-gray-50 px-4">
                            <input
                              type="checkbox"
                              checked={formData.isPublished}
                              onChange={handleInputChange}
                              name="isPublished"
                              className="h-4 w-4 text-[#465D96]"
                            />
                            <span className="text-sm text-gray-700">
                              Publish Test
                            </span>
                          </label>
                        </div>

                        {/* Time */}
                        {["startTime", "endTime"].map((time) => (
                          <div key={time}>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                              {time === "startTime" ? "Start Time" : "End Time"}
                            </label>
                            <input
                              type="datetime-local"
                              name={time}
                              value={formData[time]?.slice(0,16) || ""}
                              onChange={handleInputChange}
                              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-[#465D96] focus:ring-2 focus:ring-[#465D96]/30"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* QUESTIONS TAB */}
                  {activeTab === "questions" && (
                    <div className="space-y-5">
                      {/* Search */}
                      <input
                        type="text"
                        placeholder="Search questions..."
                        value={questionSearch}
                        onChange={(e) => setQuestionSearch(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-[#465D96] focus:ring-2 focus:ring-[#465D96]/30"
                      />

                      {/* Available Questions */}
                      <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3 max-h-64 overflow-y-auto">
                        {filteredQuestions.map((q) => (
                          <label
                            key={q._id}
                            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 hover:border-[#465D96] hover:bg-[#465D96]/5"
                          >
                            <input
                              type="checkbox"
                              checked={formData.questions.some(
                                (i) => i.question === q._id
                              )}
                              onChange={() => handleQuestionToggle(q._id)}
                              className="h-4 w-4 text-[#465D96]"
                            />
                            <span
                              className="text-sm text-gray-700"
                              dangerouslySetInnerHTML={{ __html: q.title }}
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
                  <button
                    type="button"
                    onClick={
                      activeTab === "questions"
                        ? () => setActiveTab("details")
                        : resetForm
                    }
                    className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                  >
                    {activeTab === "questions" ? "Back" : "Cancel"}
                  </button>

                  {activeTab === "details" ? (
                    <button
                      type="button"
                      onClick={() => setActiveTab("questions")}
                      className="rounded-lg bg-[#465D96]/10 px-4 py-2 text-sm font-semibold text-[#465D96] hover:bg-[#465D96]/20"
                    >
                      Next: Questions
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="rounded-lg bg-[#465D96] px-6 py-2 text-sm font-semibold text-white hover:bg-[#3A4F86]"
                    >
                      {editingId ? "Update Test" : "Create Test"}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Mock Tests List */}
        <div className=" grid grid-cols-3 gap-2">
          {rows.length === 0 ? (
            <div className=" col-span-3 flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-100 bg-white/50 py-16">
              <AcademicCapIcon className="mb-4 h-12 w-12 text-/50" />
              <h3 className="mb-1 text-base font-medium ">No tests yet</h3>
              <p className="mb-6 text-sm text-">
                Get started by creating your first mock test
              </p>
              <button
                onClick={() => setIsFormOpen(true)}
                className="rounded-lg bg-[#465D96] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#465D96]/90"
              >
                + Create Test
              </button>
            </div>
          ) : (
            rows.map((row) => (
              <div
                key={row._id}
                className="group rounded-2xl border border-gray-200 bg-white  p-5 transition-all hover:-translate-y-0.5 hover:border-indigo-400 hover:shadow-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Title + Status */}
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600">
                        {row.title}
                      </h3>

                      {row.isPublished ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                          <CheckCircleIcon className="h-4 w-4" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                          <XCircleIcon className="h-4 w-4" />
                          Draft
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {row.description && (
                      <p className="mb-4 text-sm text-gray-600">
                        {row.description}
                      </p>
                    )}

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <ClockIcon className="h-4 w-4 text-indigo-500" />
                        <span>{row.duration} mins</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <AcademicCapIcon className="h-4 w-4 text-purple-500" />
                        <span>{row.totalMarks} marks</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400">•</span>
                        <span>{row.questions?.length || 0} questions</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400">•</span>
                        <span>
                          {row.allowedAttempts}{" "}
                          {row.allowedAttempts === 1 ? "attempt" : "attempts"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(row)}
                      className="rounded-xl bg-blue-50 p-2 text-blue-600 transition hover:bg-blue-600 hover:text-white"
                      title="Edit test"
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(row._id)}
                      className="rounded-xl bg-red-50 p-2 text-red-600 transition hover:bg-red-600 hover:text-white"
                      title="Delete test"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MockTest;
