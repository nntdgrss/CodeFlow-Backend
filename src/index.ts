import { cookie } from '@elysiajs/cookie'
import cors from '@elysiajs/cors'
import { jwt } from '@elysiajs/jwt'
import { Elysia } from 'elysia'
import { auth } from './auth/auth'
import { projects } from './projects/projects'

const app = new Elysia({ prefix: '/v0' })
	.use(cookie())
	.use(
		jwt({
			secret: process.env.JWT_SECRET || 'super-secret',
			exp: '7d',
		})
	)
	.use(
		cors({
			credentials: true,
			origin: 'http://localhost:3000',
			allowedHeaders: ['content-type', 'authorization'],
			exposeHeaders: ['*'],
		})
	)
	.use(auth)
	.use(projects)
	.get('/', {
		message: 'Server work succesfully',
		time: new Date().toISOString(),
	})
	.listen(3001)

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)
