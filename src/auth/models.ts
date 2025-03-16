export interface LoginDto {
	email: string
	password: string
}

export interface RegisterDto {
	email: string
	password: string
	firstname: string
	lastname: string
	username: string
}

export interface UserData {
	id: string
	email: string
	firstName: string
	lastName: string
	username: string
}

export interface UserResponse {
	user: UserData
	token: string
}
