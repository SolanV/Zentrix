'use server'

import {
  checkInMemberRecord,
  checkOutMemberRecord,
  deleteAttendanceRecord,
} from '@/lib/cloudflare/d1'
import { revalidatePath } from 'next/cache'

export async function checkInMember(memberId: string) {
  try {
    await checkInMemberRecord(memberId)
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to check in member' }
  }

  revalidatePath('/dashboard/attendance')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function checkOutMember(attendanceId: string) {
  try {
    await checkOutMemberRecord(attendanceId)
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to check out member' }
  }

  revalidatePath('/dashboard/attendance')
  return { success: true }
}

export async function deleteAttendance(id: string) {
  try {
    await deleteAttendanceRecord(id)
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to delete attendance' }
  }

  revalidatePath('/dashboard/attendance')
  return { success: true }
}
