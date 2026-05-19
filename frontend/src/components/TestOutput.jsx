import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const LANG_MAP = {
  junit5:  "java",
  testng:  "java",
  pytest:  "python",
  jest:    "javascript",
  vitest:  "typescript",
  go:      "go",
};

export default function TestOutput({ tests, framework, frameworkLabel, prTitle }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(tests);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const language = LANG_MAP[framework] || "javascript";

  return (
    <div className="card overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800 bg-gray-950">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex gap-1.5 flex-shrink-0">
            <div className="w-3 h-3 rounded-full bg-red-500 opacity-70" />
            <div className="w-3 h-3 rounded-full bg-amber-500 opacity-70" />
            <div className="w-3 h-3 rounded-full bg-emerald-500 opacity-70" />
          </div>
          <p className="text-xs font-mono text-amber-400 truncate">
            {frameworkLabel}
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors ml-4 flex-shrink-0 font-medium"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
              </svg>
              Copy code
            </>
          )}
        </button>
      </div>

      <div className="overflow-auto flex-1 max-h-[600px]">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: "1.25rem 1.5rem",
            background: "transparent",
            fontSize: "0.78rem",
            lineHeight: "1.7",
          }}
          showLineNumbers
          lineNumberStyle={{ color: "#4b5563", fontSize: "0.7rem", marginRight: "1rem" }}
        >
          {tests}
        </SyntaxHighlighter>
      </div>

      <div className="px-5 py-2.5 border-t border-gray-800 bg-gray-950">
        <p className="text-xs text-gray-600">
          Review tests before committing — verify mock assumptions match your codebase.
        </p>
      </div>
    </div>
  );
}
