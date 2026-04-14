export default function ThemeCards({
  themes,
  loading,
  selectedTheme,
  onSelect,
  onShowStep3,
}) {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h2 className="text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-1">
        STEP 2
      </h2>
      <h3 className="text-lg font-bold text-gray-800 mb-4">テーマを選択</h3>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {themes.map((theme, i) => (
            <button
              key={i}
              onClick={() => onSelect(theme)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                selectedTheme === theme
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
              }`}
            >
              <p className="font-semibold text-gray-800 text-sm mb-1">{theme.title}</p>
              <p className="text-gray-500 text-xs leading-relaxed">{theme.description}</p>
            </button>
          ))}
        </div>
      )}

      {!loading && themes.length > 0 && (
        <button
          onClick={onShowStep3}
          disabled={!selectedTheme}
          className="mt-4 w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[48px]"
        >
          このテーマで記事を生成する
        </button>
      )}
    </section>
  )
}
