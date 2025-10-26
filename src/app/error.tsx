"use client";

import Link from "next/link";

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<html lang="en">
			<body>
				<div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
					<div className="w-full max-w-md text-center">
						<div className="mb-4 text-6xl">😔</div>
						<h1 className="mb-2 font-bold text-2xl text-gray-900">
							Oops! Something went wrong
						</h1>
						<p className="mb-6 text-gray-600">
							We're sorry for the inconvenience. Our team has been notified and
							we're working to fix this.
						</p>
						<div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
							<button
								type="button"
								onClick={reset}
								className="rounded-lg bg-purple-600 px-6 py-2.5 font-medium text-sm text-white transition-colors hover:bg-purple-700"
							>
								Try Again
							</button>
							<Link
								href="/"
								className="inline-block rounded-lg border border-gray-300 px-6 py-2.5 font-medium text-gray-700 text-sm transition-colors hover:bg-gray-50"
							>
								Go Home
							</Link>
						</div>
						{process.env.NODE_ENV === "development" && (
							<details className="mt-6 text-left">
								<summary className="cursor-pointer text-gray-500 text-sm hover:text-gray-700">
									Error Details (Dev Only)
								</summary>
								<pre className="mt-2 overflow-auto rounded-lg bg-gray-100 p-4 text-left text-gray-800 text-xs">
									{error.message}
									{error.stack && `\n\n${error.stack}`}
								</pre>
							</details>
						)}
					</div>
				</div>
			</body>
		</html>
	);
}
