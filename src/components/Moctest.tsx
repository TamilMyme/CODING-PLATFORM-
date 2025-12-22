import React, { useState, useEffect, useCallback } from "react";
import { ClockIcon } from "@heroicons/react/24/outline";
import Avatar from "./UI/Avatar";

// Types
interface Question {
  id: number;
  question: string;
  options: string[];
}

interface QuizState {
  currentQuestion: number;
  selectedAnswers: Record<number, number[]>;
  timeRemaining: number; // in seconds
}

// Mock questions data
const questions: Question[] = [
  {
    id: 1,
    question: "Which of the following is a popular programming language for developing multimedia webpages.",
    options: [
      "Java",
      "Python",
      "JavaScript",
      "C++"
    ]
  },
  {
    id: 2,
    question: "What is the primary purpose of CSS in web development?",
    options: [
      "To structure web pages",
      "To style and layout web pages",
      "To add interactivity",
      "To manage databases"
    ]
  },
  {
    id: 3,
    question: "Which HTML tag is used to create a hyperlink?",
    options: [
      "<link>",
      "<a>",
      "<href>",
      "<url>"
    ]
  },
  {
    id: 4,
    question: "What does API stand for?",
    options: [
      "Application Programming Interface",
      "Advanced Programming Interface",
      "Automated Programming Interface",
      "Application Process Integration"
    ]
  },
  {
    id: 5,
    question: "Which method is used to add an element to the end of an array in JavaScript?",
    options: [
      "push()",
      "add()",
      "append()",
      "insert()"
    ]
  },
  {
    id: 6,
    question: "What is React primarily used for?",
    options: [
      "Backend development",
      "Building user interfaces",
      "Database management",
      "Server configuration"
    ]
  },
  {
    id: 7,
    question: "Which CSS property is used to change the text color?",
    options: [
      "text-color",
      "font-color",
      "color",
      "text-style"
    ]
  },
  {
    id: 8,
    question: "What is the purpose of the useEffect hook in React?",
    options: [
      "To manage component state",
      "To perform side effects",
      "To create components",
      "To handle events"
    ]
  },
  {
    id: 9,
    question: "Which operator is used for strict equality in JavaScript?",
    options: [
      "==",
      "===",
      "=",
      "!="
    ]
  },
  {
    id: 10,
    question: "What does DOM stand for?",
    options: [
      "Document Object Model",
      "Data Object Model",
      "Document Oriented Model",
      "Dynamic Object Management"
    ]
  }
];

const TOTAL_QUESTIONS = questions.length;
const INITIAL_TIME = 14 * 3600 + 44 * 60; // 14:44:00 in seconds

// Timer Component
const Timer: React.FC<{ timeRemaining: number }> = ({ timeRemaining }) => {
  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;

  const formatTime = (value: number): string => {
    return value.toString().padStart(2, "0");
  };

  return (
    <div className="flex items-center gap-1.5 text-gray-700">
      <ClockIcon className="w-4 h-4 md:w-5 md:h-5" />
      <span className="text-xs md:text-sm font-medium">
        Time remaining: {formatTime(hours)}:{formatTime(minutes)}:{formatTime(seconds)}
      </span>
    </div>
  );
};

// Small Progress Circle Component for Mobile Header
interface SmallProgressCircleProps {
  current: number;
  total: number;
}

const SmallProgressCircle: React.FC<SmallProgressCircleProps> = ({ current, total }) => {
  const percentage = (current / total) * 100;
  const radius = 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex items-center gap-1">
      <div className="relative w-5 h-5">
        <svg className="transform -rotate-90 w-5 h-5">
          {/* Background circle */}
          <circle
            cx="10"
            cy="10"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="2"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="10"
            cy="10"
            r={radius}
            stroke="#22c55e"
            strokeWidth="2"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-in-out"
          />
        </svg>
      </div>
      <span className="text-xs font-medium text-gray-700">{current}/{total}</span>
    </div>
  );
};

