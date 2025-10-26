import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "~/lib/auth/get-user";

// OPTIMIZATION: Cache feed data for 1 minute
// Reduces database load while keeping content relatively fresh
export const revalidate = 60; // 1 minute

export default async function PublicFeedPage() {
	const currentUser = await getCurrentUser();

	// TODO: Fetch posts from database once Post model is created
	const posts: Post[] = [];

	return (
		<div className="grid gap-6 lg:grid-cols-12">
			{/* Left Sidebar - User Info / CTA */}
			<aside className="lg:col-span-3">
				<div className="sticky top-6 space-y-4">
					{!currentUser ? (
						<SignupPromptCard />
					) : (
						<UserQuickCard user={currentUser} />
					)}
				</div>
			</aside>

			{/* Main Feed */}
			<main className="lg:col-span-6">
				<div className="space-y-4">
					{/* Welcome Banner for non-logged-in users */}
					{!currentUser && (
						<div className="rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 p-6">
							<h2 className="mb-2 font-bold text-gray-900 text-xl">
								Welcome to Cresp 🎨
							</h2>
							<p className="mb-4 text-gray-700 text-sm">
								Join our community of creative professionals to showcase your
								work, collaborate, and get discovered.
							</p>
							<Link
								href="/signup"
								className="inline-block rounded-lg bg-purple-600 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-purple-700"
							>
								Sign up free
							</Link>
						</div>
					)}

					{/* Posts Feed */}
					{posts.length > 0 ? (
						posts.map((post) => (
							<PostCard key={post.id} post={post} isLoggedIn={!!currentUser} />
						))
					) : (
						<EmptyFeedCard />
					)}
				</div>
			</main>

			{/* Right Sidebar - Trending/Suggestions */}
			<aside className="hidden lg:col-span-3 lg:block">
				<div className="sticky top-6 space-y-4">
					<TrendingCard />
					<AboutCard />
				</div>
			</aside>
		</div>
	);
}

// Type definition for Post (will match future Prisma model)
interface Post {
	id: string;
	content: string;
	createdAt: Date;
	author: {
		id: string;
		username: string;
		name: string | null;
		image: string | null;
		userRoles: Array<{
			role: {
				name: string;
				icon: string | null;
			};
		}>;
	};
}

function PostCard({
	post,
	isLoggedIn,
}: {
	post: Post;
	isLoggedIn: boolean;
}) {
	const authorName = post.author.name ?? post.author.username;
	const authorRole = post.author.userRoles[0]?.role;
	const timeAgo = getTimeAgo(post.createdAt);

	return (
		<article className="rounded-xl border border-gray-200 bg-white shadow-sm">
			{/* Post Header */}
			<div className="flex items-start gap-3 p-4">
				<Link href={`/user/${post.author.id}`} className="flex-shrink-0">
					{post.author.image ? (
						<div className="relative h-12 w-12 overflow-hidden rounded-full">
							<Image
								src={post.author.image}
								alt={authorName}
								fill
								className="object-cover"
							/>
						</div>
					) : (
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-indigo-600">
							<span className="font-bold text-lg text-white">
								{authorName.charAt(0).toUpperCase()}
							</span>
						</div>
					)}
				</Link>

				<div className="min-w-0 flex-1">
					<Link
						href={`/user/${post.author.id}`}
						className="font-semibold text-gray-900 hover:text-purple-600"
					>
						{authorName}
					</Link>
					{authorRole && (
						<p className="text-gray-600 text-sm">
							{authorRole.icon} {authorRole.name}
						</p>
					)}
					<p className="text-gray-500 text-xs">{timeAgo}</p>
				</div>
			</div>

			{/* Post Content */}
			<div className="px-4 pb-3">
				<p className="whitespace-pre-wrap text-gray-800">{post.content}</p>
			</div>

			{/* Engagement Stats */}
			<div className="border-gray-200 border-t border-b px-4 py-2">
				<div className="flex items-center justify-between text-gray-600 text-sm">
					<span>0 likes</span>
					<span>0 comments</span>
				</div>
			</div>

			{/* Action Buttons */}
			<div className="flex items-center justify-around p-2">
				<ActionButton
					icon={
						<svg
							className="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}
							aria-hidden="true"
						>
							<title>Like icon</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
							/>
						</svg>
					}
					label="Like"
					isLoggedIn={isLoggedIn}
				/>
				<ActionButton
					icon={
						<svg
							className="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}
							aria-hidden="true"
						>
							<title>Comment icon</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
							/>
						</svg>
					}
					label="Comment"
					isLoggedIn={isLoggedIn}
				/>
				<ActionButton
					icon={
						<svg
							className="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}
							aria-hidden="true"
						>
							<title>Share icon</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
							/>
						</svg>
					}
					label="Share"
					isLoggedIn={isLoggedIn}
				/>
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
				className="flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-medium text-gray-600 text-sm transition-colors hover:bg-gray-50"
			>
				{icon}
				<span>{label}</span>
			</Link>
		);
	}

	return (
		<button
			type="button"
			className="flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-medium text-gray-600 text-sm transition-colors hover:bg-gray-50"
		>
			{icon}
			<span>{label}</span>
		</button>
	);
}

