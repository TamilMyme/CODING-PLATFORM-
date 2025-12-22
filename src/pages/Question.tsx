"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { TrashIcon, PlusIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline"
import { CodeBracketIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/solid"
import LabelInput from "../components/UI/LabelInput"
import LabelTextArea from "../components/UI/LabelTextArea"
import SelectDropDown from "../components/UI/SelectDropDown"
import QuestionApis from "../apis/QuestionApis"
import TextEditor from "../components/UI/TextEdiotor"

type QuestionType = "mcq" | "coding"

interface MCQOption {
  text: string
  isCorrect: boolean
}

interface MCQQuestion {
  _id: string
  type: "mcq"
  description: ""
  title: string
  options: MCQOption[]
  correctOption?: number[]
  multiSelect?: boolean
  difficulty?: "easy" | "medium" | "hard"
  marks?: number
}

interface CodingTestCase {
  input: string
  output: string
  isHidden?: boolean
}

interface CodingQuestion {
  _id: string
  type: "coding"
  title: string
  description: string
  testCases: CodingTestCase[]
  allowedLanguages: string[]
  inputFormat?: string
  outputFormat?: string
  constraints?: string
  timeLimit?: number
  memoryLimit?: number
  difficulty?: "easy" | "medium" | "hard"
  marks?: number
}

type Question = MCQQuestion | CodingQuestion

const Question: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [questionType, setQuestionType] = useState<QuestionType>("mcq")

  // MCQ Form State
  const [mcqFormData, setMcqFormData] = useState({
    title: "",
    description: "",
    options: [{ text: "", isCorrect: false }],
    correctOption: [] as number[],
    multiSelect: false,
    difficulty: "easy",
    marks: 1,
  })

  // Coding Form State
  const [codingFormData, setCodingFormData] = useState({
    title: "",
    description: "",
    testCases: [{ input: "", output: "", isHidden: true }],
    allowedLanguages: ["python"],
    inputFormat: "",
    outputFormat: "",
    constraints: "",
    timeLimit: 2,
    memoryLimit: 256,
    difficulty: "easy",
    marks: 1,
  })

  const questionTypeOptions = [
    { value: "mcq", label: "MCQ" },
    { value: "coding", label: "Coding" },
  ]

  const languageOptions = [
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "c", label: "C" },
    { value: "cpp", label: "C++" },
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
  ]

  const difficultyOptions = [
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" },
  ]

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await QuestionApis.getAllQuestions()
        setQuestions(data.data.questions)
      } catch (err) {
        console.error("Failed to fetch questions:", err)
      }
    }
    fetchQuestions()
  }, [])

  const handleQuestionTypeChange = (_name: string, value: string) => {
    setQuestionType(value as QuestionType)
    setMcqFormData({
      title: "",
      description: "",
      options: [{ text: "", isCorrect: false }],
      correctOption: [],
      multiSelect: false,
      difficulty: "easy",
      marks: 1,
    })
    setCodingFormData({
      title: "",
      description: "",
      testCases: [{ input: "", output: "", isHidden: true }],
      allowedLanguages: ["python"],
      inputFormat: "",
      outputFormat: "",
      constraints: "",
      timeLimit: 2,
      memoryLimit: 256,
      difficulty: "easy",
      marks: 1,
    })
  }

  // MCQ Input Change
  const handleMcqInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    let newValue: string | boolean = value

    // Type narrowing for checkbox
    if (type === "checkbox" && "checked" in e.target) {
      newValue = e.target.checked
    }

    if (name === "multiSelect") {
      setMcqFormData((prev) => ({
        ...prev,
        multiSelect: Boolean(newValue),
        correctOption: [],
      }))
    } else if (name === "marks") {
      setMcqFormData((prev) => ({ ...prev, marks: Number.parseInt(value) }))
    } else {
      setMcqFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  // Coding Input Change
  const handleCodingInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === "marks") {
      setCodingFormData((prev) => ({ ...prev, marks: Number.parseInt(value) }))
    } else {
      setCodingFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  // MCQ Options
  const handleAddOption = () => {
    setMcqFormData((prev) => ({
      ...prev,
      options: [...prev.options, { text: "", isCorrect: false }],
    }))
  }

  const handleOptionChange = (index: number, value: string) => {
    setMcqFormData((prev) => {
      const newOptions = [...prev.options]
      newOptions[index].text = value
      return { ...prev, options: newOptions }
    })
  }

  const handleRemoveOption = (index: number) => {
    setMcqFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
      correctOption: prev.correctOption.filter((i) => i !== index),
    }))
  }

  const handleCorrectOptionChange = (index: number) => {
    setMcqFormData((prev) => {
      let newCorrectOption: number[]
      if (prev.multiSelect) {
        newCorrectOption = prev.correctOption.includes(index)
          ? prev.correctOption.filter((i) => i !== index)
          : [...prev.correctOption, index]
      } else {
        newCorrectOption = [index]
      }

      const newOptions = prev.options.map((opt, i) => ({
        ...opt,
        isCorrect: newCorrectOption.includes(i),
      }))

      return { ...prev, correctOption: newCorrectOption, options: newOptions }
    })
  }

  // Coding TestCases
  const handleTestCaseChange = (index: number, field: "input" | "output", value: string) => {
    setCodingFormData((prev) => {
      const newTestCases = [...prev.testCases]
      newTestCases[index][field] = value
      return { ...prev, testCases: newTestCases }
    })
  }

  const handleAddTestCase = () => {
    setCodingFormData((prev) => ({
      ...prev,
      testCases: [...prev.testCases, { input: "", output: "", isHidden: true }],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      let newQuestion: any = null

      if (questionType === "mcq") {
        newQuestion = {
          type: "mcq",
          title: mcqFormData.title,
          options: mcqFormData.options,
          correctOption: mcqFormData.correctOption,
          multiSelect: mcqFormData.multiSelect,
          difficulty: mcqFormData.difficulty,
          marks: mcqFormData.marks,
        }
      } else {
        newQuestion = {
          type: "coding",
          title: codingFormData.title,
          description: codingFormData.description,
          testCases: codingFormData.testCases,
          allowedLanguages: codingFormData.allowedLanguages,
          inputFormat: codingFormData.inputFormat,
          outputFormat: codingFormData.outputFormat,
          constraints: codingFormData.constraints,
          timeLimit: codingFormData.timeLimit,
          memoryLimit: codingFormData.memoryLimit,
          difficulty: codingFormData.difficulty,
          marks: codingFormData.marks,
        }
      }

      const created = await QuestionApis.createQuestion(newQuestion)
      setQuestions((prev) => [...prev, created.data])
      setIsFormOpen(false)
    } catch (err) {
      console.error("Failed to add question:", err)

      setQuestionType("mcq")
      setMcqFormData({
        title: "",
        description: "",
        options: [{ text: "", isCorrect: false }],
        correctOption: [],
        multiSelect: false,
        difficulty: "easy",
        marks: 1,
      })
      setCodingFormData({
        title: "",
        description: "",
        testCases: [{ input: "", output: "", isHidden: true }],
        allowedLanguages: ["python"],
        inputFormat: "",
        outputFormat: "",
        constraints: "",
        timeLimit: 2,
        memoryLimit: 256,
        difficulty: "easy",
        marks: 1,
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await QuestionApis.deleteQuestion(id, {})
      setQuestions((prev) => prev.filter((q) => q._id !== id))
    } catch (err) {
      console.error("Failed to delete question:", err)
    }
  }

  const mcqQuestions = questions.filter((q) => q.type === "mcq") as MCQQuestion[]
  const codingQuestions = questions.filter((q) => q.type === "coding") as CodingQuestion[]

  const DifficultyBadge = ({ difficulty }: { difficulty?: "easy" | "medium" | "hard" }) => {
    const colors = {
      easy: "bg-emerald-50 text-emerald-700 border-emerald-200",
      medium: "bg-amber-50 text-amber-700 border-amber-200",
      hard: "bg-rose-50 text-rose-700 border-rose-200",
    }
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[difficulty || "easy"]}`}
      >
        {difficulty || "easy"}
      </span>
    )
  }

  return (
    <div className="min-h-screen">
      <div className=" mx-auto">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Question Bank</h1>
              <p className="mt-2 text-base text-gray-600 leading-relaxed">
                Create and manage assessment questions for your courses
              </p>
            </div>
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#465D96] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#465D96]/95 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <PlusIcon className="w-5 h-5" />
              Create Question
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <QuestionMarkCircleIcon className="w-5 h-5 text-[#465D96]" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Questions</p>
                  <p className="text-2xl font-bold text-gray-900">{questions.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">MCQ Questions</p>
                  <p className="text-2xl font-bold text-gray-900">{mcqQuestions.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-50 rounded-lg">
                  <CodeBracketIcon className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Coding Questions</p>
                  <p className="text-2xl font-bold text-gray-900">{codingQuestions.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Create New Question</h3>
                  <p className="text-sm text-gray-600 mt-0.5">Add a question to your assessment bank</p>
                </div>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6">
                <div className="space-y-6">
                  <SelectDropDown
                    label="Question Type"
                    name="questionType"
                    options={questionTypeOptions}
                    value={questionType}
                    onChange={handleQuestionTypeChange}
                    required
                  />

                  {questionType === "mcq" ? (
                    <>
                      <TextEditor
                        label="Question Title"
                        value={mcqFormData.title}
                        onChange={(content) => setMcqFormData((prev) => ({ ...prev, title: content }))}
                        placeholder="Enter your question here..."
                      />

                      <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                        <input
                          type="checkbox"
                          id="multiSelect"
                          name="multiSelect"
                          checked={mcqFormData.multiSelect}
                          onChange={handleMcqInputChange}
                          className="w-4 h-4 text-[#465D96] border-gray-300 rounded focus:ring-[#465D96]/95"
                        />
                        <label htmlFor="multiSelect" className="text-sm font-medium text-gray-700 cursor-pointer">
                          Allow multiple correct options
                        </label>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">Answer Options</label>
                        <div className="space-y-3">
                          {mcqFormData.options.map((opt, index) => (
                            <div key={index} className="flex items-center gap-3 group">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-700">
                                {String.fromCharCode(65 + index)}
                              </div>
                              <LabelInput
                                value={opt.text}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                placeholder={`Option ${index + 1}`}
                                required
                                className="flex-1"
                                name={""}
                              />
                              <input
                                type="checkbox"
                                checked={opt.isCorrect}
                                onChange={() => handleCorrectOptionChange(index)}
                                className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                title="Mark as correct"
                              />
                              {mcqFormData.options.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOption(index)}
                                  className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <TrashIcon className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={handleAddOption}
                          className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[#465D96] hover:text-indigo-700 transition-colors"
                        >
                          <PlusIcon className="w-4 h-4" /> Add Another Option
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <LabelInput
                          label="Marks"
                          type="number"
                          name="marks"
                          value={mcqFormData.marks}
                          onChange={handleMcqInputChange}
                        />
                        <SelectDropDown
                          label="Difficulty Level"
                          name="difficulty"
                          options={difficultyOptions}
                          value={mcqFormData.difficulty}
                          onChange={(name, value) =>
                            setMcqFormData((prev) => ({
                              ...prev,
                              difficulty: value as any,
                            }))
                          }
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <LabelTextArea
                        label="Question Title"
                        name="title"
                        value={codingFormData.title}
                        onChange={(e) =>
                          setCodingFormData((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        required
                      />

                      <TextEditor
                        label="Problem Description"
                        value={codingFormData.description}
                        onChange={(content) =>
                          setCodingFormData((prev) => ({
                            ...prev,
                            description: content,
                          }))
                        }
                        placeholder="Describe the coding problem..."
                      />

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">Test Cases</label>
                        <div className="space-y-3">
                          {codingFormData.testCases.map((tc, i) => (
                            <div
                              key={i}
                              className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200"
                            >
                              <LabelInput
                                label={`Input ${i + 1}`}
                                value={tc.input}
                                onChange={(e) => handleTestCaseChange(i, "input", e.target.value)}
                                required
                                name={""}
                              />
                              <LabelInput
                                label={`Output ${i + 1}`}
                                value={tc.output}
                                onChange={(e) => handleTestCaseChange(i, "output", e.target.value)}
                                required
                                name={""}
                              />
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={handleAddTestCase}
                          className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[#465D96] hover:text-indigo-700 transition-colors"
                        >
                          <PlusIcon className="w-4 h-4" /> Add Test Case
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <LabelInput
                          label="Marks"
                          type="number"
                          name="marks"
                          value={codingFormData.marks}
                          onChange={handleCodingInputChange}
                        />
                        <SelectDropDown
                          label="Difficulty Level"
                          name="difficulty"
                          options={difficultyOptions}
                          value={codingFormData.difficulty}
                          onChange={(name, value) =>
                            setCodingFormData((prev) => ({
                              ...prev,
                              difficulty: value as any,
                            }))
                          }
                        />
                      </div>
                    </>
                  )}
                </div>
              </form>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#465D96] rounded-xl hover:bg-[#465D96]/95 transition-colors shadow-sm"
                >
                  Create Question
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {mcqQuestions.map((q, idx) => (
            <div
              key={q._id}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 text-sm font-bold">
                      {idx + 1}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                      <CheckCircleIcon className="w-3.5 h-3.5" />
                      MCQ
                    </span>
                    <DifficultyBadge difficulty={q.difficulty} />
                    <span className="text-sm text-gray-600">
                      <span className="font-semibold text-gray-900">{q.marks}</span> {q.marks === 1 ? "mark" : "marks"}
                    </span>
                  </div>
                  <div
                    className="text-lg font-medium text-gray-900 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: q.title }}
                  />
                </div>
                <button
                  onClick={() => handleDelete(q._id)}
                  className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex-shrink-0"
                  title="Delete question"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 mt-4">
                {q.options.map((opt, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                      opt.isCorrect ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <span
                      className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                        opt.isCorrect ? "bg-emerald-200 text-emerald-800" : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span
                      className={`flex-1 text-sm leading-relaxed ${
                        opt.isCorrect ? "text-emerald-900 font-medium" : "text-gray-700"
                      }`}
                    >
                      {opt.text}
                    </span>
                    {opt.isCorrect && <CheckCircleIcon className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {codingQuestions.map((q, idx) => (
            <div
              key={q._id}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-violet-100 text-violet-700 text-sm font-bold">
                      {mcqQuestions.length + idx + 1}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 text-xs font-medium border border-violet-100">
                      <CodeBracketIcon className="w-3.5 h-3.5" />
                      Coding
                    </span>
                    <DifficultyBadge difficulty={q.difficulty} />
                    <span className="text-sm text-gray-600">
                      <span className="font-semibold text-gray-900">{q.marks}</span> {q.marks === 1 ? "mark" : "marks"}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{q.title}</h3>
                  <div
                    className="text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: q.description }}
                  />
                </div>
                <button
                  onClick={() => handleDelete(q._id)}
                  className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex-shrink-0"
                  title="Delete question"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">Test Cases</h4>
                <div className="space-y-2">
                  {q.testCases.map((tc, i) => (
                    <div key={i} className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="text-slate-500 font-medium">Input:</span>
                        <code className="ml-2 text-slate-900">{tc.input}</code>
                      </div>
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="text-slate-500 font-medium">Output:</span>
                        <code className="ml-2 text-slate-900">{tc.output}</code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {questions.length === 0 && (
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center">
              <div className="max-w-sm mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <QuestionMarkCircleIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No questions yet</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  Get started by creating your first question for the assessment bank.
                </p>
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#465D96] text-white text-sm font-semibold rounded-xl hover:bg-[#465D96]/95 transition-colors shadow-sm"
                >
                  <PlusIcon className="w-4 h-4" />
                  Create Your First Question
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Question
