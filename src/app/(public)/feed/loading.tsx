export default function FeedLoading() {
	return (
		<div className="grid gap-6 lg:grid-cols-12">
			{/* Left Sidebar Skeleton */}
			<aside className="lg:col-span-3">
				<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
					<div className="mb-4 space-y-3 text-center">
						<div className="mx-auto h-16 w-16 animate-pulse rounded-full bg-gray-200" />
						<div className="mx-auto h-4 w-32 animate-pulse rounded bg-gray-200" />
						<div className="mx-auto h-3 w-40 animate-pulse rounded bg-gray-200" />
					</div>
					<div className="space-y-2">
						<div className="h-10 w-full animate-pulse rounded-lg bg-gray-200" />
						<div className="h-10 w-full animate-pulse rounded-lg bg-gray-200" />
					</div>
				</div>
			</aside>

			{/* Main Feed Skeleton */}
			<main className="lg:col-span-6">
				<div className="space-y-4">
					{/* Welcome Banner Skeleton */}
					<div className="h-32 animate-pulse rounded-xl bg-gray-200" />

					{/* Post Cards Skeleton */}
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
						>
							<div className="mb-4 flex items-start gap-3">
								<div className="h-12 w-12 flex-shrink-0 animate-pulse rounded-full bg-gray-200" />
								<div className="flex-1 space-y-2">
									<div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
									<div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
								</div>
							</div>
							<div className="space-y-2">
								<div className="h-4 w-full animate-pulse rounded bg-gray-200" />
								<div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
							</div>
							<div className="mt-4 flex gap-4">
								<div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
								<div className="h-8 w-24 animate-pulse rounded bg-gray-200" />
								<div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
							</div>
						</div>
					))}
				</div>
			</main>

			{/* Right Sidebar Skeleton */}
			<aside className="hidden lg:col-span-3 lg:block">
				<div className="space-y-4">
					<div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
						<div className="mb-3 h-5 w-32 animate-pulse rounded bg-gray-200" />
						<div className="space-y-3">
							{[1, 2, 3].map((i) => (
								<div key={i} className="space-y-1">
									<div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
									<div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
								</div>
							))}
						</div>
					</div>
				</div>
			</aside>
		</div>
	);
}
