import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    // Environment variables from .env.local
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'not found',
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || 'not found',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'not found',
    
    // Next.js environment variables
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'not found',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'not found',
    
    // Check current working directory
    CWD: process.cwd()
  })
}