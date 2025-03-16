import { Elysia } from 'elysia'
import { auth } from './auth/auth'

const app = new Elysia({ prefix: '/v0' })
	.use(auth)
	.get('/', {
		message: 'Server work succesfully',
		time: new Date().toISOString(),
	})
	.listen(3001)

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)
