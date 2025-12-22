"use client"

import type React from "react"
import { useState } from "react"

interface TextEditorProps {
  label?: string
  value: string
  onChange: (content: string) => void
  placeholder?: string
  error?: string
}

const TextEditor: React.FC<TextEditorProps> = ({ label, value, onChange, placeholder, error }) => {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-semibold text-gray-900 mb-2">{label}</label>}
      <div
        className={`border rounded-lg overflow-hidden transition-all ${
          isFocused ? "border-indigo-500 ring-2 ring-indigo-500" : "border-gray-300"
        }`}
      >
        <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const selected = window.getSelection()?.toString()
              if (selected) {
                const newValue = value.replace(selected, `<strong>${selected}</strong>`)
                onChange(newValue)
              }
            }}
            className="px-2 py-1 text-xs font-bold text-gray-700 hover:bg-gray-200 rounded"
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => {
              const selected = window.getSelection()?.toString()
              if (selected) {
                const newValue = value.replace(selected, `<em>${selected}</em>`)
                onChange(newValue)
              }
            }}
            className="px-2 py-1 text-xs italic text-gray-700 hover:bg-gray-200 rounded"
            title="Italic"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => {
              const selected = window.getSelection()?.toString()
              if (selected) {
                const newValue = value.replace(selected, `<code>${selected}</code>`)
                onChange(newValue)
              }
            }}
            className="px-2 py-1 text-xs font-mono text-gray-700 hover:bg-gray-200 rounded"
            title="Code"
          >
            {"</>"}
          </button>
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          rows={6}
          className="w-full px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none placeholder:text-gray-400 resize-y"
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-rose-600">{error}</p>}
      {value && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs font-medium text-gray-600 mb-1">Preview:</p>
          <div className="text-sm text-gray-900" dangerouslySetInnerHTML={{ __html: value }} />
        </div>
      )}
    </div>
  )
}

export default TextEditor
