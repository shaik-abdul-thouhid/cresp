"use client";

import { ChevronLeft, ChevronRight, FileText, Flag, ImageIcon, MoreVertical, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ReportPostModal } from "~/components/posts/report-post-modal";
import type { PostWithRelations } from "./page";

/**
 * Custom hook for lazy loading content when it enters the viewport
 */
function useLazyLoad() {
	const [isVisible, setIsVisible] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) {
					setIsVisible(true);
					// Once visible, stop observing
					if (ref.current) {
						observer.unobserve(ref.current);
					}
				}
			},
			{
				rootMargin: "50px", // Start loading 50px before entering viewport
				threshold: 0.01,
			},
		);

		if (ref.current) {
			observer.observe(ref.current);
		}

		return () => {
			if (ref.current) {
				observer.unobserve(ref.current);
			}
		};
	}, []);

	return { ref, isVisible };
}

interface FeedPostsListProps {
	posts: PostWithRelations[];
	isLoggedIn: boolean;
	highlightId?: string;
	hasMore: boolean;
	sortBy: string;
}

export function FeedPostsList({
	posts: initialPosts,
	isLoggedIn,
	highlightId,
	hasMore: initialHasMore,
	sortBy,
}: FeedPostsListProps) {
	const [posts, setPosts] = useState(initialPosts);
	const [hasMore, setHasMore] = useState(initialHasMore);
	const [isLoading, setIsLoading] = useState(false);
	const [activeHighlight, setActiveHighlight] = useState(highlightId);
	const highlightRef = useRef<HTMLDivElement>(null);

	// Auto-scroll to highlighted post and remove highlight after 10 seconds
	useEffect(() => {
		if (highlightId && highlightRef.current) {
			// Scroll to highlighted post after a short delay (for smooth UX)
			setTimeout(() => {
				highlightRef.current?.scrollIntoView({
					behavior: "smooth",
					block: "center",
				});
			}, 100);

			// Remove highlight after 10 seconds
			const timer = setTimeout(() => {
				setActiveHighlight(undefined);
			}, 10000);

			return () => clearTimeout(timer);
		}
	}, [highlightId]);

	// Load more posts
	const handleLoadMore = async () => {
		if (isLoading || !hasMore) return;
		
		setIsLoading(true);
		try {
			const lastPost = posts[posts.length - 1];
			if (!lastPost) return;

			// Import the server action dynamically
			const { loadMorePosts } = await import("~/server/actions/feed");
			const result = await loadMorePosts(lastPost.id, sortBy);
			
			setPosts((prev) => [...prev, ...result.posts]);
			setHasMore(result.hasMore);
		} catch (error) {
			console.error("Error loading more posts:", error);
		} finally {
			setIsLoading(false);
		}
	};

	if (posts.length === 0) {
		return <EmptyFeedCard isLoggedIn={isLoggedIn} />;
	}

	return (
		<>
			{posts.map((post) => (
				<div
					key={post.id}
					ref={post.id === activeHighlight ? highlightRef : null}
				>
					<PostCard
						post={post}
						isLoggedIn={isLoggedIn}
						isHighlighted={post.id === activeHighlight}
					/>
				</div>
			))}
			
			{/* Load More Button */}
			{hasMore && (
				<div className="flex justify-center pt-4">
					<button
						type="button"
						onClick={handleLoadMore}
						disabled={isLoading}
						className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-3 font-medium text-white shadow-md transition-all hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
					>
						{isLoading ? (
							<span className="flex items-center gap-2">
								<svg
									className="h-5 w-5 animate-spin"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									/>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									/>
								</svg>
								Loading...
							</span>
						) : (
							"Load More Posts"
						)}
					</button>
				</div>
			)}
		</>
	);
}

