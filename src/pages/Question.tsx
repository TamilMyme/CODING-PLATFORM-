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
  PencilIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  DocumentArrowDownIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import {
  QuestionMarkCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
import LabelInput from "../components/UI/LabelInput";
import LabelTextArea from "../components/UI/LabelTextArea";
import SelectDropDown from "../components/UI/SelectDropDown";
import QuestionApis from "../apis/QuestionApis";
import TextEditor from "../components/UI/TextEdiotor";
import ToggleSwitch from "../components/UI/ToggleSwitch";
import { MdClose } from "react-icons/md";
import CourseApis from "../apis/CourseApis";
import type { ICourse } from "../types/interfaces";
import { useAuth } from "../context/AuthProvider";

// ===== TYPES =====
type QuestionType = "single_choice_mcq" | "multi_choice_mcq" | "coding";
type DifficultyLevel = "easy" | "medium" | "hard";

interface MCQOption {
  text: string;
  isCorrect: boolean;
}

interface CodingTestCase {
  input: string;
  output: string;
  isHidden: boolean;
  explanation?: string;
}

interface CodeStub {
  language: string;
  code: string;
  functionName?: string;
  className?: string;
}

interface ProblemExample {
  id: number;
  input: string;
  output: string;
  explanation?: string;
}

interface ProblemHint {
  id: number;
  hint: string;
}

interface CompanyTag {
  name: string;
  frequency: number;
}

interface SimilarProblem {
  problemId: string;
  title: string;
  difficulty: DifficultyLevel;
}

interface BaseQuestion {
  _id: string;
  title: string;
  problemNumber?: number;
  problemSlug?: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  marks: number;
  course: string;
  createdAt: string;
  updatedAt: string;
  // LeetCode-style fields
  description: string;
  examples?: ProblemExample[];
  constraints?: string[];
  followUp?: string;
  topics?: string[];
  companies?: CompanyTag[];
  hints?: ProblemHint[];
  editorial?: string;
  similarProblems?: SimilarProblem[];
  acceptanceRate?: number;
  submissionsCount?: number;
  acceptedCount?: number;
  discussionCount?: number;
  isPremium?: boolean;
  isLocked?: boolean;
}

interface MCQQuestion extends BaseQuestion {
  type: "single_choice_mcq" | "multi_choice_mcq";
  options: MCQOption[];
  correctOption: number[];
}

interface CodingQuestion extends BaseQuestion {
  type: "coding";
  inputFormat?: string;
  outputFormat?: string;
  testCases: CodingTestCase[];
  codeStubs?: CodeStub[];
  allowedLanguages: string[];
  timeLimit?: number;
  memoryLimit?: number;
}

type Question = MCQQuestion | CodingQuestion;

// ===== COMPONENT =====
const Question: React.FC = () => {
  // ===== STATE =====
  const {user} = useAuth()
  const [questions, setQuestions] = useState<Question[]>([]);
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingQuestion, setViewingQuestion] = useState<Question | null>(null);
  const [questionType, setQuestionType] = useState<QuestionType>("single_choice_mcq");
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("ALL");
  const [filterType, setFilterType] = useState<QuestionType | "ALL">("ALL");
  const [filterCourse, setFilterCourse] = useState<string>("ALL");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // MCQ Form State
  const [mcqFormData, setMcqFormData] = useState({
    title: "",
    course: "",
    options: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }],
    correctOption: [] as number[],
    difficulty: "easy" as DifficultyLevel,
    marks: 1,
  });

  // Coding Form State
  const [codingFormData, setCodingFormData] = useState({
    title: "",
    problemNumber: undefined as number | undefined,
    problemSlug: "",
    course: "",
    description: "",
    examples: [] as ProblemExample[],
    constraints: [] as string[],
    followUp: "",
    topics: [] as string[],
    companies: [] as CompanyTag[],
    hints: [] as ProblemHint[],
    editorial: "",
    testCases: [{ input: "", output: "", isHidden: true }],
    codeStubs: [] as CodeStub[],
    allowedLanguages: ["python"],
    inputFormat: "",
    outputFormat: "",
    timeLimit: 2,
    memoryLimit: 256,
    difficulty: "easy" as DifficultyLevel,
    marks: 1,
    isPremium: false,
    isLocked: false,
  });

  // ===== OPTIONS =====
  const questionTypeOptions = [
    { value: "single_choice_mcq", label: "Single Choice MCQ", icon: CheckCircleIcon },
    { value: "multi_choice_mcq", label: "Multi Choice MCQ", icon: CheckCircleIcon },
    { value: "coding", label: "Coding Question", icon: CodeBracketIcon },
  ];

  const languageOptions = [
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "c", label: "C" },
    { value: "cpp", label: "C++" },
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
  ];

  const difficultyOptions = [
    { value: "easy", label: "Easy", color: "emerald" },
    { value: "medium", label: "Medium", color: "amber" },
    { value: "hard", label: "Hard", color: "rose" },
  ];

  const topicOptions = [
    "Array", "String", "Hash Table", "Linked List", "Tree", "Graph",
    "Dynamic Programming", "Backtracking", "Greedy", "Binary Search",
    "Sorting", "Recursion", "Math", "Bit Manipulation", "Stack",
    "Queue", "Heap", "Trie", "Divide and Conquer", "Breadth-First Search",
    "Depth-First Search", "Binary Tree", "Binary Search Tree", "Matrix",
    "Two Pointers", "Sliding Window", "Prefix Sum", "Union Find",
    "Topological Sort", "Segment Tree", "Binary Indexed Tree",
    "Geometry", "Randomized", "Rejection Sampling", "Reservoir Sampling",
    "Design", "Data Stream", "Ordered Set", "Brainteaser", "Memoization"
  ];

  // ===== EFFECTS =====
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [questionsData, coursesData] = await Promise.all([
          QuestionApis.getAllQuestions(),
          CourseApis.getAll(),
        ]);
        setQuestions(questionsData.data.questions || []);
        setCourses(Array.isArray(coursesData) ? coursesData : []);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    fetchData();
  }, []);

  // ===== HANDLERS =====
  const handleQuestionTypeChange = (_name: string, value: string) => {
    setQuestionType(value as QuestionType);
    setErrors({});
    
    if (!isEditMode) {
      setMcqFormData({
        title: "",
        course: "",
        options: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }],
        correctOption: [],
        difficulty: "easy" as DifficultyLevel,
        marks: 1,
      });
      setCodingFormData({
        title: "",
        problemNumber: undefined,
        problemSlug: "",
        course: "",
        description: "",
        examples: [],
        constraints: [],
        followUp: "",
        topics: [],
        companies: [],
        hints: [],
        editorial: "",
        testCases: [{ input: "", output: "", isHidden: true }],
        codeStubs: [],
        allowedLanguages: ["python"],
        inputFormat: "",
        outputFormat: "",
        timeLimit: 2,
        memoryLimit: 256,
        difficulty: "easy" as DifficultyLevel,
        marks: 1,
        isPremium: false,
        isLocked: false,
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (questionType === "single_choice_mcq" || questionType === "multi_choice_mcq") {
      if (!mcqFormData.title || !mcqFormData.title.trim()) {
        newErrors.title = "Question title is required";
      }
      if (!mcqFormData.course) {
        newErrors.course = "Course selection is required";
      }
      if (mcqFormData.options.length < 2) {
        newErrors.options = "At least 2 options are required";
      }
      if (mcqFormData.correctOption.length === 0) {
        newErrors.correctOption = "At least one correct option must be selected";
      }
      if (mcqFormData.options.some(opt => !opt.text.trim())) {
        newErrors.optionText = "All options must have text";
      }
    } else {
      if (!codingFormData.title || !codingFormData.title.trim()) {
        newErrors.title = "Question title is required";
      }
      if (!codingFormData.course) {
        newErrors.course = "Course selection is required";
      }
      if (!codingFormData.description || !codingFormData.description.trim()) {
        newErrors.description = "Problem description is required";
      }
      if (codingFormData.testCases.length === 0 || codingFormData.testCases.some(tc => !tc.input.trim() || !tc.output.trim())) {
        newErrors.testCases = "At least one valid test case is required";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // MCQ Handlers
  const handleMcqInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMcqFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

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
    if (errors.optionText) {
      setErrors((prev) => ({ ...prev, optionText: "" }));
    }
  };

  const handleRemoveOption = (index: number) => {
    setMcqFormData((prev) => {
      const newOptions = prev.options.filter((_, i) => i !== index);
      const newCorrectOption = prev.correctOption
        .filter(i => i !== index)
        .map(i => i > index ? i - 1 : i);
      
      // Update isCorrect flags
      newOptions.forEach((opt, i) => {
        opt.isCorrect = newCorrectOption.includes(i);
      });
      
      return { ...prev, options: newOptions, correctOption: newCorrectOption };
    });
  };

  const handleCorrectOptionChange = (index: number) => {
    setMcqFormData((prev) => {
      let newCorrectOption: number[];
      
      if (questionType === "single_choice_mcq") {
        newCorrectOption = [index];
      } else {
        newCorrectOption = prev.correctOption.includes(index)
          ? prev.correctOption.filter((i) => i !== index)
          : [...prev.correctOption, index];
      }

      const newOptions = prev.options.map((opt, i) => ({
        ...opt,
        isCorrect: newCorrectOption.includes(i),
      }));

      return { ...prev, correctOption: newCorrectOption, options: newOptions };
    });
    if (errors.correctOption) {
      setErrors((prev) => ({ ...prev, correctOption: "" }));
    }
  };

  // Coding Handlers
  const handleCodingInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCodingFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Example Handlers
  const handleExampleChange = (index: number, field: "input" | "output" | "explanation", value: string) => {
    setCodingFormData((prev) => {
      const newExamples = [...prev.examples];
      newExamples[index][field] = value;
      return { ...prev, examples: newExamples };
    });
  };

  const handleAddExample = () => {
    setCodingFormData((prev) => ({
      ...prev,
      examples: [...prev.examples, { id: prev.examples.length + 1, input: "", output: "", explanation: "" }],
    }));
  };

  const handleRemoveExample = (index: number) => {
    setCodingFormData((prev) => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index),
    }));
  };

  // Constraint Handlers
  const handleConstraintChange = (index: number, value: string) => {
    setCodingFormData((prev) => {
      const newConstraints = [...prev.constraints];
      newConstraints[index] = value;
      return { ...prev, constraints: newConstraints };
    });
  };

  const handleAddConstraint = () => {
    setCodingFormData((prev) => ({
      ...prev,
      constraints: [...prev.constraints, ""],
    }));
  };

  const handleRemoveConstraint = (index: number) => {
    setCodingFormData((prev) => ({
      ...prev,
      constraints: prev.constraints.filter((_, i) => i !== index),
    }));
  };

  // Topic Handlers
  const handleTopicToggle = (topic: string) => {
    setCodingFormData((prev) => {
      const newTopics = prev.topics.includes(topic)
        ? prev.topics.filter((t) => t !== topic)
        : [...prev.topics, topic];
      return { ...prev, topics: newTopics };
    });
  };

  // Company Handlers
  const handleCompanyChange = (index: number, field: "name" | "frequency", value: string | number) => {
    setCodingFormData((prev) => {
      const newCompanies = [...prev.companies];
      newCompanies[index][field] = value as never;
      return { ...prev, companies: newCompanies };
    });
  };

  const handleAddCompany = () => {
    setCodingFormData((prev) => ({
      ...prev,
      companies: [...prev.companies, { name: "", frequency: 1 }],
    }));
  };

  const handleRemoveCompany = (index: number) => {
    setCodingFormData((prev) => ({
      ...prev,
      companies: prev.companies.filter((_, i) => i !== index),
    }));
  };

  // Hint Handlers
  const handleHintChange = (index: number, value: string) => {
    setCodingFormData((prev) => {
      const newHints = [...prev.hints];
      newHints[index].hint = value;
      return { ...prev, hints: newHints };
    });
  };

  const handleAddHint = () => {
    setCodingFormData((prev) => ({
      ...prev,
      hints: [...prev.hints, { id: prev.hints.length + 1, hint: "" }],
    }));
  };

  const handleRemoveHint = (index: number) => {
    setCodingFormData((prev) => ({
      ...prev,
      hints: prev.hints.filter((_, i) => i !== index),
    }));
  };

  const handleTestCaseChange = (index: number, field: "input" | "output", value: string) => {
    setCodingFormData((prev) => {
      const newTestCases = [...prev.testCases];
      newTestCases[index][field] = value;
      return { ...prev, testCases: newTestCases };
    });
    if (errors.testCases) {
      setErrors((prev) => ({ ...prev, testCases: "" }));
    }
  };

  const handleAddTestCase = () => {
    setCodingFormData((prev) => ({
      ...prev,
      testCases: [...prev.testCases, { input: "", output: "", isHidden: true }],
    }));
  };

  const handleRemoveTestCase = (index: number) => {
    setCodingFormData((prev) => ({
      ...prev,
      testCases: prev.testCases.filter((_, i) => i !== index),
    }));
  };

  const handleCodeStubChange = (index: number, field: "language" | "code", value: string) => {
    setCodingFormData((prev) => {
      const newStubs = [...prev.codeStubs];
      newStubs[index][field] = value;
      return { ...prev, codeStubs: newStubs };
    });
  };

  const handleAddCodeStub = () => {
    setCodingFormData((prev) => ({
      ...prev,
      codeStubs: [...prev.codeStubs, { language: "python", code: "" }],
    }));
  };

  const handleRemoveCodeStub = (index: number) => {
    setCodingFormData((prev) => ({
      ...prev,
      codeStubs: prev.codeStubs.filter((_, i) => i !== index),
    }));
  };

  const handleLanguageToggle = (lang: string) => {
    setCodingFormData((prev) => {
      const newLanguages = prev.allowedLanguages.includes(lang)
        ? prev.allowedLanguages.filter((l) => l !== lang)
        : [...prev.allowedLanguages, lang];
      return { ...prev, allowedLanguages: newLanguages };
    });
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    
    try {
      let questionData: any = null;

      if (questionType === "single_choice_mcq" || questionType === "multi_choice_mcq") {
        questionData = {
          type: questionType,
          title: mcqFormData.title,
          course: mcqFormData.course,
          options: mcqFormData.options,
          correctOption: mcqFormData.correctOption,
          difficulty: mcqFormData.difficulty,
          marks: mcqFormData.marks,
          description: mcqFormData.title, // MCQ uses title as description
          createdBy : user?._id!
        };
      } else {
        questionData = {
          type: "coding",
          title: codingFormData.title,
          problemNumber: codingFormData.problemNumber,
          problemSlug: codingFormData.problemSlug,
          course: codingFormData.course,
          description: codingFormData.description,
          examples: codingFormData.examples,
          constraints: codingFormData.constraints,
          followUp: codingFormData.followUp,
          topics: codingFormData.topics,
          companies: codingFormData.companies,
          hints: codingFormData.hints,
          editorial: codingFormData.editorial,
          testCases: codingFormData.testCases,
          codeStubs: codingFormData.codeStubs,
          allowedLanguages: codingFormData.allowedLanguages,
          inputFormat: codingFormData.inputFormat,
          outputFormat: codingFormData.outputFormat,
          timeLimit: codingFormData.timeLimit,
          memoryLimit: codingFormData.memoryLimit,
          difficulty: codingFormData.difficulty,
          marks: codingFormData.marks,
          isPremium: codingFormData.isPremium,
          isLocked: codingFormData.isLocked,
          createdBy : user?._id!
        };
      }

      if (isEditMode && editingQuestionId) {
        const updated = await QuestionApis.updateQuestion(editingQuestionId, questionData);
        setQuestions((prev) =>
          prev.map((q) => (q._id === editingQuestionId ? updated.data : q))
        );
      } else {
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
      await QuestionApis.deleteQuestion(id);
      setQuestions((prev) => prev.filter((q) => q._id !== id));
    } catch (err) {
      console.error("Failed to delete question:", err);
    }
  };

  const handleEdit = (question: Question) => {
    setIsEditMode(true);
    setEditingQuestionId(question._id);
    setQuestionType(question.type);
    setErrors({});
    
    if (question.type === "single_choice_mcq" || question.type === "multi_choice_mcq") {
      const mcqQuestion = question as MCQQuestion;
      setMcqFormData({
        title: mcqQuestion.title,
        course: mcqQuestion.course,
        options: mcqQuestion.options,
        correctOption: mcqQuestion.correctOption,
        difficulty: mcqQuestion.difficulty,
        marks: mcqQuestion.marks,
      });
    } else {
      const codingQuestion = question as CodingQuestion;
      setCodingFormData({
        title: codingQuestion.title,
        problemNumber: codingQuestion.problemNumber,
        problemSlug: codingQuestion.problemSlug || "",
        course: codingQuestion.course,
        description: codingQuestion.description,
        examples: codingQuestion.examples || [],
        constraints: codingQuestion.constraints || [],
        followUp: codingQuestion.followUp || "",
        topics: codingQuestion.topics || [],
        companies: codingQuestion.companies || [],
        hints: codingQuestion.hints || [],
        editorial: codingQuestion.editorial || "",
        testCases: codingQuestion.testCases.map(tc => ({
          input: tc.input,
          output: tc.output,
          isHidden: tc.isHidden ?? true
        })),
        codeStubs: codingQuestion.codeStubs || [],
        allowedLanguages: codingQuestion.allowedLanguages,
        inputFormat: codingQuestion.inputFormat || "",
        outputFormat: codingQuestion.outputFormat || "",
        timeLimit: codingQuestion.timeLimit || 2,
        memoryLimit: codingQuestion.memoryLimit || 256,
        difficulty: codingQuestion.difficulty,
        marks: codingQuestion.marks,
        isPremium: codingQuestion.isPremium || false,
        isLocked: codingQuestion.isLocked || false,
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
    setQuestionType("single_choice_mcq");
    setErrors({});
    setMcqFormData({
      title: "",
      course: "",
      options: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }],
      correctOption: [],
      difficulty: "easy" as DifficultyLevel,
      marks: 1,
    });
    setCodingFormData({
      title: "",
      problemNumber: undefined,
      problemSlug: "",
      course: "",
      description: "",
      examples: [],
      constraints: [],
      followUp: "",
      topics: [],
      companies: [],
      hints: [],
      editorial: "",
      testCases: [{ input: "", output: "", isHidden: true }],
      codeStubs: [],
      allowedLanguages: ["python"],
      inputFormat: "",
      outputFormat: "",
      timeLimit: 2,
      memoryLimit: 256,
      difficulty: "easy" as DifficultyLevel,
      marks: 1,
      isPremium: false,
      isLocked: false,
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
    setFilterCourse("ALL");
    setShowFilters(false);
  };

  // ===== FILTERING =====
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

  if (filterCourse !== "ALL") {
    filteredQuestions = filteredQuestions.filter(
      (question) => question.course === filterCourse,
    );
  }

  const mcqQuestions = filteredQuestions.filter(
    (q) => q.type === "single_choice_mcq" || q.type === "multi_choice_mcq",
  ) as MCQQuestion[];
  const codingQuestions = filteredQuestions.filter(
    (q) => q.type === "coding",
  ) as CodingQuestion[];

  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // ===== COMPONENTS =====
  const DifficultyBadge = ({ difficulty }: { difficulty?: DifficultyLevel }) => {
    const colors = {
      easy: "bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200",
      medium: "bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-200",
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

  const QuestionTypeBadge = ({ type }: { type: QuestionType }) => {
    const config = {
      single_choice_mcq: {
        label: "Single Choice",
        icon: CheckCircleIcon,
        colors: "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200",
      },
      multi_choice_mcq: {
        label: "Multi Choice",
        icon: CheckCircleIcon,
        colors: "bg-gradient-to-r from-violet-50 to-violet-100 text-violet-700 border-violet-200",
      },
      coding: {
        label: "Coding",
        icon: CodeBracketIcon,
        colors: "bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 border-indigo-200",
      },
    };
    const { label, icon: Icon, colors } = config[type];
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border shadow-sm ${colors}`}>
        <Icon className="w-3.5 h-3.5" />
        {label}
      </span>
    );
  };

  const QuestionTypeSelector = () => (
    <div className="grid grid-cols-3 gap-3">
      {questionTypeOptions.map((option) => {
        const Icon = option.icon;
        const isSelected = questionType === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleQuestionTypeChange("questionType", option.value)}
            className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
              isSelected
                ? "border-indigo-600 bg-gradient-to-br from-indigo-50 to-indigo-100 shadow-md"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              isSelected
                ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-600"
            }`}>
              <Icon className="w-6 h-6" />
            </div>
            <span className={`text-sm font-medium ${
              isSelected ? "text-indigo-600" : "text-gray-700"
            }`}>
              {option.label}
            </span>
            {isSelected && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="w-3 h-3 text-white" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );

  const CodeEditor = ({ value, onChange, language }: { value: string; onChange: (value: string) => void; language: string }) => (
    <div className="relative">
      <div className="absolute top-0 left-0 px-3 py-2 bg-gray-800 text-gray-300 text-xs font-mono rounded-t-lg">
        {language}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Write your ${language} code stub here...`}
        className="w-full h-48 mt-6 px-4 py-3 bg-gray-900 text-gray-100 font-mono text-sm rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
        spellCheck={false}
      />
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="mb-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="text-white">
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <SparklesIcon className="w-8 h-8" />
                Question Bank
              </h1>
              <p className="text-indigo-100 mt-1 text-sm md:text-base">
                Create and manage assessment questions for your courses
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
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
              <span>Create Question</span>
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
                    searchTerm && "Search",
                    filterDifficulty !== "ALL" && "Difficulty",
                    filterType !== "ALL" && "Type",
                    filterCourse !== "ALL" && "Course",
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Question Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as QuestionType | "ALL")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                >
                  <option value="ALL">All Types</option>
                  <option value="single_choice_mcq">Single Choice MCQ</option>
                  <option value="multi_choice_mcq">Multi Choice MCQ</option>
                  <option value="coding">Coding</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Difficulty</label>
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

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Course</label>
                <select
                  value={filterCourse}
                  onChange={(e) => setFilterCourse(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                >
                  <option value="ALL">All Courses</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Sort By</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as QuestionType | "ALL")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                >
                  <option value="title">Title</option>
                  <option value="difficulty">Difficulty</option>
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
                    <QuestionMarkCircleIcon className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{questions.length}</p>
                  <p className="text-sm font-medium text-gray-600">Total Questions</p>
                </div>
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
                    <CheckCircleIcon className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{mcqQuestions.length}</p>
                  <p className="text-sm font-medium text-gray-600">MCQ Questions</p>
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
                    <CodeBracketIcon className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{codingQuestions.length}</p>
                  <p className="text-sm font-medium text-gray-600">Coding Questions</p>
                </div>
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
                    <BookOpenIcon className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{courses.length}</p>
                  <p className="text-sm font-medium text-gray-600">Courses</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Question Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-100">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-purple-600">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {isEditMode ? "Edit Question" : "Create New Question"}
                </h3>
                <p className="text-sm text-indigo-100 mt-1">
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
                {/* Question Type Selector */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-4">
                    Select Question Type
                  </label>
                  <QuestionTypeSelector />
                </div>

                {/* Common Fields */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <LabelInput
                      label="Course"
                      name="course"
                      value={questionType === "coding" ? codingFormData.course : mcqFormData.course}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (questionType === "coding") {
                          setCodingFormData(prev => ({ ...prev, course: value }));
                        } else {
                          setMcqFormData(prev => ({ ...prev, course: value }));
                        }
                        if (errors.course) setErrors(prev => ({ ...prev, course: "" }));
                      }}
                      required
                      select
                      options={[
                        { value: "", label: "Select a course" },
                        ...courses.map(c => ({ value: c._id, label: c.title })),
                      ]}
                    />
                    {errors.course && (
                      <p className="mt-1 text-sm text-rose-600">{errors.course}</p>
                    )}
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <LabelInput
                      label="Marks"
                      type="number"
                      name="marks"
                      value={questionType === "coding" ? codingFormData.marks : mcqFormData.marks}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        if (questionType === "coding") {
                          setCodingFormData(prev => ({ ...prev, marks: value }));
                        } else {
                          setMcqFormData(prev => ({ ...prev, marks: value }));
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <TextEditor
                    label="Question Title"
                    value={questionType === "coding" ? codingFormData.title : mcqFormData.title}
                    onChange={(content) => {
                      if (questionType === "coding") {
                        setCodingFormData(prev => ({ ...prev, title: content }));
                      } else {
                        setMcqFormData(prev => ({ ...prev, title: content }));
                      }
                      if (errors.title) setErrors(prev => ({ ...prev, title: "" }));
                    }}
                    placeholder="Enter your question here..."
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-rose-600">{errors.title}</p>
                  )}
                </div>

                {/* Type-Specific Fields */}
                {questionType === "single_choice_mcq" || questionType === "multi_choice_mcq" ? (
                  <>
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <label className="text-sm font-semibold text-gray-900">
                          Answer Options
                        </label>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {questionType === "single_choice_mcq" 
                            ? "Select one correct option" 
                            : "Select all correct options"}
                        </span>
                      </div>
                      <div className="space-y-4">
                        {mcqFormData.options.map((opt, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-4 group p-4 rounded-lg border border-gray-200 hover:border-indigo-500/30 hover:bg-gray-50 transition-all duration-200"
                          >
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-sm font-bold text-gray-700 shadow-sm">
                              {String.fromCharCode(65 + index)}
                            </div>
                            <LabelInput
                              value={opt.text}
                              onChange={(e) => handleOptionChange(index, e.target.value)}
                              placeholder={`Option ${index + 1}`}
                              required
                              className="flex-1"
                              name=""
                            />
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleCorrectOptionChange(index)}
                                className={`p-2 rounded-lg transition-all ${
                                  opt.isCorrect
                                    ? "bg-emerald-100 text-emerald-600"
                                    : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                }`}
                                title={opt.isCorrect ? "Mark as incorrect" : "Mark as correct"}
                              >
                                <CheckCircleIcon className="w-5 h-5" />
                              </button>
                              {mcqFormData.options.length > 2 && (
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
                          </div>
                        ))}
                      </div>
                      {errors.options && (
                        <p className="mt-2 text-sm text-rose-600">{errors.options}</p>
                      )}
                      {errors.correctOption && (
                        <p className="mt-2 text-sm text-rose-600">{errors.correctOption}</p>
                      )}
                      {errors.optionText && (
                        <p className="mt-2 text-sm text-rose-600">{errors.optionText}</p>
                      )}
                      <button
                        type="button"
                        onClick={handleAddOption}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-all duration-200"
                      >
                        <PlusIcon className="w-4 h-4" /> Add Another Option
                      </button>
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
                            difficulty: value as DifficultyLevel,
                          }))
                        }
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <LabelInput
                          label="Problem Number (Optional)"
                          type="number"
                          name="problemNumber"
                          value={codingFormData.problemNumber || ""}
                          onChange={handleCodingInputChange}
                          placeholder="e.g., 1"
                        />
                      </div>
                      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <LabelInput
                          label="Problem Slug (Optional)"
                          name="problemSlug"
                          value={codingFormData.problemSlug}
                          onChange={handleCodingInputChange}
                          placeholder="e.g., two-sum"
                        />
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                      <TextEditor
                        label="Problem Description"
                        value={codingFormData.description}
                        onChange={(content) => {
                          setCodingFormData(prev => ({ ...prev, description: content }));
                          if (errors.description) setErrors(prev => ({ ...prev, description: "" }));
                        }}
                        placeholder="Describe the coding problem..."
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-rose-600">{errors.description}</p>
                      )}
                    </div>

                    {/* Examples Section */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <label className="text-sm font-semibold text-gray-900">
                          Examples
                        </label>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          Add examples to illustrate the problem
                        </span>
                      </div>
                      <div className="space-y-4">
                        {codingFormData.examples.map((example, i) => (
                          <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">
                                Example {i + 1}
                              </span>
                              {codingFormData.examples.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveExample(i)}
                                  className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                                  title="Remove example"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            <div className="p-4 space-y-3">
                              <div>
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                  Input
                                </span>
                                <LabelInput
                                  value={example.input}
                                  onChange={(e) => handleExampleChange(i, "input", e.target.value)}
                                  placeholder="e.g., nums = [2,7,11,15], target = 9"
                                  name=""
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                  Output
                                </span>
                                <LabelInput
                                  value={example.output}
                                  onChange={(e) => handleExampleChange(i, "output", e.target.value)}
                                  placeholder="e.g., [0,1]"
                                  name=""
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                  Explanation (Optional)
                                </span>
                                <LabelTextArea
                                  value={example.explanation || ""}
                                  onChange={(e) => handleExampleChange(i, "explanation", e.target.value)}
                                  placeholder="Explain the example..."
                                  rows={2}
                                  name=""
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleAddExample}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-all duration-200"
                      >
                        <PlusIcon className="w-4 h-4" /> Add Example
                      </button>
                    </div>

                    {/* Constraints Section */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <label className="text-sm font-semibold text-gray-900">
                          Constraints
                        </label>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          Add constraints for the problem
                        </span>
                      </div>
                      <div className="space-y-3">
                        {codingFormData.constraints.map((constraint, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className="text-sm text-gray-500">{i + 1}.</span>
                            <LabelInput
                              value={constraint}
                              onChange={(e) => handleConstraintChange(i, e.target.value)}
                              placeholder="e.g., 1 <= nums.length <= 10^4"
                              name=""
                              className="flex-1"
                            />
                            {codingFormData.constraints.length > 0 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveConstraint(i)}
                                className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                                title="Remove constraint"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleAddConstraint}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-all duration-200"
                      >
                        <PlusIcon className="w-4 h-4" /> Add Constraint
                      </button>
                    </div>

                    {/* Topics Section */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                      <label className="block text-sm font-semibold text-gray-900 mb-4">
                        Topics / Tags
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {topicOptions.map((topic) => (
                          <label
                            key={topic}
                            className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-colors text-xs ${
                              codingFormData.topics.includes(topic)
                                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                                : "border-gray-200 hover:bg-gray-50 text-gray-700"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={codingFormData.topics.includes(topic)}
                              onChange={() => handleTopicToggle(topic)}
                              className="rounded text-indigo-600 focus:ring-indigo-600"
                            />
                            <span className="truncate">{topic}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Companies Section */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <label className="text-sm font-semibold text-gray-900">
                          Companies
                        </label>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          Companies that ask this question
                        </span>
                      </div>
                      <div className="space-y-3">
                        {codingFormData.companies.map((company, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <LabelInput
                              value={company.name}
                              onChange={(e) => handleCompanyChange(i, "name", e.target.value)}
                              placeholder="e.g., Google"
                              name=""
                              className="flex-1"
                            />
                            <LabelInput
                              type="number"
                              value={company.frequency}
                              onChange={(e) => handleCompanyChange(i, "frequency", parseInt(e.target.value) || 1)}
                              placeholder="Freq"
                              name=""
                              className="w-20"
                            />
                            {codingFormData.companies.length > 0 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveCompany(i)}
                                className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                                title="Remove company"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleAddCompany}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-all duration-200"
                      >
                        <PlusIcon className="w-4 h-4" /> Add Company
                      </button>
                    </div>

                    {/* Follow-up Question */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                      <LabelTextArea
                        label="Follow-up Question (Optional)"
                        name="followUp"
                        value={codingFormData.followUp}
                        onChange={handleCodingInputChange}
                        placeholder="e.g., Could you solve it in O(n) time complexity?"
                        rows={2}
                      />
                    </div>

                    {/* Hints Section */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <label className="text-sm font-semibold text-gray-900">
                          Hints
                        </label>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          Provide hints to help users
                        </span>
                      </div>
                      <div className="space-y-3">
                        {codingFormData.hints.map((hint, i) => (
                          <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">
                                Hint {i + 1}
                              </span>
                              {codingFormData.hints.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveHint(i)}
                                  className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                                  title="Remove hint"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            <div className="p-4">
                              <LabelTextArea
                                value={hint.hint}
                                onChange={(e) => handleHintChange(i, e.target.value)}
                                placeholder="Enter hint..."
                                rows={2}
                                name=""
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleAddHint}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-all duration-200"
                      >
                        <PlusIcon className="w-4 h-4" /> Add Hint
                      </button>
                    </div>

                    {/* Editorial */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                      <TextEditor
                        label="Editorial / Solution (Optional)"
                        value={codingFormData.editorial}
                        onChange={(content) => {
                          setCodingFormData(prev => ({ ...prev, editorial: content }));
                        }}
                        placeholder="Provide a detailed solution explanation..."
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
                      <div className="flex items-center justify-between mb-4">
                        <label className="text-sm font-semibold text-gray-900">
                          Constraints
                        </label>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          Add constraints for the problem
                        </span>
                      </div>
                      <div className="space-y-3">
                        {codingFormData.constraints.map((constraint, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className="text-sm text-gray-500">{i + 1}.</span>
                            <LabelInput
                              value={constraint}
                              onChange={(e) => handleConstraintChange(i, e.target.value)}
                              placeholder="e.g., 1 <= nums.length <= 10^4"
                              name=""
                              className="flex-1"
                            />
                            {codingFormData.constraints.length > 0 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveConstraint(i)}
                                className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                                title="Remove constraint"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleAddConstraint}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-all duration-200"
                      >
                        <PlusIcon className="w-4 h-4" /> Add Constraint
                      </button>
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
                            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">
                                Test Case {i + 1}
                              </span>
                              {codingFormData.testCases.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTestCase(i)}
                                  className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                                  title="Remove test case"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
                              <LabelInput
                                label="Input"
                                value={tc.input}
                                onChange={(e) =>
                                  handleTestCaseChange(i, "input", e.target.value)
                                }
                                required
                                name=""
                              />
                              <LabelInput
                                label="Expected Output"
                                value={tc.output}
                                onChange={(e) =>
                                  handleTestCaseChange(i, "output", e.target.value)
                                }
                                required
                                name=""
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      {errors.testCases && (
                        <p className="mt-2 text-sm text-rose-600">{errors.testCases}</p>
                      )}
                      <button
                        type="button"
                        onClick={handleAddTestCase}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-all duration-200"
                      >
                        <PlusIcon className="w-4 h-4" /> Add Test Case
                      </button>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <label className="text-sm font-semibold text-gray-900">
                          Code Stubs (Optional)
                        </label>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          Provide starter code for different languages
                        </span>
                      </div>
                      <div className="space-y-4">
                        {codingFormData.codeStubs.map((stub, i) => (
                          <div
                            key={i}
                            className="border border-gray-200 rounded-lg overflow-hidden"
                          >
                            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                              <select
                                value={stub.language}
                                onChange={(e) => handleCodeStubChange(i, "language", e.target.value)}
                                className="text-sm font-medium text-gray-700 bg-transparent border-none focus:outline-none"
                              >
                                {languageOptions.map(lang => (
                                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => handleRemoveCodeStub(i)}
                                className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                                title="Remove code stub"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                            <CodeEditor
                              value={stub.code}
                              onChange={(value) => handleCodeStubChange(i, "code", value)}
                              language={stub.language}
                            />
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleAddCodeStub}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-all duration-200"
                      >
                        <PlusIcon className="w-4 h-4" /> Add Code Stub
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                            difficulty: value as DifficultyLevel,
                          }))
                        }
                      />
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                      <label className="block text-sm font-semibold text-gray-900 mb-4">
                        Allowed Languages
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {languageOptions.map((lang) => (
                          <label
                            key={lang.value}
                            className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                              codingFormData.allowedLanguages.includes(lang.value)
                                ? "border-[#465D96] bg-[#465D96]/5"
                                : "border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={codingFormData.allowedLanguages.includes(lang.value)}
                              onChange={() => handleLanguageToggle(lang.value)}
                              className="rounded text-indigo-600 focus:ring-indigo-600"
                            />
                            <span className="text-sm text-gray-700">{lang.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center justify-end gap-4 px-8 py-5 border-t border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
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
                {isEditMode ? "Update Question" : "Create Question"}
              </button>
            </div>
            </form>

            
          </div>
        </div>
      )}

      {/* View Question Modal */}
      {isViewModalOpen && viewingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-100">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-purple-600">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  Question Details
                </h3>
                <p className="text-sm text-indigo-100 mt-1">
                  Review question information
                </p>
              </div>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setViewingQuestion(null);
                }}
                className="p-2.5 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200 shadow-sm"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-6">
              <div className="space-y-6">
                <div className="flex items-center gap-4 flex-wrap">
                  <QuestionTypeBadge type={viewingQuestion.type} />
                  <DifficultyBadge difficulty={viewingQuestion.difficulty} />
                  <span className="inline-flex items-center px-3 py-2 rounded-lg bg-amber-50 text-amber-700 text-sm font-medium border border-amber-100">
                    <span className="font-bold">{viewingQuestion.marks}</span>{" "}
                    {viewingQuestion.marks === 1 ? "mark" : "marks"}
                  </span>
                  {courses.find(c => c._id === viewingQuestion.course) && (
                    <span className="inline-flex items-center px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100">
                      <BookOpenIcon className="w-4 h-4 mr-1.5" />
                      {courses.find(c => c._id === viewingQuestion.course)?.title}
                    </span>
                  )}
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                    Question Title
                  </h4>
                  <div className="text-gray-900">
                    {/* {viewingQuestion.type === "single_choice_mcq" || viewingQuestion.type === "multi_choice_mcq" ? ( */}
                      <div
                        dangerouslySetInnerHTML={{
                          __html: (viewingQuestion as MCQQuestion).title,
                        }}
                      />
                    {/* ) : (
                      (viewingQuestion as CodingQuestion).title
                    )} */}
                  </div>
                </div>

                {viewingQuestion.type === "single_choice_mcq" || viewingQuestion.type === "multi_choice_mcq" ? (
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
                    {viewingQuestion.type === "multi_choice_mcq" && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-700">
                          <strong>Note:</strong> This question allows multiple correct answers.
                        </p>
                      </div>
                    )}
                  </div>
                 ) : (
                   <div className="space-y-5">
                     {/* Problem Number and Slug */}
                     {viewingQuestion.problemNumber && (
                       <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                         <div className="flex items-center gap-4">
                           <div>
                             <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Problem #</span>
                             <p className="text-2xl font-bold text-indigo-700">{viewingQuestion.problemNumber}</p>
                           </div>
                           {viewingQuestion.problemSlug && (
                             <div>
                               <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Slug</span>
                               <p className="text-sm font-mono text-gray-700">/{viewingQuestion.problemSlug}</p>
                             </div>
                           )}
                         </div>
                       </div>
                     )}

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

                     {/* Examples */}
                     {(viewingQuestion as CodingQuestion).examples && (viewingQuestion as CodingQuestion).examples!.length > 0 && (
                       <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                         <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                           Examples
                         </h4>
                         <div className="space-y-4">
                           {(viewingQuestion as CodingQuestion).examples!.map((example, i) => (
                             <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                               <div className="bg-indigo-50 px-4 py-2 border-b border-indigo-100">
                                 <span className="text-sm font-medium text-indigo-700">
                                   Example {i + 1}
                                 </span>
                               </div>
                               <div className="p-4 space-y-3">
                                 <div>
                                   <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                     Input
                                   </span>
                                   <pre className="mt-1 p-3 bg-gray-50 rounded text-sm text-gray-800 overflow-x-auto">
                                     {example.input}
                                   </pre>
                                 </div>
                                 <div>
                                   <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                     Output
                                   </span>
                                   <pre className="mt-1 p-3 bg-gray-50 rounded text-sm text-gray-800 overflow-x-auto">
                                     {example.output}
                                   </pre>
                                 </div>
                                 {example.explanation && (
                                   <div>
                                     <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                       Explanation
                                     </span>
                                     <p className="mt-1 text-sm text-gray-700">{example.explanation}</p>
                                   </div>
                                 )}
                               </div>
                             </div>
                           ))}
                         </div>
                       </div>
                     )}

                     {/* Constraints */}
                     {(viewingQuestion as CodingQuestion).constraints && (viewingQuestion as CodingQuestion).constraints!.length > 0 && (
                       <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                         <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                           Constraints
                         </h4>
                         <ul className="space-y-2">
                           {(viewingQuestion as CodingQuestion).constraints!.map((constraint, i) => (
                             <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                               <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                                 {i + 1}
                               </span>
                               <span>{constraint}</span>
                             </li>
                           ))}
                         </ul>
                       </div>
                     )}

                     {/* Follow-up */}
                     {(viewingQuestion as CodingQuestion).followUp && (
                       <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200">
                         <h4 className="text-sm font-semibold text-amber-800 uppercase tracking-wide mb-2">
                           Follow-up
                         </h4>
                         <p className="text-sm text-amber-900">
                           {(viewingQuestion as CodingQuestion).followUp}
                         </p>
                       </div>
                     )}

                     {/* Topics */}
                     {(viewingQuestion as CodingQuestion).topics && (viewingQuestion as CodingQuestion).topics!.length > 0 && (
                       <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                         <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                           Topics
                         </h4>
                         <div className="flex flex-wrap gap-2">
                           {(viewingQuestion as CodingQuestion).topics!.map((topic) => (
                             <span
                               key={topic}
                               className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-indigo-100 text-indigo-800 border border-indigo-200"
                             >
                               {topic}
                             </span>
                           ))}
                         </div>
                       </div>
                     )}

                     {/* Companies */}
                     {(viewingQuestion as CodingQuestion).companies && (viewingQuestion as CodingQuestion).companies!.length > 0 && (
                       <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                         <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                           Companies
                         </h4>
                         <div className="flex flex-wrap gap-2">
                           {(viewingQuestion as CodingQuestion).companies!.map((company) => (
                             <span
                               key={company.name}
                               className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
                             >
                               {company.name}
                               <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-blue-200 text-blue-900 text-xs">
                                 {company.frequency}
                               </span>
                             </span>
                           ))}
                         </div>
                       </div>
                     )}

                     {/* Hints */}
                     {(viewingQuestion as CodingQuestion).hints && (viewingQuestion as CodingQuestion).hints!.length > 0 && (
                       <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                         <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                           Hints
                         </h4>
                         <div className="space-y-3">
                           {(viewingQuestion as CodingQuestion).hints!.map((hint, i) => (
                             <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                               <div className="bg-amber-50 px-4 py-2 border-b border-amber-100">
                                 <span className="text-sm font-medium text-amber-700">
                                   Hint {i + 1}
                                 </span>
                               </div>
                               <div className="p-4">
                                 <p className="text-sm text-gray-700">{hint.hint}</p>
                               </div>
                             </div>
                           ))}
                         </div>
                       </div>
                     )}

                     {/* Editorial */}
                     {(viewingQuestion as CodingQuestion).editorial && (
                       <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                         <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                           Editorial / Solution
                         </h4>
                         <div
                           className="text-gray-900 leading-relaxed prose prose-sm max-w-none"
                           dangerouslySetInnerHTML={{
                             __html: (viewingQuestion as CodingQuestion).editorial!,
                           }}
                         />
                       </div>
                     )}

                     {/* Statistics */}
                     {((viewingQuestion as CodingQuestion).acceptanceRate !== undefined ||
                       (viewingQuestion as CodingQuestion).submissionsCount !== undefined ||
                       (viewingQuestion as CodingQuestion).acceptedCount !== undefined ||
                       (viewingQuestion as CodingQuestion).discussionCount !== undefined) && (
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         {(viewingQuestion as CodingQuestion).acceptanceRate !== undefined && (
                           <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200 text-center">
                             <p className="text-2xl font-bold text-emerald-700">
                               {(viewingQuestion as CodingQuestion).acceptanceRate}%
                             </p>
                             <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide mt-1">
                               Acceptance Rate
                             </p>
                           </div>
                         )}
                         {(viewingQuestion as CodingQuestion).submissionsCount !== undefined && (
                           <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 text-center">
                             <p className="text-2xl font-bold text-blue-700">
                               {(viewingQuestion as CodingQuestion).submissionsCount}
                             </p>
                             <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mt-1">
                               Submissions
                             </p>
                           </div>
                         )}
                         {(viewingQuestion as CodingQuestion).acceptedCount !== undefined && (
                           <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200 text-center">
                             <p className="text-2xl font-bold text-green-700">
                               {(viewingQuestion as CodingQuestion).acceptedCount}
                             </p>
                             <p className="text-xs font-medium text-green-600 uppercase tracking-wide mt-1">
                               Accepted
                             </p>
                           </div>
                         )}
                         {(viewingQuestion as CodingQuestion).discussionCount !== undefined && (
                           <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200 text-center">
                             <p className="text-2xl font-bold text-purple-700">
                               {(viewingQuestion as CodingQuestion).discussionCount}
                             </p>
                             <p className="text-xs font-medium text-purple-600 uppercase tracking-wide mt-1">
                               Discussions
                             </p>
                           </div>
                         )}
                       </div>
                     )}

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

                    {(viewingQuestion as CodingQuestion).codeStubs && (viewingQuestion as CodingQuestion).codeStubs!.length > 0 && (
                      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                          Code Stubs
                        </h4>
                        <div className="space-y-4">
                          {(viewingQuestion as CodingQuestion).codeStubs!.map((stub, i) => (
                            <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                              <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                                <span className="text-sm font-medium text-gray-700">
                                  {stub.language}
                                </span>
                              </div>
                              <pre className="p-4 bg-gray-900 text-gray-100 text-sm overflow-x-auto font-mono">
                                {stub.code}
                              </pre>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

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

            <div className="flex items-center justify-end gap-4 px-8 py-5 border-t border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
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
                <div className="flex items-center gap-2 flex-wrap">
                  {q.problemNumber && (
                    <span
                      className="inline-flex items-center justify-center w-8 h-8 rounded-xl text-sm font-bold shadow-sm bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700"
                    >
                      {q.problemNumber}
                    </span>
                  )}
                  <QuestionTypeBadge type={q.type} />
                  {q.isPremium && (
                    <span className="inline-flex items-center px-2 py-1 rounded-lg bg-purple-100 text-purple-700 text-xs font-medium border border-purple-200">
                      Premium
                    </span>
                  )}
                  {q.isLocked && (
                    <span className="inline-flex items-center px-2 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200">
                      Locked
                    </span>
                  )}
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
                {q.type === "single_choice_mcq" || q.type === "multi_choice_mcq" ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: (q as MCQQuestion).title,
                    }}
                  />
                ) : (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: (q as CodingQuestion).title,
                    }}
                  />
                )}
              </h3>

              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <DifficultyBadge difficulty={q.difficulty} />
                <span className="inline-flex items-center px-2 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-medium border border-amber-100">
                  <span className="font-bold">{q.marks}</span>{" "}
                  {q.marks === 1 ? "mark" : "marks"}
                </span>
                {courses.find(c => c._id === q.course) && (
                  <span className="inline-flex items-center px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                    <BookOpenIcon className="w-3 h-3 mr-1" />
                    {courses.find(c => c._id === q.course)?.title}
                  </span>
                )}
              </div>

              {/* LeetCode-style stats */}
              <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-100">
                {q.acceptanceRate !== undefined && (
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{q.acceptanceRate}%</p>
                    <p className="text-xs text-gray-500">Acceptance</p>
                  </div>
                )}
                {q.submissionsCount !== undefined && (
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{q.submissionsCount}</p>
                    <p className="text-xs text-gray-500">Submissions</p>
                  </div>
                )}
              </div>

              {/* Topics tags */}
              {q.topics && q.topics.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-gray-100">
                  {q.topics.slice(0, 3).map((topic) => (
                    <span
                      key={topic}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100"
                    >
                      {topic}
                    </span>
                  ))}
                  {q.topics.length > 3 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                      +{q.topics.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredQuestions.length === 0 && (
          <div className="col-span-full bg-gradient-to-br from-white to-blue-50/30 border-2 border-dashed border-blue-200 rounded-3xl p-16 text-center shadow-sm">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                <QuestionMarkCircleIcon className="w-10 h-10 text-indigo-600" />
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
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-600/95 hover:to-purple-600/95 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
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
    </div>
  );
};

export default Question;
