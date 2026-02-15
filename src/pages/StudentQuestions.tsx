"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  ClockIcon,
  PlayIcon,
  XCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LightBulbIcon,
  BookOpenIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  BeakerIcon,
  CpuChipIcon,
  TrophyIcon,
  FireIcon,
  SparklesIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";
import QuestionApis from "../apis/QuestionApis";
import CourseApis from "../apis/CourseApis";
import type { ICourse } from "../types/interfaces";
import { useAuth } from "../context/AuthProvider";
import CodeEditor from "../components/UI/CodeEditor";

// ===== TYPES =====
type DifficultyLevel = "easy" | "medium" | "hard";
type ProblemStatus = "solved" | "attempted" | "unsolved";

interface ProblemExample {
  id: number;
  input: string;
  output: string;
  explanation?: string;
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

interface Problem {
  _id: string;
  title: string;
  problemNumber?: number;
  problemSlug?: string;
  type?: string;
  difficulty: DifficultyLevel;
  marks: number;
  course: string;
  description: string;
  examples?: ProblemExample[];
  constraints?: string[];
  followUp?: string;
  topics?: string[];
  acceptanceRate?: number;
  submissionsCount?: number;
  acceptedCount?: number;
  testCases: CodingTestCase[];
  codeStubs?: CodeStub[];
  allowedLanguages: string[];
  timeLimit?: number;
  memoryLimit?: number;
  hints?: string[];
  editorial?: string;
  status?: ProblemStatus;
  createdAt?: string;
}

interface TestResult {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  runtime?: number;
  memory?: number;
  error?: string;
}

// Piston API Response Types
interface PistonMessage {
  type: string;
  output?: string;
  data?: any;
}

interface PistonRunResult {
  stdout?: string;
  stderr?: string;
  code?: number;
  message?: string;
}

interface PistonResponse {
  run: PistonRunResult;
  compile?: PistonRunResult;
  language: string;
  version: string;
}

// ===== PISTON API CONFIG =====
const PISTON_API_URL = "https://emkc.org/api/v2/piston/execute";

const LANGUAGE_VERSIONS: Record<string, string> = {
  python: "3.10.0",
  javascript: "18.15.0",
  java: "15.0.2",
  cpp: "10.2.0",
  c: "10.2.0",
  typescript: "5.0.3",
  go: "1.19.4",
  rust: "1.68.2",
};

const executeCode = async (
  language: string,
  code: string,
  input: string
): Promise<{ output: string; error: string | null; runtime: number }> => {
  const startTime = performance.now();

  try {
    const response = await fetch(PISTON_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language,
        version: LANGUAGE_VERSIONS[language] || "*",
        files: [
          {
            name: `main.${getFileExtension(language)}`,
            content: code,
          },
        ],
        stdin: input,
        compile_timeout: 10000,
        run_timeout: 5000,
      }),
    });

    const data: PistonResponse = await response.json();
    const endTime = performance.now();
    const runtime = Math.round(endTime - startTime);

    if (data.run?.code !== 0) {
      return {
        output: data.run?.stdout || "",
        error: data.run?.stderr || data.run?.message || "Execution failed",
        runtime,
      };
    }

    return {
      output: data.run?.stdout || "",
      error: data.run?.stderr || null,
      runtime,
    };
  } catch (error) {
    const endTime = performance.now();
    const runtime = Math.round(endTime - startTime);
    return {
      output: "",
      error: error instanceof Error ? error.message : "Failed to execute code",
      runtime,
    };
  }
};

const getFileExtension = (language: string): string => {
  const extensions: Record<string, string> = {
    python: "py",
    javascript: "js",
    java: "java",
    cpp: "cpp",
    c: "c",
    typescript: "ts",
    go: "go",
    rust: "rs",
  };
  return extensions[language] || "txt";
};

