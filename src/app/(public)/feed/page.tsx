import type { Prisma } from "@prisma/client";
import { FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PullToRefreshWrapper } from "~/components/pull-to-refresh-wrapper";
import { getCurrentUser } from "~/lib/auth/get-user";
import { db } from "~/server/db";
import { FeedPostsList } from "./feed-posts-list";

// OPTIMIZATION: Cache feed data for 1 minute
// Reduces database load while keeping content relatively fresh
export const revalidate = 60; // 1 minute

// Type for our post query
type PostWithRelations = Prisma.PostGetPayload<{
	include: {
		user: {
			select: {
				id: true;
				username: true;
				name: true;
				image: true;
			};
		};
		professionalRoles: {
			include: {
				professionalRole: true;
			};
		};
		media: true;
		hashtags: {
			include: {
				hashtag: true;
			};
		};
		_count: {
			select: {
				likes: true;
				comments: true;
			};
		};
	};
}>;

const POSTS_PER_PAGE = 20;

export default async function PublicFeedPage({
	searchParams: sp,
}: {
	searchParams: Promise<{ highlight?: string; sortBy?: string }>;
}) {
	const currentUser = await getCurrentUser();

	const searchParams = await sp;

	// Fetch full user details with metrics if logged in
	const fullUser = currentUser
		? await db.user.findUnique({
				where: { id: currentUser.userId },
				select: {
					id: true,
					username: true,
					name: true,
					image: true,
					totalReputation: true,
					portfolioPostCount: true,
					casualPostCount: true,
					professionalRoles: {
						select: {
							isPrimary: true,
							professionalRole: {
								select: {
									id: true,
									name: true,
									icon: true,
								},
							},
						},
						orderBy: [{ isPrimary: "desc" }, { assignedAt: "asc" }],
					},
				},
			})
		: null;

	// Determine sort order based on query params
	const sortBy = searchParams.sortBy || "latest";
	let orderBy: Prisma.PostOrderByWithRelationInput;
	
	switch (sortBy) {
		case "popular":
			orderBy = { likeCount: "desc" };
			break;
		case "discussed":
			orderBy = { commentCount: "desc" };
			break;
		case "latest":
		default:
			orderBy = { createdAt: "desc" };
			break;
	}

	// Fetch posts with pagination
	const posts = await db.post.findMany({
		where: {
			visibility: "PUBLIC",
			deletedAt: null,
		},
		include: {
			user: {
				select: {
					id: true,
					username: true,
					name: true,
					image: true,
				},
			},
			professionalRoles: {
				include: {
					professionalRole: true,
				},
			},
			media: true,
			hashtags: {
				include: {
					hashtag: true,
				},
			},
			_count: {
				select: {
					likes: true,
					comments: true,
				},
			},
		},
		orderBy,
		take: POSTS_PER_PAGE + 1, // Fetch one extra to check if there are more
	});

	// Check if there are more posts
	const hasMore = posts.length > POSTS_PER_PAGE;
	const displayPosts = hasMore ? posts.slice(0, POSTS_PER_PAGE) : posts;

	return (
		<PullToRefreshWrapper>
			<div className="lg:grid lg:gap-6 lg:grid-cols-12">
				{/* Left Sidebar - User Info (only for logged-in users on desktop) */}
				{fullUser && (
					<aside className="hidden lg:block lg:col-span-3">
						<div className="sticky top-6 space-y-4">
							<UserQuickCard user={fullUser} />
						</div>
					</aside>
				)}

				{/* Main Feed - Full width on mobile, centered column on desktop */}
				<main className={fullUser ? "lg:col-span-6" : "lg:col-span-9"}>
					<div className="space-y-4">
						{/* Create Post (logged-in users only) */}
						{currentUser && <CreatePostCard />}

						{/* Sort Filter */}
						<SortFilter currentSort={sortBy} />

						{/* Posts Feed with Highlight */}
						<FeedPostsList
							posts={displayPosts}
							isLoggedIn={!!currentUser}
							highlightId={searchParams.highlight}
							hasMore={hasMore}
							sortBy={sortBy}
						/>
					</div>
				</main>

				{/* Right Sidebar - Trending/Suggestions (Sticky, desktop only) */}
				<aside className="hidden lg:block lg:col-span-3">
					<div className="sticky top-6 space-y-4">
						<TrendingCard />
						<AboutCard />
					</div>
				</aside>
			</div>
		</PullToRefreshWrapper>
	);
}

