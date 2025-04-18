
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://afsaifgfjmmzrsqgabjc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmc2FpZmdmam1tenJzcWdhYmpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5MjU5MzksImV4cCI6MjA2MDUwMTkzOX0.vdI866J2dvsqVoNmaE_pdNS5vIc3ABM9qpTAmp2q_Zg'

// Create Supabase client with persistent sessions enabled
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: window.localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})
