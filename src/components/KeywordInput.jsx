import { useState } from 'react'

export default function KeywordInput({ keywords, setKeywords, onGenerate, loading, error }) {
  const [input, setInput] = useState('')

  const addKeyword = () => {
    const trimmed = input.trim()
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed])
    }
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addKeyword()
    }
  }

  const removeKeyword = (kw) => {
    setKeywords(keywords.filter((k) => k !== kw))
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h2 className="text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-1">
        STEP 1
      </h2>
      <h3 className="text-lg font-bold text-gray-800 mb-4">キーワードを入力</h3>

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="キーワードを入力…"
          className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
        />
        <button
          onClick={addKeyword}
          disabled={!input.trim()}
          className="px-4 py-3 bg-indigo-100 text-indigo-700 font-medium rounded-xl hover:bg-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[48px]"
        >
          追加
        </button>
      </div>

      {/* タグ表示 */}
      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {keywords.map((kw) => (
            <span
              key={kw}
              className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-sm font-medium px-3 py-1.5 rounded-full"
            >
              {kw}
              <button
                onClick={() => removeKeyword(kw)}
                className="ml-1 text-indigo-400 hover:text-indigo-700 text-lg leading-none w-5 h-5 flex items-center justify-center"
                aria-label={`${kw}を削除`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {error && (
        <p className="text-red-600 text-sm mb-3 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <button
        onClick={onGenerate}
        disabled={keywords.length === 0 || loading}
        className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[48px] flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            生成中…
          </>
        ) : (
          'テーマを生成する'
        )}
      </button>
    </section>
  )
}
