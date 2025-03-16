import * as jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'секретный_ключ'

interface TokenPayload {
	id: string
	email: string
}

export function generateToken(payload: TokenPayload): string {
	return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): TokenPayload {
	return jwt.verify(token, JWT_SECRET) as TokenPayload
}
