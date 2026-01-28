import React, { useEffect, useState } from "react";
import LabelInput from "../components/UI/LabelInput";
import { useNavigate } from "react-router-dom";
import { LockClosedIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import { useAuth } from "../context/AuthProvider";
import UserApis from "../apis/UserApis";

const LoginPage: React.FC = () => {
  const { user, setLogin, isLogin, setUser, setIsLoading } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [formError, setFormError] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormError((prev) => ({ ...prev, [name]: "" }));
    setLoginError(""); // Clear login error on any input change
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^.{8,}$/; // At least 8 characters

    let errors = { email: "", password: "" };
    let hasError = false;

    if (!form.email) {
      errors.email = "Email is required";
      hasError = true;
    } else if (!emailRegex.test(form.email)) {
      errors.email = "Please enter a valid email address";
      hasError = true;
    }

    if (!form.password) {
      errors.password = "Password is required";
      hasError = true;
    } else if (!passwordRegex.test(form.password)) {
      errors.password = "Password must be at least 8 characters";
      hasError = true;
    }

    setFormError(errors);
    return !hasError;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setIsLoading(true);
    setLoginError("");

    try {
      const res = await UserApis.signIn(form);

      // Reset form
      setForm({
        email: "",
        password: "",
      });
      setFormError({
        email: "",
        password: "",
      });

      // Set user data and login state
      setUser(res.data);
      setLogin(true);
      setIsLoading(false);

      // Navigate to dashboard
      navigate("/");
    } catch (error: any) {
      setIsLoading(false);
      const errorMessage =
        error.response?.data?.message || "Login failed. Please try again.";
      setLoginError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (user && isLogin) {
      navigate("/");
    }
  }, [user, isLogin, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex">
      {/* Logo */}
      <div className="absolute top-6 left-6 z-10">
        <img src="/logo.png" alt="Logo" className="h-12" />
      </div>

      {/* Left side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-600">
                Enter your credentials to access your account
              </p>
            </div>

            {loginError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{loginError}</p>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <LabelInput
                  name="email"
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  error={formError.email}
                  onChange={handleChange}
                  className="h-12 px-4 bg-gray-50 border-gray-200 rounded-lg focus:bg-white focus:border-indigo-500 transition-colors"
                  prefixIcon={
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  }
                />
              </div>

              <div>
                <LabelInput
                  name="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  error={formError.password}
                  onChange={handleChange}
                  className="h-12 px-4 bg-gray-50 border-gray-200 rounded-lg focus:bg-white focus:border-indigo-500 transition-colors"
                  prefixIcon={
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  }
                  suffixIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Forgot your password?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    "Sign in"
                  )}
                </button>
              </div>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      Or continue with
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className=" mt-6 w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  <span className="sr-only">Sign in with Google</span>
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
                  </svg>
                </button>
              </div>
            </form>
          </div>

          <p className="mt-8 text-center text-sm text-gray-500">
            © 2025 Your Company. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right side - Image/Branding */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src="/6670916.jpg"
          alt="Learning Platform"
          className="absolute inset-0 w-full h-full object-cover "
        />
      </div>
    </div>
  );
};

export default LoginPage;
