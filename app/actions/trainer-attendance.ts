'use server'

import {
  checkInTrainerRecord,
  checkOutTrainerRecord,
  deleteTrainerAttendanceRecord,
} from '@/lib/cloudflare/d1'
import { revalidatePath } from 'next/cache'

export async function checkInTrainer(trainerId: string) {
  try {
    await checkInTrainerRecord(trainerId)
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to check in trainer' }
  }

  revalidatePath('/dashboard/attendance')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function checkOutTrainer(attendanceId: string) {
  try {
    await checkOutTrainerRecord(attendanceId)
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to check out trainer' }
  }

  revalidatePath('/dashboard/attendance')
  return { success: true }
}

export async function deleteTrainerAttendance(id: string) {
  try {
    await deleteTrainerAttendanceRecord(id)
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to delete trainer attendance' }
  }

  revalidatePath('/dashboard/attendance')
  return { success: true }
}
