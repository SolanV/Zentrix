import { randomUUID } from 'crypto'
import type {
  Attendance,
  GymClass,
  Member,
  MembershipPlan,
  Payment,
  Trainer,
  TrainerAttendance,
  GymSettings,
} from '@/lib/types'

type D1Value = string | number | boolean | null

interface D1QueryResult<T> {
  results?: T[]
  success?: boolean
  meta?: unknown
}

interface D1ApiResponse<T> {
  errors?: { message: string }[]
  messages?: string[]
  result?: D1QueryResult<T> | D1QueryResult<T>[]
  success: boolean
}

function requiredEnv(name: string) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

function getD1Config() {
  return {
    accountId: requiredEnv('CLOUDFLARE_ACCOUNT_ID'),
    databaseId: requiredEnv('CLOUDFLARE_D1_DATABASE_ID'),
    apiToken: requiredEnv('CLOUDFLARE_D1_API_TOKEN'),
  }
}

function normalizeParams(params: D1Value[]) {
  return params.map((param) => {
    if (typeof param === 'boolean') return param ? 1 : 0
    return param
  })
}

async function d1Query<T>(sql: string, params: D1Value[] = []) {
  const { accountId, databaseId, apiToken } = getD1Config()
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql, params: normalizeParams(params) }),
      cache: 'no-store',
    },
  )
  const payload = (await response.json()) as D1ApiResponse<T>

  if (!response.ok || !payload.success) {
    const message =
      payload.errors?.map((error) => error.message).join(', ') ||
      `Cloudflare D1 query failed with status ${response.status}`

    throw new Error(message)
  }

  const result = Array.isArray(payload.result) ? payload.result[0] : payload.result
  return result?.results ?? []
}

async function first<T>(sql: string, params: D1Value[] = []) {
  const rows = await d1Query<T>(sql, params)
  return rows[0] ?? null
}

async function run(sql: string, params: D1Value[] = []) {
  await d1Query(sql, params)
}

function asBoolean<T extends { is_active?: number | boolean }>(row: T) {
  return {
    ...row,
    is_active: Boolean(row.is_active),
  }
}

function withPlan(row: Member & { plan_name?: string | null; plan_price?: number | null }) {
  return {
    ...row,
    membership_plans: row.plan_id
      ? {
          id: row.plan_id,
          name: row.plan_name ?? '',
          price: Number(row.plan_price ?? 0),
        }
      : null,
  } as Member
}

export async function listPlans() {
  const rows = await d1Query<MembershipPlan & { is_active: number }>(
    'SELECT * FROM membership_plans ORDER BY price ASC',
  )

  return rows.map(asBoolean) as MembershipPlan[]
}

export async function listPlanOptions() {
  return d1Query<Pick<MembershipPlan, 'id' | 'name'>>(
    'SELECT id, name FROM membership_plans ORDER BY name ASC',
  )
}

export async function listSettingsPlans() {
  return d1Query<Pick<MembershipPlan, 'id' | 'name' | 'price' | 'duration_days'>>(
    'SELECT id, name, price, duration_days FROM membership_plans ORDER BY price ASC',
  )
}

export async function getPlanDuration(planId: string) {
  const plan = await first<Pick<MembershipPlan, 'duration_days'>>(
    'SELECT duration_days FROM membership_plans WHERE id = ? LIMIT 1',
    [planId],
  )

  return plan?.duration_days ?? null
}

export async function getPlanRecord(planId: string) {
  return first<MembershipPlan>(
    'SELECT * FROM membership_plans WHERE id = ? LIMIT 1',
    [planId],
  )
}


export async function createPlanRecord(input: {
  description: string | null
  duration_days: number
  is_active: boolean
  name: string
  price: number
}) {
  await run(
    `INSERT INTO membership_plans (id, name, description, price, duration_days, is_active)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      randomUUID(),
      input.name,
      input.description,
      input.price,
      input.duration_days,
      input.is_active,
    ],
  )
}

export async function updatePlanRecord(id: string, input: {
  description: string | null
  duration_days: number
  is_active: boolean
  name: string
  price: number
}) {
  await run(
    `UPDATE membership_plans
     SET name = ?, description = ?, price = ?, duration_days = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [input.name, input.description, input.price, input.duration_days, input.is_active, id],
  )
}

export async function deletePlanRecord(id: string) {
  await run('DELETE FROM membership_plans WHERE id = ?', [id])
}