// Progress Circle Component
interface ProgressCircleProps {
  current: number;
  total: number;
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({ current, total }) => {
  const percentage = (current / total) * 100;
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-24 h-24 md:w-28 md:h-28">
        <svg className="transform -rotate-90 w-24 h-24 md:w-28 md:h-28">
          {/* Background circle */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="6"
            fill="none"
            className="md:stroke-[8]"
          />
          {/* Progress circle */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="#22c55e"
            strokeWidth="6"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-in-out md:stroke-[8]"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg md:text-xl font-bold text-gray-900">{current}</div>
            <div className="text-xs md:text-sm text-gray-500">/{total}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Option Button Component
interface OptionButtonProps {
  label: string;
  option: string;
  isSelected: boolean;
  onSelect: () => void;
}

const OptionButton: React.FC<OptionButtonProps> = ({
  label,
  option,
  isSelected,
  onSelect,
}) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-label={`Option ${label}: ${option}`}
      className={`
        w-full p-2.5 md:p-3 rounded-lg border-2 text-left transition-all duration-200
        ${isSelected
          ? "bg-green-600 border-green-600 text-white"
          : "bg-white border-gray-300 text-gray-900 hover:border-green-400 hover:bg-green-50"
        }
        focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
      `}
    >
      <div className="flex items-center gap-2 md:gap-3">
        <span
          className={`
            w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-semibold text-xs md:text-sm shrink-0
            ${isSelected ? "bg-white text-green-600" : "bg-gray-100 text-gray-700"}
          `}
        >
          {label}
        </span>
        <span className="flex-1 text-sm md:text-base">{option}</span>
      </div>
    </button>
  );
};

// Main Quiz Component
const Moctest: React.FC = () => {
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestion: 0,
    selectedAnswers: {},
    timeRemaining: INITIAL_TIME,
  });

  const currentQuestionData = questions[quizState.currentQuestion];
  const selectedAnswers = quizState.selectedAnswers[quizState.currentQuestion] ?? [];
  const answeredCount = Object.keys(quizState.selectedAnswers).filter(
    (key) => (quizState.selectedAnswers[Number(key)] ?? []).length > 0
  ).length;

