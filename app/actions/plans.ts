'use server'

import {
  createPlanRecord,
  deletePlanRecord,
  updatePlanRecord,
} from '@/lib/cloudflare/d1'
import { revalidatePath } from 'next/cache'

export async function createPlan(formData: FormData) {
  try {
    await createPlanRecord({
      name: formData.get('name') as string,
      description: (formData.get('description') as string) || null,
      price: Number(formData.get('price') || 0),
      duration_days: Number(formData.get('duration_days') || 30),
      is_active: formData.get('is_active') === 'on',
    })
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to create plan' }
  }

  revalidatePath('/dashboard/plans')
  return { success: true }
}

export async function updatePlan(id: string, formData: FormData) {
  try {
    await updatePlanRecord(id, {
      name: formData.get('name') as string,
      description: (formData.get('description') as string) || null,
      price: Number(formData.get('price') || 0),
      duration_days: Number(formData.get('duration_days') || 30),
      is_active: formData.get('is_active') === 'on',
    })
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to update plan' }
  }

  revalidatePath('/dashboard/plans')
  return { success: true }
}

export async function deletePlan(id: string) {
  try {
    await deletePlanRecord(id)
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to delete plan' }
  }

  revalidatePath('/dashboard/plans')
  return { success: true }
}
