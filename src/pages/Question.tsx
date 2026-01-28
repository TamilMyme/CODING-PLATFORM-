"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  TrashIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import {
  CodeBracketIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/solid";
import LabelInput from "../components/UI/LabelInput";
import LabelTextArea from "../components/UI/LabelTextArea";
import SelectDropDown from "../components/UI/SelectDropDown";
import QuestionApis from "../apis/QuestionApis";
import TextEditor from "../components/UI/TextEdiotor";
import ToggleSwitch from "../components/UI/ToggleSwitch";
import { MdClose } from "react-icons/md";

type QuestionType = "mcq" | "coding";

interface MCQOption {
  text: string;
  isCorrect: boolean;
}

interface MCQQuestion {
  _id: string;
  type: "mcq";
  description: "";
  title: string;
  options: MCQOption[];
  correctOption?: number[];
  multiSelect?: boolean;
  difficulty?: "easy" | "medium" | "hard";
  marks?: number;
}

interface CodingTestCase {
  input: string;
  output: string;
  isHidden?: boolean;
}

interface CodingQuestion {
  _id: string;
  type: "coding";
  title: string;
  description: string;
  testCases: CodingTestCase[];
  allowedLanguages: string[];
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string;
  timeLimit?: number;
  memoryLimit?: number;
  difficulty?: "easy" | "medium" | "hard";
  marks?: number;
}

type Question = MCQQuestion | CodingQuestion;

