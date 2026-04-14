const TONES = ['フレンドリー', 'プロフェッショナル', 'モチベーション系']

export default function SettingsPanel({
  isOpen,
  onClose,
  tone,
  setTone,
  footer,
  setFooter,
  apiKey,
  setApiKey,
  falApiKey,
  setFalApiKey,
}) {
  return (
    <>
      {/* オーバーレイ */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      {/* PCでも薄いオーバーレイ */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 hidden md:block"
          onClick={onClose}
        />
      )}

      {/* パネル本体 */}
      <div
        className={`settings-panel fixed z-50 bg-white shadow-2xl overflow-y-auto
          /* モバイル: ボトムシート */
          inset-x-0 bottom-0 rounded-t-2xl max-h-[88vh]
          /* PC: 右サイドバー */
          md:inset-x-auto md:right-0 md:top-0 md:bottom-0 md:max-h-none md:h-full md:w-80 md:rounded-none
          ${isOpen ? 'open' : ''}`}
      >
        {/* ハンドル（モバイルのみ） */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        <div className="p-5 pb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-800">設定</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none p-1"
              aria-label="閉じる"
            >
              ×
            </button>
          </div>

          {/* Anthropic APIキー */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Anthropic APIキー
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <p className="text-xs text-gray-400 mt-1">端末のローカルストレージに保存されます</p>
          </div>

          {/* fal.ai APIキー */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              fal.ai APIキー
              <span className="ml-2 text-xs font-normal text-gray-400">（画像生成オプション）</span>
            </label>
            <input
              type="password"
              value={falApiKey}
              onChange={(e) => setFalApiKey(e.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:xxxx"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <p className="text-xs text-gray-400 mt-1">アイキャッチ画像生成に使用します</p>
          </div>

          {/* トーン選択 */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              文章トーン
            </label>
            <div className="space-y-2">
              {TONES.map((t) => (
                <label
                  key={t}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                    tone === t
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="tone"
                    value={t}
                    checked={tone === t}
                    onChange={() => setTone(t)}
                    className="accent-indigo-600"
                  />
                  <span className="text-sm font-medium text-gray-700">{t}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 文末テンプレート */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              文末テンプレート
            </label>
            <textarea
              value={footer}
              onChange={(e) => setFooter(e.target.value)}
              placeholder={'住所やハッシュタグなど…\n例）#ブログ #AI'}
              rows={5}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 leading-relaxed"
            />
            <p className="text-xs text-gray-400 mt-1">記事末尾に自動追加されます</p>
          </div>
        </div>
      </div>
    </>
  )
}
