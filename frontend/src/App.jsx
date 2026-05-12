import { useState } from "react";
import axios from "axios";
import Header from "./components/Header";
import PRForm from "./components/PRForm";
import FileList from "./components/FileList";
import TestOutput from "./components/TestOutput";

// In dev, Vite proxies /api → localhost:8000.
// In production (Vercel), set VITE_API_URL to your Render backend URL.
const API_BASE = import.meta.env.VITE_API_URL || "";

export default function App() {
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [result, setResult]     = useState(null);  // GenerateResponse from backend

  async function handleGenerate({ prUrl, ghToken, framework, scope, coverage }) {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data } = await axios.post(`${API_BASE}/api/generate-tests`, {
        pr_url:       prUrl,
        github_token: ghToken,
        framework,
        scope,
        coverage,
      });
      setResult(data);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.message ||
        "Unexpected error. Check the backend is running.";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">

          {/* ── Left column: form ─────────────────────────────── */}
          <div className="space-y-4">
            <PRForm onSubmit={handleGenerate} loading={loading} />

            {/* How it works */}
            <div className="card p-5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                How it works
              </h3>
              <ol className="space-y-2.5">
                {[
                  ["GitHub API", "Fetches PR diff, file list, and PR metadata"],
                  ["Diff parsing", "Extracts changed functions and context"],
                  ["Gemini 1.5 Flash", "Generates tests with coverage for every changed path"],
                  ["You", "Review, tweak, and commit the tests"],
                ].map(([step, desc], i) => (
                  <li key={step} className="flex gap-3 items-start">
                    <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-xs font-medium text-gray-300">{step}</p>
                      <p className="text-xs text-gray-600">{desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* ── Right column: results ──────────────────────────── */}
          <div className="space-y-4 min-w-0">

            {/* Loading skeleton */}
            {loading && (
              <div className="card p-8 flex flex-col items-center gap-4">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-300">Analysing PR diff…</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Fetching from GitHub → sending to Gemini → writing tests
                  </p>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="card p-5 border-red-900 bg-red-950/30">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-red-400">Error</p>
                    <p className="text-xs text-red-300 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            {result && !loading && (
              <>
                {/* PR title */}
                <div className="card px-5 py-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-900 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Pull Request</p>
                    <p className="text-sm font-medium text-gray-200 truncate">{result.pr_title}</p>
                  </div>
                  <span className="ml-auto badge bg-amber-950 text-amber-400 border border-amber-800 flex-shrink-0">
                    {result.framework_label}
                  </span>
                </div>

                {/* Changed files */}
                <FileList
                  files={result.files}
                  filesChanged={result.files_changed}
                  additions={result.additions}
                  deletions={result.deletions}
                />

                {/* Generated tests */}
                <TestOutput
                  tests={result.tests}
                  framework={result.framework}
                  frameworkLabel={result.framework_label}
                  prTitle={result.pr_title}
                />
              </>
            )}

            {/* Empty state */}
            {!loading && !error && !result && (
              <div className="card p-12 flex flex-col items-center gap-4 border-dashed">
                <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-400">No tests generated yet</p>
                  <p className="text-xs text-gray-600 mt-1 max-w-xs">
                    Paste a GitHub PR URL on the left and click <span className="text-amber-500">Generate Tests</span>
                  </p>
                </div>

                {/* Example PR hint */}
                <div className="mt-2 bg-gray-800 rounded-lg px-4 py-3 w-full max-w-sm">
                  <p className="text-xs text-gray-500 mb-1">Try a public PR, e.g.</p>
                  <p className="text-xs font-mono text-gray-400 break-all">
                    https://github.com/facebook/react/pull/31152
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-4 text-center">
        <p className="text-xs text-gray-700">
          Powered by Gemini 1.5 Flash · GitHub REST API · FastAPI · React
        </p>
      </footer>
    </div>
  );
}
