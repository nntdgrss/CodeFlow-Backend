import { Elysia, type Context } from 'elysia'
import { jwtDecode } from 'jwt-decode'
import { verifyToken } from '../utils/jwt'

interface NextAuthToken {
	sub: string
	email: string
	name: string
	accessToken: string
	username: string
	iat: number
	exp: number
	jti: string
}

export const authMiddleware = (app: Elysia) => {
	return app.derive(async ({ set, cookie, headers }: Context) => {
		// Проверяем Authorization заголовок
		const authHeader = headers.authorization
		if (authHeader?.startsWith('Bearer ')) {
			const token = authHeader.substring(7)

			try {
				const user = verifyToken(token)
				return { user }
			} catch (error) {
				console.error('Bearer token verification failed:', error)
			}
		}

		const cookieToken = cookie['next-auth.session-token']?.value

		if (!cookieToken) {
			return { user: null }
		}

		try {
			// Декодируем NextAuth токен
			const decoded = jwtDecode<NextAuthToken>(cookieToken)

			// Проверяем наличие accessToken в сессии
			if (!decoded?.accessToken) {
				return { user: null }
			}

			try {
				// Пытаемся верифицировать access token
				const user = verifyToken(decoded.accessToken)

				return {
					user: {
						id: user.id,
						email: user.email,
					},
				}
			} catch (verifyError) {
				console.error('Access token verification failed:', verifyError)
				return { user: null }
			}
		} catch (error) {
			console.error('Auth error:', error)
			return { user: null }
		}
	})
}
