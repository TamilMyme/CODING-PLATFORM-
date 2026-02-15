"use client";

import type React from "react";
import { useState } from "react";
import Editor from "@monaco-editor/react";
import {
  PlayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  language: string;
  onLanguageChange: (language: string) => void;
  onRun: () => void;
  onSubmit: () => void;
  testCases: { input: string; output: string; isHidden: boolean }[];
  testResults: { input: string; expected: string; actual: string; passed: boolean; error?: string; runtime?: number }[] | null;
  isRunning: boolean;
  isSubmitting: boolean;
}

const languageOptions = [
  { value: "python", label: "Python", icon: "🐍" },
  { value: "javascript", label: "JavaScript", icon: "⚡" },
  { value: "java", label: "Java", icon: "☕" },
  { value: "cpp", label: "C++", icon: "⚙️" },
  { value: "c", label: "C", icon: "🔧" },
  { value: "typescript", label: "TypeScript", icon: "📘" },
  { value: "go", label: "Go", icon: "🔵" },
  { value: "rust", label: "Rust", icon: "🦀" },
];

const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  language,
  onLanguageChange,
  onRun,
  onSubmit,
  testCases,
  testResults,
  isRunning,
  isSubmitting,
}) => {
  const [showTestCases, setShowTestCases] = useState(true);
  const [testCasesHeight, setTestCasesHeight] = useState(250);

  const getMonacoLanguage = (lang: string): string => {
    const languageMap: Record<string, string> = {
      python: "python",
      javascript: "javascript",
      java: "java",
      cpp: "cpp",
      c: "c",
      typescript: "typescript",
      go: "go",
      rust: "rust",
    };
    return languageMap[lang] || "javascript";
  };

  const allPassed = testResults && testResults.length > 0 && testResults.every((r) => r.passed);
  const passedCount = testResults?.filter((r) => r.passed).length || 0;
  const totalCount = testResults?.length || 0;
  const hasErrors = testResults?.some((r) => r.error);

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#3c3c3c]">
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-xs font-medium">Code Editor</span>
          <div className="relative">
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="appearance-none bg-[#3c3c3c] text-white text-xs px-3 py-1.5 pr-8 rounded border border-[#5c5c5c] focus:outline-none focus:border-[#007acc] cursor-pointer hover:border-[#5c5c5c] transition-colors"
            >
              {languageOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.icon} {opt.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2ea043] hover:bg-[#238636] disabled:bg-[#238636] disabled:opacity-60 text-white text-xs font-medium rounded transition-colors"
          >
            <PlayIcon className="w-3 h-3" />
            <span>Run</span>
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#007acc] hover:bg-[#005a9e] disabled:bg-[#005a9e] disabled:opacity-60 text-white text-xs font-medium rounded transition-colors"
          >
            <CheckCircleIcon className="w-3 h-3" />
            <span>Submit</span>
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={getMonacoLanguage(language)}
          value={code}
          onChange={(value) => onChange(value || "")}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            wordWrap: "on",
            padding: { top: 16, bottom: 16 },
            renderWhitespace: "selection",
            fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
          }}
        />
      </div>

      {/* Editor Footer */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#252526] border-t border-[#3c3c3c]">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>Lines: {code.split("\n").length}</span>
          <span>Characters: {code.length}</span>
        </div>
        <div className="text-xs text-gray-500">
          Press Tab to indent
        </div>
      </div>

      {/* Test Cases Panel */}
      <div 
        className="bg-[#1e1e1e] border-t border-[#3c3c3c]"
        style={{ height: showTestCases ? `${testCasesHeight}px` : 'auto' }}
      >
        {/* Test Cases Header */}
        <div 
          className="flex items-center justify-between px-4 py-2 bg-[#252526] cursor-pointer hover:bg-[#2d2d2e] transition-colors"
          onClick={() => setShowTestCases(!showTestCases)}
        >
          <div className="flex items-center gap-3">
            {showTestCases ? (
              <ChevronDownIcon className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRightIcon className="w-4 h-4 text-gray-400" />
            )}
            <h3 className="text-xs font-semibold text-gray-300">Test Cases</h3>
            {testResults && (
              <span className={`text-xs font-medium ${allPassed ? 'text-green-400' : hasErrors ? 'text-red-400' : 'text-yellow-400'}`}>
                {passedCount}/{totalCount} passed
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasErrors && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-red-900/30 text-red-400 text-xs font-medium rounded">
                <ExclamationTriangleIcon className="w-3 h-3" />
                Errors
              </span>
            )}
            {allPassed && !hasErrors && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-green-900/30 text-green-400 text-xs font-medium rounded">
                <CheckCircleIcon className="w-3 h-3" />
                All Passed
              </span>
            )}
          </div>
        </div>

        {/* Test Cases List */}
        {showTestCases && (
          <div className="overflow-y-auto p-3 space-y-2" style={{ maxHeight: `${testCasesHeight - 40}px` }}>
            {testCases.map((testCase, index) => {
              const result = testResults?.[index];
              const isPassed = result?.passed;
              const isFailed = result && !result.passed;
              const hasError = result?.error;

              return (
                <div
                  key={index}
                  className={`rounded-lg border overflow-hidden ${
                    isPassed
                      ? "border-green-900/50 bg-green-900/10"
                      : hasError
                      ? "border-red-900/50 bg-red-900/10"
                      : isFailed
                      ? "border-red-900/50 bg-red-900/10"
                      : "border-[#3c3c3c] bg-[#252526]"
                  }`}
                >
                  {/* Test Case Header */}
                  <div className="flex items-center justify-between px-3 py-2 bg-[#2d2d2e] border-b border-[#3c3c3c]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-300">
                        Case {index + 1}
                      </span>
                      {testCase.isHidden && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-yellow-900/30 text-yellow-400 rounded">
                          Hidden
                        </span>
                      )}
                      {result?.runtime && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-blue-900/30 text-blue-400 rounded">
                          {result.runtime}ms
                        </span>
                      )}
                    </div>
                    {result && (
                      <div className="flex items-center gap-1">
                        {isPassed ? (
                          <>
                            <CheckCircleIcon className="w-3.5 h-3.5 text-green-400" />
                            <span className="text-[10px] font-medium text-green-400">Passed</span>
                          </>
                        ) : hasError ? (
                          <>
                            <ExclamationTriangleIcon className="w-3.5 h-3.5 text-red-400" />
                            <span className="text-[10px] font-medium text-red-400">Error</span>
                          </>
                        ) : (
                          <>
                            <XCircleIcon className="w-3.5 h-3.5 text-red-400" />
                            <span className="text-[10px] font-medium text-red-400">Failed</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Test Case Details */}
                  <div className="p-3 space-y-2">
                    <div>
                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                        Input
                      </span>
                      <pre className="mt-1 text-xs text-gray-300 bg-[#1e1e1e] p-2 rounded border border-[#3c3c3c] font-mono overflow-x-auto">
                        {testCase.input}
                      </pre>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                        Expected Output
                      </span>
                      <pre className="mt-1 text-xs text-gray-300 bg-[#1e1e1e] p-2 rounded border border-[#3c3c3c] font-mono overflow-x-auto">
                        {testCase.output}
                      </pre>
                    </div>
                    {result && !isPassed && (
                      <div>
                        {hasError ? (
                          <div>
                            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                              Error
                            </span>
                            <pre className="mt-1 text-xs text-red-300 bg-red-900/20 p-2 rounded border border-red-900/50 font-mono overflow-x-auto">
                              {result.error}
                            </pre>
                          </div>
                        ) : (
                          <div>
                            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                              Your Output
                            </span>
                            <pre className="mt-1 text-xs text-red-300 bg-red-900/20 p-2 rounded border border-red-900/50 font-mono overflow-x-auto">
                              {result.actual}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {testResults === null && (
              <div className="text-center py-6">
                <p className="text-xs text-gray-500">Click "Run" to test your code</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;
