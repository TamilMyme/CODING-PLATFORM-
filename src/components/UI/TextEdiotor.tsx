import React from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  LinkIcon,
  ListBulletIcon,
} from "@heroicons/react/24/solid";
import { GoListOrdered } from "react-icons/go";

interface TextEditorProps {
  value: string;
  onChange: (content: string) => void;
  label: string;
  placeholder?: string;
  valid?: string;
  className?: string;
}

const TextEditor: React.FC<TextEditorProps> = ({ value, onChange, label, valid, className }) => {
  const editor: Editor | null = useEditor({
    extensions: [StarterKit],
    content: value,
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt("Enter URL");
    if (url) editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className={`input_field ${className ?? ""}`}>
      <label className="block font-medium mb-1">{label}</label>

      {/* Toolbar */}
      <div className="border rounded-t p-2 bg-gray-50 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "text-blue-600" : ""}
        >
          <BoldIcon className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "text-blue-600" : ""}
        >
          <ItalicIcon className="w-5 h-5" />
        </button>

        {/* <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive("underline") ? "text-blue-600" : ""}
        >
          <UnderlineIcon className="w-5 h-5" />
        </button> */}

        {/* <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive("strike") ? "text-blue-600" : ""}
        >
          <StrikethroughIcon className="w-5 h-5" />
        </button> */}

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "text-blue-600" : ""}
        >
          <ListBulletIcon className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "text-blue-600" : ""}
        >
          <GoListOrdered className="w-5 h-5" />
        </button>

        {/* <button type="button" onClick={addLink} className={editor.isActive("link") ? "text-blue-600" : ""}>
          <LinkIcon className="w-5 h-5" />
        </button> */}
      </div>

      {/* Editor */}
      <div className="border rounded-b p-2 min-h-[150px]">
        <EditorContent editor={editor} />
      </div>

      {valid && <small className="text-red-500">{valid}</small>}
    </div>
  );
};

export default TextEditor;
