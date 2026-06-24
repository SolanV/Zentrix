import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demjqvxnydgwrglbkyuq.supabase.co'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbWpxdnhueWRnd3JnbGJreXVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMzU0MzUsImV4cCI6MjA5NzgxMTQzNX0.tiCckwCUW2h0UHcv7x0oVYtzRGzl_Mn-J8JgSQ4eyIQ'
  
  return createBrowserClient(
    supabaseUrl,
    supabaseKey,
  )
}
