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
}) => {
  return (
    <div>
      {label&&<label htmlFor={name} className="block mb-1 font-medium capitalize">
        {label}:
      </label>}
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
        className={`bg-dash block w-full p-2 rounded-md outline-none resize-y focus:border focus:border-secondary ${
          error ? "border-red-500 focus:border-red-600" : ""
        } ${className}`}
        rows={4}
      />
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

export default LabelTextArea;
