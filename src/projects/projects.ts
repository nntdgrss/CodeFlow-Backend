import { Elysia, t, type Context } from 'elysia'
import { authMiddleware } from '../middlewares/auth-middleware'
import prisma from '../prisma/prisma.client'

interface CreateProjectDto {
	name: string
	description: string
}

type AuthUser = {
	id: string
	email: string
}

type AppContext = Context & {
	user: AuthUser | null
}

type AuthContext = {
	body: unknown
	query: Record<string, string>
	params: Record<string, string>
	headers: Record<string, string | undefined>
	cookie: Record<string, { value: string }>
	set: {
		status: number
	}
	user: {
		id: string
		email: string
	} | null
}

// Создаем экземпляр и сразу применяем middleware
export const projects = new Elysia({ prefix: '/projects' })
	.use(authMiddleware)
	.get('/', async ({ user, set }: AuthContext) => {
		if (!user) {
			set.status = 401
			return {
				message: 'Не авторизован',
			}
		}

		try {
			const projects = await prisma.project.findMany({
				where: { ownerId: user.id },
			})

			return {
				projects,
			}
		} catch (error) {
			console.error('Projects error:', error)
			set.status = 500
			return {
				message: 'Ошибка при получении проектов',
			}
		}
	})
	.post(
		'/create',
		async ({ body, user, set }: AppContext) => {
			if (!user) {
				set.status = 401
				return {
					message: 'Не авторизован',
				}
			}

			const { name, description } = body as CreateProjectDto

			if (!name || !description) {
				set.status = 400
				return {
					message: 'Пожалуйста, заполните все поля',
				}
			}

			try {
				const project = await prisma.project.create({
					data: {
						name,
						description,
						ownerId: user.id,
					},
				})

				return {
					project,
				}
			} catch (error) {
				console.error('Create project error:', error)
				set.status = 500
				return {
					message: 'Ошибка при создании проекта',
				}
			}
		},
		{
			body: t.Object({
				name: t.String({
					minLength: 3,
					maxLength: 50,
				}),
				description: t.String({
					maxLength: 100,
				}),
			}),
		}
	)
	.get('/:id', async ({ params, user, set }: AppContext) => {
		if (!user) {
			set.status = 401
			return {
				message: 'Не авторизован',
			}
		}
		const { id } = params as { id: string }

		try {
			const project = await prisma.project.findUnique({
				where: {
					id: id,
					ownerId: user.id,
				},
			})

			if (!project) {
				set.status = 404
				return {
					message: 'Проект не найден',
				}
			}

			return {
				project,
			}
		} catch (error) {
			console.error('Get project error:', error)
			set.status = 500
			return {
				message: 'Ошибка при получении проекта',
			}
		}
	})
	.delete('/delete/:id', async ({ params, user, set }: AppContext) => {
		if (!user) {
			set.status = 401
			return {
				message: 'Не авторизован',
			}
		}
		const { id } = params as { id: string }

		try {
			const project = await prisma.project.findUnique({
				where: {
					id: id,
					ownerId: user.id,
				},
			})

			if (!project) {
				set.status = 404
				return {
					message: 'Проект не найден',
				}
			}

			await prisma.project.delete({
				where: {
					id: id,
				},
			})

			return {
				message: 'Проект успешно удален',
			}
		} catch (error) {
			console.error('Delete project error:', error)
			set.status = 500
			return {
				message: 'Ошибка при удалении проекта',
			}
		}
	})
