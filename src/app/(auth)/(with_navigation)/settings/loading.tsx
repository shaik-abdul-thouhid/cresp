export default function SettingsLoading() {
	return (
		<div className="space-y-6">
			<div>
				<div className="mb-2 h-8 w-48 animate-pulse rounded bg-gray-200" />
				<div className="h-4 w-64 animate-pulse rounded bg-gray-200" />
			</div>

			{/* Profile Settings Skeleton */}
			<div className="rounded-xl bg-white p-6 shadow-sm">
				<div className="mb-4 h-6 w-48 animate-pulse rounded bg-gray-200" />
				<div className="space-y-4">
					{[1, 2, 3, 4].map((i) => (
						<div key={i} className="space-y-2">
							<div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
							<div className="h-6 w-full animate-pulse rounded bg-gray-200" />
						</div>
					))}
				</div>
				<div className="mt-6 h-10 w-32 animate-pulse rounded-lg bg-gray-200" />
			</div>

			{/* Account Settings Skeleton */}
			<div className="rounded-xl bg-white p-6 shadow-sm">
				<div className="mb-4 h-6 w-48 animate-pulse rounded bg-gray-200" />
				<div className="space-y-4">
					{[1, 2].map((i) => (
						<div key={i} className="space-y-2">
							<div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
							<div className="h-4 w-full animate-pulse rounded bg-gray-200" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
