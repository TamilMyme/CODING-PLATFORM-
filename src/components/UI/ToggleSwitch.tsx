interface ToggleSwitchProps {
  label?: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ 
  label, 
  enabled, 
  onChange, 
  disabled = false,
  size = "md"
}) => {
  const sizeClasses = {
    sm: "w-8 h-4",
    md: "w-11 h-6",
    lg: "w-14 h-8"
  };

  const dotSizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  };

  const dotTranslateClasses = {
    sm: enabled ? "translate-x-4" : "translate-x-0.5",
    md: enabled ? "translate-x-5" : "translate-x-0.5",
    lg: enabled ? "translate-x-6" : "translate-x-0.5"
  };

  return (
    <div className="flex items-center gap-2">
      {label && (
        <label className="text-sm font-medium text-gray-700 cursor-pointer">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => !disabled && onChange(!enabled)}
        disabled={disabled}
        className={`relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#465D96]/50 ${
          sizeClasses[size]
        } ${
          enabled 
            ? "bg-[#465D96]" 
            : "bg-gray-200"
        } ${
          disabled 
            ? "opacity-50 cursor-not-allowed" 
            : ""
        }`}
        role="switch"
        aria-checked={enabled}
      >
        <span className="sr-only">Toggle {label}</span>
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${dotSizeClasses[size]} ${dotTranslateClasses[size]}`}
        />
      </button>
    </div>
  );
};

export default ToggleSwitch