import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DatePickerProps {
  label: string;
  placeholder: string;
  selected: Date | string | null;
  onChange: (date: Date | null) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  showTimeSelect?: boolean;
  showTimeSelectOnly?: boolean;  // <-- new prop for time-only mode
  className?: string;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
}

const CustomDatePicker: React.FC<DatePickerProps> = ({
  label,
  placeholder,
  selected,
  onChange,
  required = false,
  disabled = false,
  error,
  showTimeSelect = false,
  showTimeSelectOnly = false,
  className = "",
  prefixIcon,
  suffixIcon,
}) => {
  return (
    <div>
      <label className="block mb-1 font-medium">{label}:</label>
      <div className="relative">
        {prefixIcon && (
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
            {prefixIcon}
          </span>
        )}

        <DatePicker
          selected={(selected as (Date | null))}
          onChange={onChange}
          disabled={disabled}
          required={required}
          showTimeSelect={showTimeSelect || showTimeSelectOnly}
          showTimeSelectOnly={showTimeSelectOnly}
          timeIntervals={15}
          timeCaption="Time"
          placeholderText={placeholder}
          dateFormat={
            showTimeSelectOnly
              ? "h:mm aa"
              : showTimeSelect
              ? "MMMM d, yyyy h:mm aa"
              : "MMMM d, yyyy"
          }
          className={`bg-gray-100 w-full p-1 px-2 rounded-md outline-none inline focus:border-2 focus:border-secondary  ${
            error ? "border-red-500 focus:border-red-600" : ""
          } ${prefixIcon ? "pl-8" : ""} ${suffixIcon ? "pr-8" : ""} ${className}`}
        />

        {suffixIcon && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
            {suffixIcon}
          </span>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default CustomDatePicker;
