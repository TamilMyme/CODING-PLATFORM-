import React, { useEffect, useState } from "react";
import {
  ClockIcon,
  DocumentTextIcon,
  PlayCircleIcon,
} from "@heroicons/react/24/outline";
import MockTestApis from "../apis/MockTestApis";
import type { IMockTest } from "../types/interfaces";
import { useNavigate } from "react-router-dom";

const MockTestList = () => {
  const [mockTests, setMockTests] = useState<IMockTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate()

  useEffect(() => {
    const fetchMockTests = async () => {
      try {
        const res = await MockTestApis.getAllMockTests();
        setMockTests(res.data.mockTests);
      } catch (err) {
        setError("Failed to load mock tests");
      } finally {
        setLoading(false);
      }
    };

    fetchMockTests();
  }, []);

  if (loading) {
    return <p className="text-center py-10">Loading mock tests...</p>;
  }

  if (error) {
    return <p className="text-center py-10 text-red-500">{error}</p>;
  }

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
          {mockTests.map((test) => {
            const now = new Date();
            const isLive =
              test.isPublished &&
              (!test.startTime || new Date(test.startTime) <= now) &&
              (!test.endTime || new Date(test.endTime) >= now);

            return (
              <div
                key={test._id}
                className="bg-white/80 backdrop-blur rounded-2xl shadow-sm hover:shadow-md transition border p-5 flex flex-col"
              >
                {/* STATUS */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      isLive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {isLive ? "LIVE NOW" : "UPCOMING / ENDED"}
                  </span>

                  <span className="text-xs text-gray-500">
                    {test.allowedAttempts} Attempts Allowed
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
                  {test.startTime && <p>Start: {new Date(test.startTime).toLocaleString()}</p>}
                  {test.endTime && <p>End: {new Date(test.endTime).toLocaleString()}</p>}
                </div>

                {/* ACTION */}
                <button
                  disabled={!isLive}
                  className={`mt-auto flex items-center justify-center gap-2 py-2 rounded-xl transition font-medium ${
                    isLive
                      ? "bg-[#465D96] hover:bg-[#3b4f85] text-white"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                  onClick={()=>navigate(`/skill-brains/${test._id}`)}
                >
                  <PlayCircleIcon className="w-5 h-5" />
                  Start Test
                </button>
              </div>
            );
          })}
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
