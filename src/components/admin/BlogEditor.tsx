interface BlogEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function BlogEditor({ value, onChange }: BlogEditorProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-50 p-2 border-b flex gap-2">
        <button className="px-3 py-1 bg-white rounded hover:bg-gray-100">
          B
        </button>
        <button className="px-3 py-1 bg-white rounded hover:bg-gray-100">
          I
        </button>
        <button className="px-3 py-1 bg-white rounded hover:bg-gray-100">
          U
        </button>
        <button className="px-3 py-1 bg-white rounded hover:bg-gray-100">
          🔗
        </button>
        <button className="px-3 py-1 bg-white rounded hover:bg-gray-100">
          📷
        </button>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={15}
        className="w-full px-4 py-3 focus:outline-none resize-y"
        placeholder="محتوا را اینجا بنویسید..."
      />
    </div>
  );
}
