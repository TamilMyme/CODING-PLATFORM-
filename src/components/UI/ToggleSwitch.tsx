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
    sm: "w-9 h-5",
    md: "w-11 h-6",
    lg: "w-14 h-8"
  };

  const dotSizeClasses = {
    sm: "w-3.5 h-3.5",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  const dotTranslateClasses = {
    sm: enabled ? "translate-x-4" : "translate-x-0.5",
    md: enabled ? "translate-x-5" : "translate-x-0.5",
    lg: enabled ? "translate-x-6" : "translate-x-1"
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
        className={`relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500/50 ${
          sizeClasses[size]
        } ${
          enabled 
            ? "bg-gradient-to-r from-green-500 to-emerald-600 border-green-500 shadow-lg shadow-green-500/30" 
            : "bg-gray-200 border-gray-300 hover:bg-gray-300"
        } ${
          disabled 
            ? "opacity-50 cursor-not-allowed" 
            : "hover:scale-105 active:scale-95"
        }`}
        role="switch"
        aria-checked={enabled}
      >
        <span className="sr-only">Toggle {label}</span>
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block transform rounded-full bg-white shadow-md ring-0 transition-all duration-300 ease-in-out ${dotSizeClasses[size]} ${dotTranslateClasses[size]}`}
        />
      </button>
    </div>
  );
};

export default ToggleSwitch;
