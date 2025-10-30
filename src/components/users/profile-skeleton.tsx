export function ProfileSkeleton() {
	return (
		<div className="space-y-6">
			{/* Profile Header Skeleton */}
			<div className="rounded-xl bg-white p-8 shadow-sm">
				<div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
					{/* Profile Image Skeleton */}
					<div className="h-32 w-32 flex-shrink-0 animate-pulse rounded-full bg-gray-200" />

					{/* Profile Info Skeleton */}
					<div className="flex-1 space-y-3">
						{/* Name */}
						<div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200" />
						{/* Username */}
						<div className="h-5 w-32 animate-pulse rounded-lg bg-gray-200" />
						{/* Professional Roles */}
						<div className="flex gap-2">
							<div className="h-7 w-24 animate-pulse rounded-full bg-gray-200" />
							<div className="h-7 w-28 animate-pulse rounded-full bg-gray-200" />
						</div>
						{/* Bio */}
						<div className="space-y-2">
							<div className="h-4 w-full animate-pulse rounded bg-gray-200" />
							<div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
						</div>
						{/* Location & Join Date */}
						<div className="space-y-2">
							<div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
							<div className="h-4 w-36 animate-pulse rounded bg-gray-200" />
						</div>
					</div>

					{/* Action Buttons Skeleton */}
					<div className="flex gap-3">
						<div className="h-10 w-28 animate-pulse rounded-lg bg-gray-200" />
						<div className="h-10 w-28 animate-pulse rounded-lg bg-gray-200" />
					</div>
				</div>
			</div>

			{/* Metrics Skeleton */}
			<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
				{[1, 2, 3, 4].map((i) => (
					<div key={i} className="rounded-xl bg-white p-4 shadow-sm">
						<div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
						<div className="mt-2 h-8 w-16 animate-pulse rounded bg-gray-200" />
					</div>
				))}
			</div>

			{/* Tabs Skeleton */}
			<div className="rounded-xl bg-white shadow-sm">
				<div className="border-gray-200 border-b">
					<div className="flex gap-1 p-1">
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className="h-10 w-32 animate-pulse rounded-lg bg-gray-200"
							/>
						))}
					</div>
				</div>

				{/* Content Skeleton */}
				<div className="p-6">
					<div className="space-y-4">
						{[1, 2, 3].map((i) => (
							<div key={i} className="rounded-xl border border-gray-200 p-4">
								<div className="flex items-start gap-3">
									<div className="h-12 w-12 flex-shrink-0 animate-pulse rounded-full bg-gray-200" />
									<div className="flex-1 space-y-3">
										<div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
										<div className="h-4 w-full animate-pulse rounded bg-gray-200" />
										<div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
										<div className="h-48 w-full animate-pulse rounded-lg bg-gray-200" />
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
