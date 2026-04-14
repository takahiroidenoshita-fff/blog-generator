const WORD_COUNT_OPTIONS = [300, 500, 800, 1200]

export default function ArticleOutput({
  article,
  onArticleChange,
  loading,
  error,
  wordCount,
  setWordCount,
  customWordCount,
  setCustomWordCount,
  isCustom,
  setIsCustom,
  onGenerate,
  onCopy,
  imageUrls,
  imageLoading,
  imageError,
  onGenerateImage,
  hasFalKey,
}) {
  const charCount = article.length

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h2 className="text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-1">
        STEP 3
      </h2>
      <h3 className="text-lg font-bold text-gray-800 mb-4">記事を生成</h3>

      {/* 文字数選択 */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-600 mb-2">目標文字数</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {WORD_COUNT_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => {
                setIsCustom(false)
                setWordCount(n)
              }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors min-h-[40px] ${
                !isCustom && wordCount === n
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-indigo-100'
              }`}
            >
              {n}字
            </button>
          ))}
          <button
            onClick={() => setIsCustom(true)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors min-h-[40px] ${
              isCustom
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-indigo-100'
            }`}
          >
            カスタム
          </button>
        </div>
        {isCustom && (
          <input
            type="number"
            value={customWordCount}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10)
              if (!isNaN(v) && v > 0) {
                setCustomWordCount(v)
                setWordCount(v)
              }
            }}
            min={100}
            max={5000}
            placeholder="文字数を入力"
            className="border border-gray-300 rounded-xl px-4 py-2 w-40 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        )}
      </div>

      {/* 生成ボタン */}
      <button
        onClick={onGenerate}
        disabled={loading}
        className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[48px] flex items-center justify-center gap-2 mb-4"
      >
        {loading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            生成中…
          </>
        ) : (
          '生成する'
        )}
      </button>

      {error && (
        <p className="text-red-600 text-sm mb-3 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      {/* 生成結果 */}
      {(article || loading) && (
        <>
          <textarea
            value={article}
            onChange={(e) => onArticleChange(e.target.value)}
            readOnly={loading}
            rows={12}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">{charCount.toLocaleString()} 文字</span>
            {!loading && article && (
              <button
                onClick={onCopy}
                className="px-5 py-2 bg-gray-800 text-white text-sm font-medium rounded-xl hover:bg-gray-900 transition-colors min-h-[40px]"
              >
                コピーする
              </button>
            )}
          </div>
        </>
      )}

      {/* アイキャッチ画像生成 */}
      {!loading && article && hasFalKey && (
        <div className="mt-5 border-t border-gray-100 pt-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">アイキャッチ画像</h4>
          <button
            onClick={onGenerateImage}
            disabled={imageLoading}
            className="w-full py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[48px] flex items-center justify-center gap-2"
          >
            {imageLoading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                生成中…（4枚）
              </>
            ) : imageUrls.length > 0 ? (
              '画像を再生成する'
            ) : (
              '画像を生成する（4枚）'
            )}
          </button>

          {imageError && (
            <p className="text-red-600 text-sm mt-2 bg-red-50 rounded-lg px-3 py-2">{imageError}</p>
          )}

          {imageUrls.length > 0 && !imageLoading && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {imageUrls.map((url, i) => (
                <div key={url} className="relative group">
                  <img
                    src={url}
                    alt={`アイキャッチ画像 ${i + 1}`}
                    className="w-full rounded-xl shadow-sm"
                  />
                  <a
                    href={url}
                    download={`featured-image-${i + 1}.jpg`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-2 right-2 px-3 py-1 bg-gray-900/70 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    DL
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
