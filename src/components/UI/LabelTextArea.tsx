import React from "react";

interface TextAreaProps {
  label?: string;
  name: string;
  value?: string;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  rows?: number;
}

const LabelTextArea: React.FC<TextAreaProps> = ({
  label="",
  name,
  value,
  placeholder = "",
  onChange,
  required = false,
  disabled = false,
  error,
  className = "",
  rows = 4,
}) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`block w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#465D96]/50 focus:border-[#465D96] transition-all duration-200 resize-y ${
          error ? "border-red-500 focus:ring-red-500/50 focus:border-red-500" : ""
        } ${disabled ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""} ${className}`}
        rows={rows}
      />
      {error && (
        <p
          id={`${name}-error`}
          className="mt-1.5 text-sm text-red-600 flex items-center gap-1"
          role="alert"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default LabelTextArea;
