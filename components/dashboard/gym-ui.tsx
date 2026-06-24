import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/format'

const avatarColors = [
  'bg-[#E6F1FB] text-[#185FA5]',
  'bg-[#E1F5EE] text-[#0F6E56]',
  'bg-[#FBEAF0] text-[#993556]',
  'bg-[#FAEEDA] text-[#854F0B]',
  'bg-[#EAF3DE] text-[#3B6D11]',
]

export function getAvatarColor(name: string) {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return avatarColors[hash % avatarColors.length]
}

export function DashboardTopbar({
  title,
  children,
}: {
  title: string
  children?: ReactNode
}) {
  return (
    <div className="mb-6 flex items-center justify-between gap-3">
      <h2 className="text-lg font-medium text-foreground">{title}</h2>
      {children}
    </div>
  )
}

export function MetricCard({
  label,
  value,
  sub,
  subClassName,
  valueClassName,
}: {
  label: string
  value: ReactNode
  sub?: ReactNode
  subClassName?: string
  valueClassName?: string
}) {
  return (
    <div className="rounded-[var(--radius-md)] bg-muted p-4">
      <div className="mb-1.5 text-xs text-muted-foreground">{label}</div>
      <div className={cn('text-[22px] font-medium text-foreground', valueClassName)}>
        {value}
      </div>
      {sub ? (
        <div className={cn('mt-1 text-[11px] text-muted-foreground', subClassName)}>
          {sub}
        </div>
      ) : null}
    </div>
  )
}

export function MetricsGrid({
  columns = 4,
  children,
}: {
  columns?: 3 | 4
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        'mb-6 grid gap-3',
        columns === 3
          ? 'grid-cols-1 sm:grid-cols-3'
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
      )}
    >
      {children}
    </div>
  )
}

export function GymCard({
  title,
  action,
  children,
  className,
  contentClassName,
}: {
  title?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
}) {
  return (
    <div
      className={cn(
        'mb-4 rounded-[var(--radius-lg)] border border-border/80 bg-card p-4 sm:p-5',
        className,
      )}
    >
      {title ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="text-[15px] font-medium text-foreground">{title}</span>
          {action}
        </div>
      ) : null}
      <div className={contentClassName}>{children}</div>
    </div>
  )
}

export function StatRow({
  label,
  value,
  valueClassName,
}: {
  label: ReactNode
  value: ReactNode
  valueClassName?: string
}) {
  return (
    <div className="flex items-center justify-between border-b border-border/80 py-2 text-[13px] last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('font-medium text-foreground', valueClassName)}>{value}</span>
    </div>
  )
}

export function MemberAvatar({
  name,
  size = 'sm',
  className,
}: {
  name: string
  size?: 'sm' | 'md'
  className?: string
}) {
  const initials = getInitials(name)
  const color = getAvatarColor(name)

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-medium',
        size === 'md' ? 'size-10 text-sm' : 'size-[30px] text-[11px]',
        color,
        className,
      )}
    >
      {initials}
    </span>
  )
}

export function MemberCell({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2">
      <MemberAvatar name={name} />
      <span className="font-medium text-foreground">{name}</span>
    </div>
  )
}

export function CapacityBar({
  filled,
  total,
  label = 'Capacity utilization',
}: {
  filled: number
  total: number
  label?: string
}) {
  const percent = total > 0 ? Math.min(Math.round((filled / total) * 100), 100) : 0

  return (
    <div className="mt-4">
      <div className="mb-1 text-xs text-muted-foreground">{label}</div>
      <div className="mt-1.5 h-2 overflow-hidden rounded bg-muted">
        <div
          className="h-full rounded bg-[#185FA5] transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground">
        {filled}/{total} slots filled ({percent}%)
      </div>
    </div>
  )
}

export function TrendUp({ children }: { children: ReactNode }) {
  return <span className="text-xs text-[#3B6D11]">{children}</span>
}

export function TrendDown({ children }: { children: ReactNode }) {
  return <span className="text-xs text-[#A32D2D]">{children}</span>
}
