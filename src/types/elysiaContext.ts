import { JwtPayload } from 'jsonwebtoken'

type BaseContext = {
	body: unknown
	query: Record<string, string>
	headers: Record<string, string | undefined>
	cookie: Record<string, { value: string }>
	params: Record<string, string>
}

declare module 'elysia' {
	export interface AuthenticatedContext extends BaseContext {
		user: JwtPayload & {
			id: string
			email: string
		}
	}
}
