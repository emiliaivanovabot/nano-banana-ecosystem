'use client'

export default function TestLogin() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <h2 className="text-3xl font-bold text-center">Platform Login Test</h2>
        <form className="mt-8 space-y-6">
          <div>
            <input
              type="text"
              placeholder="Username"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  )
}