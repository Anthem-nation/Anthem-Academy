import Link from 'next/link'
import { LoginForm } from './LoginForm'

interface LoginPageProps {
  searchParams: Promise<{ error?: string; message?: string; redirectTo?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Anthem Academy</h1>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          {params.error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {params.error}
            </div>
          )}
          {params.message === 'check-email' && (
            <div className="mb-4 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
              Check your email for a confirmation link before signing in.
            </div>
          )}

          <LoginForm />

          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
