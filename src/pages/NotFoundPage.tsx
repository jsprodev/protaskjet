import { Link } from 'react-router-dom'

export const NotFoundPage = () => {
  return (
    <section className="flex h-screen items-center bg-gray-50 p-16 dark:bg-gray-700">
      <div className="container flex flex-col items-center">
        <div className="flex max-w-md flex-col gap-6 text-center">
          <h2 className="text-9xl font-extrabold text-gray-600 dark:text-gray-100">
            <span className="sr-only">Error</span>404
          </h2>
          <p className="text-2xl md:text-3xl dark:text-gray-300">Sorry, we couldn't find this page.</p>
          <Link to={'/'} className="rounded-xl bg-black/90 px-8 py-4 text-xl font-semibold text-white hover:bg-black">
            Go Back
          </Link>
        </div>
      </div>
    </section>
  )
}
