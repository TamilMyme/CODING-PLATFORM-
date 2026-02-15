import React, { useRef, useEffect, useState } from "react";
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  LinkIcon,
  ListBulletIcon,
  CodeBracketIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { GoListOrdered } from "react-icons/go";

interface TextEditorProps {
  value: string;
  onChange: (content: string) => void;
  label: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

const ToolbarButton: React.FC<{
  onClick: () => void;
  isActive: boolean;
  icon: React.ReactNode;
  title: string;
  disabled?: boolean;
}> = ({ onClick, isActive, icon, title, disabled = false }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`relative group flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 ${
      isActive
        ? "bg-gradient-to-br from-[#465D96] to-[#5a72b5] text-white shadow-md scale-105"
        : "bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200"
    } ${disabled ? "opacity-50 cursor-not-allowed" : "hover:shadow-sm"}`}
  >
    {icon}
  </button>
);

const TextEditor: React.FC<TextEditorProps> = ({
  value,
  onChange,
  label,
  placeholder = "Start typing...",
  error,
  required = false,
  className = "",
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [characterCount, setCharacterCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  /** Keep DOM in sync without nuking cursor */
  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
    updateCounts();
  }, [value]);

  const updateCounts = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || "";
    setCharacterCount(text.length);
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
  };

  const execCommand = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    handleChange();
  };

  const handleChange = () => {
    if (!editorRef.current) return;
    onChange(editorRef.current.innerHTML);
    updateCounts();
  };

  const handleCode = () => {
    const selection = window.getSelection();
    const text = selection?.toString() || "";
    execCommand(
      "insertHTML",
      `<code class="bg-gray-100 text-rose-600 px-1.5 py-0.5 rounded text-sm font-mono">${text}</code>`
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();
      execCommand("insertHTML", "&nbsp;&nbsp;&nbsp;&nbsp;");
    }
    if (e.key === "Escape" && showLinkInput) {
      setShowLinkInput(false);
      setLinkUrl("");
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Toolbar */}
        <div className="absolute -top-3 left-4 right-4 z-10 bg-white/95 backdrop-blur border border-gray-200 rounded-xl shadow-lg p-1.5 flex flex-wrap gap-1">
          <ToolbarButton
            onClick={() => execCommand("bold")}
            isActive={document.queryCommandState("bold")}
            icon={<BoldIcon className="w-4 h-4" />}
            title="Bold"
          />
          <ToolbarButton
            onClick={() => execCommand("italic")}
            isActive={document.queryCommandState("italic")}
            icon={<ItalicIcon className="w-4 h-4" />}
            title="Italic"
          />
          <ToolbarButton
            onClick={() => execCommand("underline")}
            isActive={document.queryCommandState("underline")}
            icon={<UnderlineIcon className="w-4 h-4" />}
            title="Underline"
          />
          <ToolbarButton
            onClick={() => execCommand("strikeThrough")}
            isActive={document.queryCommandState("strikeThrough")}
            icon={<StrikethroughIcon className="w-4 h-4" />}
            title="Strike"
          />

          <div className="w-px h-6 bg-gray-200 mx-1" />

          <ToolbarButton
            onClick={() => execCommand("insertUnorderedList")}
            isActive={document.queryCommandState("insertUnorderedList")}
            icon={<ListBulletIcon className="w-4 h-4" />}
            title="Bullet list"
          />
          <ToolbarButton
            onClick={() => execCommand("insertOrderedList")}
            isActive={document.queryCommandState("insertOrderedList")}
            icon={<GoListOrdered className="w-4 h-4" />}
            title="Ordered list"
          />

          <div className="w-px h-6 bg-gray-200 mx-1" />

          <ToolbarButton
            onClick={handleCode}
            isActive={false}
            icon={<CodeBracketIcon className="w-4 h-4" />}
            title="Inline code"
          />
          <ToolbarButton
            onClick={() => setShowLinkInput(true)}
            isActive={showLinkInput}
            icon={<LinkIcon className="w-4 h-4" />}
            title="Add link"
          />
        </div>

        {/* Link input */}
        {showLinkInput && (
          <div className="absolute top-10 left-4 right-4 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-4 flex gap-2">
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && execCommand("createLink", linkUrl)}
              className="flex-1 px-3 py-2 border rounded-lg"
              placeholder="https://example.com"
              autoFocus
            />
            <button
              onClick={() => execCommand("createLink", linkUrl)}
              className="px-4 py-2 bg-[#465D96] text-white rounded-lg"
            >
              Insert
            </button>
            <button
              onClick={() => {
                setShowLinkInput(false);
                setLinkUrl("");
              }}
              className="px-3 py-2 bg-gray-100 rounded-lg"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleChange}
          onKeyDown={handleKeyDown}
          data-placeholder={placeholder}
          suppressContentEditableWarning
          className={`border-2 rounded-xl bg-white prose focus:outline-none min-h-[200px] max-h-[400px] overflow-y-auto pt-12 pb-4 px-4 ${
            error
              ? "border-rose-300 focus:ring-rose-100"
              : "border-gray-200 focus:ring-[#465D96]/10"
          }`}
        />

        {/* Stats */}
        <div className="mt-2 flex justify-between text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
          <span>{wordCount} words</span>
          <span>{characterCount} characters</span>
        </div>
      </div>

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
        }
        [contenteditable]:focus:before {
          display: none;
        }
        [contenteditable] ul { list-style: disc; padding-left: 1.5rem; }
        [contenteditable] ol { list-style: decimal; padding-left: 1.5rem; }
        [contenteditable] a { color: #465D96; text-decoration: underline; }
        [contenteditable] code {
          background: #f3f4f6;
          color: #e11d48;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-family: ui-monospace, monospace;
        }
      `}</style>
    </div>
  );
};

export default TextEditor;
