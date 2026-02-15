import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/overview";
import LoginPage from "./pages/LoginPage";
import Student from "./pages/Student";
import Institutions from "./pages/Institutions";
import Question from "./pages/Question";
import StudentQuestions from "./pages/StudentQuestions";
import MockTest from "./pages/MockTest";
import MockTestSubmissions from "./pages/MockTestSubmissions";
import Leaderboard from "./pages/Leaderboard";
import AuthProvider from "./context/AuthProvider";
// import Dashui from "./components/Dashui";
import Moctest from "./components/Moctest";
import Users from "./pages/Users";
import Course from "./pages/Course";
import MyCourse from "./pages/MyCourse";
import Batch from "./pages/Batch";
import ProtectedRoute from "./components/ProtectedRoute";
import MockTestList from "./pages/Assigments";
import './App.css'

const App: React.FC = () => {
  3;
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN", "STUDENT"]} />
            }
          >
            <Route
              path="/"
              element={
                <Layout>
                  <Dashboard />
                </Layout>
              }
            />

            <Route
              path="/my-course"
              element={
                <Layout>
                  <MyCourse />
                </Layout>
              }
            />
            <Route
              path="/batches"
              element={
                <Layout>
                  <Batch />
                </Layout>
              }
            />
            <Route
              path="/mock-tests"
              element={
                <Layout>
                  <MockTestList />
                </Layout>
              }
            />
            <Route
              path="/student-questions"
              element={
                <Layout>
                  <StudentQuestions />
                </Layout>
              }
            />
          </Route>
          <Route
            path="/"
            element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]} />}
          >
            <Route
              path="/institutions"
              element={
                <Layout>
                  <Institutions />
                </Layout>
              }
            />
            <Route
              path="/questions"
              element={
                <Layout>
                  <Question />
                </Layout>
              }
            />
            <Route
              path="/courses"
              element={
                <Layout>
                  <Course />
                </Layout>
              }
            />
             <Route
               path="/tests"
               element={
                 <Layout>
                   <MockTest />
                 </Layout>
               }
             />
             <Route
               path="/mock-test-submissions/:testId"
               element={
                 <Layout>
                   <MockTestSubmissions />
                 </Layout>
               }
             />
            <Route
              path="/leaderboards"
              element={
                <Layout>
                  <Leaderboard />
                </Layout>
              }
            />
            <Route
              path="/users"
              element={
                <Layout>
                  <Users />
                </Layout>
              }
            />
            
          </Route>
          <Route
            path="/"
            element={<ProtectedRoute allowedRoles={["SUPER_ADMIN", "STUDENT"]} />}
          >
            <Route
              path="/students"
              element={
                <Layout>
                  <Student />
                </Layout>
              }
            />
          </Route>

          <Route
            path="/"
            element={<ProtectedRoute allowedRoles={["SUPER_ADMIN", "STUDENT"]} />}
          >
            <Route path="/assign" element={<Moctest />} />
            <Route path="/skill-brains/:testId" element={<Moctest/>}/>
          </Route>
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

