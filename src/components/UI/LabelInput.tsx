import React from "react";

interface InputProps {
  label?: string;
  name: string;
  type?: string;
  value?: string|number;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  prefixIcon?: React.ReactNode;  // icon before input text
  suffixIcon?: React.ReactNode;  // icon after input text
  min?: string | number;  // minimum value for number inputs
  max?: string | number;  // maximum value for number inputs
  step?: string | number;  // step value for number inputs
}

const LabelInput: React.FC<InputProps> = ({
  label = "",
  name,
  type = "text",
  placeholder = "",
  value,
  onChange,
  required = false,
  disabled = false,
  error,
  className = "",
  prefixIcon,
  suffixIcon,
  min,
  max,
  step,
}) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {prefixIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {prefixIcon}
          </span>
        )}

        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          className={`block w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#465D96]/50 focus:border-[#465D96] transition-all duration-200 ${
            error ? "border-red-500 focus:ring-red-500/50 focus:border-red-500" : ""
          } ${prefixIcon ? "pl-10" : ""} ${suffixIcon ? "pr-10" : ""} ${disabled ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""} ${className}`}
        />

        {suffixIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {suffixIcon}
          </span>
        )}
      </div>

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

export default LabelInput;
