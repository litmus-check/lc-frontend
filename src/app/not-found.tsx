import Link from "next/link";

export default function NotFound() {
  return (
    <div className="font-hanken flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <h1 className="text-6xl font-bold text-gray-900">404</h1>
      <p className="mt-2 text-lg text-gray-600">Page not found</p>
      <p className="mt-1 text-sm text-gray-500">
        The page you are looking for does not exist or you do not have access.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
      >
        Go to home
      </Link>
    </div>
  );
}
