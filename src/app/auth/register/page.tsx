import { Suspense } from 'react'
import { RegisterForm } from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterPageSkeleton />}>
      <RegisterForm />
    </Suspense>
  )
}

function RegisterPageSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#FAFAFA]">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-sm border border-[#E4E4E7] p-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-40 mx-auto mb-2" />
          <div className="h-4 bg-gray-200 rounded w-64 mx-auto mb-8" />
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}
