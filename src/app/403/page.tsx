"use client";

import { useRouter } from "next/navigation";

export default function PermissionDeniedPage() {
  const router = useRouter();

  return (
    <div className="font-hanken flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <h1 className="text-6xl font-bold text-gray-900">403</h1>
      <p className="mt-2 text-lg text-gray-600">Permission denied</p>
      <p className="mt-1 text-sm text-gray-500">
        You do not have access to this page.
      </p>
      <button
        type="button"
        onClick={() => router.back()}
        className="mt-6 rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
      >
        Go back
      </button>
    </div>
  );
}
