import { SignJWT, jwtVerify, type JWTPayload } from 'jose'

export type VerificationLevel = 'orb' | 'device'

interface TokenPayload {
  userId: string
  nullifierHash: string
  verificationLevel: VerificationLevel
}

export interface AuthPayload extends JWTPayload {
  userId: string
  nullifierHash: string
  verificationLevel: VerificationLevel
}

// JWT secret from environment, with a fallback for development only
function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable is required in production')
    }
    // Development-only fallback
    return new TextEncoder().encode('dev-secret-do-not-use-in-production')
  }
  return new TextEncoder().encode(secret)
}

const TOKEN_EXPIRY = '24h'

/**
 * Generate a JWT token for an authenticated user.
 */
export async function generateToken(payload: TokenPayload): Promise<string> {
  const secret = getSecret()

  const token = await new SignJWT({
    userId: payload.userId,
    nullifierHash: payload.nullifierHash,
    verificationLevel: payload.verificationLevel,
  } as AuthPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .setSubject(payload.userId)
    .sign(secret)

  return token
}

/**
 * Verify a JWT token and return the decoded payload.
 * Returns null if the token is invalid or expired.
 */
export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const secret = getSecret()
    const { payload } = await jwtVerify(token, secret)

    // Validate required fields
    const authPayload = payload as AuthPayload
    if (!authPayload.userId || !authPayload.nullifierHash || !authPayload.verificationLevel) {
      return null
    }

    return authPayload
  } catch {
    return null
  }
}

/**
 * Extract Bearer token from an Authorization header value.
 * Returns null if the header is missing or malformed.
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null
  }

  return parts[1]
}
