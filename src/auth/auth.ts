import { Elysia, error } from 'elysia'
import prisma from '../prisma/prisma.client'
import { generateToken } from '../utils/jwt'
import { comparePassword, hashPassword } from '../utils/password'
import { LoginDto, RegisterDto } from './models'

export const auth = new Elysia({ prefix: '/auth' })
	.post('/register', async ({ body }) => {
		const { email, password, firstname, lastname, username } =
			body as RegisterDto

		if (!email || !password || !firstname || !lastname || !username) {
			return {
				status: 400,
				message: 'Пожалуйста, заполните все поля',
			}
		}

		const existingUser = await prisma.user.findUnique({
			where: { email, username },
		})

		if (existingUser) {
			return {
				status: 409,
				message: 'Пользователь с таким email уже существует',
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

		const accessToken = generateToken({ id: user.id, email: user.email })

		return {
			user: {
				id: user.id,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				username: user.username,
			},
			token: accessToken,
		}
	})
	.post('/login', async ({ body }) => {
		const { email, password } = body as LoginDto

		if (!email || !password) {
			return {
				status: 400,
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
			return {
				status: 401,
				message: 'Неверный email или пароль',
			}
		}

		const accessToken = generateToken({ id: user.id, email: user.email })

		return {
			user: {
				id: user.id,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				username: user.username,
			},
			token: accessToken,
		}
	})
