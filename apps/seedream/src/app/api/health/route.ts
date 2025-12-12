export async function GET() {
  return Response.json({ 
    status: 'ok',
    app: 'seedream', 
    timestamp: new Date().toISOString(),
    env: {
      nodeEnv: process.env.NODE_ENV || 'unknown',
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'not-set',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'missing',
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'set' : 'missing',
      openaiKey: process.env.OPENAI_API_KEY ? 'set' : 'missing',
      uploadDir: process.env.UPLOAD_DIR || 'not-set'
    }
  });
}