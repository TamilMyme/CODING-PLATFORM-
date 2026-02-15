import React, { useState, useEffect } from "react";
import {
  ClockIcon,
  CodeBracketIcon,
  ListBulletIcon,
  CheckCircleIcon,
  BookmarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentCheckIcon,
  ArrowPathIcon,
  AcademicCapIcon,
  ChevronDownIcon,
  TrophyIcon,
  DocumentTextIcon,
  XCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckCircleSolidIcon,
  BookmarkIcon as BookmarkSolidIcon,
} from "@heroicons/react/24/solid";
import Editor from "@monaco-editor/react";
import Avatar from "./UI/Avatar";
import { useAuth } from "../context/AuthProvider";
import { useParams } from "react-router-dom";
import MockTestApis from "../apis/MockTestApis";
import MockTestSubmissionApis from "../apis/MockTestSubmissionApis";
import type { IMockTest } from "../types/interfaces";

/* ================= TYPES ================= */

type ProgrammingLanguage =
  | "javascript"
  | "typescript"
  | "python"
  | "java"
  | "cpp"
  | "csharp"
  | "go"
  | "rust"
  | "php"
  | "ruby";

const PISTON_API_URL = "https://emkc.org/api/v2/piston/execute";

interface QuizState {
  currentQuestion: number;
  selectedAnswers: Record<number, number[]>;
  codeAnswers: Record<number, string>;
  selectedLanguages: Record<number, ProgrammingLanguage>;
  testCases: Record<number, { input: string; expected: string }[]>;
  timeRemaining: number;
  bookmarked: Set<number>;
}

/* ================= MOCK DATA ================= */

const mockTestData = {
  title: "JavaScript Fundamentals Assessment",
  description: "Test your knowledge of JavaScript core concepts, ES6+ features, and problem-solving skills.",
  duration: 60,
  questions: [
    {
      id: "1",      
      question: "<h3 class='text-lg font-semibold text-[#1e293b] mb-2'>What is the output of the following code?</h3><pre class='bg-[#f1f5f9] p-3 rounded-lg mt-3 font-mono text-sm text-[#1e293b]'>console.log(typeof null);</pre>",
      options: ["'null'", "'undefined'", "'object'", "'boolean'"],
      multiSelect: false,
      type: "mcq" as const,
    },
    {
      id: "2",
      question: "<h3 class='text-lg font-semibold text-[#1e293b] mb-2'>Which of the following are valid ways to declare a variable in JavaScript?</h3><p class='text-[#64748b] mt-2'>Select all that apply.</p>",
      options: ["var x = 1;", "let x = 1;", "const x = 1;", "variable x = 1;"],
      multiSelect: true,
      type: "mcq" as const,
    },
    {
      id: "3",
      question: "<h3 class='text-lg font-semibold text-[#1e293b] mb-2'>What will be logged to the console?</h3><pre class='bg-[#f1f5f9] p-3 rounded-lg mt-3 font-mono text-sm text-[#1e293b]'>const arr = [1, 2, 3];\narr.push(4);\nconsole.log(arr.length);</pre>",
      options: ["3", "4", "undefined", "Error"],
      multiSelect: false,
      type: "mcq" as const,
    },
    {
      id: "4",
      question: "<h3 class='text-lg font-semibold text-[#1e293b] mb-2'>Which methods mutate the original array?</h3><p class='text-[#64748b] mt-2'>Select all that apply.</p>",
      options: ["push()", "map()", "splice()", "filter()"],
      multiSelect: true,
      type: "mcq" as const,
    },
    {
      id: "5",
      question: "<h3 class='text-lg font-semibold text-[#1e293b] mb-2'>FizzBuzz Challenge</h3><p class='text-[#64748b] mt-2'>Write a function that returns an array of numbers from 1 to n. For multiples of 3, use 'Fizz'. For multiples of 5, use 'Buzz'. For multiples of both, use 'FizzBuzz'.</p><h4 class='font-semibold mt-4 text-[#1e293b]'>Example:</h4><pre class='bg-[#f1f5f9] p-3 rounded-lg mt-2 font-mono text-sm text-[#1e293b]'>fizzBuzz(5) // [1, 2, 'Fizz', 4, 'Buzz']</pre>",
      options: [],
      multiSelect: false,
      type: "coding" as const,
    },
    {
      id: "6",
      question: "<h3 class='text-lg font-semibold text-[#1e293b] mb-2'>Two Sum Problem</h3><p class='text-[#64748b] mt-2'>Given an array of integers and a target sum, return indices of the two numbers that add up to the target.</p><h4 class='font-semibold mt-4 text-[#1e293b]'>Example:</h4><pre class='bg-[#f1f5f9] p-3 rounded-lg mt-2 font-mono text-sm text-[#1e293b]'>twoSum([2, 7, 11, 15], 9) // [0, 1]</pre>",
      options: [],
      multiSelect: false,
      type: "coding" as const,
    },
  ],
};

/* ================= LANGUAGE TEMPLATES ================= */

const languageTemplates: Record<ProgrammingLanguage, string> = {
  javascript: `function solution(input) {
  // Write your solution here
  
  return result;
}`,
  typescript: `function solution(input: any): any {
  // Write your solution here
  
  return result;
}`,
  python: `def solution(input):
    # Write your solution here
    
    return result`,
  java: `public class Solution {
    public static Object solution(Object input) {
        // Write your solution here
        
        return result;
    }
}`,
  cpp: `#include <iostream>
#include <vector>
#include <string>

using namespace std;

// Write your solution here
Object solution(Object input) {
    // Your code here
    
    return result;
}`,
  csharp: `using System;

public class Solution {
    public static object SolutionMethod(object input) {
        // Write your solution here
        
        return result;
    }
}`,
  go: `package main

// Write your solution here
func solution(input interface{}) interface{} {
    // Your code here
    
    return result
}`,
  rust: `// Write your solution here
fn solution(input: &str) -> String {
    // Your code here
    
    String::from("result")
}`,
  php: `<?php
// Write your solution here
function solution($input) {
    // Your code here
    
    return $result;
}`,
  ruby: `# Write your solution here
def solution(input)
  # Your code here
  
  return result
end`,
};

// Piston API language mapping
const pistonLanguageMap: Record<ProgrammingLanguage, { language: string; version: string }> = {
  javascript: { language: "javascript", version: "18.15.0" },
  typescript: { language: "typescript", version: "5.0.3" },
  python: { language: "python", version: "3.10.0" },
  java: { language: "java", version: "15.0.2" },
  cpp: { language: "c++", version: "10.2.0" },
  csharp: { language: "csharp", version: "6.12.0" },
  go: { language: "go", version: "1.16.2" },
  rust: { language: "rust", version: "1.68.2" },
  php: { language: "php", version: "8.2.8" },
  ruby: { language: "ruby", version: "3.2.2" },
};

