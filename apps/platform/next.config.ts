import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Map VITE_ environment variables to NEXT_PUBLIC_ for V1 compatibility
    NEXT_PUBLIC_SUPABASE_URL: process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_LOGIN_USERS: process.env.VITE_LOGIN_USERS || process.env.NEXT_PUBLIC_LOGIN_USERS,
    NEXT_PUBLIC_BACKEND_API_URL: process.env.VITE_BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL,
    NEXT_PUBLIC_WEBSOCKET_URL: process.env.VITE_WEBSOCKET_URL || process.env.NEXT_PUBLIC_WEBSOCKET_URL,
    NEXT_PUBLIC_N8N_WEBHOOK_URL: process.env.VITE_N8N_WEBHOOK_URL || process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL,
    NEXT_PUBLIC_RUNPOD_API_KEY: process.env.VITE_RUNPOD_API_KEY || process.env.NEXT_PUBLIC_RUNPOD_API_KEY,
    NEXT_PUBLIC_RUNPOD_ENDPOINT_ID: process.env.VITE_RUNPOD_ENDPOINT_ID || process.env.NEXT_PUBLIC_RUNPOD_ENDPOINT_ID,
    NEXT_PUBLIC_USE_RUNPOD_API: process.env.VITE_USE_RUNPOD_API || process.env.NEXT_PUBLIC_USE_RUNPOD_API,
    NEXT_PUBLIC_GEMINI_API_KEY: process.env.VITE_GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    NEXT_PUBLIC_GROK_API_KEY: process.env.VITE_GROK_API_KEY || process.env.NEXT_PUBLIC_GROK_API_KEY,
  },
  transpilePackages: ["@repo/ui", "@repo/auth-config", "@repo/database"]
};

export default nextConfig;
