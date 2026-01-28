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
    <div ref={ref} className={`relative w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div
        className={`w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 shadow-sm cursor-pointer flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#465D96]/50 focus:border-[#465D96] transition-all duration-200 ${
          disabled ? "bg-gray-50 text-gray-500 cursor-not-allowed" : "hover:border-gray-400"
        } ${error ? "border-red-500 focus:ring-red-500/50 focus:border-red-500" : ""}`}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        tabIndex={0}
      >
        <span className={selectedOption ? "text-gray-900" : "text-gray-400"}>
          {selectedOption?.label || placeholder}
        </span>

        <svg
          className={`w-5 h-5 text-gray-400 ml-2 transform transition-transform ${
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
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {searchable && (
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#465D96]/50 focus:border-[#465D96]"
                  placeholder="Search options..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          )}
          <ul className="py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <li
                  key={opt.value}
                  onClick={() => {
                    onChange(name, opt.value);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`px-3 py-2 cursor-pointer transition-colors ${
                    opt.value === value 
                      ? "bg-[#465D96] text-white" 
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {opt.label}
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-gray-500 text-sm">No options found</li>
            )}
          </ul>
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1" role="alert">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default SelectDropDown;