const languageOptions: { value: ProgrammingLanguage; label: string; icon: string }[] = [
  { value: "javascript", label: "JavaScript", icon: "⚡" },
  { value: "typescript", label: "TypeScript", icon: "📘" },
  { value: "python", label: "Python", icon: "🐍" },
  { value: "java", label: "Java", icon: "☕" },
  { value: "cpp", label: "C++", icon: "⚙️" },
  { value: "csharp", label: "C#", icon: "🎯" },
  { value: "go", label: "Go", icon: "🔵" },
  { value: "rust", label: "Rust", icon: "🦀" },
  { value: "php", label: "PHP", icon: "🐘" },
  { value: "ruby", label: "Ruby", icon: "💎" },
];

const defaultCode = languageTemplates.python;

/* ================= MAIN COMPONENT ================= */

const MockTest: React.FC = () => {
  const {user} = useAuth()
  const {testId} = useParams()
  const [mockTest,setMockTest] = useState<IMockTest|null>(null)
  const [activeTab, setActiveTab] = useState<"mcq" | "coding">("mcq");
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestion: 0,
    selectedAnswers: {},
    codeAnswers: {},
    selectedLanguages: {},
    testCases: {},
    timeRemaining: 0,
    bookmarked: new Set(),
  });
  const [codeOutput, setCodeOutput] = useState<string>("");
  const [testResults, setTestResults] = useState<{ passed: number; failed: number; results: Array<{ input: string; expected: string; actual: string; passed: boolean }> } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ score: number; totalMarks: number; passed: number; failed: number } | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState<any>(null);
  const [isLoadingSubmission, setIsLoadingSubmission] = useState(true);

  /* ================= TIMER ================= */

  useEffect(() => {
    if (quizState.timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setQuizState((prev) => ({
        ...prev,
        timeRemaining: prev.timeRemaining - 1,
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [quizState.timeRemaining]);

  /* ================= HELPERS ================= */

  const filteredQuestions = mockTest?.questions.filter((q) => q.type === activeTab) || [];
  const currentQuestion = filteredQuestions[quizState.currentQuestion];

  const hours = Math.floor(quizState.timeRemaining / 3600);
  const minutes = Math.floor((quizState.timeRemaining % 3600) / 60);
  const seconds = quizState.timeRemaining % 60;

  const isAnswered = (idx: number) => {
    if (activeTab === "mcq") {
      return (quizState.selectedAnswers[idx]?.length || 0) > 0;
    }
    const lang = quizState.selectedLanguages[idx] || "python";
    const template = languageTemplates[lang as ProgrammingLanguage];
    return (quizState.codeAnswers[idx]?.length || 0) > 0 && 
           quizState.codeAnswers[idx] !== template;
  };

  const totalAnswered = mockTestData.questions.filter((_, idx) => {
    const q = mockTestData.questions[idx];
    if (q.type === "mcq") {
      const mcqIdx = mockTestData.questions.filter(qq => qq.type === "mcq").indexOf(q);
      return (quizState.selectedAnswers[mcqIdx]?.length || 0) > 0;
    } else {
      const codingIdx = mockTestData.questions.filter(qq => qq.type === "coding").indexOf(q);
      const lang = quizState.selectedLanguages[codingIdx] || "python";
      const template = languageTemplates[lang as ProgrammingLanguage];
      return (quizState.codeAnswers[codingIdx]?.length || 0) > 0 && 
             quizState.codeAnswers[codingIdx] !== template;
    }
  }).length;

  const toggleBookmark = () => {
    setQuizState((prev) => {
      const newBookmarked = new Set(prev.bookmarked);
      const key = activeTab === "mcq" ? quizState.currentQuestion : quizState.currentQuestion + 100;
      if (newBookmarked.has(key)) {
        newBookmarked.delete(key);
      } else {
        newBookmarked.add(key);
      }
      return { ...prev, bookmarked: newBookmarked };
    });
  };

  const isBookmarked = quizState.bookmarked.has(
    activeTab === "mcq" ? quizState.currentQuestion : quizState.currentQuestion + 100
  );

  const getTimeColor = () => {
    if (quizState.timeRemaining < 300) return "text-[#ef4444]";
    if (quizState.timeRemaining < 600) return "text-[#f59e0b]";
    return "text-[#1e293b]";
  };

  const getCurrentLanguage = (): ProgrammingLanguage => {
    return quizState.selectedLanguages[quizState.currentQuestion] || "python";
  };

  const getCurrentCodeTemplate = (): string => {
    const lang = getCurrentLanguage();
    return languageTemplates[lang];
  };

  const handleLanguageChange = (lang: ProgrammingLanguage) => {
    setQuizState((prev) => {
      const newCodeAnswers = { ...prev.codeAnswers };
      const currentCode = prev.codeAnswers[prev.currentQuestion];
      
      // Only reset code if it's the default template for the current language
      const currentLang = prev.selectedLanguages[prev.currentQuestion] || "python";
      if (currentCode === languageTemplates[currentLang as ProgrammingLanguage]) {
        newCodeAnswers[prev.currentQuestion] = languageTemplates[lang];
      }
      
      return {
        ...prev,
        selectedLanguages: {
          ...prev.selectedLanguages,
          [prev.currentQuestion]: lang,
        },
        codeAnswers: newCodeAnswers,
      };
    });
  };

  /* ================= RENDER ================= */
  const fetchMocktest = async () => {
  try {
    const res = await MockTestApis.getMockTest(testId!);
    const mock = res.data; // It's a single mock test object
    const formattedQuestions = mock.questions.map((ques: any) => ({
      id: ques.question._id,
      question: ques.question.title,
      options: ques.question.options.map((op: any) => op.text),
      multiSelect: ques.question.multiSelect,
      type: ques.question.type,
      marks: ques.marks
    }));

    const formattedMock = {
      ...mock,
      questions: formattedQuestions
    };
    setQuizState({...quizState,timeRemaining:(res?.data?.duration || 0) * 60})
    setMockTest(formattedMock);
  } catch (error) {
    console.log(error);
  }
};

  useEffect(()=>{
    if(testId){
      fetchMocktest()
    }
  },[testId])

  // Check if student has already submitted the test
  useEffect(() => {
    const checkExistingSubmission = async () => {
      if (!testId || !user?._id) return;
      
      setIsLoadingSubmission(true);
      try {
        const submissions = await MockTestSubmissionApis.getSubmissionsByStudent(user._id);
        const allSubmissions = Array.isArray(submissions) ? submissions : [];
        
        // Find if there's a submission for this specific mock test
        const existing = allSubmissions.find((sub: any) => 
          sub.mockTest === testId && sub.status === 'submitted'
        );
        
        if (existing) {
          setAlreadySubmitted(true);
          setExistingSubmission(existing);
        }
      } catch (error) {
        console.error("Error checking existing submission:", error);
      } finally {
        setIsLoadingSubmission(false);
      }
    };

    checkExistingSubmission();
  }, [testId, user?._id]);

  const runUserCode = async () => {
    const currentLang = getCurrentLanguage();
    const currentTestCases = quizState.testCases[quizState.currentQuestion] || [];
    const langName = languageOptions.find((opt) => opt.value === currentLang)?.label || currentLang;
    
    let output = "";
    const results: Array<{ input: string; expected: string; actual: string; passed: boolean }> = [];

    const userCode = quizState.codeAnswers[quizState.currentQuestion] || "";

    // JavaScript can be executed in the browser
    if (currentLang === "javascript") {
      const originalLog = console.log;
      const originalError = console.error;
      const originalWarn = console.warn;

      try {
        console.log = (...args) => {
          output += args.map(String).join(" ") + "\n";
        };
        console.error = (...args) => {
          output += "❌ " + args.map(String).join(" ") + "\n";
        };
        console.warn = (...args) => {
          output += "⚠️ " + args.map(String).join(" ") + "\n";
        };

        // Run test cases if provided
        if (currentTestCases.length > 0) {
          for (const testCase of currentTestCases) {
            try {
              // Create a function from user code
              const fn = new Function(userCode);
              
              // Execute with test input
              const actual = JSON.stringify(fn(eval(testCase.input)));
              const expected = testCase.expected;
              const passed = actual === expected;
              
              results.push({
                input: testCase.input,
                expected,
                actual,
                passed,
              });
            } catch (err: any) {
              results.push({
                input: testCase.input,
                expected: testCase.expected,
                actual: `Error: ${err.message}`,
                passed: false,
              });
            }
          }
          
          const passedCount = results.filter((r) => r.passed).length;
          const failedCount = results.length - passedCount;
          
          setTestResults({
            passed: passedCount,
            failed: failedCount,
            results,
          });
          
          output = `🧪 Test Results (${langName}):\n`;
          output += `✅ Passed: ${passedCount}/${results.length}\n`;
          output += `❌ Failed: ${failedCount}/${results.length}\n\n`;
        } else {
          // Run raw JS code without test cases
          const fn = new Function(userCode);
          const result = fn();

          // If user returned something explicitly
          if (result !== undefined) {
            output += "↩ Returned: " + JSON.stringify(result) + "\n";
          }

          setTestResults(null);
        }

        setCodeOutput(output || "✅ Code executed successfully (no output)");
      } catch (err: any) {
        setCodeOutput("❌ Runtime Error:\n" + err.message);
        setTestResults(null);
      } finally {
        console.log = originalLog;
        console.error = originalError;
        console.warn = originalWarn;
      }
    } else {
      // Use Piston API for other languages
      try {
        const pistonLang = pistonLanguageMap[currentLang];
        
        if (!pistonLang) {
          throw new Error(`Language ${currentLang} is not supported by Piston API`);
        }

        if (currentTestCases.length > 0) {
          // Run with test cases
          for (const testCase of currentTestCases) {
            try {
              // Prepare code with test case input
              let codeToExecute = userCode;
              
              // Add test execution code at the end
              if (currentLang === "python") {
                codeToExecute += `\n\n# Test execution\nimport json\ntry:\n    input_data = ${testCase.input}\n    result = solution(input_data)\n    print(json.dumps(result))\nexcept Exception as e:\n    print(f"Error: {str(e)}")`;
              } else if (currentLang === "java") {
                codeToExecute += `\n\npublic class Main {\n    public static void main(String[] args) {\n        try {\n            Object input = ${testCase.input};\n            Object result = Solution.solution(input);\n            System.out.println(result);\n        } catch (Exception e) {\n            System.out.println("Error: " + e.getMessage());\n        }\n    }\n}`;
              } else if (currentLang === "cpp") {
                codeToExecute += `\n\nint main() {\n    try {\n        Object input = ${testCase.input};\n        Object result = solution(input);\n        std::cout << result << std::endl;\n    } catch (const std::exception& e) {\n        std::cout << "Error: " << e.what() << std::endl;\n    }\n    return 0;\n}`;
              } else if (currentLang === "csharp") {
                codeToExecute += `\n\npublic class Program {\n    public static void Main(string[] args) {\n        try {\n            var input = ${testCase.input};\n            var result = Solution.SolutionMethod(input);\n            Console.WriteLine(result);\n        } catch (Exception e) {\n            Console.WriteLine("Error: " + e.Message);\n        }\n    }\n}`;
              } else if (currentLang === "go") {
                codeToExecute += `\n\nfunc main() {\n    input := ${testCase.input}\n    result := solution(input)\n    fmt.Println(result)\n}`;
              } else if (currentLang === "rust") {
                codeToExecute += `\n\nfn main() {\n    let input = "${testCase.input}";\n    let result = solution(&input);\n    println!("{}", result);\n}`;
              } else if (currentLang === "php") {
                codeToExecute += `\n\n$input = ${testCase.input};\n$result = solution($input);\necho $result;`;
              } else if (currentLang === "ruby") {
                codeToExecute += `\n\ninput = ${testCase.input}\nresult = solution(input)\nputs result`;
              } else if (currentLang === "typescript") {
                codeToExecute += `\n\n// Test execution\nconst input = ${testCase.input};\nconst result = solution(input);\nconsole.log(JSON.stringify(result));`;
              }

              const response = await fetch(PISTON_API_URL, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  language: pistonLang.language,
                  version: pistonLang.version,
                  files: [
                    {
                      content: codeToExecute,
                    },
                  ],
                }),
              });

              if (!response.ok) {
                throw new Error(`Piston API error: ${response.status}`);
              }

              const data = await response.json();
              const actual = data.run?.output?.trim() || "No output";
              const expected = testCase.expected;
              const passed = actual === expected;

              results.push({
                input: testCase.input,
                expected,
                actual,
                passed,
              });
            } catch (err: any) {
              results.push({
                input: testCase.input,
                expected: testCase.expected,
                actual: `Error: ${err.message}`,
                passed: false,
              });
            }
          }

          const passedCount = results.filter((r) => r.passed).length;
          const failedCount = results.length - passedCount;

          setTestResults({
            passed: passedCount,
            failed: failedCount,
            results,
          });

          output = `🧪 Test Results (${langName}):\n`;
          output += `✅ Passed: ${passedCount}/${results.length}\n`;
          output += `❌ Failed: ${failedCount}/${results.length}\n\n`;
          output += `📊 Executed via Piston API\n`;
        } else {
          // Run code without test cases
          const response = await fetch(PISTON_API_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              language: pistonLang.language,
              version: pistonLang.version,
              files: [
                {
                  content: userCode,
                },
              ],
            }),
          });

          if (!response.ok) {
            throw new Error(`Piston API error: ${response.status}`);
          }

          const data = await response.json();
          output = data.run?.output || "✅ Code executed successfully (no output)";

          setTestResults(null);
        }

        setCodeOutput(output || "✅ Code executed successfully (no output)");
      } catch (err: any) {
        setCodeOutput("❌ Execution Error:\n" + err.message);
        setTestResults(null);
      }
    }
  };

  /* ================= SUBMIT HANDLER ================= */

  const handleSubmitTest = async () => {
    setIsSubmitting(true);
    try {
      // Prepare answers array matching backend schema
      const answers: Array<{
        questionId: string;
        selectedOptionIndexs?: number[];
        code?: string;
        language?: string;
        marksObtained: number;
      }> = [];

      let totalScore = 0;
      let totalMarks = 0;

      // Process MCQ questions
      const mcqQuestions = mockTest?.questions.filter(q => q.type === "mcq") || [];
      
      mcqQuestions.forEach((q, idx) => {
        const mcqIdx = mockTest?.questions.filter(qq => qq.type === "mcq").indexOf(q);
        const selectedAnswer = quizState.selectedAnswers[mcqIdx!];
        const marks = q.marks || 1;
        totalMarks += marks;
        
        // For now, we'll assume correct answers are stored in the question
        // In a real app, you'd have the correct answers from the backend
        const marksObtained = selectedAnswer && selectedAnswer.length > 0 ? marks : 0;
        totalScore += marksObtained;

        answers.push({
          questionId: q.id,
          selectedOptionIndexs: selectedAnswer || [],
          marksObtained,
        });
      });

      // Calculate scores for Coding questions
      const codingQuestions = mockTest?.questions.filter(q => q.type === "coding") || [];
      
      codingQuestions.forEach(async(q, idx) => {
        const codingIdx = mockTest?.questions.filter(qq => qq.type === "coding").indexOf(q);
        const codeAnswer = quizState.codeAnswers[codingIdx!];
        const testCases = quizState.testCases[codingIdx!] || [];
        const marks = q.marks || 1;
        totalMarks += marks;
        
        let marksObtained = 0;
        
        if (codeAnswer && codeAnswer.trim() !== "") {
          // Run test cases to calculate score
          let passedCount = 0;
          const currentLang = quizState.selectedLanguages[codingIdx!] || "python";
          
          if (testCases.length > 0) {
            for (const testCase of testCases) {
              try {
                const pistonLang = pistonLanguageMap[currentLang];
                let codeToExecute = codeAnswer;
                
                // Prepare code with test case
                if (currentLang === "python") {
                  codeToExecute += `\n\nimport json\ntry:\n    input_data = ${testCase.input}\n    result = solution(input_data)\n    print(json.dumps(result))\nexcept Exception as e:\n    print(f"Error: {str(e)}")`;
                } else if (currentLang === "javascript") {
                  codeToExecute += `\n\nconst input = ${testCase.input};\nconst result = solution(input);\nconsole.log(JSON.stringify(result));`;
                } else if (currentLang === "java") {
                  codeToExecute += `\n\npublic class Main {\n    public static void main(String[] args) {\n        try {\n            Object input = ${testCase.input};\n            Object result = Solution.solution(input);\n            System.out.println(result);\n        } catch (Exception e) {\n            System.out.println("Error: " + e.getMessage());\n        }\n    }\n}`;
                } else if (currentLang === "cpp") {
                  codeToExecute += `\n\nint main() {\n    try {\n        Object input = ${testCase.input};\n        Object result = solution(input);\n        std::cout << result << std::endl;\n    } catch (const std::exception& e) {\n        std::cout << "Error: " << e.what() << std::endl;\n    }\n    return 0;\n}`;
                } else if (currentLang === "csharp") {
                  codeToExecute += `\n\npublic class Program {\n    public static void Main(string[] args) {\n        try {\n            var input = ${testCase.input};\n            var result = Solution.SolutionMethod(input);\n            Console.WriteLine(result);\n        } catch (Exception e) {\n            Console.WriteLine("Error: " + e.Message);\n        }\n    }\n}`;
                } else if (currentLang === "go") {
                  codeToExecute += `\n\nfunc main() {\n    input := ${testCase.input}\n    result := solution(input)\n    fmt.Println(result)\n}`;
                } else if (currentLang === "rust") {
                  codeToExecute += `\n\nfn main() {\n    let input = "${testCase.input}";\n    let result = solution(&input);\n    println!("{}", result);\n}`;
                } else if (currentLang === "php") {
                  codeToExecute += `\n\n$input = ${testCase.input};\n$result = solution($input);\necho $result;`;
                } else if (currentLang === "ruby") {
                  codeToExecute += `\n\ninput = ${testCase.input}\nresult = solution(input)\nputs result`;
                } else if (currentLang === "typescript") {
                  codeToExecute += `\n\nconst input = ${testCase.input};\nconst result = solution(input);\nconsole.log(JSON.stringify(result));`;
                }

                const response = await fetch(PISTON_API_URL, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    language: pistonLang.language,
                    version: pistonLang.version,
                    files: [{ content: codeToExecute }],
                  }),
                });

                if (response.ok) {
                  const data = await response.json();
                  const actual = data.run?.output?.trim() || "";
                  if (actual === testCase.expected) {
                    passedCount++;
                  }
                }
              } catch (err) {
                console.error("Test case execution error:", err);
              }
            }
            
            // Calculate score based on passed test cases
            const scorePerTest = marks / testCases.length;
            marksObtained = passedCount * scorePerTest;
          } else {
            // No test cases defined, give partial credit for attempting
            marksObtained = marks * 0.5;
          }
        }
        
        totalScore += marksObtained;

        answers.push({
          questionId: q.id,
          code: codeAnswer,
          language: quizState.selectedLanguages[codingIdx!] || "python",
          marksObtained,
        });
      });

      const percentage = totalMarks > 0 ? (totalScore / totalMarks) * 100 : 0;

      // Prepare submission data matching backend schema
      const submissionData = {
        mockTest: testId,
        student: user?._id,
        answers: answers,
        totalScore: totalScore,
        status: "submitted",
        submittedAt: new Date(),
      };

      // Submit to backend
      const response = await MockTestSubmissionApis.createMockTestSubmission(submissionData);

      setSubmitResult({
        score: totalScore,
        totalMarks: totalMarks,
        passed: Math.round(percentage),
        failed: Math.round(100 - percentage),
      });

      setShowSubmitModal(true);
    } catch (error) {
      console.error("Error submitting test:", error);
      alert("Failed to submit test. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveProgress = async () => {
    try {
      // Prepare answers array matching backend schema
      const answers: Array<{
        questionId: string;
        selectedOptionIndexs?: number[];
        code?: string;
        language?: string;
        marksObtained: number;
      }> = [];

      // Process MCQ questions
      const mcqQuestions = mockTest?.questions.filter(q => q.type === "mcq") || [];
      mcqQuestions.forEach((q, idx) => {
        const mcqIdx = mockTest?.questions.filter(qq => qq.type === "mcq").indexOf(q);
        const selectedAnswer = quizState.selectedAnswers[mcqIdx!];

        answers.push({
          questionId: q.id,
          selectedOptionIndexs: selectedAnswer || [],
          marksObtained: 0, // Will be calculated on submission
        });
      });

      // Process Coding questions
      const codingQuestions = mockTest?.questions.filter(q => q.type === "coding") || [];
      codingQuestions.forEach((q, idx) => {
        const codingIdx = mockTest?.questions.filter(qq => qq.type === "coding").indexOf(q);
        const codeAnswer = quizState.codeAnswers[codingIdx!];

        answers.push({
          questionId: q.id,
          code: codeAnswer,
          language: quizState.selectedLanguages[codingIdx!] || "python",
          marksObtained: 0, // Will be calculated on submission
        });
      });

      // Prepare progress data matching backend schema
      const progressData = {
        mockTest: testId,
        student: user?._id,
        answers: answers,
        status: "in-progress",
      };

      await MockTestSubmissionApis.createMockTestSubmission(progressData);
      alert("Progress saved successfully!");
    } catch (error) {
      console.error("Error saving progress:", error);
      alert("Failed to save progress. Please try again.");
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-6 bg-[#f8fafc] font-['DM_Sans']">
      {/* Show loading state while checking submission status */}
      {isLoadingSubmission ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#64748b]">Loading test...</p>
          </div>
        </div>
      ) : alreadySubmitted ? (
        /* Show already submitted message */
        <div className="max-w-2xl mx-auto mt-10">
          <div className="bg-white rounded-2xl border-2 border-[#f59e0b] shadow-[0_20px_25px_-5px_rgba(15,23,42,0.1),0_8px_10px_-6px_rgba(15,23,42,0.1)] overflow-hidden">
            <div className="bg-gradient-to-r from-[#f59e0b] to-[#d97706] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Already Submitted</h2>
                  <p className="text-amber-100 text-sm">You have already completed this test</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Test Info */}
              <div className="bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0]">
                <h3 className="font-semibold text-[#1e293b] mb-2">{mockTest?.title}</h3>
                <p className="text-sm text-[#64748b]">{mockTest?.description}</p>
              </div>

              {/* Score Display */}
              {existingSubmission && (
                <div className="bg-gradient-to-br from-[#ecfdf5] to-[#d1fae5] rounded-xl p-6 border border-[#10b981]">
                  <div className="text-center">
                    <p className="text-sm font-medium text-[#047857] mb-2">Your Score</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-4xl font-bold text-[#047857]">
                        {existingSubmission.totalScore || 0}
                      </span>
                      <span className="text-2xl text-[#047857]/70">/ {mockTest?.totalMarks || 0}</span>
                    </div>
                    <p className="text-sm text-[#047857]/80 mt-2">
                      {existingSubmission.totalScore && mockTest?.totalMarks 
                        ? `${Math.round((existingSubmission.totalScore / mockTest.totalMarks) * 100)}%`
                        : '0%'}
                    </p>
                  </div>
                </div>
              )}

              {/* Submission Info */}
              {existingSubmission?.submittedAt && (
                <div className="flex items-center gap-2 text-sm text-[#64748b]">
                  <ClockIcon className="w-4 h-4" />
                  <span>Submitted on: {new Date(existingSubmission.submittedAt).toLocaleString()}</span>
                </div>
              )}

              {/* Info Message */}
              <div className="bg-[#eff6ff] rounded-xl p-4 border border-[#3b82f6]">
                <div className="flex items-start gap-3">
                  <DocumentTextIcon className="w-5 h-5 text-[#3b82f6] mt-0.5" />
                  <div>
                    <p className="text-sm text-[#1e3a8a]">
                      <strong>Note:</strong> You can only attempt this test once. If you have any questions about your results, please contact your instructor.
                    </p>
                  </div>
                </div>
              </div>

              {/* Back Button */}
              <button
                onClick={() => window.history.back()}
                className="w-full px-6 py-3 bg-[#3b82f6] text-white rounded-xl font-semibold hover:bg-[#2563eb] transition-all duration-200 flex items-center justify-center gap-2"
              >
                <ChevronLeftIcon className="w-5 h-5" />
                Go Back
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
      {/* HEADER */}
      <header className="bg-[#ffffff] rounded-xl border border-[#e2e8f0] shadow-[0_10px_15px_-3px_rgba(15,23,42,0.08),0_4px_6px_-4px_rgba(15,23,42,0.04)] p-4 lg:p-6 mb-4 lg:mb-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          {/* Left: Test Info */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-[#3b82f6]/10">
              <AcademicCapIcon className="w-6 h-6 text-[#3b82f6]" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-[#1e293b]">
                {mockTest?.title}
              </h1>
              <p className="text-sm mt-1 max-w-xl text-[#64748b]">
                {mockTest?.description}
              </p>
            </div>
          </div>

          {/* Right: Timer & User */}
          <div className="flex items-center gap-4 lg:gap-6">
            {/* Timer */}
            <div className="bg-[#ffffff] rounded-lg border border-[#e2e8f0] shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] px-4 py-2.5 flex items-center gap-3">
              <ClockIcon className={`w-5 h-5 ${getTimeColor()} ${quizState.timeRemaining < 300 ? 'animate-pulse' : ''}`} />
              <span className={`font-['JetBrains_Mono'] font-semibold text-lg ${getTimeColor()}`}>
                {hours > 0 && `${hours.toString().padStart(2, "0")}:`}
                {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
              </span>
            </div>

            {/* Progress */}
            <div className="hidden sm:flex items-center gap-2 text-sm text-[#64748b]">
              <CheckCircleIcon className="w-5 h-5 text-[#16a34a]" />
              <span>
                <span className="font-semibold text-[#1e293b]">{totalAnswered}</span>
                /{mockTest?.questions.length} answered
              </span>
            </div>

            {/* User Avatar */}
            {/* <div className="flex items-center gap-3 pl-4 border-l border-[#e2e8f0]">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#334155]">
                <UserCircleIcon className="w-6 h-6 text-[#f8fafc]" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-[#1e293b]">Jo</p>
                <p className="text-xs text-[#64748b]">Candidate</p>
              </div>
            </div> */}
            {user && <Avatar name={user?.name!} email={user?.email!}/>}
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-[#e2e8f0]">
          <button
            onClick={() => {
              setActiveTab("mcq");
              setQuizState((p) => ({ ...p, currentQuestion: 0 }));
            }}
            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
              activeTab === "mcq"
                ? "bg-[#3b82f6] text-[#ffffff] shadow-[0_2px_8px_0_rgba(59,130,246,0.25)]"
                : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0] hover:text-[#1e293b]"
            }`}
          >
            <ListBulletIcon className="w-5 h-5" />
            <span>Multiple Choice</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-[#ffffff]/50">
              {mockTest?.questions.filter((q) => q.type === "mcq").length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("coding");
              setQuizState((p) => ({ ...p, currentQuestion: 0 }));
            }}
            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
              activeTab === "coding"
                ? "bg-[#3b82f6] text-[#ffffff] shadow-[0_2px_8px_0_rgba(59,130,246,0.25)]"
                : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0] hover:text-[#1e293b]"
            }`}
          >
            <CodeBracketIcon className="w-5 h-5" />
            <span>Coding</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-[#ffffff]/50">
              {mockTest?.questions.filter((q) => q.type === "coding").length}
            </span>
          </button>
        </div>
      </header>

      {/* MAIN BODY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* QUESTION PANEL */}
        <div className="lg:col-span-4 xl:col-span-3 bg-[#ffffff] rounded-xl border border-[#e2e8f0] shadow-[0_10px_15px_-3px_rgba(15,23,42,0.08),0_4px_6px_-4px_rgba(15,23,42,0.04)] p-5 h-fit lg:sticky lg:top-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2 text-[#1e293b]">
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold bg-[#3b82f6]/10 text-[#3b82f6]">
                {quizState.currentQuestion + 1}
              </span>
              Question {quizState.currentQuestion + 1}
            </h2>
            <button
              onClick={toggleBookmark}
              className="p-2 rounded-lg transition-colors hover:bg-[#f1f5f9]"
              title={isBookmarked ? "Remove bookmark" : "Bookmark question"}
            >
              {isBookmarked ? (
                <BookmarkSolidIcon className="w-5 h-5 text-[#f59e0b]" />
              ) : (
                <BookmarkIcon className="w-5 h-5 text-[#64748b]" />
              )}
            </button>
          </div>

          {currentQuestion ? (
            <>
              {/* Question Details */}
              <div className="mb-4 space-y-2">
                {/* Question Type Badge */}
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    currentQuestion.type === "mcq"
                      ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200"
                      : "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border border-purple-200"
                  }`}>
                    {currentQuestion.type === "mcq" ? (
                      <>
                        <ListBulletIcon className="w-3.5 h-3.5" />
                        MCQ
                      </>
                    ) : (
                      <>
                        <CodeBracketIcon className="w-3.5 h-3.5" />
                        Coding
                      </>
                    )}
                  </span>
                  
                  {/* Marks Badge */}
                  {currentQuestion.marks && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border border-amber-200">
                      <TrophyIcon className="w-3.5 h-3.5" />
                      {currentQuestion.marks} {currentQuestion.marks === 1 ? 'Mark' : 'Marks'}
                    </span>
                  )}
                </div>

                {/* Multi Select Indicator */}
                {currentQuestion.multiSelect && (
                  <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-[#3b82f6]/10 text-[#3b82f6]">
                    <CheckCircleIcon className="w-4 h-4" />
                    <span className="font-medium">Multiple answers allowed</span>
                  </div>
                )}
              </div>

              {/* Question Content */}
              <div
                className="prose prose-sm max-w-none mb-4"
                dangerouslySetInnerHTML={{ __html: currentQuestion.question }}
              />

              {/* Additional Question Info */}
              {currentQuestion.type === "mcq" && (
                <div className="mt-4 p-3 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]">
                  <div className="flex items-center gap-2 text-xs text-[#64748b] mb-2">
                    <DocumentTextIcon className="w-4 h-4" />
                    <span className="font-medium">Question Details</span>
                  </div>
                  <div className="space-y-1 text-xs text-[#64748b]">
                    <div className="flex justify-between">
                      <span>Options:</span>
                      <span className="font-medium text-[#1e293b]">{currentQuestion.options.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="font-medium text-[#1e293b]">{currentQuestion.multiSelect ? "Multiple Select" : "Single Select"}</span>
                    </div>
                  </div>
                </div>
              )}

              {currentQuestion.type === "coding" && (
                <div className="mt-4 p-3 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]">
                  <div className="flex items-center gap-2 text-xs text-[#64748b] mb-2">
                    <CodeBracketIcon className="w-4 h-4" />
                    <span className="font-medium">Question Details</span>
                  </div>
                  <div className="space-y-1 text-xs text-[#64748b]">
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="font-medium text-[#1e293b]">Coding Problem</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Test Cases:</span>
                      <span className="font-medium text-[#1e293b]">{(quizState.testCases[quizState.currentQuestion] || []).length} defined</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-[#64748b]">No question available</p>
          )}
        </div>

        {/* ANSWER PANEL */}
        <div className="lg:col-span-6 xl:col-span-7 bg-[#ffffff] rounded-xl border border-[#e2e8f0] shadow-[0_10px_15px_-3px_rgba(15,23,42,0.08),0_4px_6px_-4px_rgba(15,23,42,0.04)] p-5 min-h-[60vh]">
          {currentQuestion ? (
            <>
              {currentQuestion.type === "mcq" && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium mb-4 text-[#64748b]">
                    Select {currentQuestion.multiSelect ? "all that apply" : "one answer"}:
                  </h3>
                  {currentQuestion.options.map((opt, idx) => {
                    const selected = quizState.selectedAnswers[quizState.currentQuestion]?.includes(idx);

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setQuizState((prev) => ({
                            ...prev,
                            selectedAnswers: {
                              ...prev.selectedAnswers,
                              [prev.currentQuestion]: currentQuestion.multiSelect
                                ? selected
                                  ? prev.selectedAnswers[prev.currentQuestion].filter((i) => i !== idx)
                                  : [...(prev.selectedAnswers[prev.currentQuestion] || []), idx]
                                : [idx],
                            },
                          }));
                        }}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-start gap-3 ${
                          selected
                            ? "border-[#3b82f6] bg-[#3b82f6]/10"
                            : "border-[#e2e8f0] bg-[#ffffff] hover:border-[#3b82f6]/50 hover:bg-[#3b82f6]/5"
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                            selected
                              ? "border-[#3b82f6] bg-[#3b82f6]"
                              : "border-[#64748b]/30 bg-transparent"
                          }`}
                        >
                          {selected && <CheckCircleSolidIcon className="w-4 h-4 text-[#ffffff]" />}
                        </span>
                        <span className="flex-1 text-[#1e293b]">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {currentQuestion.type === "coding" && (
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-[#64748b]">
                      Write your solution:
                    </h3>
                    <div className="flex items-center gap-3">
                      {/* Language Selector */}
                      <div className="relative">
                        <select
                          value={getCurrentLanguage()}
                          onChange={(e) => handleLanguageChange(e.target.value as ProgrammingLanguage)}
                          className="appearance-none bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-4 py-2 pr-10 text-sm font-medium text-[#1e293b] hover:border-[#3b82f6] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] cursor-pointer transition-all duration-200"
                        >
                          {languageOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.icon} {opt.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b] pointer-events-none" />
                      </div>
                      
                      <button
                        onClick={() => {
                          setQuizState((prev) => ({
                            ...prev,
                            codeAnswers: {
                              ...prev.codeAnswers,
                              [prev.currentQuestion]: getCurrentCodeTemplate(),
                            },
                          }));
                        }}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm bg-transparent text-[#1e293b] hover:bg-[#f1f5f9] transition-all duration-200"
                      >
                        <ArrowPathIcon className="w-4 h-4" />
                        Reset Code
                      </button>
                      <button
                        onClick={runUserCode}
                        className="px-4 py-2 rounded-lg bg-[#3b82f6] text-white font-medium hover:opacity-90 transition-all duration-200"
                      >
                        ▶ Run Code
                      </button>
                    </div>
                  </div>
                  
                  {/* Language Info Banner */}
                  <div className="mb-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3b82f6]/10 text-[#3b82f6]">
                    <CodeBracketIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {languageOptions.find((opt) => opt.value === getCurrentLanguage())?.label}
                    </span>
                    <span className="text-xs text-[#64748b] ml-auto">
                      ✅ Piston API execution
                    </span>
                  </div>
                  
                  <div className="rounded-lg min-h-[400px] border border-[#e2e8f0] overflow-hidden">
                    <Editor
                      height="600px"
                      language={getCurrentLanguage()}
                      value={quizState.codeAnswers[quizState.currentQuestion] || getCurrentCodeTemplate()}
                      theme="vs-dark"
                      onChange={(value) =>
                        setQuizState((prev) => ({
                          ...prev,
                          codeAnswers: {
                            ...prev.codeAnswers,
                            [prev.currentQuestion]: value || "",
                          },
                        }))
                      }
                      options={{
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', monospace",
                        minimap: { enabled: false },
                        padding: { top: 16, bottom: 16 },
                        lineNumbers: "on",
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                      }}
                    />
                  </div>
                  {codeOutput && (
                    <div className="mt-4 bg-black text-green-400 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap">
                      {codeOutput}
                    </div>
                  )}

                  {/* Test Cases Section */}
                  <div className="mt-6 border-t border-[#e2e8f0] pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-[#64748b]">
                        Test Cases
                      </h3>
                      <button
                        onClick={() => {
                          setQuizState((prev) => {
                            const currentTestCases = prev.testCases[prev.currentQuestion] || [];
                            return {
                              ...prev,
                              testCases: {
                                ...prev.testCases,
                                [prev.currentQuestion]: [...currentTestCases, { input: "", expected: "" }],
                              },
                            };
                          });
                        }}
                        className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg font-medium text-xs bg-[#3b82f6] text-white hover:bg-[#2563eb] transition-all duration-200"
                      >
                        + Add Test Case
                      </button>
                    </div>

                    {(quizState.testCases[quizState.currentQuestion] || []).map((testCase, idx) => (
                      <div key={idx} className="mb-3 p-4 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-[#1e293b]">Test Case {idx + 1}</span>
                          <button
                            onClick={() => {
                              setQuizState((prev) => {
                                const currentTestCases = prev.testCases[prev.currentQuestion] || [];
                                return {
                                  ...prev,
                                  testCases: {
                                    ...prev.testCases,
                                    [prev.currentQuestion]: currentTestCases.filter((_, i) => i !== idx),
                                  },
                                };
                              });
                            }}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-[#64748b] mb-1">Input Value</label>
                            <input
                              type="text"
                              value={testCase.input}
                              onChange={(e) => {
                                setQuizState((prev) => {
                                  const currentTestCases = prev.testCases[prev.currentQuestion] || [];
                                  return {
                                    ...prev,
                                    testCases: {
                                      ...prev.testCases,
                                      [prev.currentQuestion]: currentTestCases.map((tc, i) =>
                                        i === idx ? { ...tc, input: e.target.value } : tc
                                      ),
                                    },
                                  };
                                });
                              }}
                              placeholder='e.g., 5 or [1, 2, 3]'
                              className="w-full px-3 py-2 rounded-lg border border-[#e2e8f0] text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[#64748b] mb-1">Expected Output</label>
                            <input
                              type="text"
                              value={testCase.expected}
                              onChange={(e) => {
                                setQuizState((prev) => {
                                  const currentTestCases = prev.testCases[prev.currentQuestion] || [];
                                  return {
                                    ...prev,
                                    testCases: {
                                      ...prev.testCases,
                                      [prev.currentQuestion]: currentTestCases.map((tc, i) =>
                                        i === idx ? { ...tc, expected: e.target.value } : tc
                                      ),
                                    },
                                  };
                                });
                              }}
                              placeholder='e.g., [1, 2, "Fizz", 4, "Buzz"]'
                              className="w-full px-3 py-2 rounded-lg border border-[#e2e8f0] text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Test Results Display */}
                    {testResults && (
                      <div className="mt-4">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[#64748b]">Results:</span>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              ✅ {testResults.passed} Passed
                            </span>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              ❌ {testResults.failed} Failed
                            </span>
                          </div>
                        </div>
                        {testResults.results.map((result, idx) => (
                          <div
                            key={idx}
                            className={`mb-2 p-3 rounded-lg border ${
                              result.passed
                                ? "bg-green-50 border-green-200"
                                : "bg-red-50 border-red-200"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span className="mt-0.5">{result.passed ? "✅" : "❌"}</span>
                              <div className="flex-1 text-sm">
                                <div className="font-medium text-[#1e293b] mb-1">Test Case {idx + 1}</div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <span className="text-[#64748b]">Input:</span>
                                    <code className="ml-1 bg-white px-1 rounded">{result.input}</code>
                                  </div>
                                  <div>
                                    <span className="text-[#64748b]">Expected:</span>
                                    <code className="ml-1 bg-white px-1 rounded">{result.expected}</code>
                                  </div>
                                  <div className="col-span-2">
                                    <span className="text-[#64748b]">Actual:</span>
                                    <code className={`ml-1 px-1 rounded ${result.passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                      {result.actual}
                                    </code>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )}
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-[#64748b]">
              <p>No question available</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#e2e8f0]">
            <button
              onClick={() =>
                setQuizState((p) => ({
                  ...p,
                  currentQuestion: Math.max(0, p.currentQuestion - 1),
                }))
              }
              disabled={quizState.currentQuestion === 0}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm bg-transparent text-[#1e293b] hover:bg-[#f1f5f9] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronLeftIcon className="w-5 h-5" />
              Previous
            </button>

            <span className="text-sm text-[#64748b]">
              {quizState.currentQuestion + 1} of {filteredQuestions.length}
            </span>

            <button
              onClick={() =>
                setQuizState((p) => ({
                  ...p,
                  currentQuestion: Math.min(filteredQuestions.length - 1, p.currentQuestion + 1),
                }))
              }
              disabled={quizState.currentQuestion === filteredQuestions.length - 1}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm bg-gradient-to-r from-[#3b82f6] to-[#6366f1] text-[#ffffff] hover:opacity-90 hover:scale-[1.02] shadow-[0_4px_14px_0_rgba(59,130,246,0.35)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Next
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* QUESTION NAVIGATOR */}
        <div className="lg:col-span-2 bg-[#ffffff] rounded-xl border border-[#e2e8f0] shadow-[0_10px_15px_-3px_rgba(15,23,42,0.08),0_4px_6px_-4px_rgba(15,23,42,0.04)] p-5 h-fit lg:sticky lg:top-6">
          <h2 className="font-semibold mb-4 text-[#1e293b]">Navigator</h2>
          <div className="grid grid-cols-5 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {filteredQuestions.map((_, idx) => {
              const answered = isAnswered(idx);
              const isCurrent = quizState.currentQuestion === idx;
              const bookmarkKey = activeTab === "mcq" ? idx : idx + 100;
              const isMarked = quizState.bookmarked.has(bookmarkKey);

              return (
                <button
                  key={idx}
                  onClick={() => setQuizState((p) => ({ ...p, currentQuestion: idx }))}
                  className={`w-10 h-10 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center relative ${
                    isCurrent
                      ? "bg-[#3b82f6] text-[#ffffff] shadow-[0_2px_8px_0_rgba(59,130,246,0.3)]"
                      : answered
                      ? "bg-[#16a34a]/15 text-[#16a34a] border border-[#16a34a]/30"
                      : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]"
                  }`}
                >
                  {idx + 1}
                  {isMarked && (
                    <BookmarkSolidIcon className="w-3 h-3 absolute -top-1 -right-1 text-[#f59e0b]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 space-y-2 text-xs border-t border-[#e2e8f0]">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-[#3b82f6]" />
              <span className="text-[#64748b]">Current</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-[#16a34a]/15 border border-[#16a34a]/30" />
              <span className="text-[#64748b]">Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-[#f1f5f9]" />
              <span className="text-[#64748b]">Not answered</span>
            </div>
            <div className="flex items-center gap-2">
              <BookmarkSolidIcon className="w-4 h-4 text-[#f59e0b]" />
              <span className="text-[#64748b]">Bookmarked</span>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIONS FOOTER */}
      <footer className="bg-[#ffffff] rounded-xl border border-[#e2e8f0] shadow-[0_10px_15px_-3px_rgba(15,23,42,0.08),0_4px_6px_-4px_rgba(15,23,42,0.04)] p-4 mt-4 lg:mt-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#64748b]">
            Make sure to review all questions before submitting.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleSaveProgress}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-[#ffffff] hover:opacity-90 hover:scale-[1.02] shadow-[0_4px_14px_0_rgba(22,163,74,0.35)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <DocumentCheckIcon className="w-5 h-5" />
              Save Progress
            </button>
            <button
              onClick={() => setShowSubmitModal(true)}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm bg-[#ef4444] text-[#ffffff] hover:opacity-90 hover:scale-[1.02] shadow-[0_4px_14px_0_rgba(239,68,68,0.35)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Test
            </button>
          </div>
        </div>
      </footer>

      {/* SUBMIT CONFIRMATION MODAL */}
      {showSubmitModal && !submitResult && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-50 to-amber-100 rounded-full mb-4">
                <DocumentCheckIcon className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Submit Test?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to submit your test? This action cannot be undone.
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Questions Answered</span>
                  <span className="font-semibold text-gray-900">{totalAnswered}/{mockTest?.questions.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Time Remaining</span>
                  <span className="font-semibold text-gray-900">
                    {hours > 0 && `${hours.toString().padStart(2, "0")}:`}
                    {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
                  </span>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg font-medium text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitTest}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 rounded-lg font-medium text-sm bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Test"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBMIT RESULT MODAL */}
      {submitResult && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-full mb-4">
                <TrophyIcon className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Test Submitted!</h3>
              <p className="text-gray-600 mb-6">Your test has been successfully submitted.</p>

              {/* Score Display */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 mb-6">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600 mb-1">Your Score</p>
                  <p className="text-4xl font-bold text-indigo-600">
                    {submitResult.score}/{submitResult.totalMarks}
                  </p>
                  <p className="text-lg font-semibold text-gray-700 mt-1">
                    {Math.round((submitResult.score / submitResult.totalMarks) * 100)}%
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(submitResult.score / submitResult.totalMarks) * 100}%` }}
                  />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="text-xs text-gray-600">Correct</p>
                        <p className="text-lg font-bold text-gray-900">{submitResult.passed}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <XCircleIcon className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="text-xs text-gray-600">Incorrect</p>
                        <p className="text-lg font-bold text-gray-900">{submitResult.failed}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  setSubmitResult(null);
                }}
                className="w-full px-6 py-3 rounded-xl font-medium text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 transition-all shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
};

export default MockTest;