export async function listMembersWithPlans() {
  const rows = await d1Query<
    Member & { plan_name?: string | null; plan_price?: number | null }
  >(
    `SELECT members.*, membership_plans.name AS plan_name, membership_plans.price AS plan_price
     FROM members
     LEFT JOIN membership_plans ON membership_plans.id = members.plan_id
     ORDER BY members.created_at DESC`,
  )

  return rows.map(withPlan)
}

export async function listActiveMemberOptions() {
  return d1Query<Pick<Member, 'id' | 'full_name'>>(
    `SELECT id, full_name FROM members
     WHERE status = 'active'
     ORDER BY full_name ASC`,
  )
}

export async function listMemberOptions() {
  return d1Query<Pick<Member, 'id' | 'full_name'>>(
    'SELECT id, full_name FROM members ORDER BY full_name ASC',
  )
}

export async function createMemberRecord(input: Omit<Member, 'id' | 'created_at' | 'join_date' | 'membership_plans'>) {
  await run(
    `INSERT INTO members (
       id, full_name, email, phone, gender, date_of_birth, address,
       plan_id, membership_start, membership_end, status
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      randomUUID(),
      input.full_name,
      input.email,
      input.phone,
      input.gender,
      input.date_of_birth,
      input.address,
      input.plan_id,
      input.membership_start,
      input.membership_end,
      input.status,
    ],
  )
}

export async function updateMemberRecord(id: string, input: Omit<Member, 'id' | 'created_at' | 'join_date' | 'membership_plans'>) {
  await run(
    `UPDATE members
     SET full_name = ?, email = ?, phone = ?, gender = ?, date_of_birth = ?,
         address = ?, plan_id = ?, membership_start = ?, membership_end = ?,
         status = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      input.full_name,
      input.email,
      input.phone,
      input.gender,
      input.date_of_birth,
      input.address,
      input.plan_id,
      input.membership_start,
      input.membership_end,
      input.status,
      id,
    ],
  )
}

export async function deleteMemberRecord(id: string) {
  await run('DELETE FROM members WHERE id = ?', [id])
}

export async function listPaymentsWithRelations() {
  const rows = await d1Query<
    Payment & { member_name?: string | null; plan_name?: string | null }
  >(
    `SELECT payments.*, members.full_name AS member_name, membership_plans.name AS plan_name
     FROM payments
     LEFT JOIN members ON members.id = payments.member_id
     LEFT JOIN membership_plans ON membership_plans.id = payments.plan_id
     ORDER BY payments.created_at DESC`,
  )

  return rows.map((row) => ({
    ...row,
    members: row.member_id ? { id: row.member_id, full_name: row.member_name ?? '' } : null,
    membership_plans: row.plan_id ? { id: row.plan_id, name: row.plan_name ?? '' } : null,
  })) as Payment[]
}

export async function createPaymentRecord(input: {
  amount: number
  due_date: string | null
  member_id: string
  method: string | null
  notes: string | null
  paid_at: string | null
  plan_id: string | null
  status: string
}) {
  await run(
    `INSERT INTO payments (
       id, invoice_number, member_id, plan_id, amount, status, method, due_date, paid_at, notes
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      randomUUID(),
      `INV-${Date.now()}`,
      input.member_id,
      input.plan_id,
      input.amount,
      input.status,
      input.method,
      input.due_date,
      input.paid_at,
      input.notes,
    ],
  )
}

export async function updatePaymentStatusRecord(id: string, status: string) {
  await run(
    `UPDATE payments
     SET status = ?, paid_at = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [status, status === 'paid' ? new Date().toISOString() : null, id],
  )
}

export async function deletePaymentRecord(id: string) {
  await run('DELETE FROM payments WHERE id = ?', [id])
}

export async function listAttendanceWithMembers(limit = 200) {
  const rows = await d1Query<Attendance & { member_name?: string | null }>(
    `SELECT attendance.*, members.full_name AS member_name
     FROM attendance
     LEFT JOIN members ON members.id = attendance.member_id
     ORDER BY attendance.check_in DESC
     LIMIT ?`,
    [limit],
  )

  return rows.map((row) => ({
    ...row,
    members: row.member_id ? { id: row.member_id, full_name: row.member_name ?? '' } : null,
  })) as Attendance[]
}

