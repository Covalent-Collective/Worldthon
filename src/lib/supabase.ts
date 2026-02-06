import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Lazy-loaded Supabase clients
let _supabase: SupabaseClient<Database> | null = null
let _serviceSupabase: SupabaseClient<Database> | null = null

// Helper to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

// Get Supabase client with anon key (클라이언트 측 사용)
export const getSupabase = (): SupabaseClient<Database> | null => {
  if (!isSupabaseConfigured()) {
    return null
  }

  if (!_supabase) {
    _supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  return _supabase
}

// Get Supabase client with service role key (서버 전용 - API 라우트에서 사용)
// RLS를 우회하여 직접 DB 접근 가능
export const getServiceSupabase = (): SupabaseClient<Database> | null => {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return null
  }

  if (!_serviceSupabase) {
    _serviceSupabase = createClient<Database>(supabaseUrl, serviceRoleKey)
  }

  return _serviceSupabase
}