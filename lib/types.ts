export type MemberStatus = 'active' | 'inactive' | 'expired' | 'frozen'
export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled'
export type BookingStatus = 'booked' | 'attended' | 'cancelled' | 'no_show'

export interface MembershipPlan {
  id: string
  name: string
  description: string | null
  price: number
  duration_days: number
  is_active: boolean
  created_at: string
}

export interface Trainer {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  specialization: string | null
  bio: string | null
  is_active: boolean
  created_at: string
}

export interface Member {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  gender: string | null
  date_of_birth: string | null
  address: string | null
  plan_id: string | null
  join_date: string
  membership_start: string | null
  membership_end: string | null
  status: MemberStatus
  created_at: string
  membership_plans?: Pick<MembershipPlan, 'id' | 'name' | 'price'> | null
}

export interface Payment {
  id: string
  member_id: string
  plan_id: string | null
  invoice_number: string
  amount: number
  status: PaymentStatus
  method: string | null
  due_date: string | null
  paid_at: string | null
  notes: string | null
  created_at: string
  members?: Pick<Member, 'id' | 'full_name'> | null
  membership_plans?: Pick<MembershipPlan, 'id' | 'name'> | null
}

export interface Attendance {
  id: string
  member_id: string
  check_in: string
  check_out: string | null
  created_at: string
  members?: Pick<Member, 'id' | 'full_name'> | null
}

export interface TrainerAttendance {
  id: string
  trainer_id: string
  check_in: string
  check_out: string | null
  created_at: string
  trainers?: Pick<Trainer, 'id' | 'full_name'> | null
}


export interface GymClass {
  id: string
  name: string
  description: string | null
  trainer_id: string | null
  day_of_week: string | null
  start_time: string | null
  end_time: string | null
  capacity: number
  is_active: boolean
  created_at: string
  trainers?: Pick<Trainer, 'id' | 'full_name'> | null
}

export interface ClassBooking {
  id: string
  class_id: string
  member_id: string
  booked_at: string
  status: BookingStatus
  members?: Pick<Member, 'id' | 'full_name'> | null
  classes?: Pick<GymClass, 'id' | 'name'> | null
}

export interface GymSettings {
  id: string
  gym_name: string
  location: string | null
  phone: string | null
  email: string | null
  email_reminders_enabled: boolean
  reminder_template_7_days: string | null
  reminder_template_today: string | null
  updated_at: string
}

