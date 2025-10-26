"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { usePullToRefresh } from "~/hooks/use-pull-to-refresh";

interface PullToRefreshWrapperProps {
	children: React.ReactNode;
}

export function PullToRefreshWrapper({ children }: PullToRefreshWrapperProps) {
	const router = useRouter();

	const { containerRef, isPulling, isRefreshing, pullDistance, threshold } =
		usePullToRefresh({
			onRefresh: async () => {
				console.log("Pull to refresh triggered!");
				// Refresh the page data
				router.refresh();
				// Add a small delay so users can see the refresh animation
				await new Promise((resolve) => setTimeout(resolve, 800));
				toast.success("Feed refreshed!");
			},
			threshold: 80,
			maxPullDistance: 120,
		});

	const rotation = Math.min((pullDistance / threshold) * 360, 360);
	const opacity = Math.min(pullDistance / threshold, 1);
	const scale = Math.min(pullDistance / threshold, 1);

	return (
		<div ref={containerRef} className="relative min-h-screen">
			{/* Pull to refresh indicator */}
			{isPulling && (
				<div
					className="fixed left-0 right-0 z-[9999] flex justify-center pt-2 transition-all duration-200"
					style={{
						transform: `translateY(${Math.min(pullDistance * 0.8, 80)}px)`,
						top: 0,
					}}
				>
					<div
						className="flex items-center gap-2 rounded-full border-2 border-purple-200 bg-white px-5 py-3 shadow-xl"
						style={{ 
							opacity,
							transform: `scale(${0.8 + scale * 0.2})`,
						}}
					>
						<RefreshCw
							className={`h-6 w-6 text-purple-600 transition-transform ${isRefreshing ? "animate-spin" : ""}`}
							style={
								!isRefreshing
									? { transform: `rotate(${rotation}deg)` }
									: undefined
							}
						/>
						<span className="whitespace-nowrap font-medium text-gray-700 text-sm">
							{isRefreshing
								? "Refreshing..."
								: pullDistance >= threshold
									? "Release to refresh"
									: "Pull to refresh"}
						</span>
					</div>
				</div>
			)}

			{children}
		</div>
	);
}

