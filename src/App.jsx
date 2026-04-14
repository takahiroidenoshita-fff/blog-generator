import { useState, useEffect, useRef } from 'react'
import SettingsPanel from './components/SettingsPanel'
import KeywordInput from './components/KeywordInput'
import ThemeCards from './components/ThemeCards'
import ArticleOutput from './components/ArticleOutput'
import useSettings from './hooks/useSettings'
import { generateThemes, generateArticle, generateImagePrompt } from './lib/anthropic'
import { generateImages } from './lib/fal'

export default function App() {
  const { tone, setTone, footer, setFooter, apiKey, setApiKey, falApiKey, setFalApiKey } = useSettings()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  // STEP 1
  const [keywords, setKeywords] = useState([])
  const [themesLoading, setThemesLoading] = useState(false)
  const [themesError, setThemesError] = useState('')

  // STEP 2
  const [themes, setThemes] = useState([])
  const [selectedTheme, setSelectedTheme] = useState(null)

  // STEP 3
  const [step3Visible, setStep3Visible] = useState(false)
  const [wordCount, setWordCount] = useState(500)
  const [customWordCount, setCustomWordCount] = useState(500)
  const [isCustom, setIsCustom] = useState(false)
  // articleText: テキストエリアに表示するテキスト（生成後はユーザーが編集可能）
  const [articleText, setArticleText] = useState('')
  const [articleLoading, setArticleLoading] = useState(false)
  const [articleError, setArticleError] = useState('')

  // 画像生成
  const [imageUrls, setImageUrls] = useState([])
  const [imageLoading, setImageLoading] = useState(false)
  const [imageError, setImageError] = useState('')

  // Toast
  const [toast, setToast] = useState('')
  const toastTimer = useRef(null)

  // オンライン/オフライン監視
  useEffect(() => {
    const online = () => setIsOnline(true)
    const offline = () => setIsOnline(false)
    window.addEventListener('online', online)
    window.addEventListener('offline', offline)
    return () => {
      window.removeEventListener('online', online)
      window.removeEventListener('offline', offline)
    }
  }, [])

  const showToast = (message) => {
    setToast(message)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2000)
  }

  const handleGenerateThemes = async () => {
    if (!isOnline) return showToast('ネット接続が必要です')
    if (keywords.length === 0) return
    setThemesLoading(true)
    setThemesError('')
    setThemes([])
    setSelectedTheme(null)
    setStep3Visible(false)
    setArticleText('')
    setImageUrls([])
    try {
      const result = await generateThemes(keywords, tone, apiKey)
      setThemes(result)
    } catch (e) {
      setThemesError(e.message || 'テーマ生成に失敗しました')
    } finally {
      setThemesLoading(false)
    }
  }

  const handleShowStep3 = () => {
    if (!selectedTheme) return
    setStep3Visible(true)
    setArticleText('')
    setArticleError('')
    setImageUrls([])
    setImageError('')
    // 少し後にスクロール
    setTimeout(() => {
      document.getElementById('step3')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const handleGenerateArticle = async () => {
    if (!isOnline) return showToast('ネット接続が必要です')
    if (!selectedTheme) return
    setArticleLoading(true)
    setArticleError('')
    setArticleText('')
    try {
      const result = await generateArticle(
        selectedTheme,
        tone,
        wordCount,
        apiKey,
        // ストリーミング中はフッターなしで表示
        (partial) => setArticleText(partial),
      )
      // 完了後にフッターを付与
      setArticleText(result + (footer ? '\n\n' + footer : ''))
    } catch (e) {
      setArticleError(e.message || '記事生成に失敗しました')
    } finally {
      setArticleLoading(false)
    }
  }

  const handleGenerateImage = async () => {
    if (!isOnline) return showToast('ネット接続が必要です')
    if (!selectedTheme) return
    setImageLoading(true)
    setImageError('')
    setImageUrls([])
    try {
      // Claude でテーマ＋キーワードから具体的な英語プロンプトを生成
      const prompt = await generateImagePrompt(selectedTheme, keywords, apiKey)
      // fal.ai で4枚生成
      const urls = await generateImages(prompt, falApiKey)
      setImageUrls(urls)
    } catch (e) {
      setImageError(e.message || '画像生成に失敗しました')
    } finally {
      setImageLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(articleText)
      showToast('コピーしました ✓')
    } catch {
      showToast('コピーに失敗しました')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-800">ブログジェネレーター</h1>
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 text-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="設定を開く"
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* オフライン通知 */}
      {!isOnline && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-sm text-amber-800">
          ネット接続が必要です。オフライン中は記事を生成できません。
        </div>
      )}

      {/* メインコンテンツ */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 space-y-5 pb-20">
        {/* STEP 1 */}
        <KeywordInput
          keywords={keywords}
          setKeywords={setKeywords}
          onGenerate={handleGenerateThemes}
          loading={themesLoading}
          error={themesError}
        />

        {/* STEP 2 */}
        {(themes.length > 0 || themesLoading) && (
          <ThemeCards
            themes={themes}
            loading={themesLoading}
            selectedTheme={selectedTheme}
            onSelect={(theme) => {
              setSelectedTheme(theme)
              setStep3Visible(false)
              setArticleText('')
              setArticleError('')
              setImageUrls([])
              setImageError('')
            }}
            onShowStep3={handleShowStep3}
          />
        )}

        {/* STEP 3 */}
        {step3Visible && (
          <div id="step3">
            <ArticleOutput
              article={articleText}
              onArticleChange={(text) => setArticleText(text)}
              loading={articleLoading}
              error={articleError}
              wordCount={wordCount}
              setWordCount={setWordCount}
              customWordCount={customWordCount}
              setCustomWordCount={setCustomWordCount}
              isCustom={isCustom}
              setIsCustom={setIsCustom}
              onGenerate={handleGenerateArticle}
              onCopy={handleCopy}
              imageUrls={imageUrls}
              imageLoading={imageLoading}
              imageError={imageError}
              onGenerateImage={handleGenerateImage}
              hasFalKey={!!falApiKey}
            />
          </div>
        )}
      </main>

      {/* 設定パネル */}
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        tone={tone}
        setTone={setTone}
        footer={footer}
        setFooter={setFooter}
        apiKey={apiKey}
        setApiKey={setApiKey}
        falApiKey={falApiKey}
        setFalApiKey={setFalApiKey}
      />

      {/* トースト通知 */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-lg z-[60] pointer-events-none">
          {toast}
        </div>
      )}
    </div>
  )
}