// Export the post type for the client component
export type { PostWithRelations };

interface FullUser {
	id: string;
	username: string;
	name: string | null;
	image: string | null;
	totalReputation: number;
	portfolioPostCount: number;
	casualPostCount: number;
	professionalRoles: Array<{
		isPrimary: boolean;
		professionalRole: {
			id: string;
			name: string;
			icon: string | null;
		};
	}>;
}

function UserQuickCard({ user }: { user: FullUser }) {
	const displayName = user.name ?? user.username;
	const totalPosts = user.portfolioPostCount + user.casualPostCount;

	// Show max 5 roles, then "+more"
	const MAX_VISIBLE_ROLES = 5;
	const visibleRoles = user.professionalRoles.slice(0, MAX_VISIBLE_ROLES);
	const hasMoreRoles = user.professionalRoles.length > MAX_VISIBLE_ROLES;
	const remainingCount = user.professionalRoles.length - MAX_VISIBLE_ROLES;

	return (
		<div className="rounded-xl border border-gray-200 bg-white shadow-sm">
			{/* User Profile Header */}
			<div className="border-gray-100 border-b p-4">
				<Link
					href={`/user/${user.id}`}
					className="flex items-center gap-3 transition-opacity hover:opacity-80"
				>
					{user.image ? (
						<div className="relative h-14 w-14 overflow-hidden rounded-full">
							<Image
								src={user.image}
								alt={displayName}
								fill
								className="object-cover"
							/>
						</div>
					) : (
						<div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-indigo-600">
							<span className="font-bold text-white text-xl">
								{displayName.charAt(0).toUpperCase()}
							</span>
						</div>
					)}
					<div className="min-w-0 flex-1">
						<p className="truncate font-semibold text-gray-900">
							{displayName}
						</p>
						<p className="truncate text-gray-600 text-sm">@{user.username}</p>
					</div>
				</Link>

				{/* Professional Role Tags */}
				{user.professionalRoles.length > 0 && (
					<div className="mt-3 flex flex-wrap gap-1.5">
						{visibleRoles.map((userRole) => (
							<span
								key={userRole.professionalRole.id}
								className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${
									userRole.isPrimary
										? "bg-purple-100 font-medium text-purple-700"
										: "bg-gray-100 text-gray-700"
								}`}
							>
								{userRole.professionalRole.icon && (
									<span className="text-[10px]">
										{userRole.professionalRole.icon}
									</span>
								)}
								<span>{userRole.professionalRole.name}</span>
							</span>
						))}
						{hasMoreRoles && (
							<Link
								href={`/user/${user.id}`}
								className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-gray-700 text-xs transition-colors hover:bg-gray-200"
							>
								<span>+{remainingCount} more</span>
							</Link>
						)}
					</div>
				)}
			</div>

			{/* User Stats */}
			<div className="grid grid-cols-3 gap-px bg-gray-100 p-px">
				<div className="bg-white p-3 text-center">
					<div className="font-bold text-gray-900 text-lg">{totalPosts}</div>
					<div className="text-gray-600 text-xs">Posts</div>
				</div>
				<div className="bg-white p-3 text-center">
					<div className="font-bold text-gray-900 text-lg">
						{user.portfolioPostCount}
					</div>
					<div className="text-gray-600 text-xs">Portfolio</div>
				</div>
				<div className="bg-white p-3 text-center">
					<div className="font-bold text-lg text-purple-600">
						{user.totalReputation}
					</div>
					<div className="text-gray-600 text-xs">Reputation</div>
				</div>
			</div>

			{/* Quick Actions */}
			<div className="space-y-1 p-2">
				<Link
					href={`/user/${user.id}`}
					className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-700 text-sm transition-colors hover:bg-gray-50"
				>
					<svg
						className="h-4 w-4 text-gray-500"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={2}
						aria-hidden="true"
					>
						<title>Profile icon</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
						/>
					</svg>
					<span>View Profile</span>
				</Link>
				<Link
					href="/settings"
					className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-700 text-sm transition-colors hover:bg-gray-50"
				>
					<svg
						className="h-4 w-4 text-gray-500"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={2}
						aria-hidden="true"
					>
						<title>Settings icon</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
						/>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
						/>
					</svg>
					<span>Settings</span>
				</Link>
			</div>
		</div>
	);
}

const TRENDING_TOPICS = [
	{ hashtag: "#CreativeWork", posts: "1.2K posts" },
	{ hashtag: "#Collaboration", posts: "856 posts" },
	{ hashtag: "#Design", posts: "2.1K posts" },
	{ hashtag: "#Photography", posts: "1.8K posts" },
] as const;

function TrendingCard() {
	return (
		<div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
			<h3 className="mb-3 font-bold text-gray-900">Trending Topics</h3>
			<div className="space-y-3">
				{TRENDING_TOPICS.map((topic) => (
					<TrendingItem
						key={topic.hashtag}
						hashtag={topic.hashtag}
						posts={topic.posts}
					/>
				))}
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

const ABOUT_LINKS = [
	{ href: "/terms", label: "Terms of Service" },
	{ href: "/privacy-policy", label: "Privacy Policy" },
] as const;

function AboutCard() {
	return (
		<div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
			<h3 className="mb-3 font-bold text-gray-900">About Cresp</h3>
			<div className="space-y-2 text-gray-600 text-sm">
				{ABOUT_LINKS.map((link) => (
					<Link
						key={link.href}
						href={link.href}
						className="block hover:text-purple-600"
					>
						{link.label}
					</Link>
				))}
			</div>
			<p className="mt-4 text-gray-500 text-xs">
				© {new Date().getFullYear()} Cresp. All rights reserved.
			</p>
		</div>
	);
}

function CreatePostCard() {
	return (
		<Link
			href="/post/create"
			className="group block rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-all hover:border-purple-400 hover:shadow-md sm:p-4"
		>
			<div className="flex items-center gap-2 sm:gap-3">
				{/* Fake Avatar Circle */}
				<div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 sm:h-12 sm:w-12">
					<FileText className="h-5 w-5 text-white sm:h-6 sm:w-6" />
				</div>

				{/* Fake Input - Takes remaining space */}
				<div className="min-w-0 flex-1">
					<div className="cursor-pointer rounded-full border-2 border-gray-200 bg-gray-50 px-3 py-2 text-left text-gray-500 transition-all group-hover:border-purple-400 group-hover:bg-purple-50 group-hover:text-gray-700 sm:px-5 sm:py-3">
						<span className="text-sm sm:text-base">What do you want to share today?</span>
					</div>
				</div>

				{/* Action Button - Hidden on very small screens */}
				<div className="hidden flex-shrink-0 xs:block">
					<div className="rounded-lg bg-purple-600 px-3 py-2 font-medium text-sm text-white transition-colors group-hover:bg-purple-700 sm:px-5 sm:py-2.5">
						Post
					</div>
				</div>
			</div>
		</Link>
	);
}

const SORT_OPTIONS = [
	{ value: "latest", label: "Latest", description: "Newest posts first" },
	{ value: "popular", label: "Popular", description: "Most liked posts" },
	{ value: "discussed", label: "Discussed", description: "Most commented" },
] as const;

function SortFilter({ currentSort }: { currentSort: string }) {
	return (
		<div className="rounded-xl border border-gray-200 bg-white p-2 shadow-sm sm:p-3">
			<div className="flex items-center gap-2 overflow-x-auto">
				<span className="flex-shrink-0 font-medium text-gray-700 text-xs sm:text-sm">
					Sort:
				</span>
				<div className="flex gap-1.5 sm:gap-2">
					{SORT_OPTIONS.map((option) => (
						<Link
							key={option.value}
							href={`/feed?sortBy=${option.value}`}
							className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-xs transition-all sm:px-4 sm:py-2 sm:text-sm ${
								currentSort === option.value
									? "bg-purple-600 font-medium text-white shadow-sm"
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
							}`}
							title={option.description}
						>
							{option.label}
						</Link>
					))}
				</div>
			</div>
		</div>
	);
}


