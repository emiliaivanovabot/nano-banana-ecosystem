export async function GET() {
  return Response.json({ 
    status: 'ok', 
    app: 'platform',
    timestamp: new Date().toISOString(),
    env: {
      nodeEnv: process.env.NODE_ENV || 'unknown',
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'not-set'
    }
  });
}