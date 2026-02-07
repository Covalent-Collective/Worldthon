import { NextResponse } from 'next/server'
import { generateNonce } from '@/lib/nonce-store'

export async function GET(): Promise<NextResponse> {
  const nonce = generateNonce()
  return NextResponse.json({ nonce })
}