export async function checkInMemberRecord(memberId: string) {
  await run('INSERT INTO attendance (id, member_id, check_in) VALUES (?, ?, ?)', [
    randomUUID(),
    memberId,
    new Date().toISOString(),
  ])
}

export async function checkOutMemberRecord(attendanceId: string) {
  await run('UPDATE attendance SET check_out = ? WHERE id = ?', [
    new Date().toISOString(),
    attendanceId,
  ])
}

export async function deleteAttendanceRecord(id: string) {
  await run('DELETE FROM attendance WHERE id = ?', [id])
}

export async function listTrainerAttendanceWithTrainers(limit = 200) {
  const rows = await d1Query<TrainerAttendance & { trainer_name?: string | null }>(
    `SELECT trainer_attendance.*, trainers.full_name AS trainer_name
     FROM trainer_attendance
     LEFT JOIN trainers ON trainers.id = trainer_attendance.trainer_id
     ORDER BY trainer_attendance.check_in DESC
     LIMIT ?`,
    [limit],
  )

  return rows.map((row) => ({
    ...row,
    trainers: row.trainer_id ? { id: row.trainer_id, full_name: row.trainer_name ?? '' } : null,
  })) as TrainerAttendance[]
}

export async function checkInTrainerRecord(trainerId: string) {
  await run('INSERT INTO trainer_attendance (id, trainer_id, check_in) VALUES (?, ?, ?)', [
    randomUUID(),
    trainerId,
    new Date().toISOString(),
  ])
}

export async function checkOutTrainerRecord(attendanceId: string) {
  await run('UPDATE trainer_attendance SET check_out = ? WHERE id = ?', [
    new Date().toISOString(),
    attendanceId,
  ])
}

export async function deleteTrainerAttendanceRecord(id: string) {
  await run('DELETE FROM trainer_attendance WHERE id = ?', [id])
}

type TrainerRow = Omit<Trainer, 'is_active'> & {
  class_count: number
  is_active: number
}

export async function listTrainersWithClassCount() {
  const rows = await d1Query<TrainerRow>(
    `SELECT trainers.*, COUNT(classes.id) AS class_count
     FROM trainers
     LEFT JOIN classes ON classes.trainer_id = trainers.id
     GROUP BY trainers.id
     ORDER BY trainers.full_name ASC`,
  )

  return rows.map((row) => ({
    ...row,
    is_active: Boolean(row.is_active),
    classes: Array.from({ length: Number(row.class_count ?? 0) }, (_, index) => ({
      id: String(index),
    })),
  }))
}

export async function listActiveTrainerOptions() {
  return d1Query<Pick<Trainer, 'id' | 'full_name'>>(
    `SELECT id, full_name FROM trainers
     WHERE is_active = 1
     ORDER BY full_name ASC`,
  )
}

export async function createTrainerRecord(input: Omit<Trainer, 'id' | 'created_at'>) {
  await run(
    `INSERT INTO trainers (full_name, email, phone, specialization, bio, is_active)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      input.full_name,
      input.email,
      input.phone,
      input.specialization,
      input.bio,
      input.is_active,
    ],
  )
}

export async function updateTrainerRecord(id: string, input: Omit<Trainer, 'id' | 'created_at'>) {
  await run(
    `UPDATE trainers
     SET full_name = ?, email = ?, phone = ?, specialization = ?, bio = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      input.full_name,
      input.email,
      input.phone,
      input.specialization,
      input.bio,
      input.is_active,
      id,
    ],
  )
}

export async function deleteTrainerRecord(id: string) {
  await run('DELETE FROM trainers WHERE id = ?', [id])
}

type ClassRow = Omit<GymClass, 'is_active'> & {
  booking_count: number
  is_active: number
  trainer_name?: string | null
}

export async function listClassesWithRelations() {
  const rows = await d1Query<ClassRow>(
    `SELECT classes.*, trainers.full_name AS trainer_name, COUNT(class_bookings.id) AS booking_count
     FROM classes
     LEFT JOIN trainers ON trainers.id = classes.trainer_id
     LEFT JOIN class_bookings ON class_bookings.class_id = classes.id
     GROUP BY classes.id
     ORDER BY classes.name ASC`,
  )

  return rows.map((row) => ({
    ...row,
    is_active: Boolean(row.is_active),
    trainers: row.trainer_id
      ? { id: row.trainer_id, full_name: row.trainer_name ?? '' }
      : null,
    class_bookings: Array.from({ length: Number(row.booking_count ?? 0) }, (_, index) => ({
      id: String(index),
    })),
  }))
}

