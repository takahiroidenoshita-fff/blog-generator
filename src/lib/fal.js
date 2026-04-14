import { fal } from '@fal-ai/client'

export async function generateImages(prompt, falApiKey) {
  if (!falApiKey) throw new Error('fal.ai APIキーが設定されていません。設定パネルから入力してください。')

  fal.config({ credentials: falApiKey })

  const result = await fal.subscribe('fal-ai/flux/schnell', {
    input: {
      prompt,
      image_size: 'landscape_4_3',
      num_inference_steps: 4,
      num_images: 4,
      enable_safety_checker: true,
    },
  })

  const urls = result?.data?.images?.map((img) => img.url).filter(Boolean)
  if (!urls || urls.length === 0) throw new Error('画像URLが取得できませんでした')
  return urls
}
