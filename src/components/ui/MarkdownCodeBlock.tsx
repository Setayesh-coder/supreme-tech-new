import { Suspense, lazy } from "react";
import type { ComponentProps } from "react";

// @ts-ignore
const SyntaxHighlighterModule = lazy(() =>
  import("react-syntax-highlighter").then((module) => ({
    default: module.Prism,
  }))
);

// @ts-ignore
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

type SyntaxHighlighterProps = ComponentProps<typeof SyntaxHighlighterModule>;

interface MarkdownCodeBlockProps {
  value: string;
  language?: string;
}

export function MarkdownCodeBlock({
  value,
  language,
}: MarkdownCodeBlockProps) {
  return (
    <Suspense
      fallback={
        <pre className="m-0 overflow-x-auto rounded bg-black/40 p-4">
          <code>{value}</code>
        </pre>
      }
    >
      <SyntaxHighlighterModule
        {...({
          style: vscDarkPlus,
          language,
          PreTag: "div",
          className: "!m-0 !bg-black/40",
          children: value,
        } as SyntaxHighlighterProps)}
      />
    </Suspense>
  );
}