export async function createClassRecord(input: Omit<GymClass, 'id' | 'created_at' | 'trainers'>) {
  await run(
    `INSERT INTO classes (
       name, description, trainer_id, day_of_week, start_time, end_time, capacity, is_active
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.name,
      input.description,
      input.trainer_id,
      input.day_of_week,
      input.start_time,
      input.end_time,
      input.capacity,
      input.is_active,
    ],
  )
}

export async function updateClassRecord(id: string, input: Omit<GymClass, 'id' | 'created_at' | 'trainers'>) {
  await run(
    `UPDATE classes
     SET name = ?, description = ?, trainer_id = ?, day_of_week = ?,
         start_time = ?, end_time = ?, capacity = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      input.name,
      input.description,
      input.trainer_id,
      input.day_of_week,
      input.start_time,
      input.end_time,
      input.capacity,
      input.is_active,
      id,
    ],
  )
}

export async function deleteClassRecord(id: string) {
  await run('DELETE FROM classes WHERE id = ?', [id])
}

export async function bookMemberIntoClassRecord(classId: string, memberId: string) {
  await run('INSERT INTO class_bookings (class_id, member_id) VALUES (?, ?)', [
    classId,
    memberId,
  ])
}

export async function cancelBookingRecord(id: string) {
  await run('DELETE FROM class_bookings WHERE id = ?', [id])
}

export async function getDashboardData() {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const yesterdayStart = new Date(todayStart)
  yesterdayStart.setDate(yesterdayStart.getDate() - 1)
  const yesterdayEnd = new Date(todayStart)

  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const lastMonthStart = new Date(monthStart)
  lastMonthStart.setMonth(lastMonthStart.getMonth() - 1)
  const lastMonthEnd = new Date(monthStart)

  const todayStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())

  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)
  const nextWeekStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(nextWeek)

  const [
    totalMembers,
    activeMembers,
    registeredThisMonth,
    todayCheckins,
    yesterdayCheckins,
    paidThisMonth,
    paidLastMonth,
    overduePayments,
    membersByPlan,
    recentCheckins,
    recentPayments,
    recentMembers,
    recentClasses,
    upcomingRenewals,
  ] = await Promise.all([
    first<{ count: number }>('SELECT COUNT(*) AS count FROM members'),
    first<{ count: number }>("SELECT COUNT(*) AS count FROM members WHERE status = 'active'"),
    first<{ count: number }>('SELECT COUNT(*) AS count FROM members WHERE created_at >= ?', [
      monthStart.toISOString(),
    ]),
    first<{ count: number }>('SELECT COUNT(*) AS count FROM attendance WHERE check_in >= ?', [
      todayStart.toISOString(),
    ]),
    first<{ count: number }>(
      'SELECT COUNT(*) AS count FROM attendance WHERE check_in >= ? AND check_in < ?',
      [yesterdayStart.toISOString(), yesterdayEnd.toISOString()],
    ),
    d1Query<Pick<Payment, 'amount'>>(
      "SELECT amount FROM payments WHERE status = 'paid' AND paid_at >= ?",
      [monthStart.toISOString()],
    ),
    d1Query<Pick<Payment, 'amount'>>(
      "SELECT amount FROM payments WHERE status = 'paid' AND paid_at >= ? AND paid_at < ?",
      [lastMonthStart.toISOString(), lastMonthEnd.toISOString()],
    ),
    first<{ count: number }>("SELECT COUNT(*) AS count FROM payments WHERE status = 'overdue'"),
    d1Query<{ membership_plans: { name?: string } | null }>(
      `SELECT membership_plans.name AS plan_name
       FROM members
       LEFT JOIN membership_plans ON membership_plans.id = members.plan_id`,
    ),
    listAttendanceWithMembers(5),
    d1Query<Payment & { member_name?: string | null }>(
      `SELECT payments.*, members.full_name AS member_name
       FROM payments
       LEFT JOIN members ON members.id = payments.member_id
       WHERE payments.status = 'paid'
       ORDER BY payments.created_at DESC
       LIMIT 3`,
    ),
    d1Query<Pick<Member, 'id' | 'full_name' | 'created_at'>>(
      'SELECT id, full_name, created_at FROM members ORDER BY created_at DESC LIMIT 3',
    ),
    d1Query<GymClass & { trainer_name?: string | null; updated_at: string }>(
      `SELECT classes.id, classes.name, classes.updated_at, trainers.full_name AS trainer_name
       FROM classes
       LEFT JOIN trainers ON trainers.id = classes.trainer_id
       ORDER BY classes.updated_at DESC
       LIMIT 2`,
    ),
    d1Query<Member & { plan_name?: string | null }>(
      `SELECT members.*, membership_plans.name AS plan_name
       FROM members
       LEFT JOIN membership_plans ON membership_plans.id = members.plan_id
       WHERE members.status = 'active'
         AND members.membership_end >= ?
         AND members.membership_end <= ?
       ORDER BY members.membership_end ASC`,
      [todayStr, nextWeekStr],
    ),
  ])

  return {
    todayStart,
    totalCount: totalMembers?.count ?? 0,
    activeCount: activeMembers?.count ?? 0,
    registeredMonthCount: registeredThisMonth?.count ?? 0,
    checkinsTodayCount: todayCheckins?.count ?? 0,
    checkinsYesterdayCount: yesterdayCheckins?.count ?? 0,
    paidThisMonth,
    paidLastMonth,
    overdueCount: overduePayments?.count ?? 0,
    membersByPlan: membersByPlan.map((row: any) => ({
      membership_plans: row.plan_name ? { name: row.plan_name } : null,
    })),
    recentCheckins,
    recentPayments: recentPayments.map((row) => ({
      ...row,
      members: row.member_id ? { id: row.member_id, full_name: row.member_name ?? '' } : null,
    })),
    recentMembers,
    recentClasses: recentClasses.map((row) => ({
      ...row,
      trainers: row.trainer_id
        ? { id: row.trainer_id, full_name: row.trainer_name ?? '' }
        : null,
    })),
    upcomingRenewals: upcomingRenewals.map((row) => ({
      ...row,
      membership_plans: row.plan_id
        ? { id: row.plan_id, name: row.plan_name ?? '' }
        : null,
    })) as Member[],
  }
}

