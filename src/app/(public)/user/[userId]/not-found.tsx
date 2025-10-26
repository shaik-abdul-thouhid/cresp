import Link from "next/link";

export default function UserNotFound() {
	return (
		<div className="rounded-xl bg-white p-12 text-center shadow-sm">
			<div className="mb-4 text-6xl">🔍</div>
			<h2 className="mb-2 font-bold text-2xl text-gray-900">User Not Found</h2>
			<p className="mb-6 text-gray-600">
				This user doesn't exist or has deleted their account.
			</p>
			<Link
				href="/feed"
				className="inline-block rounded-lg bg-purple-600 px-6 py-2.5 font-medium text-sm text-white transition-colors hover:bg-purple-700"
			>
				Browse Feed
			</Link>
		</div>
	);
}
