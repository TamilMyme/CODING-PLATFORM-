import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/overview";
import LoginPage from "./pages/LoginPage";
import Student from "./pages/Student";
import College from "./pages/College";
import Question from "./pages/Question";
import MockTest from "./pages/MockTest";
import AuthProvider from "./context/AuthProvider";
// import Dashui from "./components/Dashui";
import Moctest from "./components/Moctest";
import Users from "./pages/Users";
import StudentLogin from "./pages/StudentLogin";
import Course from "./pages/Course";
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
              <ProtectedRoute allowedRoles={["super-admin", "student"]} />
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
                  <Course />
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
          </Route>
          <Route
            path="/"
            element={<ProtectedRoute allowedRoles={["super-admin"]} />}
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
              path="/colleges"
              element={
                <Layout>
                  <College />
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
              path="/tests"
              element={
                <Layout>
                  <MockTest />
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
            path="/students"
            element={
              <Layout>
                <Student />
              </Layout>
            }
          />

          <Route path="/assign" element={<Moctest />} />
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/login" element={<StudentLogin />} />
          <Route path="/skill-brains/:testId" element={<Moctest/>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
