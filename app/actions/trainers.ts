'use server'

import {
  createTrainerRecord,
  deleteTrainerRecord,
  updateTrainerRecord,
} from '@/lib/cloudflare/d1'
import { revalidatePath } from 'next/cache'

export async function createTrainer(formData: FormData) {
  try {
    await createTrainerRecord({
      full_name: formData.get('full_name') as string,
      email: (formData.get('email') as string) || null,
      phone: (formData.get('phone') as string) || null,
      specialization: (formData.get('specialization') as string) || null,
      bio: (formData.get('bio') as string) || null,
      is_active: formData.get('is_active') === 'on',
    })
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to create trainer' }
  }

  revalidatePath('/dashboard/trainers')
  return { success: true }
}

export async function updateTrainer(id: string, formData: FormData) {
  try {
    await updateTrainerRecord(id, {
      full_name: formData.get('full_name') as string,
      email: (formData.get('email') as string) || null,
      phone: (formData.get('phone') as string) || null,
      specialization: (formData.get('specialization') as string) || null,
      bio: (formData.get('bio') as string) || null,
      is_active: formData.get('is_active') === 'on',
    })
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to update trainer' }
  }

  revalidatePath('/dashboard/trainers')
  return { success: true }
}

export async function deleteTrainer(id: string) {
  try {
    await deleteTrainerRecord(id)
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to delete trainer' }
  }

  revalidatePath('/dashboard/trainers')
  return { success: true }
}
