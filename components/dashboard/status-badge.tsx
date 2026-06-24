import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const styles: Record<string, string> = {
  active: 'bg-[#EAF3DE] text-[#3B6D11] hover:bg-[#EAF3DE]',
  paid: 'bg-[#EAF3DE] text-[#3B6D11] hover:bg-[#EAF3DE]',
  attended: 'bg-[#EAF3DE] text-[#3B6D11] hover:bg-[#EAF3DE]',
  booked: 'bg-[#E6F1FB] text-[#185FA5] hover:bg-[#E6F1FB]',
  pending: 'bg-[#FAEEDA] text-[#854F0B] hover:bg-[#FAEEDA]',
  frozen: 'bg-[#E6F1FB] text-[#185FA5] hover:bg-[#E6F1FB]',
  overdue: 'bg-[#FCEBEB] text-[#A32D2D] hover:bg-[#FCEBEB]',
  expired: 'bg-[#FCEBEB] text-[#A32D2D] hover:bg-[#FCEBEB]',
  no_show: 'bg-[#FCEBEB] text-[#A32D2D] hover:bg-[#FCEBEB]',
  inactive: 'bg-muted text-muted-foreground hover:bg-muted',
  cancelled: 'bg-muted text-muted-foreground hover:bg-muted',
}

export function StatusBadge({ status, children }: { status: string; children?: React.ReactNode }) {
  return (
    <Badge
      variant="secondary"
      className={cn('capitalize', styles[status] ?? 'bg-muted text-muted-foreground')}
    >
      {children ?? status.replace('_', ' ')}
    </Badge>
  )
}