function SignupPromptCard() {
	return (
		<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
			<div className="mb-4 text-center">
				<div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-indigo-600">
					<svg
						className="h-8 w-8 text-white"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={2}
						aria-hidden="true"
					>
						<title>Users icon</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
						/>
					</svg>
				</div>
				<h3 className="mb-2 font-bold text-gray-900">Join Cresp Today</h3>
				<p className="mb-4 text-gray-600 text-sm">
					Connect with creative professionals worldwide
				</p>
			</div>
			<div className="space-y-2">
				<Link
					href="/signup"
					className="block rounded-lg bg-purple-600 px-4 py-2.5 text-center font-medium text-sm text-white transition-colors hover:bg-purple-700"
				>
					Sign up
				</Link>
				<Link
					href="/login"
					className="block rounded-lg border border-gray-300 px-4 py-2.5 text-center font-medium text-gray-700 text-sm transition-colors hover:bg-gray-50"
				>
					Log in
				</Link>
			</div>
		</div>
	);
}

function UserQuickCard({ user }: { user: { userId: string; email: string } }) {
	return (
		<div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
			<p className="text-gray-600 text-sm">Logged in as</p>
			<p className="font-medium text-gray-900">{user.email}</p>
		</div>
	);
}

function TrendingCard() {
	return (
		<div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
			<h3 className="mb-3 font-bold text-gray-900">Trending Topics</h3>
			<div className="space-y-3">
				<TrendingItem hashtag="#CreativeWork" posts="1.2K posts" />
				<TrendingItem hashtag="#Collaboration" posts="856 posts" />
				<TrendingItem hashtag="#Design" posts="2.1K posts" />
				<TrendingItem hashtag="#Photography" posts="1.8K posts" />
			</div>
		</div>
	);
}

function TrendingItem({ hashtag, posts }: { hashtag: string; posts: string }) {
	return (
		<div className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-gray-50">
			<p className="font-medium text-gray-900 text-sm">{hashtag}</p>
			<p className="text-gray-500 text-xs">{posts}</p>
		</div>
	);
}

function AboutCard() {
	return (
		<div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
			<h3 className="mb-3 font-bold text-gray-900">About Cresp</h3>
			<div className="space-y-2 text-gray-600 text-sm">
				<Link href="/terms" className="block hover:text-purple-600">
					Terms of Service
				</Link>
				<Link href="/privacy-policy" className="block hover:text-purple-600">
					Privacy Policy
				</Link>
			</div>
			<p className="mt-4 text-gray-500 text-xs">
				© {new Date().getFullYear()} Cresp. All rights reserved.
			</p>
		</div>
	);
}

function EmptyFeedCard() {
	return (
		<div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
			<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
				<svg
					className="h-8 w-8 text-gray-400"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth={2}
					aria-hidden="true"
				>
					<title>Empty feed icon</title>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
					/>
				</svg>
			</div>
			<h3 className="mb-2 font-bold text-gray-900">No posts yet</h3>
			<p className="mb-4 text-gray-600 text-sm">
				Be the first to share your creative work with the community!
			</p>
			<Link
				href="/signup"
				className="inline-block rounded-lg bg-purple-600 px-6 py-2.5 font-medium text-sm text-white transition-colors hover:bg-purple-700"
			>
				Sign up to post
			</Link>
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
