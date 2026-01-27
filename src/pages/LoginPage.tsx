import { LoginForm } from '@/components/features/LoginForm'

export const LoginPage = () => {
  return (
    <div className="grid min-h-svh bg-neutral-100 lg:grid-cols-2">
      {/* Left: Infographic */}
      <div className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-0" />

        <img
          src="/images/infographics.png"
          alt="ProTaskJet overview"
          className="absolute inset-0 h-full w-full object-contain"
        />
      </div>

      {/* Right: Login */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
