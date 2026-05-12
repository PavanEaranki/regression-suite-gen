import { useState } from "react";

const FRAMEWORKS = [
  { value: "auto",   label: "Auto-detect from diff" },
  { value: "junit5", label: "Java — JUnit 5" },
  { value: "testng", label: "Java — TestNG" },
  { value: "pytest", label: "Python — pytest" },
  { value: "jest",   label: "JavaScript — Jest" },
  { value: "vitest", label: "TypeScript — Vitest" },
  { value: "go",     label: "Go — testing package" },
];

const SCOPES = [
  { value: "functional",  label: "Functional regression" },
  { value: "unit",        label: "Unit tests" },
  { value: "integration", label: "Integration tests" },
  { value: "e2e",         label: "E2E / API tests" },
];

const COVERAGE = [
  { value: "changed",  label: "Changed logic only" },
  { value: "full",     label: "Changed + edge cases" },
  { value: "edge",     label: "Edge & boundary cases" },
  { value: "security", label: "Security / input validation" },
];

export default function PRForm({ onSubmit, loading }) {
  const [prUrl, setPrUrl]         = useState("");
  const [ghToken, setGhToken]     = useState("");
  const [showToken, setShowToken] = useState(false);
  const [framework, setFramework] = useState("auto");
  const [scope, setScope]         = useState("functional");
  const [coverage, setCoverage]   = useState("full");

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ prUrl, ghToken, framework, scope, coverage });
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 space-y-5">
      <div>
        <h2 className="text-sm font-semibold text-gray-200 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.113.793-.261.793-.577v-2.234C6.073 21.16 5.362 19.66 5.17 18.88c-.114-.456-.525-.95-1.02-1.12-.38-.128-.927-.458-.015-.469.857-.011 1.47.79 1.673 1.116.98 1.646 2.546 1.184 3.17.902.1-.703.383-1.183.697-1.456-2.42-.275-4.963-1.21-4.963-5.388 0-1.19.425-2.165 1.12-2.928-.112-.275-.486-1.386.107-2.888 0 0 .914-.292 2.995 1.117a10.41 10.41 0 012.727-.366 10.41 10.41 0 012.727.366c2.08-1.409 2.994-1.117 2.994-1.117.594 1.502.22 2.613.108 2.888.695.763 1.12 1.738 1.12 2.928 0 4.188-2.548 5.11-4.973 5.38.39.336.738 1.001.738 2.018v2.99c0 .319.19.695.8.576C20.565 21.796 24 17.3 24 12 24 5.373 18.627 0 12 0z"/>
          </svg>
          Pull Request
        </h2>

        {/* PR URL */}
        <div className="space-y-1">
          <label className="label">GitHub PR URL *</label>
          <input
            type="url"
            className="input-field font-mono text-xs"
            placeholder="https://github.com/owner/repo/pull/42"
            value={prUrl}
            onChange={(e) => setPrUrl(e.target.value)}
            required
          />
        </div>

        {/* GitHub Token */}
        <div className="space-y-1 mt-4">
          <label className="label">
            GitHub Token
            <span className="normal-case text-gray-600 ml-1">(optional — for private repos)</span>
          </label>
          <div className="relative">
            <input
              type={showToken ? "text" : "password"}
              className="input-field font-mono text-xs pr-16"
              placeholder="ghp_••••••••••••"
              value={ghToken}
              onChange={(e) => setGhToken(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-amber-500 hover:text-amber-400 font-medium"
              onClick={() => setShowToken((v) => !v)}
            >
              {showToken ? "hide" : "show"}
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Generate at GitHub → Settings → Developer settings → Personal access tokens
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-800" />

      {/* Options */}
      <div>
        <h2 className="text-sm font-semibold text-gray-200 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
          Test Options
        </h2>

        <div className="space-y-4">
          <div>
            <label className="label">Test Framework</label>
            <select className="select-field" value={framework} onChange={(e) => setFramework(e.target.value)}>
              {FRAMEWORKS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Test Scope</label>
            <select className="select-field" value={scope} onChange={(e) => setScope(e.target.value)}>
              {SCOPES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Coverage Focus</label>
            <select className="select-field" value={coverage} onChange={(e) => setCoverage(e.target.value)}>
              {COVERAGE.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Submit */}
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? (
          <>
            <LoadingSpinner />
            Generating…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
            Generate Tests
          </>
        )}
      </button>
    </form>
  );
}

function LoadingSpinner() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
