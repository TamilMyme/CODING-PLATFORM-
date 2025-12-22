import React, { useState } from "react";
import { DocumentTextIcon, TrophyIcon } from "@heroicons/react/24/outline";
import Avatar from "./UI/Avatar";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LeaderboardEntry {
  id: number;
  rank: number;
  name: string;
  email: string;
  score: number;
  isCurrentUser?: boolean;
}

interface TestResult {
  id: number;
  subject: string;
  chapter: string;
  date: string;
  score: number;
}

const Dashui: React.FC = () => {
  // const [selectedLanguage, setSelectedLanguage] = useState("EN");

  // Leaderboard data
  const leaderboardData: LeaderboardEntry[] = [
    {
      id: 1,
      rank: 1,
      name: "Alice Johnson",
      email: "alice@example.com",
      score: 95,
    },
    { id: 2, rank: 2, name: "Bob Smith", email: "bob@example.com", score: 92 },
    {
      id: 3,
      rank: 3,
      name: "Charlie Brown",
      email: "charlie@example.com",
      score: 88,
    },
    {
      id: 4,
      rank: 5,
      name: "John Doe",
      email: "john@example.com",
      score: 75,
      isCurrentUser: true,
    },
  ];

  const topThree = leaderboardData.filter((entry) => entry.rank <= 3);
  const currentUser = leaderboardData.find((entry) => entry.isCurrentUser);

  const testResults: TestResult[] = [
    {
      id: 1,
      subject: "JAVA DSA",
      chapter: "Chapter 1",
      date: "2nd Jan 2020",
      score: 35,
    },
    {
      id: 2,
      subject: "C PROGRAMMING",
      chapter: "Chapter 2",
      date: "5th Jan 2020",
      score: 85,
    },
    {
      id: 3,
      subject: "PYTHON PROGRAMMING",
      chapter: "Chapter 3",
      date: "10th Jan 2020",
      score: 75,
    },
  ];

  // Performance chart data
  const performanceData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Performance",
        data: [65, 70, 68, 75, 72, 73.5],
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#f59e0b",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 50,
        max: 100,
        grid: {
          display: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {/* Upcoming Tests Card */}
      <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border border-gray-100 w-full">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Upcoming Tests
        </h2>
        <div className="flex flex-col items-center mb-4">
          <div className="w-32 h-32 md:w-40 md:h-40 bg-[#465D96]/50 rounded-full flex items-center justify-center mb-4">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-[#465D96] rounded-full flex items-center justify-center">
              <DocumentTextIcon className="w-12 h-12 md:w-16 md:h-16 text-white" />
            </div>
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-900 mb-1">
              Programming Fundamentals (30 marks)
            </p>
            <p className="text-sm text-gray-600 mb-1">Chapter 2,3,4</p>
            <p className="text-sm text-gray-500">Deadline: 2nd May 2024</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 bg-[#465D96] hover:bg-[#465D96]/90 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            Take The Test
          </button>
          <button className="flex-1 bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
            Postpone
          </button>
        </div>
      </div>

      {/* New Solved Papers Card */}
      <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          New Solved Papers
        </h2>
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32 mb-4">
            <svg className="transform -rotate-90 w-32 h-32">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="#e5e7eb"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="#f59e0b"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${85 * 3.52} ${100 * 3.52}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">85%</span>
            </div>
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-900 mb-1">
              Data Structures (Theory)
            </p>
            <p className="text-sm text-gray-600 mb-1">20 Jan 2024</p>
            <p className="text-sm text-gray-500 mb-4">3 Hours</p>
            <button className="bg-[#465D96] hover:bg-[#465D96]/90 text-white font-medium py-2 px-6 rounded-lg transition-colors">
              Take A Look
            </button>
          </div>
        </div>
      </div>
      

      {/* Leaderboard Card */}
      <div className="bg-white rounded-xl shadow-md p-2 md:p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Leaderboard
        </h2>

        {/* Top 3 */}
        <div className="space-y-3 mb-4">
          {topThree.map((entry) => (
            <div
              key={entry.id}
              className={`flex items-center gap-3 p-2 rounded-lg ${
                entry.rank === 1
                  ? "bg-yellow-50 border-2 border-yellow-200"
                  : entry.rank === 2
                  ? "bg-gray-50 border border-gray-200"
                  : "bg-orange-50 border border-orange-200"
              }`}
            >
              {/* Rank */}
              <div
                className={`w-5 h-5 flex items-center justify-center rounded-full font-bold text-sm shrink-0 ${
                  entry.rank === 1
                    ? "bg-[#465D96] text-white"
                    : entry.rank === 2
                    ? "bg-gray-400 text-white"
                    : "bg-orange-400 text-white"
                }`}
              >
                {entry.rank}
              </div>

              {/* Avatar
                      <div className="shrink-0">
                        <Avatar
                          name={entry.name}
                          email={entry.email}
                          size="sm"
                          collapsed={true}
                        />
                      </div> */}

              {/* Name and Score */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {entry.name}
                </p>
                <p className="text-xs text-gray-600">{entry.score} pts</p>
              </div>

              {/* Avatar with Medal */}
              <div className="shrink-0 relative">
                {/* Medal above avatar for top 3 */}
                {entry.rank <= 3 && (
                  <div className="absolute -left-6  transform -translate-x-1/2 z-10">
                    <TrophyIcon
                      className={`w-6 h-6 ${
                        entry.rank === 1
                          ? "text-[#465D96]/90"
                          : entry.rank === 2
                          ? "text-gray-400"
                          : "text-orange-600"
                      }`}
                    />
                  </div>
                )}
                <Avatar
                  name={entry.name}
                  email={entry.email}
                  size="sm"
                  collapsed={true}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Current User Position */}
        {currentUser && (
          <div className="pt-3 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-500 mb-2">
              Your Position
            </p>
            <div className="flex items-center gap-3 p-2 rounded-lg bg-indigo-50 border-2 border-indigo-200">
              {/* Rank */}
              <div className="w-5 h-5 flex items-center justify-center rounded-full font-bold text-sm bg-indigo-600 text-white shrink-0">
                {currentUser.rank}
              </div>

              {/* Name and Score */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {currentUser.name}
                </p>
                <p className="text-xs text-gray-600">{currentUser.score} pts</p>
              </div>
              {/* Avatar */}
              <div className="shrink-0">
                <Avatar
                  name={currentUser.name}
                  email={currentUser.email}
                  size="sm"
                  collapsed={true}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Performance Card */}
      <div className="bg-white h-96 rounded-xl shadow-md p-4 md:p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Performance</h2>
          <div className="text-right">
            <span className="text-orange-500 font-semibold">6.5%</span>
            <p className="text-xs text-gray-500">Decline</p>
          </div>
        </div>
        <div className=" ">
          <Line data={performanceData} options={chartOptions} />
        </div>
      </div>
      
      {/* Calendar Card */}
      <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Calendar</h2>
        <div className="mb-4">
          <div className="flex gap-2 justify-center mb-3">
            {[22, 23, 24].map((day) => (
              <div
                key={day}
                className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium ${
                  day === 23
                    ? "bg-[#465D96] text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {day}
              </div>
            ))}
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="font-semibold text-gray-900 mb-1">Programming Test</p>
            <p className="text-sm text-gray-600">10:00 AM</p>
          </div>
        </div>
        <button className="w-full bg-[#465D96] hover:bg-[#465D96]/90 text-white font-medium py-2 px-4 rounded-lg transition-colors">
          Monthly view
        </button>
      </div>

      {/* Recent Test Results Card - Spans 2 columns on large screens */}
      <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Test Results
        </h2>
        <div className="space-y-4">
          {testResults.map((result) => (
            <div
              key={result.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {result.subject}
                </h3>
                <p className="text-sm text-gray-600">{result.chapter}</p>
                <p className="text-xs text-gray-500">{result.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-16">
                  <svg className="transform -rotate-90 w-16 h-16">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="#e5e7eb"
                      strokeWidth="6"
                      fill="none"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke={result.score >= 70 ? "#f59e0b" : "#f97316"}
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${result.score * 1.76} ${100 * 1.76}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-900">
                      {result.score}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Dashui;