// ===== COMPONENT =====
const StudentQuestions: React.FC = () => {
  const { user } = useAuth();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // View mode: "list" or "solve"
  const [viewMode, setViewMode] = useState<"list" | "solve">("list");
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);

  // List view state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  // Solve mode state
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "solutions" | "submissions">("description");
  const [showHint, setShowHint] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(true);
  const [streak, setStreak] = useState(0);
  const [showStreakAnimation, setShowStreakAnimation] = useState(false);

  // ===== EFFECTS =====
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [questionsData, coursesData] = await Promise.all([
          QuestionApis.getAllQuestions(),
          CourseApis.getAll(),
        ]);
        const codingQuestions = (questionsData.data.questions || []).filter(
          (q: Problem) => q.type === "coding"
        );
        setProblems(codingQuestions);
        setCourses(Array.isArray(coursesData) ? coursesData : []);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Load streak from localStorage on mount
  useEffect(() => {
    const savedStreak = localStorage.getItem("codingStreak");
    if (savedStreak) {
      setStreak(parseInt(savedStreak, 10));
    }
  }, []);

  // ===== HANDLERS =====
  const handleSelectProblem = (problem: Problem) => {
    setSelectedProblem(problem);
    setCode(
      problem.codeStubs?.find((stub) => stub.language === language)?.code ||
      getDefaultCode(language, problem)
    );
    setTestResults(null);
    setShowHint(false);
    setCurrentHintIndex(0);
    setActiveTab("description");
    setViewMode("solve");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedProblem(null);
  };

  const handleRunCode = async () => {
    if (!selectedProblem) return;

    setIsRunning(true);
    setTestResults(null);

    const results: TestResult[] = [];

    try {
      // Run each test case
      for (const testCase of selectedProblem.testCases) {
        const { output, error, runtime } = await executeCode(
          language,
          code,
          testCase.input
        );

        const actualOutput = output.trim();
        const expectedOutput = testCase.output.trim();

        results.push({
          input: testCase.input,
          expected: expectedOutput,
          actual: actualOutput,
          passed: error === null && actualOutput === expectedOutput,
          runtime,
          error: error || undefined,
        });
      }

      setTestResults(results);
    } catch (error) {
      console.error("Error running code:", error);
      setTestResults(
        selectedProblem.testCases.map((testCase) => ({
          input: testCase.input,
          expected: testCase.output,
          actual: "",
          passed: false,
          runtime: 0,
          error: "Failed to execute code",
        }))
      );
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!selectedProblem) return;

    setIsSubmitting(true);

    try {
      // Run all test cases first
      await handleRunCode();

      // Wait for results
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Check if all tests passed
      const allPassed = testResults?.every((r) => r.passed);

      if (allPassed) {
        // Update problem status
        setProblems((prev) =>
          prev.map((p) =>
            p._id === selectedProblem._id ? { ...p, status: "solved" } : p
          )
        );
        
        // Increment streak
        const newStreak = streak + 1;
        setStreak(newStreak);
        localStorage.setItem("codingStreak", newStreak.toString());
        
        // Show streak animation
        setShowStreakAnimation(true);
        setTimeout(() => setShowStreakAnimation(false), 3000);
        
        alert(`Solution submitted successfully! 🔥 Streak: ${newStreak}`);
      } else {
        alert("Some test cases failed. Please fix your code and try again.");
      }
    } catch (error) {
      console.error("Error submitting code:", error);
      alert("Failed to submit solution. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    if (selectedProblem) {
      setCode(
        selectedProblem.codeStubs?.find((stub) => stub.language === newLanguage)?.code ||
        getDefaultCode(newLanguage, selectedProblem)
      );
    }
  };

  const getDefaultCode = (lang: string, problem: Problem): string => {
    const templates: Record<string, string> = {
      python: `# Write your solution here
def solution():
    # Your code here
    pass

if __name__ == "__main__":
    solution()`,
      javascript: `// Write your solution here
function solution() {
    // Your code here
}

solution();`,
      java: `// Write your solution here
public class Solution {
    public static void main(String[] args) {
        // Your code here
    }
}`,
      cpp: `// Write your solution here
#include <iostream>
using namespace std;

int main() {
    // Your code here
    return 0;
}`,
      c: `// Write your solution here
#include <stdio.h>

int main() {
    // Your code here
    return 0;
}`,
    };
    return templates[lang] || templates["python"];
  };

  // ===== FILTERS =====
  const filteredProblems = problems.filter((problem) => {
    const matchesSearch =
      searchTerm === "" ||
      problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.topics?.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDifficulty = filterDifficulty === "ALL" || problem.difficulty === filterDifficulty;
    const matchesStatus = filterStatus === "ALL" || problem.status === filterStatus;

    return matchesSearch && matchesDifficulty && matchesStatus;
  });

  // ===== PAGINATION =====
  const totalPages = Math.ceil(filteredProblems.length / itemsPerPage);
  const paginatedProblems = filteredProblems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ===== HELPERS =====
  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case "easy":
        return "text-green-600";
      case "medium":
        return "text-yellow-600";
      case "hard":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getDifficultyBgColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-50";
      case "medium":
        return "bg-yellow-50";
      case "hard":
        return "bg-red-50";
      default:
        return "bg-gray-50";
    }
  };

  const getDifficultyGradient = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case "easy":
        return "from-green-500 to-green-600";
      case "medium":
        return "from-yellow-500 to-yellow-600";
      case "hard":
        return "from-red-500 to-red-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getStatusIcon = (status?: ProblemStatus) => {
    if (status === "solved") {
      return <CheckCircleSolid className="w-5 h-5 text-green-600" />;
    }
    if (status === "attempted") {
      return <XCircleIcon className="w-5 h-5 text-yellow-600" />;
    }
    return null;
  };

  // ===== RENDER =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {viewMode === "list" ? (
        /* ===== PROBLEM LIST VIEW ===== */
        <div className="">
          

          {/* Content */}
          <div className="">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-48">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <CodeBracketIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{problems.length}</p>
                        <p className="text-sm text-gray-600">Total Problems</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                        <CheckCircleIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {problems.filter((p) => p.status === "solved").length}
                        </p>
                        <p className="text-sm text-gray-600">Solved</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                        <TrophyIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {problems.filter((p) => p.difficulty === "hard").length}
                        </p>
                        <p className="text-sm text-gray-600">Hard Problems</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <SparklesIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {Math.round(
                            (problems.filter((p) => p.status === "solved").length / Math.max(problems.length, 1)) * 100
                          )}%
                        </p>
                        <p className="text-sm text-gray-600">Success Rate</p>
                      </div>
                    </div>
                  </div>

                  {/* Streak Card */}
                  <div className={`bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all ${
                    showStreakAnimation ? "scale-105 ring-2 ring-orange-400" : ""
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center ${
                        showStreakAnimation ? "animate-pulse" : ""
                      }`}>
                        <FireIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{streak}</p>
                        <p className="text-sm text-gray-600">Current Streak</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filters Bar */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                  <div className="flex flex-wrap items-center gap-4">
                    {/* Difficulty Filter */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Difficulty:</span>
                      <div className="flex gap-2">
                        {["ALL", "easy", "medium", "hard"].map((diff) => (
                          <button
                            key={diff}
                            onClick={() => setFilterDifficulty(diff)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                              filterDifficulty === diff
                                ? diff === "ALL"
                                  ? "bg-indigo-600 text-white"
                                  : `bg-gradient-to-r ${getDifficultyGradient(diff as DifficultyLevel)} text-white`
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {diff.charAt(0).toUpperCase() + diff.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="h-6 w-px bg-gray-200"></div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Status:</span>
                      <div className="flex gap-2">
                        {["ALL", "solved", "attempted", "unsolved"].map((status) => (
                          <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                              filterStatus === status
                                ? "bg-indigo-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex-1"></div>

                    {/* Reset */}
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setFilterDifficulty("ALL");
                        setFilterStatus("ALL");
                      }}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all font-medium"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>

                {/* Problems Grid */}
                {paginatedProblems.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mb-6">
                      <CodeBracketIcon className="w-12 h-12 text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No problems found
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Try adjusting your filters or search terms
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {paginatedProblems.map((problem) => (
                        <div
                          key={problem._id}
                          onClick={() => handleSelectProblem(problem)}
                          className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group cursor-pointer"
                        >
                          {/* Problem Header */}
                          <div className={`bg-gradient-to-r ${getDifficultyGradient(problem.difficulty)} px-6 py-4`}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-white line-clamp-2">
                                  {problem.problemNumber && `#${problem.problemNumber} `}
                                  <span dangerouslySetInnerHTML={{ __html: problem.title }} />
                                </h3>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-white/80 text-xs">
                                    {problem.marks} points
                                  </span>
                                  {problem.acceptanceRate && (
                                    <span className="text-white/80 text-xs">
                                      • {problem.acceptanceRate.toFixed(1)}% acceptance
                                    </span>
                                  )}
                                </div>
                              </div>
                              {getStatusIcon(problem.status)}
                            </div>
                          </div>

                          {/* Problem Content */}
                          <div className="p-6">
                            {/* Topics */}
                            {problem.topics && problem.topics.length > 0 && (
                              <div className="mb-4">
                                <div className="flex flex-wrap gap-2">
                                  {problem.topics.slice(0, 3).map((topic, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-md"
                                    >
                                      {topic}
                                    </span>
                                  ))}
                                  {problem.topics.length > 3 && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md">
                                      +{problem.topics.length - 3}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Problem Stats */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="flex items-center gap-2">
                                <ClockIcon className="w-4 h-4 text-gray-400" />
                                <div>
                                  <p className="text-xs text-gray-500">Time Limit</p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {problem.timeLimit || 1}s
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <CpuChipIcon className="w-4 h-4 text-gray-400" />
                                <div>
                                  <p className="text-xs text-gray-500">Memory</p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {problem.memoryLimit || 256}MB
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Test Cases Count */}
                            <div className="mb-4">
                              <p className="text-xs font-medium text-gray-500 mb-1">
                                Test Cases
                              </p>
                              <p className="text-sm text-gray-900">
                                {problem.testCases.length} test cases
                              </p>
                            </div>

                            {/* Start Button */}
                            <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 group-hover:shadow-md">
                              {problem.status === "solved" ? (
                                <>
                                  <CheckCircleIcon className="w-5 h-5" />
                                  Review Solution
                                </>
                              ) : problem.status === "attempted" ? (
                                <>
                                  <PlayIcon className="w-5 h-5" />
                                  Continue Solving
                                </>
                              ) : (
                                <>
                                  <PlayIcon className="w-5 h-5" />
                                  Start Solving
                                </>
                              )}
                              <ArrowRightIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="mt-8 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                          {Math.min(currentPage * itemsPerPage, filteredProblems.length)} of{" "}
                          {filteredProblems.length} problems
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          >
                            <ChevronLeftIcon className="w-4 h-4" />
                            Previous
                          </button>
                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(
                              (page) =>
                                page === 1 ||
                                page === totalPages ||
                                (page >= currentPage - 1 && page <= currentPage + 1)
                            )
                            .map((page, i, arr) => (
                              <React.Fragment key={page}>
                                {i > 0 && arr[i - 1] !== page - 1 && (
                                  <span className="px-2 text-sm text-gray-400">...</span>
                                )}
                                <button
                                  onClick={() => setCurrentPage(page)}
                                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                    currentPage === page
                                      ? "bg-indigo-600 text-white"
                                      : "text-gray-600 hover:bg-gray-100"
                                  }`}
                                >
                                  {page}
                                </button>
                              </React.Fragment>
                            ))}
                          <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          >
                            Next
                            <ChevronRightIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      ) : 
        /* ===== PROBLEM SOLVE VIEW ===== */
        selectedProblem && (
          <div className="h-screen flex flex-col bg-white">
            {/* Top Bar */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBackToList}
                  className="flex items-center gap-1 text-white hover:text-white/80 text-sm font-medium hover:bg-white/10 px-3 py-2 rounded-lg transition-all"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                  <span>Back to Problems</span>
                </button>
                <div className="h-6 w-px bg-white/30"></div>
                <div>
                  <h2
                    className="font-semibold text-white text-base"
                    dangerouslySetInnerHTML={{ __html: selectedProblem.title }}
                  />
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full bg-white/20 text-white`}
                    >
                      {selectedProblem.difficulty.charAt(0).toUpperCase() +
                        selectedProblem.difficulty.slice(1)}
                    </span>
                    <span className="text-white/80 text-xs">
                      {selectedProblem.marks} points
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Streak Display */}
                <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
                  showStreakAnimation
                    ? "bg-orange-400 text-orange-900 scale-110"
                    : "bg-white/20 text-white"
                }`}>
                  <FireIcon className={`w-4 h-4 ${showStreakAnimation ? "animate-pulse" : ""}`} />
                  <span className="text-xs font-semibold">{streak}</span>
                  <span className="text-xs">Streak</span>
                </div>

                {selectedProblem.hints && selectedProblem.hints.length > 0 && (
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      showHint
                        ? "bg-yellow-400 text-yellow-900"
                        : "text-white hover:bg-white/10"
                    }`}
                  >
                    <LightBulbIcon className="w-4 h-4" />
                    <span>Hint</span>
                  </button>
                )}
                {selectedProblem.editorial && (
                  <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white hover:bg-white/10 rounded-lg transition-all">
                    <BookOpenIcon className="w-4 h-4" />
                    <span>Editorial</span>
                  </button>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Panel - Problem Description */}
              <div className={`${isLeftPanelCollapsed ? 'w-12' : 'w-1/2 min-w-[400px] max-w-[500px]'} overflow-y-auto border-r border-gray-200 bg-white transition-all duration-300`}>
                {/* Tabs Header with Collapse Toggle */}
                <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
                  <div className="flex items-center">
                    <button
                      onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
                      className="p-3 hover:bg-gray-100 transition-colors border-r border-gray-200"
                      title={isLeftPanelCollapsed ? "Expand panel" : "Collapse panel"}
                    >
                      {isLeftPanelCollapsed ? (
                        <ChevronRightIcon className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                    {!isLeftPanelCollapsed && (
                      <div className="flex-1 flex">
                        {["description", "solutions", "submissions"].map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                              activeTab === tab
                                ? "border-indigo-600 text-indigo-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                          >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tab Content */}
                {!isLeftPanelCollapsed && (
                  <div className="p-6">
                  {activeTab === "description" && (
                    <div className="space-y-6">
                      {/* Description */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <DocumentTextIcon className="w-4 h-4 text-indigo-600" />
                          Description
                        </h3>
                        <div
                          className="text-sm text-gray-700 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: selectedProblem.description }}
                        />
                      </div>

                      {/* Examples */}
                      {selectedProblem.examples && selectedProblem.examples.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <BeakerIcon className="w-4 h-4 text-indigo-600" />
                            Examples
                          </h3>
                          <div className="space-y-4">
                            {selectedProblem.examples.map((example, index) => (
                              <div
                                key={example.id}
                                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 overflow-hidden"
                              >
                                <div className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
                                  <span className="text-xs font-semibold text-indigo-700">
                                    Example {index + 1}
                                  </span>
                                </div>
                                <div className="p-4 space-y-3">
                                  <div>
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                      Input
                                    </span>
                                    <pre className="mt-2 text-sm text-gray-800 bg-white p-3 rounded-lg border border-gray-200 font-mono overflow-x-auto">
                                      {example.input}
                                    </pre>
                                  </div>
                                  <div>
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                      Output
                                    </span>
                                    <pre className="mt-2 text-sm text-gray-800 bg-white p-3 rounded-lg border border-gray-200 font-mono overflow-x-auto">
                                      {example.output}
                                    </pre>
                                  </div>
                                  {example.explanation && (
                                    <div>
                                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Explanation
                                      </span>
                                      <p className="mt-2 text-sm text-gray-700">
                                        {example.explanation}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Constraints */}
                      {selectedProblem.constraints && selectedProblem.constraints.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <ChartBarIcon className="w-4 h-4 text-indigo-600" />
                            Constraints
                          </h3>
                          <ul className="space-y-2">
                            {selectedProblem.constraints.map((constraint, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2 text-sm text-gray-700"
                              >
                                <span className="text-indigo-600 mt-0.5">•</span>
                                <span dangerouslySetInnerHTML={{ __html: constraint }} />
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Follow Up */}
                      {selectedProblem.followUp && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <SparklesIcon className="w-4 h-4 text-indigo-600" />
                            Follow Up
                          </h3>
                          <p
                            className="text-sm text-gray-700"
                            dangerouslySetInnerHTML={{ __html: selectedProblem.followUp }}
                          />
                        </div>
                      )}

                      {/* Hints Panel */}
                      {showHint && selectedProblem.hints && selectedProblem.hints.length > 0 && (
                        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-yellow-900 flex items-center gap-1.5">
                              <LightBulbIcon className="w-4 h-4" />
                              Hint {currentHintIndex + 1} of {selectedProblem.hints.length}
                            </h3>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() =>
                                  setCurrentHintIndex((i) => Math.max(0, i - 1))
                                }
                                disabled={currentHintIndex === 0}
                                className="p-1.5 rounded-lg hover:bg-yellow-100 disabled:opacity-50 transition-all"
                              >
                                <ChevronLeftIcon className="w-3 h-3 text-yellow-700" />
                              </button>
                              <button
                                onClick={() =>
                                  setCurrentHintIndex((i) =>
                                    Math.min(selectedProblem.hints!.length - 1, i + 1)
                                  )
                                }
                                disabled={currentHintIndex === selectedProblem.hints.length - 1}
                                className="p-1.5 rounded-lg hover:bg-yellow-100 disabled:opacity-50 transition-all"
                              >
                                <ChevronRightIcon className="w-3 h-3 text-yellow-700" />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-yellow-800 leading-relaxed">
                            {selectedProblem.hints[currentHintIndex]}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "solutions" && (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mb-4">
                        <BookOpenIcon className="w-10 h-10 text-indigo-400" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 mb-2">
                        Solutions Coming Soon
                      </h3>
                      <p className="text-sm text-gray-500">
                        Check back later for community solutions
                      </p>
                    </div>
                  )}

                  {activeTab === "submissions" && (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mb-4">
                        <ChartBarIcon className="w-10 h-10 text-indigo-400" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 mb-2">
                        Submission History
                      </h3>
                      <p className="text-sm text-gray-500">
                        Your submission history will appear here
                      </p>
                    </div>
                  )}
                  </div>
                )}
              </div>

              {/* Right Panel - Code Editor */}
              <div className="flex-1 flex flex-col">
                <CodeEditor
                  code={code}
                  onChange={setCode}
                  language={language}
                  onLanguageChange={handleLanguageChange}
                  onRun={handleRunCode}
                  onSubmit={handleSubmitCode}
                  testCases={selectedProblem.testCases}
                  testResults={testResults}
                  isRunning={isRunning}
                  isSubmitting={isSubmitting}
                />
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default StudentQuestions;

