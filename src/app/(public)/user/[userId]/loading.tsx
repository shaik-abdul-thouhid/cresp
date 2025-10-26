export default function UserProfileLoading() {
	return (
		<div className="space-y-6">
			{/* Profile Header Skeleton */}
			<div className="rounded-xl bg-white p-8 shadow-sm">
				<div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
					{/* Profile Image Skeleton */}
					<div className="h-32 w-32 flex-shrink-0 animate-pulse rounded-full bg-gray-200" />

					{/* Profile Info Skeleton */}
					<div className="flex-1 space-y-3">
						<div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
						<div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
						<div className="flex gap-2">
							<div className="h-6 w-24 animate-pulse rounded-full bg-gray-200" />
							<div className="h-6 w-28 animate-pulse rounded-full bg-gray-200" />
						</div>
						<div className="h-4 w-full animate-pulse rounded bg-gray-200" />
						<div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
					</div>

					{/* Action Buttons Skeleton */}
					<div className="flex gap-3">
						<div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200" />
					</div>
				</div>
			</div>

			{/* Portfolio Section Skeleton */}
			<div className="rounded-xl bg-white p-6 shadow-sm">
				<div className="mb-4 h-6 w-32 animate-pulse rounded bg-gray-200" />
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<div className="h-48 animate-pulse rounded-lg bg-gray-200" />
					<div className="h-48 animate-pulse rounded-lg bg-gray-200" />
					<div className="h-48 animate-pulse rounded-lg bg-gray-200" />
				</div>
			</div>
		</div>
	);
}
