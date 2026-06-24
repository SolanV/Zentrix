'use server'

import {
  createPaymentRecord,
  deletePaymentRecord,
  updatePaymentStatusRecord,
} from '@/lib/cloudflare/d1'
import { revalidatePath } from 'next/cache'

export async function createPayment(formData: FormData) {
  const status = (formData.get('status') as string) || 'pending'

  try {
    await createPaymentRecord({
      member_id: formData.get('member_id') as string,
      plan_id: (formData.get('plan_id') as string) || null,
      amount: Number(formData.get('amount') || 0),
      status,
      method: (formData.get('method') as string) || null,
      due_date: (formData.get('due_date') as string) || null,
      paid_at: status === 'paid' ? new Date().toISOString() : null,
      notes: (formData.get('notes') as string) || null,
    })
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to create payment' }
  }

  revalidatePath('/dashboard/payments')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updatePaymentStatus(id: string, status: string) {
  try {
    await updatePaymentStatusRecord(id, status)
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to update payment' }
  }

  revalidatePath('/dashboard/payments')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deletePayment(id: string) {
  try {
    await deletePaymentRecord(id)
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to delete payment' }
  }

  revalidatePath('/dashboard/payments')
  return { success: true }
}
