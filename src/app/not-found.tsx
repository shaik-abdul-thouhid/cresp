import Link from "next/link";

export default function NotFound() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
			<div className="w-full max-w-md text-center">
				<div className="mb-4 text-6xl">404</div>
				<h1 className="mb-2 font-bold text-2xl text-gray-900">
					Page Not Found
				</h1>
				<p className="mb-6 text-gray-600">
					The page you're looking for doesn't exist or has been moved.
				</p>
				<Link
					href="/"
					className="inline-block rounded-lg bg-purple-600 px-6 py-2.5 font-medium text-sm text-white transition-colors hover:bg-purple-700"
				>
					Go Home
				</Link>
			</div>
		</div>
	);
}
