'use server'

import {
  bookMemberIntoClassRecord,
  cancelBookingRecord,
  createClassRecord,
  deleteClassRecord,
  updateClassRecord,
} from '@/lib/cloudflare/d1'
import { revalidatePath } from 'next/cache'

export async function createClass(formData: FormData) {
  try {
    await createClassRecord({
      name: formData.get('name') as string,
      description: (formData.get('description') as string) || null,
      trainer_id: (formData.get('trainer_id') as string) || null,
      day_of_week: (formData.get('day_of_week') as string) || null,
      start_time: (formData.get('start_time') as string) || null,
      end_time: (formData.get('end_time') as string) || null,
      capacity: Number(formData.get('capacity') || 20),
      is_active: formData.get('is_active') === 'on',
    })
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to create class' }
  }

  revalidatePath('/dashboard/classes')
  return { success: true }
}

export async function updateClass(id: string, formData: FormData) {
  try {
    await updateClassRecord(id, {
      name: formData.get('name') as string,
      description: (formData.get('description') as string) || null,
      trainer_id: (formData.get('trainer_id') as string) || null,
      day_of_week: (formData.get('day_of_week') as string) || null,
      start_time: (formData.get('start_time') as string) || null,
      end_time: (formData.get('end_time') as string) || null,
      capacity: Number(formData.get('capacity') || 20),
      is_active: formData.get('is_active') === 'on',
    })
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to update class' }
  }

  revalidatePath('/dashboard/classes')
  return { success: true }
}

export async function deleteClass(id: string) {
  try {
    await deleteClassRecord(id)
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to delete class' }
  }

  revalidatePath('/dashboard/classes')
  return { success: true }
}

export async function bookMemberIntoClass(formData: FormData) {
  try {
    await bookMemberIntoClassRecord(
      formData.get('class_id') as string,
      formData.get('member_id') as string,
    )
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to book class' }
  }

  revalidatePath('/dashboard/classes')
  return { success: true }
}

export async function cancelBooking(id: string) {
  try {
    await cancelBookingRecord(id)
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to cancel booking' }
  }

  revalidatePath('/dashboard/classes')
  return { success: true }
}