function PostCard({
	post,
	isLoggedIn,
	isHighlighted,
}: {
	post: PostWithRelations;
	isLoggedIn: boolean;
	isHighlighted: boolean;
}) {
	const authorName = post.user.name ?? post.user.username;
	const primaryRole = post.professionalRoles[0]?.professionalRole;
	const timeAgo = getTimeAgo(post.createdAt);
	const { ref: mediaRef, isVisible: isMediaVisible } = useLazyLoad();
	const { ref: avatarRef, isVisible: isAvatarVisible } = useLazyLoad();
	const carouselRef = useRef<HTMLDivElement>(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(false);
	const [showMenu, setShowMenu] = useState(false);
	const [showReportModal, setShowReportModal] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	// Check scroll position to show/hide navigation buttons
	const checkScroll = () => {
		if (carouselRef.current) {
			const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
			setCanScrollLeft(scrollLeft > 0);
			setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
		}
	};

	useEffect(() => {
		checkScroll();
		const carousel = carouselRef.current;
		if (carousel) {
			carousel.addEventListener("scroll", checkScroll);
			return () => carousel.removeEventListener("scroll", checkScroll);
		}
	}, [isMediaVisible]);

	// Close menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setShowMenu(false);
			}
		};

		if (showMenu) {
			document.addEventListener("mousedown", handleClickOutside);
			return () => document.removeEventListener("mousedown", handleClickOutside);
		}
	}, [showMenu]);

	const scroll = (direction: "left" | "right") => {
		if (carouselRef.current) {
			// Get the actual width of the first image element
			const firstImage = carouselRef.current.querySelector('div[class*="aspect-square"]');
			const scrollAmount = firstImage ? firstImage.clientWidth + 12 : 336; // +12 for gap
			
			const newPosition =
				direction === "left"
					? carouselRef.current.scrollLeft - scrollAmount
					: carouselRef.current.scrollLeft + scrollAmount;

			carouselRef.current.scrollTo({
				left: newPosition,
				behavior: "smooth",
			});
		}
	};

	return (
		<article
			className={`rounded-xl border bg-white shadow-sm transition-all duration-500 ${
				isHighlighted
					? "border-purple-400 ring-4 ring-purple-100 shadow-lg"
					: "border-gray-200"
			}`}
		>
			{/* "Just Posted" Badge */}
			{isHighlighted && (
				<div className="animate-fade-in border-b border-purple-100 bg-gradient-to-r from-purple-50 to-indigo-50 px-4 py-2">
					<div className="flex items-center gap-2 text-purple-700 text-sm">
						<Sparkles className="h-4 w-4" />
						<span className="font-medium">Just posted</span>
					</div>
				</div>
			)}

			{/* Post Header */}
			<div className="flex items-start gap-3 p-3 sm:p-4">
				<Link href={`/user/${post.user.id}`} className="flex-shrink-0">
					<div ref={avatarRef} className="h-12 w-12">
						{isAvatarVisible ? (
							post.user.image ? (
								<div className="relative h-12 w-12 overflow-hidden rounded-full">
									<Image
										src={post.user.image}
										alt={authorName}
										fill
										className="object-cover"
										loading="lazy"
										sizes="48px"
									/>
								</div>
							) : (
								<div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-indigo-600">
									<span className="font-bold text-lg text-white">
										{authorName.charAt(0).toUpperCase()}
									</span>
								</div>
							)
						) : (
							<div className="h-12 w-12 animate-pulse rounded-full bg-gray-200" />
						)}
					</div>
				</Link>

				<div className="min-w-0 flex-1">
					<Link
						href={`/user/${post.user.id}`}
						className="font-semibold text-gray-900 hover:text-purple-600"
					>
						{authorName}
					</Link>
					{primaryRole && (
						<p className="text-gray-600 text-sm">
							{primaryRole.icon} {primaryRole.name}
						</p>
					)}
					<p className="text-gray-500 text-xs">{timeAgo}</p>
				</div>

				<div className="flex items-center gap-2">
					{/* Portfolio Badge */}
					{post.postType === "PORTFOLIO" && (
						<span className="rounded-full bg-purple-100 px-3 py-1 font-medium text-purple-700 text-xs">
							Portfolio
						</span>
					)}

					{/* Three-dot menu */}
					<div className="relative" ref={menuRef}>
						<button
							type="button"
							onClick={() => setShowMenu(!showMenu)}
							className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
							aria-label="Post options"
						>
							<MoreVertical className="h-5 w-5" />
						</button>

						{/* Dropdown menu */}
						{showMenu && (
							<div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
								<button
									type="button"
									onClick={() => {
										setShowMenu(false);
										setShowReportModal(true);
									}}
									className="flex w-full items-center gap-3 px-4 py-3 text-left text-gray-700 text-sm transition-colors hover:bg-gray-50"
								>
									<Flag className="h-4 w-4 text-red-600" />
									<span>Report Post</span>
								</button>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Report Modal */}
			<ReportPostModal
				postId={post.id}
				isOpen={showReportModal}
				onClose={() => setShowReportModal(false)}
			/>

		{/* Post Content */}
		{post.content && (
			<div className="px-3 pb-3 sm:px-4">
				<p className="whitespace-pre-wrap text-gray-800">{post.content}</p>
			</div>
		)}

		{/* Post Media (Images, Videos, etc.) - Horizontal Carousel */}
		{post.media.length > 0 && (
			<div ref={mediaRef} className="relative pb-3">
				{isMediaVisible ? (
					<>
						<div className="relative">
							{/* Navigation Buttons - Only show on desktop if there are multiple images */}
							{post.media.length > 1 && (
								<>
									{canScrollLeft && (
										<button
											type="button"
											onClick={() => scroll("left")}
											className="absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110 md:block"
											aria-label="Previous image"
										>
											<ChevronLeft className="h-6 w-6 text-gray-800" />
										</button>
									)}
									{canScrollRight && (
										<button
											type="button"
											onClick={() => scroll("right")}
											className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110 md:block"
											aria-label="Next image"
										>
											<ChevronRight className="h-6 w-6 text-gray-800" />
										</button>
									)}
								</>
							)}
							
							<div
								ref={carouselRef}
								className="scrollbar-hide flex gap-2 overflow-x-auto px-2 snap-x snap-mandatory sm:gap-3 sm:px-4"
							>
								{post.media.map((media) => {
									if (media.mediaType === "IMAGE") {
										return (
											<div
												key={media.id}
												className="relative aspect-square w-[85vw] max-w-md flex-shrink-0 snap-center overflow-hidden rounded-lg border-2 border-gray-200 shadow-sm md:w-80"
											>
												<Image
													src={media.url}
													alt="Post media"
													fill
													className="object-cover"
													loading="lazy"
													sizes="(max-width: 768px) 85vw, 320px"
												/>
											</div>
										);
									}
									return null;
								})}
							</div>
						</div>
						{post.media.length > 1 && (
							<p className="mt-2 px-4 text-center text-gray-500 text-xs md:hidden">
								← Swipe to see {post.media.length} images →
							</p>
						)}
					</>
				) : (
					// Placeholder to maintain layout while loading
					<div className="scrollbar-hide flex gap-2 overflow-x-auto px-2 sm:gap-3 sm:px-4">
						{post.media.slice(0, 3).map((media) => (
							<div
								key={media.id}
								className="relative flex aspect-square w-[85vw] max-w-md flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-100 shadow-sm md:w-80"
							>
								<div className="animate-pulse">
									<ImageIcon className="h-12 w-12 text-gray-300" />
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		)}

		{/* Hashtags */}
		{post.hashtags.length > 0 && (
			<div className="flex flex-wrap gap-2 px-3 pb-3 sm:px-4">
				{post.hashtags.slice(0, 5).map((ph) => (
					<Link
						key={ph.hashtag.id}
						href={`/hashtag/${ph.hashtag.name}`}
						className="text-purple-600 text-xs hover:underline sm:text-sm"
					>
						#{ph.hashtag.name}
					</Link>
				))}
				{post.hashtags.length > 5 && (
					<span className="text-gray-500 text-xs sm:text-sm">
						+{post.hashtags.length - 5}
					</span>
				)}
			</div>
		)}

		{/* Engagement Stats */}
		<div className="border-b border-t border-gray-200 px-3 py-2 sm:px-4">
			<div className="flex items-center justify-between text-gray-600 text-xs sm:text-sm">
				<span>{post._count.likes} likes</span>
				<div className="flex gap-2 sm:gap-3">
					<span>{post._count.comments} comments</span>
					<span>{post.shareCount} shares</span>
				</div>
			</div>
		</div>

			{/* Action Buttons */}
			<div className="flex items-center justify-around p-1.5 sm:p-2">
				{[
					{
						label: "Like",
						iconPath:
							"M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5",
					},
					{
						label: "Comment",
						iconPath:
							"M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
					},
					{
						label: "Share",
						iconPath:
							"M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z",
					},
				].map((action) => (
					<ActionButton
						key={action.label}
						icon={
							<svg
								className="h-4 w-4 sm:h-5 sm:w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={2}
								aria-hidden="true"
							>
								<title>{action.label} icon</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d={action.iconPath}
								/>
							</svg>
						}
						label={action.label}
						isLoggedIn={isLoggedIn}
					/>
				))}
			</div>
		</article>
	);
}

function ActionButton({
	icon,
	label,
	isLoggedIn,
}: {
	icon: React.ReactNode;
	label: string;
	isLoggedIn: boolean;
}) {
	if (!isLoggedIn) {
		return (
			<Link
				href="/login"
				className="flex flex-1 items-center justify-center gap-1 rounded-lg px-2 py-2 font-medium text-gray-600 text-xs transition-colors hover:bg-gray-50 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
			>
				{icon}
				<span className="hidden xs:inline">{label}</span>
			</Link>
		);
	}

	return (
		<button
			type="button"
			className="flex flex-1 items-center justify-center gap-1 rounded-lg px-2 py-2 font-medium text-gray-600 text-xs transition-colors hover:bg-gray-50 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
		>
			{icon}
			<span className="hidden xs:inline">{label}</span>
		</button>
	);
}

function EmptyFeedCard({ isLoggedIn }: { isLoggedIn: boolean }) {
	if (!isLoggedIn) {
		// Non-logged-in users: Show signup prompt
		return (
			<div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
				<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-100 to-indigo-100">
					<FileText className="h-8 w-8 text-purple-600" />
				</div>
				<h3 className="mb-2 font-bold text-gray-900 text-xl">No posts yet</h3>
				<p className="mb-6 text-gray-600 text-sm">
					Be the first to share your creative work with the community!
				</p>
				<div className="flex justify-center gap-3">
					<Link
						href="/signup"
						className="inline-block rounded-lg bg-purple-600 px-6 py-2.5 font-medium text-sm text-white transition-colors hover:bg-purple-700"
					>
						Sign up to post
					</Link>
					<Link
						href="/login"
						className="inline-block rounded-lg border border-gray-300 px-6 py-2.5 font-medium text-gray-700 text-sm transition-colors hover:bg-gray-50"
					>
						Log in
					</Link>
				</div>
			</div>
		);
	}

	// Logged-in users: Show simple empty state
	return (
		<div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
			<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
				<FileText className="h-8 w-8 text-gray-400" />
			</div>
			<h3 className="mb-2 font-bold text-gray-900">No posts available</h3>
			<p className="text-gray-600 text-sm">
				Be the first to share something with the community!
			</p>
		</div>
	);
}

function getTimeAgo(date: Date): string {
	const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

	const intervals = {
		year: 31536000,
		month: 2592000,
		week: 604800,
		day: 86400,
		hour: 3600,
		minute: 60,
	};

	for (const [unit, secondsInUnit] of Object.entries(intervals)) {
		const interval = Math.floor(seconds / secondsInUnit);
		if (interval >= 1) {
			return `${interval} ${unit}${interval === 1 ? "" : "s"} ago`;
		}
	}

	return "Just now";
}

