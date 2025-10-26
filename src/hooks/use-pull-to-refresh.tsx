"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UsePullToRefreshOptions {
	onRefresh: () => Promise<void>;
	threshold?: number;
	maxPullDistance?: number;
}

export function usePullToRefresh({
	onRefresh,
	threshold = 80,
	maxPullDistance = 120,
}: UsePullToRefreshOptions) {
	const [isPulling, setIsPulling] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [pullDistance, setPullDistance] = useState(0);
	const startY = useRef(0);
	const containerRef = useRef<HTMLDivElement>(null);
	const isAtTopRef = useRef(false);

	const handleRefresh = useCallback(async () => {
		setIsRefreshing(true);
		setIsPulling(false);
		setPullDistance(threshold); // Keep at threshold while refreshing

		try {
			await onRefresh();
		} catch (error) {
			console.error("Error refreshing:", error);
		} finally {
			// Smooth animation back
			setTimeout(() => {
				setIsRefreshing(false);
				setPullDistance(0);
			}, 300);
		}
	}, [onRefresh, threshold]);

	useEffect(() => {
		const handleTouchStart = (e: TouchEvent) => {
			const scrollTop = window.scrollY || document.documentElement.scrollTop;
			isAtTopRef.current = scrollTop <= 5; // Small tolerance

			if (isAtTopRef.current && !isRefreshing) {
				startY.current = e.touches[0]?.clientY ?? 0;
			}
		};

		const handleTouchMove = (e: TouchEvent) => {
			if (!isAtTopRef.current || isRefreshing) return;

			const currentY = e.touches[0]?.clientY ?? 0;
			const distance = currentY - startY.current;

			if (distance > 5) {
				// Only start pulling if moved down more than 5px
				if (!isPulling) {
					setIsPulling(true);
				}

				// Prevent default scrolling when pulling down
				e.preventDefault();

				// Apply resistance to make it feel more natural
				const resistance = Math.min(distance / 2.5, maxPullDistance);
				setPullDistance(resistance);
			}
		};

		const handleTouchEnd = async () => {
			if (!isPulling) return;

			if (pullDistance >= threshold) {
				await handleRefresh();
			} else {
				// Reset if didn't reach threshold
				setIsPulling(false);
				setPullDistance(0);
			}

			isAtTopRef.current = false;
		};

		// Add event listeners to window for better detection
		window.addEventListener("touchstart", handleTouchStart, { passive: true });
		window.addEventListener("touchmove", handleTouchMove, { passive: false });
		window.addEventListener("touchend", handleTouchEnd, { passive: true });

		return () => {
			window.removeEventListener("touchstart", handleTouchStart);
			window.removeEventListener("touchmove", handleTouchMove);
			window.removeEventListener("touchend", handleTouchEnd);
		};
	}, [isPulling, isRefreshing, pullDistance, threshold, maxPullDistance, handleRefresh]);

	return {
		containerRef,
		isPulling: isPulling || isRefreshing,
		isRefreshing,
		pullDistance,
		threshold,
	};
}

