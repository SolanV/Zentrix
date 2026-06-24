'use client'

import { Button } from '@/components/ui/button'
import { sendPrompt } from '@/lib/prompt'

interface PromptButtonProps {
  prompt: string
  children: React.ReactNode
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function PromptButton({
  prompt,
  children,
  variant = 'outline',
  size = 'sm',
  className,
}: PromptButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={() => sendPrompt(prompt)}
    >
      {children}
    </Button>
  )
}
