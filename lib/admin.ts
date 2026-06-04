import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export function checkAuth(req: NextRequest): boolean {
  const login = process.env.ADMIN_LOGIN;
  const pass = process.env.ADMIN_PASSWORD;
  if (!login && !pass) return true; // нічого не задано — відкрито (локалка)
  const okLogin = !login || req.headers.get('x-admin-login') === login;
  const okPass = !pass || req.headers.get('x-admin-password') === pass;
  return okLogin && okPass;
}

export function adminDb(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export const unauthorized = () =>
  NextResponse.json({ error: 'Доступ заборонено' }, { status: 401 });

export const noDb = () =>
  NextResponse.json({ error: 'База не налаштована' }, { status: 503 });
