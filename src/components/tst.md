import React, { useState, useEffect, useCallback } from "react";
import { ClockIcon } from "@heroicons/react/24/outline";
import Avatar from "./UI/Avatar";
import { useAuth } from "../context/AuthProvider";
import { useParams } from "react-router-dom";
import type { IMockTest } from "../types/interfaces";
import MockTestApis from "../apis/MockTestApis";

/* ================= TYPES ================= */

interface Question {
  id: string;
  question: string;
  options: string[];
  multiSelect: boolean;
  type: "mcq" | "coding";
}

interface QuizState {
  currentQuestion: number;
  selectedAnswers: Record<number, number[]>;
  timeRemaining: number;
}

/* ================= TIMER ================= */

const Timer: React.FC<{ timeRemaining: number }> = ({ timeRemaining }) => {
  const h = Math.floor(timeRemaining / 3600);
  const m = Math.floor((timeRemaining % 3600) / 60);
  const s = timeRemaining % 60;

  const fmt = (v: number) => v.toString().padStart(2, "0");

  return (
    <div className="flex items-center gap-1.5 text-gray-700">
      <ClockIcon className="w-4 h-4" />
      <span className="text-sm font-medium">
        Time remaining: {fmt(h)}:{fmt(m)}:{fmt(s)}
      </span>
    </div>
  );
};

/* ================= OPTION BUTTON ================= */

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
}) => (
  <button
    type="button"
    onClick={onSelect}
    className={`w-full p-3 rounded-lg border-2 text-left transition
      ${
        isSelected
          ? "bg-green-600 border-green-600 text-white"
          : "bg-white border-gray-300 hover:border-green-400 hover:bg-green-50"
      }
    `}
  >
    <div className="flex gap-3">
      <span
        className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold
          ${isSelected ? "bg-white text-green-600" : "bg-gray-100 text-gray-700"}
        `}
      >
        {label}
      </span>
      <span>{option}</span>
    </div>
  </button>
);

/* ================= MAIN ================= */

const Moctest: React.FC = () => {
  const { user } = useAuth();
  const { testId } = useParams();

  const [mocktest, setMocktest] = useState<IMockTest | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestion: 0,
    selectedAnswers: {},
    timeRemaining: 0,
  });

  /* ============ MAP API QUESTIONS ============ */

  const mapApiQuestions = (test: IMockTest): Question[] => {
    return test.questions
      .filter(q => q.question.type === "mcq")
      .map(q => ({
        id: q.question._id,
        question: q.question.title,
        options: q.question.options.map(o => o.text),
        multiSelect: q.question.multiSelect,
        type: q.question.type,
      }));
  };

  /* ============ FETCH TEST ============ */

  useEffect(() => {
    if (!testId) return;

    const fetchTest = async () => {
      try {
        const res = await MockTestApis.getMockTest(testId);
        setMocktest(res.data);

        const mapped = mapApiQuestions(res.data);
        setQuestions(mapped);

        setQuizState(prev => ({
          ...prev,
          currentQuestion: 0,
          timeRemaining: res.data.duration * 60,
        }));
      } catch (err) {
        console.log(err);
      }
    };

    fetchTest();
  }, [testId]);

  /* ============ TIMER ============ */

  useEffect(() => {
    if (quizState.timeRemaining <= 0) return;

    const i = setInterval(() => {
      setQuizState(prev => ({
        ...prev,
        timeRemaining: prev.timeRemaining - 1,
      }));
    }, 1000);

    return () => clearInterval(i);
  }, [quizState.timeRemaining]);

  /* ============ HANDLERS ============ */

  const handleOptionSelect = useCallback(
    (optionIndex: number) => {
      setQuizState(prev => {
        const q = questions[prev.currentQuestion];
        const selected = prev.selectedAnswers[prev.currentQuestion] ?? [];

        if (!q.multiSelect) {
          return {
            ...prev,
            selectedAnswers: {
              ...prev.selectedAnswers,
              [prev.currentQuestion]: [optionIndex],
            },
          };
        }

        return {
          ...prev,
          selectedAnswers: {
            ...prev.selectedAnswers,
            [prev.currentQuestion]: selected.includes(optionIndex)
              ? selected.filter(i => i !== optionIndex)
              : [...selected, optionIndex],
          },
        };
      });
    },
    [questions]
  );

  const handleSubmit = () => {
    const payload = {
      testId,
      answers: quizState.selectedAnswers,
      timeTaken:
        mocktest!.duration * 60 - quizState.timeRemaining,
    };

    console.log("SUBMIT PAYLOAD:", payload);
    alert("Test submitted successfully!");
  };

  /* ============ LOADING ============ */

  if (!questions.length) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading test...
      </div>
    );
  }

  const current = questions[quizState.currentQuestion];
  const selected =
    quizState.selectedAnswers[quizState.currentQuestion] ?? [];

  /* ============ UI ============ */

  return (
    <div className="h-screen bg-gray-100 p-4">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">{mocktest?.title}</h1>
          <Avatar
            name={user?.name || "Student"}
            email={user?.email || ""}
            size="sm"
            collapsed
          />
        </div>

        {/* Timer */}
        <div className="flex justify-between items-center mb-4">
          <Timer timeRemaining={quizState.timeRemaining} />
          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Submit
          </button>
        </div>

        {/* Question */}
        <div>
          <div className="text-sm text-gray-600 mb-2">
            Question {quizState.currentQuestion + 1} of {questions.length}
          </div>

          <h2
            className="text-lg font-semibold mb-4"
            dangerouslySetInnerHTML={{ __html: current.question }}
          />

          <div className="space-y-3">
            {current.options.map((opt, i) => (
              <OptionButton
                key={i}
                label={String.fromCharCode(65 + i)}
                option={opt}
                isSelected={selected.includes(i)}
                onSelect={() => handleOptionSelect(i)}
              />
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            disabled={quizState.currentQuestion === 0}
            onClick={() =>
              setQuizState(p => ({
                ...p,
                currentQuestion: p.currentQuestion - 1,
              }))
            }
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>

          <button
            disabled={quizState.currentQuestion === questions.length - 1}
            onClick={() =>
              setQuizState(p => ({
                ...p,
                currentQuestion: p.currentQuestion + 1,
              }))
            }
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Moctest;
