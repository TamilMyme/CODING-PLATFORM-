import React from "react";
import {
  ClockIcon,
  DocumentTextIcon,
  PlayCircleIcon,
} from "@heroicons/react/24/outline";

const mockTests = [
  {
    id: 1,
    title: "Java DSA Mock Test – 1",
    description: "Arrays, Strings & Time Complexity",
    duration: 90,
    totalMarks: 100,
    attemptsLeft: 1,
    startTime: "2024-05-01 10:00 AM",
    endTime: "2024-05-01 11:30 AM",
    isPublished: true,
  },
  {
    id: 2,
    title: "Python Programming Test",
    description: "Functions, Loops & OOP",
    duration: 60,
    totalMarks: 80,
    attemptsLeft: 0,
    startTime: "2024-04-20 02:00 PM",
    endTime: "2024-04-20 03:00 PM",
    isPublished: false,
  },
  {
    id: 3,
    title: "C Programming Mock",
    description: "Pointers & Memory Management",
    duration: 75,
    totalMarks: 90,
    attemptsLeft: 2,
    startTime: "2024-05-05 09:00 AM",
    endTime: "2024-05-05 10:15 AM",
    isPublished: false,
  },
];

const MockTestList = () => {
  return (
    <div className="min-h-screen">
      <div className="mx-auto">

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mock Tests</h1>
          <p className="text-sm text-gray-500">
            Attempt mock tests to evaluate your preparation
          </p>
        </div>

        {/* TEST LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {mockTests.map((test) => (
            <div
              key={test.id}
              className="bg-white/80 backdrop-blur rounded-2xl shadow-sm hover:shadow-md transition border p-5 flex flex-col"
            >
              {/* STATUS */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    test.isPublished
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {test.isPublished ? "LIVE NOW" : "UPCOMING / ENDED"}
                </span>

                <span className="text-xs text-gray-500">
                  {test.attemptsLeft} Attempts Left
                </span>
              </div>

              {/* TITLE */}
              <h2 className="font-semibold text-lg text-gray-900 mb-1">
                {test.title}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                {test.description}
              </p>

              {/* INFO */}
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4" />
                  Duration: {test.duration} mins
                </div>
                <div className="flex items-center gap-2">
                  <DocumentTextIcon className="w-4 h-4" />
                  Total Marks: {test.totalMarks}
                </div>
              </div>

              {/* TIME */}
              <div className="text-xs text-gray-500 mb-4">
                <p>Start: {test.startTime}</p>
                <p>End: {test.endTime}</p>
              </div>

              {/* ACTION */}
              <button
                disabled={!test.isPublished || test.attemptsLeft === 0}
                className={`mt-auto flex items-center justify-center gap-2 py-2 rounded-xl transition font-medium ${
                  test.isPublished && test.attemptsLeft > 0
                    ? "bg-[#465D96] hover:bg-[#3b4f85] text-white"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                <PlayCircleIcon className="w-5 h-5" />
                Start Test
              </button>
            </div>
          ))}
        </div>

        {/* EMPTY STATE */}
        {mockTests.length === 0 && (
          <div className="text-center py-20">
            <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No mock tests available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MockTestList;
