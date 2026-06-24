'use client'

import { toast } from 'sonner'

export function sendPrompt(prompt: string) {
  if (typeof window !== 'undefined') {
    // @ts-ignore
    if (typeof window.sendPrompt === 'function') {
      // @ts-ignore
      window.sendPrompt(prompt)
    } else {
      console.log('sendPrompt called with:', prompt)
      toast.info(`Prompt requested: "${prompt}"`, {
        duration: 4000,
      })
    }
  }
}
