"use client";

import { FileText } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PostCard } from "~/components/posts/post-card";
import type { PostWithRelations } from "./page";

interface FeedPostsListProps {
	posts: PostWithRelations[];
	isLoggedIn: boolean;
	currentUserId?: string | null;
	highlightId?: string;
	hasMore: boolean;
	sortBy: string;
}

export function FeedPostsList({
	posts: initialPosts,
	isLoggedIn,
	currentUserId,
	highlightId,
	hasMore: initialHasMore,
	sortBy,
}: FeedPostsListProps) {
	const [posts, setPosts] = useState(initialPosts);
	const [hasMore, setHasMore] = useState(initialHasMore);
	const [isLoading, setIsLoading] = useState(false);
	const [activeHighlight, setActiveHighlight] = useState(highlightId);
	const highlightRef = useRef<HTMLDivElement>(null);

	// Handle post deletion
	const handlePostDelete = (postId: string) => {
		setPosts((prev) => prev.filter((p) => p.id !== postId));
	};

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
						currentUserId={currentUserId}
						isHighlighted={post.id === activeHighlight}
						onDelete={handlePostDelete}
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
									<title>Loading spinner</title>
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

// Export the post type for the component
export type { PostWithRelations };

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
