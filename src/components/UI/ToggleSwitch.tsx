interface ToggleSwitchProps {
  label: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, enabled, onChange }) => {
  return (
    <div className="flex flex-col items-center gap-3 w-fit">
      <span className="text-gray-700 font-medium">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300
          ${enabled ? "bg-[#465D96]" : "bg-gray-300"}`}
      >
        <span
          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300
            ${enabled ? "translate-x-6" : "translate-x-0"}`}
        ></span>
      </button>
    </div>
  );
};

export default ToggleSwitch