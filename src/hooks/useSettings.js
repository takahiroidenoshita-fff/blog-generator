import { useState, useEffect } from 'react'

const KEYS = {
  tone: 'blog_gen_tone',
  footer: 'blog_gen_footer',
  apiKey: 'blog_gen_api_key',
  falApiKey: 'blog_gen_fal_api_key',
}

function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? stored : defaultValue
    } catch {
      return defaultValue
    }
  })

  const setAndStore = (newValue) => {
    setValue(newValue)
    try {
      localStorage.setItem(key, newValue)
    } catch {}
  }

  return [value, setAndStore]
}

export default function useSettings() {
  const [tone, setTone] = useLocalStorage(KEYS.tone, 'フレンドリー')
  const [footer, setFooter] = useLocalStorage(KEYS.footer, '')
  const [apiKey, setApiKey] = useLocalStorage(KEYS.apiKey, '')
  const [falApiKey, setFalApiKey] = useLocalStorage(KEYS.falApiKey, '')

  return { tone, setTone, footer, setFooter, apiKey, setApiKey, falApiKey, setFalApiKey }
}
