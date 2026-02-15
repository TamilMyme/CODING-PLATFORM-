import React, { useState, useEffect } from "react";
import {
  BookOpenIcon,
  ClockIcon,
  ChartBarIcon,
  PlayIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import CourseApis from "../apis/CourseApis";
import BatchApis from "../apis/BatchApis";
import { useAuth } from "../context/AuthProvider";
import type { ICourse, IBatch } from "../types/interfaces";

interface CourseWithBatches {
  course: ICourse;
  batches: IBatch[];
  isEnrolled: boolean;
  enrolledBatch?: IBatch;
  progress?: number;
  completedModules?: number;
  totalModules?: number;
}

const MyCourse: React.FC = () => {
  const { user, setUser } = useAuth();
  const [coursesWithBatches, setCoursesWithBatches] = useState<CourseWithBatches[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CourseWithBatches[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [enrolling, setEnrolling] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchAllCourses();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = coursesWithBatches.filter((item) =>
        item.course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.course.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses(coursesWithBatches);
    }
  }, [searchTerm, coursesWithBatches]);

  const fetchAllCourses = async () => {
    try {
      setLoading(true);
      
      // Fetch all courses
      const allCourses = await CourseApis.getAll();
      
      // Fetch batches for each course and check enrollment
      const coursesData: CourseWithBatches[] = await Promise.all(
        allCourses.map(async (course) => {
          try {
            const batches = await BatchApis.getAll(course._id);
            
            // Check if user is enrolled in any batch for this course
            const enrolledBatch = batches.find((batch) => {
              const studentIds = batch.students.map((s: any) => 
                typeof s === 'string' ? s : s._id
              );
              return studentIds.includes(user?._id);
            });

            // Calculate progress if enrolled
            let progress = 0;
            let completedModules = 0;
            const totalModules = course.roadmap?.length || 0;
            
            if (enrolledBatch) {
              completedModules = Math.floor(Math.random() * totalModules); // Mock progress - replace with real progress from backend
              progress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
            }

            return {
              course,
              batches,
              isEnrolled: !!enrolledBatch,
              enrolledBatch,
              progress: Math.round(progress),
              completedModules,
              totalModules,
            };
          } catch (error) {
            console.error(`Error fetching batches for course ${course._id}:`, error);
            return {
              course,
              batches: [],
              isEnrolled: false,
              progress: 0,
              completedModules: 0,
              totalModules: course.roadmap?.length || 0,
            };
          }
        })
      );

      setCoursesWithBatches(coursesData);
      setFilteredCourses(coursesData);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (batchId: string, courseId: string) => {
    if (!user?._id) {
      alert("Please log in to enroll in a course");
      return;
    }

    try {
      setEnrolling({ ...enrolling, [batchId]: true });
      
      await BatchApis.addStudent(batchId, user._id);
      
      // Update user's enrolled courses
      const updatedEnrolledCourses = user.enrolledCourses || [];
      if (!updatedEnrolledCourses.includes(courseId)) {
        updatedEnrolledCourses.push(courseId);
        setUser({
          ...user,
          enrolledCourses: updatedEnrolledCourses,
        });
      }

      // Refresh courses to update enrollment status
      await fetchAllCourses();
      
      alert("Successfully enrolled in the course!");
    } catch (error) {
      console.error("Error enrolling in course:", error);
      alert("Failed to enroll in the course. Please try again.");
    } finally {
      setEnrolling({ ...enrolling, [batchId]: false });
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return "from-green-500 to-green-600";
    if (progress >= 50) return "from-blue-500 to-blue-600";
    if (progress >= 25) return "from-yellow-500 to-yellow-600";
    return "from-gray-500 to-gray-600";
  };

  const getProgressStatus = (progress: number) => {
    if (progress === 100) return { text: "Completed", color: "text-green-600", bg: "bg-green-50" };
    if (progress >= 75) return { text: "Almost Done", color: "text-blue-600", bg: "bg-blue-50" };
    if (progress >= 25) return { text: "In Progress", color: "text-yellow-600", bg: "bg-yellow-50" };
    return { text: "Not Started", color: "text-gray-600", bg: "bg-gray-50" };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

      {/* Content */}
      <div className=" ">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-64">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mb-6">
              <BookOpenIcon className="w-12 h-12 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? "No courses found" : "No courses available"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? "Try a different search term"
                : "Check back later for new courses"}
            </p>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <BookOpenIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{coursesWithBatches.length}</p>
                    <p className="text-sm text-gray-600">Available Courses</p>
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
                      {coursesWithBatches.filter((c) => c.isEnrolled).length}
                    </p>
                    <p className="text-sm text-gray-600">Enrolled</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <ChartBarIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(
                        coursesWithBatches
                          .filter((c) => c.isEnrolled)
                          .reduce((acc, c) => acc + (c.progress || 0), 0) /
                          Math.max(coursesWithBatches.filter((c) => c.isEnrolled).length, 1)
                      )}%
                    </p>
                    <p className="text-sm text-gray-600">Avg. Progress</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((item) => {
                const status = getProgressStatus(item.progress || 0);
                return (
                  <div
                    key={item.course._id}
                    className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group"
                  >
                    {/* Course Header */}
                    <div className={`bg-gradient-to-r ${item.isEnrolled ? 'from-indigo-500 to-purple-600' : 'from-gray-500 to-gray-600'} px-6 py-4`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white line-clamp-2">
                            {item.course.title}
                          </h3>
                          <p className="text-white/80 text-sm mt-1 line-clamp-2">
                            {item.course.description || "No description available"}
                          </p>
                          <p className="text-white/60 text-xs mt-2">
                            {item.batches.length} {item.batches.length === 1 ? 'batch' : 'batches'} available
                          </p>
                        </div>
                        {item.isEnrolled && (
                          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.color}`}>
                            {status.text}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Course Content */}
                    <div className="p-6">
                      {item.isEnrolled ? (
                        <>
                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">
                                Progress
                              </span>
                              <span className="text-sm font-semibold text-gray-900">
                                {item.progress}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className={`bg-gradient-to-r ${getProgressColor(item.progress || 0)} h-2.5 rounded-full transition-all duration-500`}
                                style={{ width: `${item.progress}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Course Stats */}
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              <AcademicCapIcon className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-xs text-gray-500">Modules</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {item.completedModules}/{item.totalModules}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <ClockIcon className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-xs text-gray-500">Est. Time</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {(item.totalModules || 0) * 2}h
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Roadmap Preview */}
                          {item.course.roadmap && item.course.roadmap.length > 0 && (
                            <div className="mb-4">
                              <p className="text-xs font-medium text-gray-500 mb-2">
                                Roadmap
                              </p>
                              <div className="space-y-1">
                                {item.course.roadmap.slice(0, 3).map((module, index) => (
                                  <div
                                    key={index}
                                    className={`flex items-center gap-2 text-sm ${
                                      index < (item.completedModules || 0)
                                        ? "text-green-600"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    {index < (item.completedModules || 0) ? (
                                      <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
                                    ) : (
                                      <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                                    )}
                                    <span className="truncate">{module}</span>
                                  </div>
                                ))}
                                {item.course.roadmap.length > 3 && (
                                  <p className="text-xs text-gray-500">
                                    +{item.course.roadmap.length - 3} more modules
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Continue Button */}
                          <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 group-hover:shadow-md">
                            {(item.progress || 0) === 0 ? (
                              <>
                                <PlayIcon className="w-5 h-5" />
                                Start Learning
                              </>
                            ) : (item.progress || 0) === 100 ? (
                              <>
                                <CheckCircleIcon className="w-5 h-5" />
                                Review Course
                              </>
                            ) : (
                              <>
                                <PlayIcon className="w-5 h-5" />
                                Continue Learning
                              </>
                            )}
                            <ArrowRightIcon className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          {/* Course Info */}
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              <AcademicCapIcon className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-xs text-gray-500">Modules</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {item.totalModules || 0}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <ClockIcon className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-xs text-gray-500">Est. Time</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {(item.totalModules || 0) * 2}h
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Roadmap Preview */}
                          {item.course.roadmap && item.course.roadmap.length > 0 && (
                            <div className="mb-4">
                              <p className="text-xs font-medium text-gray-500 mb-2">
                                Roadmap
                              </p>
                              <div className="space-y-1">
                                {item.course.roadmap.slice(0, 3).map((module, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-2 text-sm text-gray-600"
                                  >
                                    <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                                    <span className="truncate">{module}</span>
                                  </div>
                                ))}
                                {item.course.roadmap.length > 3 && (
                                  <p className="text-xs text-gray-500">
                                    +{item.course.roadmap.length - 3} more modules
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Available Batches */}
                          {item.batches.length > 0 && (
                            <div className="mb-4">
                              <p className="text-xs font-medium text-gray-500 mb-2">
                                Available Batches
                              </p>
                              <div className="space-y-2">
                                {item.batches.slice(0, 2).map((batch) => (
                                  <div
                                    key={batch._id}
                                    className="flex items-center justify-between text-sm"
                                  >
                                    <span className="text-gray-900 font-medium truncate">
                                      {batch.name}
                                    </span>
                                    <button
                                      onClick={() => handleEnroll(batch._id, item.course._id)}
                                      disabled={enrolling[batch._id]}
                                      className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                                    >
                                      {enrolling[batch._id] ? (
                                        <span className="text-xs">Enrolling...</span>
                                      ) : (
                                        <>
                                          <UserPlusIcon className="w-4 h-4" />
                                          <span className="text-xs">Enroll</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                ))}
                                {item.batches.length > 2 && (
                                  <p className="text-xs text-gray-500">
                                    +{item.batches.length - 2} more batches
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {item.batches.length === 0 && (
                            <div className="text-center py-4 text-gray-500 text-sm">
                              No batches available for this course
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyCourse;
