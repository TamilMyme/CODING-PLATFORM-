import React from "react";
import {
  BookOpenIcon,
  ClockIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const courses = [
  {
    id: 1,
    title: "Java & DSA Mastery",
    description: "Learn Java fundamentals and master Data Structures & Algorithms.",
    progress: 72,
    duration: "12 Weeks",
    level: "Intermediate",
  },
  {
    id: 2,
    title: "Python Programming",
    description: "Complete Python from basics to advanced with real projects.",
    progress: 45,
    duration: "10 Weeks",
    level: "Beginner",
  },
  {
    id: 3,
    title: "C Programming Essentials",
    description: "Build strong programming foundations with C language.",
    progress: 90,
    duration: "8 Weeks",
    level: "Beginner",
  },
];

const Course:React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className="">

        {/* HEADER */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
            <p className="text-sm text-gray-500">
              Continue learning from where you left off
            </p>
          </div>
          <button className="mt-3 sm:mt-0 bg-[#465D96] hover:bg-[#3b4f85] text-white px-5 py-2 rounded-xl transition">
            Browse Courses
          </button>
        </div>

        {/* COURSES GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white/80 backdrop-blur rounded-2xl shadow-sm hover:shadow-md transition border p-5"
            >
              {/* ICON */}
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                <BookOpenIcon className="w-6 h-6" />
              </div>

              {/* CONTENT */}
              <h2 className="font-semibold text-lg text-gray-900 mb-1">
                {course.title}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                {course.description}
              </p>

              {/* META */}
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  {course.duration}
                </div>
                <div className="flex items-center gap-1">
                  <ChartBarIcon className="w-4 h-4" />
                  {course.level}
                </div>
              </div>

              {/* PROGRESS */}
              <div className="mb-4">
                <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{course.progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#465D96] rounded-full transition-all"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>

              {/* CTA */}
              <button className="w-full bg-[#465D96] hover:bg-[#3b4f85] text-white py-2 rounded-xl transition">
                Continue Learning
              </button>
            </div>
          ))}
        </div>

        {/* EMPTY STATE (OPTIONAL) */}
        {courses.length === 0 && (
          <div className="text-center py-20">
            <BookOpenIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No courses enrolled yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Course;
