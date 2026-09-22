export function linkify(text?: string) {
  if (!text) return null;
  return text.split(/(\S+\.(?:ir|com|net|org|io|co|me|dev|app|ai|info|biz|tv)(?:\/\S*)?)/gi).map((part, i) =>
    /\S+\.(?:ir|com|net|org|io|co|me|dev|app|ai|info|biz|tv)/i.test(part) ? (
      <a key={i} href={part.startsWith("http") ? part : `https://${part}`} target="_blank" rel="noopener noreferrer"
         className="text-blue-400 hover:text-blue-300 underline break-all">
        {part}
      </a>
    ) : part
  );
}