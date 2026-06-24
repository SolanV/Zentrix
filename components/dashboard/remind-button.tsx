'use client'

import { Button } from '@/components/ui/button'

interface RemindButtonProps {
  memberName: string
  expiryDate: string
  phone: string | null
}

export function RemindButton({ memberName, expiryDate, phone }: RemindButtonProps) {
  const handleWhatsAppSend = () => {
    // Standard template message
    const message = `Hello ${memberName}, your Fitness World membership expires on ${expiryDate}. Please renew your membership to continue enjoying our services.`
    
    // Clean phone number (keep digits only)
    let cleanPhone = phone ? phone.replace(/[^\d]/g, '') : ''
    
    // If it's a 10-digit Indian number without country code, prefix with 91
    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`
    }

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-7 px-3.5 text-xs font-medium border-orange-500/20 hover:border-orange-500/40 text-orange-600 hover:text-orange-700 bg-orange-500/5 hover:bg-orange-500/10"
      onClick={handleWhatsAppSend}
    >
      Remind ↗
    </Button>
  )
}

