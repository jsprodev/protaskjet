import { Spinner } from './spinner'

export const Loader = () => {
  return (
    <div className="absolute inset-0 flex h-[calc(100vh-64px)] items-center justify-center">
      <Spinner className="size-8 text-blue-500" />
    </div>
  )
}
