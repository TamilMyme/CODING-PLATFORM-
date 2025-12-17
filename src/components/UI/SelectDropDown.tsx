import React, { useState, useRef, useEffect } from "react";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  label?: string;
  options: Option[];
  name: string;
  value?: string | number;
  onChange: (name: string, value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  searchable?: boolean; // <-- Optional prop to toggle search feature
}

const SelectDropDown: React.FC<CustomSelectProps> = ({
  label = "",
  options,
  name,
  value,
  onChange,
  placeholder = "Select an option",
  required = false,
  disabled = false,
  error,
  className = "",
  searchable = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm(""); // Clear search when closing
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  // Filter options based on search term
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={ref} className={`relative ${className}`}>
      {label && (
        <label className="block mb-1 font-medium">
          {label}
          {required && "*"}
        </label>
      )}

      <div
        className={`bg-gray-100 w-full p-2 py-1 rounded-md cursor-pointer flex items-center justify-between ${
          disabled ? "bg-gray-100 cursor-not-allowed text-gray-400" : ""
        }`}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        tabIndex={0}
      >
        <span>
          {selectedOption?.label || (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </span>

        <svg
          className={`w-4 h-4 ml-2 transform transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-[#465D96] rounded-md shadow-md max-h-60 overflow-y-auto">
          {searchable && (
            <div className="p-2 border-b border-[#465D96]">
              <input
                type="text"
                className="w-full p-1 border rounded text-sm focus:outline-none"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
          <ul>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <li
                  key={opt.value}
                  onClick={() => {
                    onChange(name, opt.value);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`p-2 hover:bg-[#465D96]/50 cursor-pointer rounded-md mx-2 my-0.5 ${
                    opt.value === value ? "bg-[#465D96] text-white" : ""
                  }`}
                >
                  {opt.label}
                </li>
              ))
            ) : (
              <li className="p-2 text-gray-400 text-sm">No options found</li>
            )}
          </ul>
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default SelectDropDown;
