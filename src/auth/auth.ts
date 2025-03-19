import { Elysia, error } from 'elysia'
import prisma from '../prisma/prisma.client'
import { generateToken } from '../utils/jwt'
import { comparePassword, hashPassword } from '../utils/password'
import { LoginDto, RegisterDto } from './models'

export const auth = new Elysia({ prefix: '/auth' })
	.post('/register', async ({ body, set }) => {
		const { email, password, firstname, lastname, username } =
			body as RegisterDto

		if (!email || !password || !firstname || !lastname || !username) {
			set.status = 400
			return {
				message: 'Пожалуйста, заполните все поля',
			}
		}

		const existingUserEmail = await prisma.user.findUnique({
			where: { email },
		})

		if (existingUserEmail) {
			set.status = 409
			return {
				message: 'Пользователь с таким email уже существует',
			}
		}

		const existingUsername = await prisma.user.findUnique({
			where: { username },
		})

		if (existingUsername) {
			set.status = 409
			return {
				message: 'Пользователь с таким именем уже существует',
			}
		}

		const hashedPassword = await hashPassword(password)

		const user = await prisma.user.create({
			data: {
				email: email,
				password: hashedPassword,
				firstName: firstname,
				lastName: lastname,
				username: username,
			},
		})

		const token = generateToken({ id: user.id, email: user.email })

		set.cookie = {
			'next-auth.session-token': {
				value: token,
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict',
				path: '/',
			},
		}

		return {
			user: {
				id: user.id,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				username: user.username,
			},
			token,
		}
	})
	.post('/login', async ({ body, set }) => {
		const { email, password } = body as LoginDto

		if (!email || !password) {
			set.status = 400
			return {
				message: 'Пожалуйста, заполните все поля',
			}
		}

		const user = await prisma.user.findUnique({
			where: { email },
		})

		if (!user) {
			return error(401, {
				message: 'Неверный email или пароль',
			})
		}

		const isPasswordValid = await comparePassword(password, user.password)

		if (!isPasswordValid) {
			set.status = 401
			return {
				message: 'Неверный email или пароль',
			}
		}

		const token = generateToken({ id: user.id, email: user.email })

		set.cookie = {
			'next-auth.session-token': {
				value: token,
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict',
				path: '/',
			},
		}

		return {
			user: {
				id: user.id,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				username: user.username,
			},
			token,
		}
	})
