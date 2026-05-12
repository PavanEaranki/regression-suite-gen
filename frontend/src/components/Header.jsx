export default function Header() {
  return (
    <header className="border-b border-gray-800 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo + Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-gray-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-semibold text-gray-100 leading-none">
              Regression Suite Generator
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              GitHub PR → Gemini → Functional Tests
            </p>
          </div>
        </div>

        {/* Tech stack badges */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="badge bg-blue-950 text-blue-400 border border-blue-800">
            GitHub API
          </span>
          <span className="badge bg-purple-950 text-purple-400 border border-purple-800">
            Gemini 1.5 Flash
          </span>
          <span className="badge bg-emerald-950 text-emerald-400 border border-emerald-800">
            Free tier
          </span>
        </div>
      </div>
    </header>
  );
}
