const STATUS_STYLES = {
  added:    "bg-emerald-950 text-emerald-400 border-emerald-800",
  modified: "bg-blue-950 text-blue-400 border-blue-800",
  removed:  "bg-red-950 text-red-400 border-red-800",
  renamed:  "bg-amber-950 text-amber-400 border-amber-800",
};

export default function FileList({ files, filesChanged, additions, deletions }) {
  return (
    <div className="card p-5">
      {/* Stats row */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Files changed</p>
          <p className="text-2xl font-semibold text-gray-100">{filesChanged}</p>
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Additions</p>
          <p className="text-2xl font-semibold text-emerald-400">+{additions}</p>
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Deletions</p>
          <p className="text-2xl font-semibold text-red-400">−{deletions}</p>
        </div>
      </div>

      <div className="border-t border-gray-800 pt-4 space-y-1.5">
        {files.map((file) => (
          <div
            key={file.filename}
            className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            {/* File icon */}
            <svg className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>

            {/* Filename */}
            <span className="text-xs font-mono text-gray-300 truncate flex-1 min-w-0">
              {file.filename}
            </span>

            {/* Status badge */}
            <span className={`badge border text-xs flex-shrink-0 ${STATUS_STYLES[file.status] || STATUS_STYLES.modified}`}>
              {file.status}
            </span>

            {/* Diff counts */}
            <span className="text-xs text-emerald-500 font-mono w-8 text-right flex-shrink-0">
              +{file.additions}
            </span>
            <span className="text-xs text-red-500 font-mono w-8 text-right flex-shrink-0">
              −{file.deletions}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