export async function countAttendanceSince(date: string) {
  const row = await first<{ count: number }>(
    'SELECT COUNT(*) AS count FROM attendance WHERE check_in >= ?',
    [date],
  )

  return row?.count ?? 0
}

export async function listAttendanceSince(date: string) {
  return d1Query<Pick<Attendance, 'check_in'>>(
    'SELECT check_in FROM attendance WHERE check_in >= ?',
    [date],
  )
}

export async function getGymSettings() {
  let settings = await first<GymSettings>('SELECT * FROM gym_settings WHERE id = ? LIMIT 1', ['default'])
  if (!settings) {
    await run(
      `INSERT OR IGNORE INTO gym_settings (id, gym_name, location, phone, email, email_reminders_enabled)
       VALUES ('default', 'Zentrix', 'Amravati, Maharashtra', '+91 98765 43210', 'admin@zentrix.in', 1)`
    )
    settings = await first<GymSettings>('SELECT * FROM gym_settings WHERE id = ? LIMIT 1', ['default'])
  }
  if (settings) {
    settings.email_reminders_enabled = Boolean(settings.email_reminders_enabled)
  }
  return settings as GymSettings
}

export async function updateGymSettingsRecord(input: Omit<GymSettings, 'id' | 'updated_at'>) {
  await run(
    `UPDATE gym_settings
     SET gym_name = ?, location = ?, phone = ?, email = ?,
         email_reminders_enabled = ?, reminder_template_7_days = ?, reminder_template_today = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = 'default'`,
    [
      input.gym_name,
      input.location,
      input.phone,
      input.email,
      input.email_reminders_enabled ? 1 : 0,
      input.reminder_template_7_days,
      input.reminder_template_today,
    ],
  )
}

export async function listMembersExpiringIn(days: number) {
  const rows = await d1Query<
    Member & { plan_name?: string | null; plan_price?: number | null }
  >(
    `SELECT members.*, membership_plans.name AS plan_name, membership_plans.price AS plan_price
     FROM members
     LEFT JOIN membership_plans ON membership_plans.id = members.plan_id
     WHERE members.status = 'active' AND members.email IS NOT NULL AND members.email != ''`
  )

  const targetDate = new Date()
  targetDate.setDate(targetDate.getDate() + days)
  const targetDateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(targetDate)
  const matched = rows.filter((r) => r.membership_end === targetDateStr)
  return matched.map(withPlan)
}
