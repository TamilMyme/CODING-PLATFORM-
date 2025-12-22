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
}) => {
  return (
    <div>
      {label && <label htmlFor={name} className="block mb-1 font-medium">
        {label}:
      </label>}
      <div className="relative">
        {prefixIcon && (
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
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
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          className={`bg-gray-100 block w-full p-1 px-2 rounded-md outline-none focus:border focus:border-[#465D96] ${
            error ? "border-red-500 focus:border-red-600" : ""
          } ${prefixIcon ? "pl-6" : ""} ${suffixIcon ? "pr-5" : ""} ${className}`}
        />

        {suffixIcon && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 ">
            {suffixIcon}
          </span>
        )}
      </div>

      {error && (
        <p
          id={`${name}-error`}
          className="mt-1 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default LabelInput;
