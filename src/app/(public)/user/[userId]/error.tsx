"use client";

import Link from "next/link";

export default function UserProfileError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<div className="rounded-xl bg-white p-12 text-center shadow-sm">
			<div className="mb-4 text-5xl">👤</div>
			<h2 className="mb-2 font-bold text-gray-900 text-xl">
				Unable to Load Profile
			</h2>
			<p className="mb-6 text-gray-600">
				We couldn't load this user's profile. They may have deleted their
				account or there might be a temporary issue.
			</p>
			<div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
				<button
					type="button"
					onClick={reset}
					className="rounded-lg bg-purple-600 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-purple-700"
				>
					Try Again
				</button>
				<Link
					href="/feed"
					className="inline-block rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 text-sm transition-colors hover:bg-gray-50"
				>
					Browse Feed
				</Link>
			</div>
			{process.env.NODE_ENV === "development" && (
				<details className="mt-6 text-left">
					<summary className="cursor-pointer text-gray-500 text-sm hover:text-gray-700">
						Error Details (Dev Only)
					</summary>
					<pre className="mt-2 overflow-auto rounded-lg bg-gray-100 p-4 text-gray-800 text-xs">
						{error.message}
					</pre>
				</details>
			)}
		</div>
	);
}
