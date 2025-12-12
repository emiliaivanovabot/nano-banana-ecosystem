// Database Migration Utilities
// Tools for setting up and managing the production database

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// Migration runner for production setup
export class SupabaseMigrationRunner {
  private client: ReturnType<typeof createClient>
  
  constructor(
    supabaseUrl: string,
    serviceRoleKey: string
  ) {
    this.client = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }
  
  /**
   * Run the main schema migration
   */
  async runSchemaMigration(): Promise<void> {
    console.log('🔄 Running schema migration...')
    
    try {
      // Read the schema file
      const schemaPath = join(__dirname, 'schema.sql')
      const schemaSql = readFileSync(schemaPath, 'utf8')
      
      // Split into individual statements
      const statements = schemaSql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
      
      console.log(`📝 Executing ${statements.length} SQL statements...`)
      
      // Execute each statement
      for (const [index, statement] of statements.entries()) {
        try {
          console.log(`  ${index + 1}/${statements.length}: ${statement.substring(0, 50)}...`)
          
          const { error } = await this.client.rpc('exec_sql', {
            sql: statement + ';'
          })
          
          if (error) {
            console.error(`❌ Error in statement ${index + 1}:`, error)
            throw error
          }
        } catch (err) {
          console.error(`❌ Failed to execute statement ${index + 1}:`, err)
          throw err
        }
      }
      
      console.log('✅ Schema migration completed successfully!')
      
    } catch (error) {
      console.error('❌ Schema migration failed:', error)
      throw error
    }
  }
  
  /**
   * Verify database setup
   */
  async verifySetup(): Promise<boolean> {
    console.log('🔍 Verifying database setup...')
    
    const checks = [
      { name: 'user_profiles table', query: 'SELECT 1 FROM user_profiles LIMIT 1' },
      { name: 'user_subscriptions table', query: 'SELECT 1 FROM user_subscriptions LIMIT 1' },
      { name: 'billing_events table', query: 'SELECT 1 FROM billing_events LIMIT 1' },
      { name: 'gemini_generations table', query: 'SELECT 1 FROM gemini_generations LIMIT 1' },
      { name: 'seedream_generations table', query: 'SELECT 1 FROM seedream_generations LIMIT 1' },
      { name: 'wan_video_generations table', query: 'SELECT 1 FROM wan_video_generations LIMIT 1' },
    ]
    
    for (const check of checks) {
      try {
        const { error } = await this.client.rpc('exec_sql', {
          sql: check.query
        })
        
        if (error) {
          console.error(`❌ ${check.name}: ${error.message}`)
          return false
        }
        
        console.log(`✅ ${check.name}: OK`)
      } catch (err) {
        console.error(`❌ ${check.name}: ${err}`)
        return false
      }
    }
    
    console.log('✅ Database verification completed!')
    return true
  }
  
  /**
   * Test RLS policies
   */
  async testRLSPolicies(): Promise<boolean> {
    console.log('🔐 Testing Row Level Security policies...')
    
    try {
      // Test anonymous access (should be restricted)
      const { data: anonData, error: anonError } = await this.client
        .from('user_profiles')
        .select('*')
        .limit(1)
      
      if (!anonError || anonData) {
        console.error('❌ RLS test failed: Anonymous users can access protected data')
        return false
      }
      
      console.log('✅ RLS policies are working correctly')
      return true
    } catch (error) {
      console.error('❌ RLS test failed:', error)
      return false
    }
  }
  
  /**
   * Set up development data (only for development environment)
   */
  async seedDevelopmentData(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️ Skipping development data seeding in production')
      return
    }
    
    console.log('🌱 Seeding development data...')
    
    const developmentUsers = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'test@example.com',
        display_name: 'Test User',
        subscription_tier: 'free',
        credits_remaining: 100,
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        email: 'premium@example.com',
        display_name: 'Premium User',
        subscription_tier: 'premium',
        credits_remaining: 1000,
      },
    ]
    
    for (const user of developmentUsers) {
      try {
        const { error } = await this.client
          .from('user_profiles')
          .upsert(user)
        
        if (error) {
          console.error(`❌ Failed to seed user ${user.email}:`, error)
        } else {
          console.log(`✅ Seeded user: ${user.email}`)
        }
      } catch (err) {
        console.error(`❌ Error seeding user ${user.email}:`, err)
      }
    }
  }
}

// CLI helper for running migrations
export async function runMigrations() {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
    )
  }
  
  const runner = new SupabaseMigrationRunner(supabaseUrl, serviceRoleKey)
  
  try {
    await runner.runSchemaMigration()
    await runner.verifySetup()
    await runner.testRLSPolicies()
    
    if (process.env.NODE_ENV === 'development') {
      await runner.seedDevelopmentData()
    }
    
    console.log('🎉 Database setup completed successfully!')
    
  } catch (error) {
    console.error('💥 Database setup failed:', error)
    process.exit(1)
  }
}

// Environment configuration helper
export function validateEnvironment(): boolean {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ]
  
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:')
    missing.forEach(key => console.error(`  - ${key}`))
    console.error('\nPlease check your .env file and ensure all variables are set.')
    return false
  }
  
  console.log('✅ Environment configuration is valid')
  return true
}

// Cross-domain authentication helper
export function getCrossDomainConfig() {
  const isProd = process.env.NODE_ENV === 'production'
  
  return {
    platformUrl: isProd 
      ? 'https://platform.nanobanan.ai'
      : 'http://localhost:3000',
    seedreamUrl: isProd 
      ? 'https://seedream.nanobanan.ai' 
      : 'http://localhost:3001',
    allowedOrigins: isProd
      ? [
          'https://platform.nanobanan.ai',
          'https://seedream.nanobanan.ai',
        ]
      : [
          'http://localhost:3000',
          'http://localhost:3001',
        ],
    cookieDomain: isProd ? '.nanobanan.ai' : 'localhost',
    cookieSecure: isProd,
  }
}

// Production health check
export async function healthCheck(): Promise<{
  database: boolean
  auth: boolean
  overall: boolean
}> {
  const results = {
    database: false,
    auth: false,
    overall: false,
  }
  
  try {
    // Database connectivity check
    const supabaseUrl = process.env.SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    const client = createClient(supabaseUrl, serviceRoleKey)
    
    // Test database connection
    const { data, error: dbError } = await client
      .from('user_profiles')
      .select('count')
      .limit(1)
    
    results.database = !dbError
    
    // Test auth service
    const { data: authData, error: authError } = await client.auth.getSession()
    results.auth = !authError
    
    results.overall = results.database && results.auth
    
  } catch (error) {
    console.error('Health check failed:', error)
  }
  
  return results
}