  // Timer effect
  useEffect(() => {
    if (quizState.timeRemaining <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setQuizState((prev) => ({
        ...prev,
        timeRemaining: Math.max(0, prev.timeRemaining - 1),
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [quizState.timeRemaining]);

  const handleOptionSelect = useCallback((optionIndex: number) => {
    setQuizState((prev) => {
      const currentSelections = prev.selectedAnswers[prev.currentQuestion] ?? [];
      const isSelected = currentSelections.includes(optionIndex);
      
      return {
        ...prev,
        selectedAnswers: {
          ...prev.selectedAnswers,
          [prev.currentQuestion]: isSelected
            ? currentSelections.filter((idx) => idx !== optionIndex)
            : [...currentSelections, optionIndex],
        },
      };
    });
  }, []);

  const handlePrevious = useCallback(() => {
    setQuizState((prev) => ({
      ...prev,
      currentQuestion: Math.max(0, prev.currentQuestion - 1),
    }));
  }, []);

  const handleNext = useCallback(() => {
    setQuizState((prev) => ({
      ...prev,
      currentQuestion: Math.min(TOTAL_QUESTIONS - 1, prev.currentQuestion + 1),
    }));
  }, []);

  const handleQuestionJump = useCallback((questionIndex: number) => {
    setQuizState((prev) => ({
      ...prev,
      currentQuestion: questionIndex,
    }));
  }, []);

  const handleSubmit = useCallback(() => {
    // Handle quiz submission
    const confirmed = window.confirm(
      `Are you sure you want to submit? You have answered ${answeredCount} out of ${TOTAL_QUESTIONS} questions.
      `
    );
    if (confirmed) {
      // Submit logic here
      console.log("Quiz submitted", quizState.selectedAnswers);
      alert("Quiz submitted successfully! ALL THE BEST FROM SKILLS & BRAINS!");
    }
  }, [answeredCount, quizState.selectedAnswers]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && quizState.currentQuestion > 0) {
        handlePrevious();
      } else if (e.key === "ArrowRight" && quizState.currentQuestion < TOTAL_QUESTIONS - 1) {
        handleNext();
      } else if (e.key >= "1" && e.key <= "4") {
        const optionIndex = parseInt(e.key) - 1;
        if (optionIndex < currentQuestionData.options.length) {
          handleOptionSelect(optionIndex);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [quizState.currentQuestion, handlePrevious, handleNext, handleOptionSelect, currentQuestionData]);

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-white via-green-50 to-green-200 p-2 md:p-4 lg:p-6">
      <div className="h-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-2 md:gap-4">
        {/* Main Quiz Card */}
        <div className="flex-1 bg-white rounded-xl md:rounded-2xl shadow-lg overflow-hidden flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-6">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-3 md:mb-4 pb-2 md:pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">Skills & Brains</div>
                {/* Small Progress Indicator for Mobile */}
                <div className="lg:hidden">
                  <SmallProgressCircle current={answeredCount} total={TOTAL_QUESTIONS} />
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <Avatar
                  name="John Doe"
                  email="john.doe@example.com"
                  size="sm"
                  collapsed={true}
                />
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs md:text-sm font-semibold text-gray-900">John Doe</span>
                  <span className="text-xs text-gray-500">ID: 12345</span>
                </div>
              </div>
            </div>

            {/* Timer & Submit Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3 md:mb-4">
              <Timer timeRemaining={quizState.timeRemaining} />
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full sm:w-auto px-4 md:px-6 py-1.5 md:py-2.5 bg-green-600 text-white text-sm md:text-base font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                aria-label="Submit quiz"
              >
                Submit
              </button>
            </div>

            {/* Question Section */}
            <div className="mb-4 md:mb-6">
              <div className="text-xs md:text-sm font-medium text-gray-600 mb-2 md:mb-3">
                Question {quizState.currentQuestion + 1} of {TOTAL_QUESTIONS}
              </div>
              <h2 className="text-base md:text-lg lg:text-xl font-semibold text-gray-900 mb-3 md:mb-4">
                {currentQuestionData.question}
              </h2>

              {/* Options */}
              <div className="space-y-2 md:space-y-3">
                {currentQuestionData.options.map((option, index) => (
                  <OptionButton
                    key={index}
                    label={String.fromCharCode(65 + index)}
                    option={option}
                    isSelected={selectedAnswers.includes(index)}
                    onSelect={() => handleOptionSelect(index)}
                  />
                ))}
              </div>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-2 md:gap-3">
              {/* Question Number Buttons
              <div className="flex flex-wrap gap-1.5 md:gap-2 justify-center">
                {questions.map((question, index) => {
                  const isAnswered = (quizState.selectedAnswers[index] ?? []).length > 0;
                  const isCurrent = quizState.currentQuestion === index;
                  return (
                    <button
                      key={question.id}
                      type="button"
                      onClick={() => handleQuestionJump(index)}
                      aria-label={`Go to question ${index + 1}`}
                      className={`
                        w-8 h-8 md:w-10 md:h-10 rounded-lg font-medium text-xs md:text-sm transition-all
                        ${isCurrent
                          ? "bg-green-600 text-white ring-2 ring-green-500 ring-offset-1 md:ring-offset-2"
                          : isAnswered
                          ? "bg-green-100 text-green-700 border-2 border-green-300"
                          : "bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200"
                        }
                        focus:outline-none focus:ring-2 focus:ring-green-500
                      `}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div> */}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between gap-2 md:gap-4">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={quizState.currentQuestion === 0}
                  className={`
                    px-4 md:px-6 py-1.5 md:py-2.5 rounded-lg text-sm md:text-base font-medium transition-colors
                    ${quizState.currentQuestion === 0
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }
                    focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                  `}
                  aria-label="Previous question"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={quizState.currentQuestion === TOTAL_QUESTIONS - 1}
                  className={`
                    px-4 md:px-6 py-1.5 md:py-2.5 rounded-lg text-sm md:text-base font-medium transition-colors
                    ${quizState.currentQuestion === TOTAL_QUESTIONS - 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }
                    focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                  `}
                  aria-label="Next question"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Circle Panel - Desktop Right Side Only */}
        <div className="hidden lg:block lg:w-56 xl:w-64 shrink-0">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 flex flex-col items-center h-full lg:h-auto">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Progress</h3>
            <ProgressCircle current={answeredCount} total={TOTAL_QUESTIONS} />
            <div className="mt-3 md:mt-4 text-xs md:text-sm text-gray-600 text-center">
              {answeredCount} of {TOTAL_QUESTIONS} questions answered
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Moctest;
