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
import type { IMockTest } from "../types/interfaces";

/* ================= TYPES ================= */


interface QuizState {
  currentQuestion: number;
  selectedAnswers: Record<number, number[]>;
  codeAnswers: Record<number, string>;
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

const defaultCode = `function solution(input) {
  // Write your solution here
  
  return result;
}`;

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
    timeRemaining: 0,
    bookmarked: new Set(),
  });
  const [codeOutput, setCodeOutput] = useState<string>("");

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
    return (quizState.codeAnswers[idx]?.length || 0) > 0 && 
           quizState.codeAnswers[idx] !== defaultCode;
  };

  const totalAnswered = mockTestData.questions.filter((_, idx) => {
    const q = mockTestData.questions[idx];
    if (q.type === "mcq") {
      const mcqIdx = mockTestData.questions.filter(qq => qq.type === "mcq").indexOf(q);
      return (quizState.selectedAnswers[mcqIdx]?.length || 0) > 0;
    } else {
      const codingIdx = mockTestData.questions.filter(qq => qq.type === "coding").indexOf(q);
      return (quizState.codeAnswers[codingIdx]?.length || 0) > 0 && 
             quizState.codeAnswers[codingIdx] !== defaultCode;
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

  const runUserCode = () => {
    let output = "";

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

      const userCode = quizState.codeAnswers[quizState.currentQuestion] || "";

      // Run raw JS code
      const fn = new Function(userCode);
      const result = fn();

      // If user returned something explicitly
      if (result !== undefined) {
        output += "↩ Returned: " + JSON.stringify(result) + "\n";
      }

      setCodeOutput(output || "✅ Code executed successfully (no output)");
    } catch (err: any) {
      setCodeOutput("❌ Runtime Error:\n" + err.message);
    } finally {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-6 bg-[#f8fafc] font-['DM_Sans']">
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
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: currentQuestion.question }}
            />
          ) : (
            <p className="text-[#64748b]">No question available</p>
          )}

          {currentQuestion?.multiSelect && (
            <div className="mt-4 flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-[#3b82f6]/10 text-[#3b82f6]">
              <CheckCircleIcon className="w-4 h-4" />
              Multiple answers allowed
            </div>
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
                <div className=" flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-[#64748b]">
                      Write your solution in JavaScript:
                    </h3>
                    <button
                      onClick={() => {
                        setQuizState((prev) => ({
                          ...prev,
                          codeAnswers: {
                            ...prev.codeAnswers,
                            [prev.currentQuestion]: defaultCode,
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
                      className="px-4 py-2 rounded-lg bg-[#3b82f6] text-white font-medium hover:opacity-90"
                    >
                      ▶ Run Code
                    </button>

                  </div>
                  <div className="rounded-lg min-h-[400px] border border-[#e2e8f0]">
                    <Editor
                      height="600px"
                      defaultLanguage="javascript"
                      value={quizState.codeAnswers[quizState.currentQuestion] || defaultCode}
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
                        padding: { top:16 ,bottom:16},
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
            <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm bg-gradient-to-r from-[#16a34a] to-[#22c55e] text-[#ffffff] hover:opacity-90 hover:scale-[1.02] shadow-[0_4px_14px_0_rgba(22,163,74,0.35)] transition-all duration-200">
              <DocumentCheckIcon className="w-5 h-5" />
              Save Progress
            </button>
            <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm bg-[#ef4444] text-[#ffffff] hover:opacity-90 hover:scale-[1.02] shadow-[0_4px_14px_0_rgba(239,68,68,0.35)] transition-all duration-200">
              Submit Test
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MockTest;