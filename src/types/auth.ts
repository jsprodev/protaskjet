export type LoginErrors = {
  email?: string
  password?: string
}

export type SignupErrors = LoginErrors & {
  name?: string
  confirmPassword?: string
}
