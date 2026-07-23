// src/components/admin/BlogEditor.tsx
import { useState, useRef } from "react";
import {
  Bold,
  Italic,
  Underline,
  Link as LinkIcon,
  Image as ImageIcon,
  List,
  ListOrdered,
  Quote,
} from "lucide-react";

interface BlogEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function BlogEditor({ value, onChange }: BlogEditorProps) {
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    setSelectionStart(target.selectionStart);
    setSelectionEnd(target.selectionEnd);
  };

  const insertText = (before: string, after: string = "") => {
    const text = value;
    const selected = text.substring(selectionStart, selectionEnd);
    const newText =
      text.substring(0, selectionStart) +
      before +
      selected +
      after +
      text.substring(selectionEnd);

    onChange(newText);

    // فوکوس و انتخاب مجدد
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursorPos = selectionStart + before.length;
        textareaRef.current.setSelectionRange(
          newCursorPos,
          newCursorPos + selected.length,
        );
      }
    }, 10);
  };

  const wrapWithTag = (tag: string) => {
    insertText(`<${tag}>`, `</${tag}>`);
  };

  const wrapWithMarkdown = (symbol: string) => {
    insertText(symbol, symbol);
  };

  const addLink = () => {
    const url = prompt("لطفاً آدرس لینک را وارد کنید:");
    if (url) {
      insertText(`[`, `](${url})`);
    }
  };

  const addImage = () => {
    const url = prompt("لطفاً آدرس تصویر را وارد کنید:");
    if (url) {
      insertText(`![`, `](${url})`);
    }
  };

  const addList = (type: "ul" | "ol") => {
    const symbol = type === "ul" ? "- " : "1. ";
    insertText(`\n${symbol}`, "");
  };

  const addBlockquote = () => {
    insertText(`\n> `, "");
  };

  const addHeading = (level: number) => {
    insertText(`\n${"#".repeat(level)} `, "");
  };

  return (
    <div className="border border-white/20 rounded-xl overflow-hidden bg-white/5">
      {/* Toolbar - استایل‌های تیره */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-white/10 bg-black/30">
        {/* Bold */}
        <button
          onClick={() => wrapWithMarkdown("**")}
          className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          title="پررنگ"
        >
          <Bold size={18} />
        </button>
        {/* Italic */}
        <button
          onClick={() => wrapWithMarkdown("_")}
          className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          title="کج"
        >
          <Italic size={18} />
        </button>
        {/* Underline */}
        <button
          onClick={() => wrapWithTag("u")}
          className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          title="زیرخط"
        >
          <Underline size={18} />
        </button>

        <div className="w-px h-6 bg-white/10" />

        {/* Headings */}
        <button
          onClick={() => addHeading(1)}
          className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-colors text-xs font-bold"
          title="عنوان اصلی"
        >
          H1
        </button>
        <button
          onClick={() => addHeading(2)}
          className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-colors text-xs font-bold"
          title="عنوان فرعی"
        >
          H2
        </button>
        <button
          onClick={() => addHeading(3)}
          className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-colors text-xs font-bold"
          title="عنوان کوچک"
        >
          H3
        </button>

        <div className="w-px h-6 bg-white/10" />

        {/* Lists */}
        <button
          onClick={() => addList("ul")}
          className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          title="لیست نشانه‌دار"
        >
          <List size={18} />
        </button>
        <button
          onClick={() => addList("ol")}
          className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          title="لیست شماره‌دار"
        >
          <ListOrdered size={18} />
        </button>

        <div className="w-px h-6 bg-white/10" />

        {/* Quote */}
        <button
          onClick={addBlockquote}
          className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          title="نقل قول"
        >
          <Quote size={18} />
        </button>

        <div className="w-px h-6 bg-white/10" />

        {/* Link & Image */}
        <button
          onClick={addLink}
          className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          title="افزودن لینک"
        >
          <LinkIcon size={18} />
        </button>
        <button
          onClick={addImage}
          className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          title="افزودن تصویر"
        >
          <ImageIcon size={18} />
        </button>
      </div>

      {/* Textarea با پس‌زمینه تیره */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextareaChange}
        onSelect={handleSelect}
        rows={15}
        className="w-full px-4 py-3 bg-gray-900/50 text-gray-200 placeholder-gray-500 focus:outline-none resize-y font-mono text-sm leading-relaxed"
        placeholder="محتوا را اینجا بنویسید... (پشتیبانی از Markdown)"
        dir="ltr"
      />

      {/* راهنمای پایین */}
      <div className="flex justify-between items-center px-4 py-2 border-t border-white/5 bg-black/20">
        <span className="text-xs text-gray-500">پشتیبانی از Markdown</span>
        <span className="text-xs text-gray-500">
          {value.split(" ").filter(Boolean).length} کلمه
        </span>
      </div>
    </div>
  );
}
