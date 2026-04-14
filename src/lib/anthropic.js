const API_URL = 'https://api.anthropic.com/v1/messages'

const TONE_MAP = {
  フレンドリー: '親しみやすくカジュアルな口調、読者に語りかけるスタイル',
  プロフェッショナル: '丁寧で信頼感のある文体、専門的な表現を適度に使用',
  'モチベーション系': '前向きでエネルギッシュ、読者の行動を促す表現',
}

function getHeaders(apiKey) {
  return {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true',
  }
}

function parseThemeJSON(text) {
  // コードブロックが含まれる場合に除去
  const cleaned = text
    .replace(/^```(?:json)?\s*/m, '')
    .replace(/\s*```$/m, '')
    .trim()
  return JSON.parse(cleaned)
}

export async function generateThemes(keywords, tone, apiKey) {
  if (!apiKey) throw new Error('APIキーが設定されていません。設定パネルから入力してください。')

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: getHeaders(apiKey),
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: `あなたはブログ編集者です。与えられたキーワードとトーンに合ったブログテーマを5つ提案してください。
以下のJSON形式のみで返答してください（説明文・コードブロック不要）:
[
  { "title": "テーマタイトル", "description": "100字以内の概要" }
]`,
      messages: [
        {
          role: 'user',
          content: `キーワード: ${keywords.join(', ')}\nトーン: ${TONE_MAP[tone] || tone}`,
        },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `APIエラー: ${res.status}`)
  }

  const data = await res.json()
  return parseThemeJSON(data.content[0].text)
}

export async function generateImagePrompt(theme, keywords, apiKey) {
  if (!apiKey) throw new Error('APIキーが設定されていません。')

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: getHeaders(apiKey),
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 150,
      messages: [
        {
          role: 'user',
          content: `You are an expert at writing image generation prompts.
Create a vivid, specific English prompt for a blog featured image.

Blog theme: ${theme.title}
Description: ${theme.description}
Keywords: ${keywords.join(', ')}

Rules:
- English only
- Describe concrete visual scene (subject, setting, lighting, mood)
- Include style: "professional photography, high quality, sharp focus"
- Max 2 sentences
- No quotes, no explanation — just the prompt`,
        },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `APIエラー: ${res.status}`)
  }

  const data = await res.json()
  return data.content[0].text.trim()
}

export async function generateArticle(theme, tone, wordCount, apiKey, onChunk) {
  if (!apiKey) throw new Error('APIキーが設定されていません。設定パネルから入力してください。')

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: getHeaders(apiKey),
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      stream: true,
      system: `あなたはプロのブログライターです。指定されたテーマ・トーン・文字数でブログ本文を書いてください。
本文のみ出力してください（タイトルや説明文は不要）。`,
      messages: [
        {
          role: 'user',
          content: `テーマ: ${theme.title}\n概要: ${theme.description}\nトーン: ${TONE_MAP[tone] || tone}\n目標文字数: ${wordCount}字程度`,
        },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `APIエラー: ${res.status}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let accumulated = ''
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const payload = line.slice(6).trim()
      if (payload === '[DONE]') break
      try {
        const event = JSON.parse(payload)
        if (
          event.type === 'content_block_delta' &&
          event.delta?.type === 'text_delta'
        ) {
          accumulated += event.delta.text
          onChunk(accumulated)
        }
      } catch {
        // 不正な JSON は無視
      }
    }
  }

  return accumulated
}