const Question: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingQuestion, setViewingQuestion] = useState<Question | null>(null);
  const [questionType, setQuestionType] = useState<QuestionType>("mcq");
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    new Set(),
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("ALL");
  const [filterType, setFilterType] = useState<QuestionType | "ALL">("ALL");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);

  // MCQ Form State
  const [mcqFormData, setMcqFormData] = useState({
    title: "",
    description: "",
    options: [{ text: "", isCorrect: false }],
    correctOption: [] as number[],
    multiSelect: false,
    difficulty: "easy",
    marks: 1,
  });

  // Coding Form State
  const [codingFormData, setCodingFormData] = useState({
    title: "",
    description: "",
    testCases: [{ input: "", output: "", isHidden: true }],
    allowedLanguages: ["python"],
    inputFormat: "",
    outputFormat: "",
    constraints: "",
    timeLimit: 2,
    memoryLimit: 256,
    difficulty: "easy",
    marks: 1,
  });

  const questionTypeOptions = [
    { value: "mcq", label: "MCQ" },
    { value: "coding", label: "Coding" },
  ];

  const languageOptions = [
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "c", label: "C" },
    { value: "cpp", label: "C++" },
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
  ];

  const difficultyOptions = [
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" },
  ];

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await QuestionApis.getAllQuestions();
        setQuestions(data.data.questions);
      } catch (err) {
        console.error("Failed to fetch questions:", err);
      }
    };
    fetchQuestions();
  }, []);

  const handleQuestionTypeChange = (_name: string, value: string) => {
    setQuestionType(value as QuestionType);
    
    // Only reset form data if not in edit mode
    if (!isEditMode) {
      setMcqFormData({
        title: "",
        description: "",
        options: [{ text: "", isCorrect: false }],
        correctOption: [],
        multiSelect: false,
        difficulty: "easy",
        marks: 1,
      });
      setCodingFormData({
        title: "",
        description: "",
        testCases: [{ input: "", output: "", isHidden: true }],
        allowedLanguages: ["python"],
        inputFormat: "",
        outputFormat: "",
        constraints: "",
        timeLimit: 2,
        memoryLimit: 256,
        difficulty: "easy",
        marks: 1,
      });
    }
  };

  // MCQ Input Change
  const handleMcqInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    let newValue: string | boolean = value;

    // Type narrowing for checkbox
    if (type === "checkbox" && "checked" in e.target) {
      newValue = e.target.checked;
    }

    if (name === "multiSelect") {
      setMcqFormData((prev) => ({
        ...prev,
        multiSelect: Boolean(newValue),
        correctOption: [],
      }));
    } else if (name === "marks") {
      setMcqFormData((prev) => ({ ...prev, marks: Number.parseInt(value) }));
    } else {
      setMcqFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handler for ToggleSwitch component
  const handleMultiSelectToggle = (value: boolean) => {
    setMcqFormData((prev) => ({
      ...prev,
      multiSelect: value,
      correctOption: [],
    }));
  };

  // Handler for option correctness ToggleSwitch
  const handleOptionCorrectnessToggle = (index: number) => {
    return () => {
      handleCorrectOptionChange(index)
    }
  };

  // Coding Input Change
  const handleCodingInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "marks") {
      setCodingFormData((prev) => ({ ...prev, marks: Number.parseInt(value) }));
    } else {
      setCodingFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // MCQ Options
  const handleAddOption = () => {
    setMcqFormData((prev) => ({
      ...prev,
      options: [...prev.options, { text: "", isCorrect: false }],
    }));
  };

  const handleOptionChange = (index: number, value: string) => {
    setMcqFormData((prev) => {
      const newOptions = [...prev.options];
      newOptions[index].text = value;
      return { ...prev, options: newOptions };
    });
  };

  const handleRemoveOption = (index: number) => {
    setMcqFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
      correctOption: prev.correctOption.filter((i) => i !== index),
    }));
  };

  const handleCorrectOptionChange = (index: number) => {
    setMcqFormData((prev) => {
      let newCorrectOption: number[];
      if (prev.multiSelect) {
        newCorrectOption = prev.correctOption.includes(index)
          ? prev.correctOption.filter((i) => i !== index)
          : [...prev.correctOption, index];
      } else {
        newCorrectOption = [index];
      }

      const newOptions = prev.options.map((opt, i) => ({
        ...opt,
        isCorrect: newCorrectOption.includes(i),
      }));

      return { ...prev, correctOption: newCorrectOption, options: newOptions };
    });
  };

  // Coding TestCases
  const handleTestCaseChange = (
    index: number,
    field: "input" | "output",
    value: string,
  ) => {
    setCodingFormData((prev) => {
      const newTestCases = [...prev.testCases];
      newTestCases[index][field] = value;
      return { ...prev, testCases: newTestCases };
    });
  };

  const handleAddTestCase = () => {
    setCodingFormData((prev) => ({
      ...prev,
      testCases: [...prev.testCases, { input: "", output: "", isHidden: true }],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let questionData: any = null;

      if (questionType === "mcq") {
        questionData = {
          type: "mcq",
          title: mcqFormData.title,
          description: mcqFormData.description,
          options: mcqFormData.options,
          correctOption: mcqFormData.correctOption,
          multiSelect: mcqFormData.multiSelect,
          difficulty: mcqFormData.difficulty,
          marks: mcqFormData.marks,
        };
      } else {
        questionData = {
          type: "coding",
          title: codingFormData.title,
          description: codingFormData.description,
          testCases: codingFormData.testCases,
          allowedLanguages: codingFormData.allowedLanguages,
          inputFormat: codingFormData.inputFormat,
          outputFormat: codingFormData.outputFormat,
          constraints: codingFormData.constraints,
          timeLimit: codingFormData.timeLimit,
          memoryLimit: codingFormData.memoryLimit,
          difficulty: codingFormData.difficulty,
          marks: codingFormData.marks,
        };
      }

      if (isEditMode && editingQuestionId) {
        // Update existing question
        const updated = await QuestionApis.updateQuestion(editingQuestionId, questionData);
        setQuestions((prev) =>
          prev.map((q) => (q._id === editingQuestionId ? updated.data : q))
        );
      } else {
        // Create new question
        const created = await QuestionApis.createQuestion(questionData);
        setQuestions((prev) => [...prev, created.data]);
      }
      
      setIsFormOpen(false);
      resetForm();
    } catch (err) {
      console.error(`Failed to ${isEditMode ? "update" : "add"} question:`, err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await QuestionApis.deleteQuestion(id, {});
      setQuestions((prev) => prev.filter((q) => q._id !== id));
    } catch (err) {
      console.error("Failed to delete question:", err);
    }
  };

  const handleEdit = (question: Question) => {
    setIsEditMode(true);
    setEditingQuestionId(question._id);
    setQuestionType(question.type);
    
    if (question.type === "mcq") {
      const mcqQuestion = question as MCQQuestion;
      setMcqFormData({
        title: mcqQuestion.title,
        description: mcqQuestion.description,
        options: mcqQuestion.options,
        correctOption: mcqQuestion.correctOption || [],
        multiSelect: mcqQuestion.multiSelect || false,
        difficulty: mcqQuestion.difficulty || "easy",
        marks: mcqQuestion.marks || 1,
      });
    } else {
      const codingQuestion = question as CodingQuestion;
      setCodingFormData({
        title: codingQuestion.title,
        description: codingQuestion.description,
        testCases: codingQuestion.testCases.map(tc => ({
          input: tc.input,
          output: tc.output,
          isHidden: tc.isHidden ?? true
        })),
        allowedLanguages: codingQuestion.allowedLanguages,
        inputFormat: codingQuestion.inputFormat || "",
        outputFormat: codingQuestion.outputFormat || "",
        constraints: codingQuestion.constraints || "",
        timeLimit: codingQuestion.timeLimit || 2,
        memoryLimit: codingQuestion.memoryLimit || 256,
        difficulty: codingQuestion.difficulty || "easy",
        marks: codingQuestion.marks || 1,
      });
    }
    
    setIsFormOpen(true);
  };

  const handleView = (question: Question) => {
    setViewingQuestion(question);
    setIsViewModalOpen(true);
  };

  const resetForm = () => {
    setIsEditMode(false);
    setEditingQuestionId(null);
    setQuestionType("mcq");
    setMcqFormData({
      title: "",
      description: "",
      options: [{ text: "", isCorrect: false }],
      correctOption: [],
      multiSelect: false,
      difficulty: "easy",
      marks: 1,
    });
    setCodingFormData({
      title: "",
      description: "",
      testCases: [{ input: "", output: "", isHidden: true }],
      allowedLanguages: ["python"],
      inputFormat: "",
      outputFormat: "",
      constraints: "",
      timeLimit: 2,
      memoryLimit: 256,
      difficulty: "easy",
      marks: 1,
    });
  };

  const toggleQuestionExpanded = (id: string) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterDifficulty("ALL");
    setFilterType("ALL");
    setShowFilters(false);
  };

  // Apply filters and search
  let filteredQuestions = [...questions];

  if (searchTerm) {
    filteredQuestions = filteredQuestions.filter((question) =>
      question.title.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }

  if (filterDifficulty !== "ALL") {
    filteredQuestions = filteredQuestions.filter(
      (question) => question.difficulty === filterDifficulty,
    );
  }

  if (filterType !== "ALL") {
    filteredQuestions = filteredQuestions.filter(
      (question) => question.type === filterType,
    );
  }

  const mcqQuestions = filteredQuestions.filter(
    (q) => q.type === "mcq",
  ) as MCQQuestion[];
  const codingQuestions = filteredQuestions.filter(
    (q) => q.type === "coding",
  ) as CodingQuestion[];

  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const DifficultyBadge = ({
    difficulty,
  }: {
    difficulty?: "easy" | "medium" | "hard";
  }) => {
    const colors = {
      easy: "bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200",
      medium:
        "bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-200",
      hard: "bg-gradient-to-r from-rose-50 to-rose-100 text-rose-700 border-rose-200",
    };
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border shadow-sm ${colors[difficulty || "easy"]}`}
      >
        {difficulty || "easy"}
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
                Question Bank
              </h1>
              <p className="text-indigo-100 mt-1 text-sm md:text-base">
                Create and manage assessment questions for your courses
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
                  placeholder="Search questions..."
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

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all font-medium text-sm shadow-md hover:shadow-lg"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Create Question</span>
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
                  {
                    [
                      searchTerm && "Search",
                      filterDifficulty !== "ALL" && "Difficulty",
                      filterType !== "ALL" && "Type",
                    ].filter(Boolean).length
                  }{" "}
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
                  xmlns="http://www.w3.org/2000/svg"
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Search */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Search
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Enter search term..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Question Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) =>
                    setFilterType(e.target.value as QuestionType | "ALL")
                  }
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                >
                  <option value="ALL">All Types</option>
                  <option value="mcq">MCQ</option>
                  <option value="coding">Coding</option>
                </select>
              </div>

              {/* Difficulty Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Difficulty
                </label>
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                >
                  <option value="ALL">All Levels</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
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
                    <QuestionMarkCircleIcon className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {questions.length}
                  </p>
                  <p className="text-sm font-medium text-gray-600">
                    Total Questions
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
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
                    <CheckCircleIcon className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {mcqQuestions.length}
                  </p>
                  <p className="text-sm font-medium text-gray-600">
                    MCQ Questions
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-blue-600 flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                  +8.2%
                </span>
                <span className="text-xs text-gray-500">from last month</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-violet-50 to-transparent rounded-bl-full opacity-50"></div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <CodeBracketIcon className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {codingQuestions.length}
                  </p>
                  <p className="text-sm font-medium text-gray-600">
                    Coding Questions
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-orange-600 flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                  +5.1%
                </span>
                <span className="text-xs text-gray-500">from last month</span>
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
                    <svg
                      className="w-7 h-7 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {filteredQuestions.length}
                  </p>
                  <p className="text-sm font-medium text-gray-600">
                    Filtered Results
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-amber-600 flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                  Active
                </span>
                <span className="text-xs text-gray-500">current view</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-100">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-blue-50/50">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {isEditMode ? "Edit Question" : "Create New Question"}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {isEditMode 
                    ? "Modify the question details below" 
                    : "Add a question to your assessment bank"
                  }
                </p>
              </div>
              <button
                onClick={() => {
                  setIsFormOpen(false);
                  resetForm();
                }}
                className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-xl transition-all duration-200 shadow-sm"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto px-8 py-6"
            >
              <div className="space-y-7">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-1">
                  <SelectDropDown
                    label="Question Type"
                    name="questionType"
                    options={questionTypeOptions}
                    value={questionType}
                    onChange={handleQuestionTypeChange}
                    required
                  />
                </div>

                {questionType === "mcq" ? (
                  <>
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                      <TextEditor
                        label="Question Title"
                        value={mcqFormData.title}
                        onChange={(content) =>
                          setMcqFormData((prev) => ({
                            ...prev,
                            title: content,
                          }))
                        }
                        placeholder="Enter your question here..."
                      />
                    </div>

                    <div className="flex items-center justify-between p-5 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 shadow-sm">
                      <label
                        htmlFor="multiSelect"
                        className="text-sm font-medium text-gray-700 cursor-pointer"
                      >
                        Allow multiple correct options
                      </label>
                      <ToggleSwitch
                        enabled={mcqFormData.multiSelect}
                        onChange={handleMultiSelectToggle}
                      />
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <label className="text-sm font-semibold text-gray-900">
                          Answer Options
                        </label>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {mcqFormData.multiSelect ? "Select all correct options" : "Select one correct option"}
                        </span>
                      </div>
                      <div className="space-y-4">
                        {mcqFormData.options.map((opt, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-4 group p-4 rounded-lg border border-gray-200 hover:border-[#465D96]/30 hover:bg-gray-50 transition-all duration-200"
                          >
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-sm font-bold text-gray-700 shadow-sm">
                              {String.fromCharCode(65 + index)}
                            </div>
                            <LabelInput
                              value={opt.text}
                              onChange={(e) =>
                                handleOptionChange(index, e.target.value)
                              }
                              placeholder={`Option ${index + 1}`}
                              required
                              className="flex-1"
                              name={""}
                            />
                            <div className="flex items-center">
                              <ToggleSwitch
                                enabled={opt.isCorrect}
                                onChange={handleOptionCorrectnessToggle(index)}
                                size="sm"
                              />
                            </div>
                            {mcqFormData.options.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveOption(index)}
                                className="p-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-sm"
                                title="Remove option"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleAddOption}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#465D96] bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-all duration-200"
                      >
                        <PlusIcon className="w-4 h-4" /> Add Another Option
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <LabelInput
                          label="Marks"
                          type="number"
                          name="marks"
                          value={mcqFormData.marks}
                          onChange={handleMcqInputChange}
                        />
                      </div>
                      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <SelectDropDown
                          label="Difficulty Level"
                          name="difficulty"
                          options={difficultyOptions}
                          value={mcqFormData.difficulty}
                          onChange={(name, value) =>
                            setMcqFormData((prev) => ({
                              ...prev,
                              difficulty: value as any,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                      <LabelInput
                        label="Question Title"
                        name="title"
                        value={codingFormData.title}
                        onChange={(e) =>
                          setCodingFormData((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                      <TextEditor
                        label="Problem Description"
                        value={codingFormData.description}
                        onChange={(content) =>
                          setCodingFormData((prev) => ({
                            ...prev,
                            description: content,
                          }))
                        }
                        placeholder="Describe the coding problem..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <LabelTextArea
                          label="Input Format"
                          name="inputFormat"
                          value={codingFormData.inputFormat}
                          onChange={(e) =>
                            setCodingFormData((prev) => ({
                              ...prev,
                              inputFormat: e.target.value,
                            }))
                          }
                          placeholder="e.g., First line contains N, followed by N integers"
                          rows={3}
                        />
                      </div>
                      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <LabelTextArea
                          label="Output Format"
                          name="outputFormat"
                          value={codingFormData.outputFormat}
                          onChange={(e) =>
                            setCodingFormData((prev) => ({
                              ...prev,
                              outputFormat: e.target.value,
                            }))
                          }
                          placeholder="e.g., Print the sorted integers separated by space"
                          rows={3}
                        />
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                      <LabelTextArea
                        label="Constraints"
                        name="constraints"
                        value={codingFormData.constraints}
                        onChange={(e) =>
                          setCodingFormData((prev) => ({
                            ...prev,
                            constraints: e.target.value,
                          }))
                        }
                        placeholder="e.g., 1 ≤ N ≤ 10^5, 1 ≤ arr[i] ≤ 10^9"
                        rows={3}
                      />
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <label className="text-sm font-semibold text-gray-900">
                          Test Cases
                        </label>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          At least one test case is required
                        </span>
                      </div>
                      <div className="space-y-4">
                        {codingFormData.testCases.map((tc, i) => (
                          <div
                            key={i}
                            className="border border-gray-200 rounded-lg overflow-hidden"
                          >
                            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                              <span className="text-sm font-medium text-gray-700">
                                Test Case {i + 1}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
                              <LabelInput
                                label="Input"
                                value={tc.input}
                                onChange={(e) =>
                                  handleTestCaseChange(i, "input", e.target.value)
                                }
                                required
                                name={""}
                              />
                              <LabelInput
                                label="Expected Output"
                                value={tc.output}
                                onChange={(e) =>
                                  handleTestCaseChange(
                                    i,
                                    "output",
                                    e.target.value,
                                  )
                                }
                                required
                                name={""}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleAddTestCase}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#465D96] bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-all duration-200"
                      >
                        <PlusIcon className="w-4 h-4" /> Add Test Case
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <LabelInput
                          label="Time Limit (seconds)"
                          type="number"
                          name="timeLimit"
                          value={codingFormData.timeLimit}
                          onChange={handleCodingInputChange}
                        />
                      </div>
                      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <LabelInput
                          label="Memory Limit (MB)"
                          type="number"
                          name="memoryLimit"
                          value={codingFormData.memoryLimit}
                          onChange={handleCodingInputChange}
                        />
                      </div>
                      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <LabelInput
                          label="Marks"
                          type="number"
                          name="marks"
                          value={codingFormData.marks}
                          onChange={handleCodingInputChange}
                        />
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                      <SelectDropDown
                        label="Difficulty Level"
                        name="difficulty"
                        options={difficultyOptions}
                        value={codingFormData.difficulty}
                        onChange={(name, value) =>
                          setCodingFormData((prev) => ({
                            ...prev,
                            difficulty: value as any,
                          }))
                        }
                      />
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                      <label className="block text-sm font-semibold text-gray-900 mb-4">
                        Allowed Languages
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {languageOptions.map((lang) => (
                          <label
                            key={lang.value}
                            className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={codingFormData.allowedLanguages.includes(lang.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setCodingFormData((prev) => ({
                                    ...prev,
                                    allowedLanguages: [...prev.allowedLanguages, lang.value],
                                  }));
                                } else {
                                  setCodingFormData((prev) => ({
                                    ...prev,
                                    allowedLanguages: prev.allowedLanguages.filter(
                                      (l) => l !== lang.value
                                    ),
                                  }));
                                }
                              }}
                              className="rounded text-[#465D96] focus:ring-[#465D96]"
                            />
                            <span className="text-sm text-gray-700">{lang.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </form>

            <div className="flex items-center justify-end gap-4 px-8 py-5 border-t border-gray-100 bg-gradient-to-r from-slate-50 to-blue-50/50">
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
                onClick={handleSubmit}
                className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#465D96] to-[#5a72b5] rounded-xl hover:from-[#465D96]/95 hover:to-[#5a72b5]/95 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {isEditMode ? "Update Question" : "Create Question"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Question Modal */}
      {isViewModalOpen && viewingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-100">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-blue-50/50">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Question Details
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Review question information
                </p>
              </div>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setViewingQuestion(null);
                }}
                className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-xl transition-all duration-200 shadow-sm"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-6">
              <div className="space-y-6">
                {/* Question Type and Info */}
                <div className="flex items-center gap-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border shadow-sm ${
                      viewingQuestion.type === "mcq"
                        ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-100"
                        : "bg-gradient-to-r from-violet-50 to-violet-100 text-violet-700 border-violet-100"
                    }`}
                  >
                    {viewingQuestion.type === "mcq" ? (
                      <CheckCircleIcon className="w-4 h-4" />
                    ) : (
                      <CodeBracketIcon className="w-4 h-4" />
                    )}
                    {viewingQuestion.type === "mcq" ? "MCQ Question" : "Coding Question"}
                  </span>
                  <DifficultyBadge difficulty={viewingQuestion.difficulty} />
                  <span className="inline-flex items-center px-3 py-2 rounded-lg bg-amber-50 text-amber-700 text-sm font-medium border border-amber-100">
                    <span className="font-bold">{viewingQuestion.marks}</span>{" "}
                    {viewingQuestion.marks === 1 ? "mark" : "marks"}
                  </span>
                </div>

                {/* Question Title */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                    Question Title
                  </h4>
                  <div className="text-gray-900">
                    {viewingQuestion.type === "mcq" ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: (viewingQuestion as MCQQuestion).title,
                        }}
                      />
                    ) : (
                      (viewingQuestion as CodingQuestion).title
                    )}
                  </div>
                </div>

                {/* Question Details based on type */}
                {viewingQuestion.type === "mcq" ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                      Answer Options
                    </h4>
                    <div className="space-y-3">
                      {(viewingQuestion as MCQQuestion).options.map((opt, i) => (
                        <div
                          key={i}
                          className={`flex items-center gap-3 p-4 rounded-lg border transition-all duration-200 ${
                            opt.isCorrect
                              ? "bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200 shadow-sm"
                              : "bg-white border-gray-200"
                          }`}
                        >
                          <span
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
                              opt.isCorrect
                                ? "bg-gradient-to-br from-emerald-200 to-emerald-300 text-emerald-800"
                                : "bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700"
                            }`}
                          >
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span
                            className={`flex-1 text-sm leading-relaxed ${
                              opt.isCorrect
                                ? "text-emerald-900 font-semibold"
                                : "text-gray-700"
                            }`}
                          >
                            {opt.text}
                          </span>
                          {opt.isCorrect && (
                            <CheckCircleIcon className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                    {(viewingQuestion as MCQQuestion).multiSelect && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-700">
                          <strong>Note:</strong> This question allows multiple correct answers.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                        Problem Description
                      </h4>
                      <div
                        className="text-gray-900 leading-relaxed prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: (viewingQuestion as CodingQuestion).description,
                        }}
                      />
                    </div>

                    {(viewingQuestion as CodingQuestion).inputFormat && (
                      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                          Input Format
                        </h4>
                        <p className="text-gray-700">
                          {(viewingQuestion as CodingQuestion).inputFormat}
                        </p>
                      </div>
                    )}

                    {(viewingQuestion as CodingQuestion).outputFormat && (
                      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                          Output Format
                        </h4>
                        <p className="text-gray-700">
                          {(viewingQuestion as CodingQuestion).outputFormat}
                        </p>
                      </div>
                    )}

                    {(viewingQuestion as CodingQuestion).constraints && (
                      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                          Constraints
                        </h4>
                        <p className="text-gray-700">
                          {(viewingQuestion as CodingQuestion).constraints}
                        </p>
                      </div>
                    )}

                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                        Test Cases
                      </h4>
                      <div className="space-y-4">
                        {(viewingQuestion as CodingQuestion).testCases.map((tc, i) => (
                          <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                              <span className="text-sm font-medium text-gray-700">
                                Test Case {i + 1}
                                {tc.isHidden && (
                                  <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                                    Hidden
                                  </span>
                                )}
                              </span>
                            </div>
                            <div className="p-4 space-y-3">
                              <div>
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                  Input
                                </span>
                                <pre className="mt-1 p-3 bg-gray-50 rounded text-sm text-gray-800 overflow-x-auto">
                                  {tc.input}
                                </pre>
                              </div>
                              <div>
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                  Expected Output
                                </span>
                                <pre className="mt-1 p-3 bg-gray-50 rounded text-sm text-gray-800 overflow-x-auto">
                                  {tc.output}
                                </pre>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                          Time Limit
                        </h4>
                        <p className="text-gray-700">
                          {(viewingQuestion as CodingQuestion).timeLimit || 2} seconds
                        </p>
                      </div>
                      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                          Memory Limit
                        </h4>
                        <p className="text-gray-700">
                          {(viewingQuestion as CodingQuestion).memoryLimit || 256} MB
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                        Allowed Languages
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(viewingQuestion as CodingQuestion).allowedLanguages.map((lang) => (
                          <span
                            key={lang}
                            className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-indigo-100 text-indigo-800 border border-indigo-200"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 px-8 py-5 border-t border-gray-100 bg-gradient-to-r from-slate-50 to-blue-50/50">
              <button
                onClick={() => handleEdit(viewingQuestion)}
                className="px-6 py-3 text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-all duration-200 shadow-sm"
              >
                Edit Question
              </button>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setViewingQuestion(null);
                }}
                className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Questions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedQuestions.map((q, idx) => (
          <div
            key={q._id}
            className="bg-white rounded-2xl border border-gray-200/60 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
          >
            <div className="p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-xl text-sm font-bold shadow-sm ${
                      q.type === "mcq"
                        ? "bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700"
                        : "bg-gradient-to-br from-violet-100 to-violet-200 text-violet-700"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border shadow-sm ${
                      q.type === "mcq"
                        ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-100"
                        : "bg-gradient-to-r from-violet-50 to-violet-100 text-violet-700 border-violet-100"
                    }`}
                  >
                    {q.type === "mcq" ? (
                      <CheckCircleIcon className="w-3.5 h-3.5" />
                    ) : (
                      <CodeBracketIcon className="w-3.5 h-3.5" />
                    )}
                    {q.type === "mcq" ? "MCQ" : "Coding"}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleView(q)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 flex-shrink-0"
                    title="View question details"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(q)}
                    className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-200 flex-shrink-0"
                    title="Edit question"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(q._id)}
                    className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-200 flex-shrink-0"
                    title="Delete question"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                {q.type === "mcq" ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: (q as MCQQuestion).title,
                    }}
                  />
                ) : (
                  (q as CodingQuestion).title
                )}
              </h3>

              <div className="flex items-center gap-2 mb-4">
                <DifficultyBadge difficulty={q.difficulty} />
                <span className="inline-flex items-center px-2 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-medium border border-amber-100">
                  <span className="font-bold">{q.marks}</span>{" "}
                  {q.marks === 1 ? "mark" : "marks"}
                </span>
              </div>

            </div>
          </div>
        ))}

        {filteredQuestions.length === 0 && (
          <div className="col-span-full bg-gradient-to-br from-white to-blue-50/30 border-2 border-dashed border-blue-200 rounded-3xl p-16 text-center shadow-sm">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                <QuestionMarkCircleIcon className="w-10 h-10 text-[#465D96]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No questions found
              </h3>
              <p className="text-base text-gray-600 leading-relaxed mb-8 max-w-sm mx-auto">
                {questions.length === 0
                  ? "Get started by creating your first question for the assessment bank."
                  : "Try adjusting your filters to find what you're looking for."}
              </p>
              {questions.length === 0 && (
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#465D96] to-[#5a72b5] text-white text-sm font-semibold rounded-xl hover:from-[#465D96]/95 hover:to-[#5a72b5]/95 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  <PlusIcon className="w-5 h-5" />
                  Create Your First Question
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
                    ? "bg-[#465D96] text-white"
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
    </div>
  );
};

export default Question;
