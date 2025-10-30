import type { Prisma } from "@prisma/client";
import {
	Award,
	Briefcase,
	Calendar,
	FileText,
	FolderOpen,
	Layers,
	MapPin,
	TrendingUp,
	Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { PostCard } from "~/components/posts/post-card";
import { ProfileActionsClient } from "~/components/users/profile-actions-client";
import { ProfileSkeleton } from "~/components/users/profile-skeleton";
import { getCurrentUser } from "~/lib/auth/get-user";
import { db } from "~/server/db";

// OPTIMIZATION: Cache user profile data for 5 minutes
// Reduces database load for frequently viewed profiles
export const revalidate = 300; // 5 minutes

interface PublicUserProfilePageProps {
	params: Promise<{ userId: string }>;
	searchParams: Promise<{ tab?: string; filter?: string }>;
}

// Type for post with relations
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
		portfolioDetails: true;
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

export default async function PublicUserProfilePage({
	params,
	searchParams,
}: PublicUserProfilePageProps) {
	const { userId } = await params;
	const { tab = "portfolio", filter } = await searchParams;

	// Check if current user is logged in (optional - for conditional features)
	const currentUser = await getCurrentUser();
	const isOwnProfile = currentUser?.userId === userId;

	// Fetch user data with error handling
	const user = await db.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			username: true,
			name: true,
			image: true,
			bio: true,
			location: true,
			createdAt: true,
			totalReputation: true,
			portfolioPostCount: true,
			casualPostCount: true,
			professionalRoles: {
				where: {
					status: { in: ["ACTIVE", "LEARNING"] },
				},
				select: {
					isPrimary: true,
					status: true,
					yearsExperience: true,
					reputationPoints: true,
					professionalRole: {
						select: {
							id: true,
							name: true,
							key: true,
							icon: true,
						},
					},
				},
				orderBy: [{ isPrimary: "desc" }, { assignedAt: "asc" }],
			},
			_count: {
				select: {
					posts: {
						where: {
							deletedAt: null,
							status: "PUBLISHED",
						},
					},
				},
			},
		},
	});

	if (!user) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<div className="text-center">
					<h2 className="mb-2 font-bold text-2xl text-gray-900">
						User Not Found
					</h2>
					<p className="text-gray-600">This user profile doesn't exist.</p>
				</div>
			</div>
		);
	}

	// Fetch collections for the user
	const collections = await db.portfolioCollection.findMany({
		where: {
			userId: user.id,
			isPublic: true,
		},
		select: {
			id: true,
			name: true,
			description: true,
			_count: {
				select: {
					posts: true,
				},
			},
		},
		orderBy: {
			displayOrder: "asc",
		},
	});

	// Fetch posts based on the active tab
	let posts: PostWithRelations[] = [];

	if (tab === "portfolio") {
		// Fetch portfolio posts with optional filtering
		const where: Prisma.PostWhereInput = {
			userId: user.id,
			postType: "PORTFOLIO",
			status: "PUBLISHED",
			deletedAt: null,
		};

		// Apply professional role filter if provided
		if (filter && filter !== "all") {
			where.professionalRoles = {
				some: {
					professionalRole: {
						key: filter,
					},
				},
			};
		}

		posts = await db.post.findMany({
			where,
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
				portfolioDetails: true,
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
			orderBy: {
				createdAt: "desc",
			},
			take: 20,
		});
	} else if (tab === "all") {
		// Fetch all posts (both portfolio and casual)
		posts = await db.post.findMany({
			where: {
				userId: user.id,
				status: "PUBLISHED",
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
				portfolioDetails: true,
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
			orderBy: {
				createdAt: "desc",
			},
			take: 20,
		});
	}

	return (
		<div className="mx-auto max-w-7xl space-y-6">
			{/* Profile Header with Cover Area */}
			<div className="overflow-hidden rounded-xl bg-white shadow-sm">
				{/* Cover Section - Gradient Background */}
				<div className="relative h-32 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 md:h-48" />

				{/* Profile Content */}
				<div className="relative px-4 pb-6 sm:px-6 lg:px-8">
					{/* Profile Image - Overlapping Cover */}
					<div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:gap-6">
						<div className="-mt-16 md:-mt-20">
							<div className="relative h-32 w-32 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg md:h-40 md:w-40">
								{user.image ? (
									<Image
										src={user.image}
										alt={user.name ?? user.username}
										fill
										className="object-cover"
										priority
									/>
								) : (
									<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-600">
										<span className="font-bold text-5xl text-white md:text-6xl">
											{(user.name ?? user.username).charAt(0).toUpperCase()}
										</span>
									</div>
								)}
							</div>
						</div>

						{/* Name and Actions */}
						<div className="flex flex-1 flex-col justify-end gap-4 pt-2 md:flex-row md:items-center md:pt-0">
							<div className="flex-1">
								<h1 className="mb-1 font-bold text-2xl text-gray-900 md:text-3xl">
									{user.name ?? user.username}
								</h1>
								<p className="mb-2 text-gray-600 text-lg">@{user.username}</p>

								{/* Professional Roles - Compact Badges */}
								{user.professionalRoles.length > 0 && (
									<div className="flex flex-wrap gap-2">
										{user.professionalRoles
											.slice(0, 3)
											.map(({ professionalRole, status, isPrimary }) => (
												<span
													key={professionalRole.id}
													className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium text-sm transition-all ${
														isPrimary
															? "bg-purple-600 text-white"
															: status === "LEARNING"
																? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
																: "bg-gray-100 text-gray-700 ring-1 ring-gray-200"
													}`}
												>
													{professionalRole.icon && (
														<span className="text-base">
															{professionalRole.icon}
														</span>
													)}
													<span>{professionalRole.name}</span>
													{status === "LEARNING" && (
														<span className="text-xs opacity-70">Learning</span>
													)}
												</span>
											))}
										{user.professionalRoles.length > 3 && (
											<span className="inline-flex items-center rounded-lg bg-gray-100 px-3 py-1.5 font-medium text-gray-700 text-sm">
												+{user.professionalRoles.length - 3} more
											</span>
										)}
									</div>
								)}
							</div>

							{/* Action Buttons */}
							<div className="flex flex-wrap gap-2 md:flex-nowrap">
								{currentUser ? (
									<>
										{isOwnProfile ? (
											<Link
												href="/settings"
												className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-medium text-gray-700 text-sm shadow-sm transition-all hover:bg-gray-50 hover:shadow"
											>
												<Briefcase className="h-4 w-4" />
												Edit Profile
											</Link>
										) : (
											<>
												<button
													type="button"
													className="flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 font-medium text-sm text-white shadow-sm transition-all hover:bg-purple-700 hover:shadow-md"
												>
													Message
												</button>
												<button
													type="button"
													className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-medium text-gray-700 text-sm shadow-sm transition-all hover:bg-gray-50 hover:shadow"
												>
													Collaborate
												</button>
												<ProfileActionsClient
													userId={user.id}
													username={user.username}
												/>
											</>
										)}
									</>
								) : (
									<Link
										href="/login"
										className="flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-6 py-2.5 font-medium text-sm text-white shadow-sm transition-all hover:bg-purple-700 hover:shadow-md"
									>
										Sign in to connect
									</Link>
								)}
							</div>
						</div>
					</div>

					{/* Bio and Location */}
					{(user.bio || user.location) && (
						<div className="mt-6 space-y-3 border-gray-100 border-t pt-6">
							{user.bio && (
								<p className="max-w-3xl text-gray-700 leading-relaxed">
									{user.bio}
								</p>
							)}
							<div className="flex flex-wrap items-center gap-4 text-gray-600 text-sm">
								{user.location && (
									<div className="flex items-center gap-1.5">
										<MapPin className="h-4 w-4" />
										<span>{user.location}</span>
									</div>
								)}
								<div className="flex items-center gap-1.5">
									<Calendar className="h-4 w-4" />
									<span>
										Joined{" "}
										{new Date(user.createdAt).toLocaleDateString("en-US", {
											month: "long",
											year: "numeric",
										})}
									</span>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* User Metrics - Enhanced Design */}
			<div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
				{/* Total Posts */}
				<MetricCard
					icon={<FileText className="h-5 w-5" />}
					label="Total Posts"
					value={user._count.posts}
					iconBgColor="bg-blue-100"
					iconColor="text-blue-600"
					description="Published"
				/>

				{/* Portfolio Posts */}
				<MetricCard
					icon={<Layers className="h-5 w-5" />}
					label="Portfolio"
					value={user.portfolioPostCount}
					iconBgColor="bg-purple-100"
					iconColor="text-purple-600"
					description="Showcase work"
				/>

				{/* Reputation or Roles */}
				{isOwnProfile ? (
					<MetricCard
						icon={<TrendingUp className="h-5 w-5" />}
						label="Reputation"
						value={user.totalReputation}
						iconBgColor="bg-indigo-100"
						iconColor="text-indigo-600"
						description="Total points"
						isPrivate
					/>
				) : (
					<MetricCard
						icon={<Award className="h-5 w-5" />}
						label="Roles"
						value={user.professionalRoles.length}
						iconBgColor="bg-green-100"
						iconColor="text-green-600"
						description="Professional"
					/>
				)}

				{/* Collections */}
				<MetricCard
					icon={<FolderOpen className="h-5 w-5" />}
					label="Collections"
					value={collections.length}
					iconBgColor="bg-amber-100"
					iconColor="text-amber-600"
					description="Organized"
				/>
			</div>

			{/* Tabs Section */}
			<div className="overflow-hidden rounded-xl bg-white shadow-sm">
				<div className="border-gray-200 border-b">
					<nav className="scrollbar-thin flex gap-1 overflow-x-auto p-1.5">
						<TabLink
							href={`/user/${user.id}?tab=portfolio`}
							active={tab === "portfolio"}
							icon={<Layers className="h-4 w-4" />}
						>
							Portfolio
						</TabLink>
						<TabLink
							href={`/user/${user.id}?tab=all`}
							active={tab === "all"}
							icon={<FileText className="h-4 w-4" />}
						>
							All Posts
						</TabLink>
						<TabLink
							href={`/user/${user.id}?tab=collections`}
							active={tab === "collections"}
							icon={<FolderOpen className="h-4 w-4" />}
						>
							Collections
						</TabLink>
						<TabLink
							href={`/user/${user.id}?tab=about`}
							active={tab === "about"}
							icon={<Users className="h-4 w-4" />}
						>
							About
						</TabLink>
					</nav>
				</div>

				{/* Tab Content */}
				<div className="min-h-[400px] p-4 md:p-6">
					<Suspense fallback={<ProfileSkeleton />}>
						{tab === "portfolio" && (
							<PortfolioTab
								posts={posts}
								isOwnProfile={isOwnProfile}
								professionalRoles={user.professionalRoles}
								currentFilter={filter}
								userId={user.id}
								currentUserId={currentUser?.userId}
							/>
						)}
						{tab === "all" && (
							<AllPostsTab
								posts={posts}
								isOwnProfile={isOwnProfile}
								currentUserId={currentUser?.userId}
							/>
						)}
						{tab === "collections" && (
							<CollectionsTab
								collections={collections}
								isOwnProfile={isOwnProfile}
							/>
						)}
						{tab === "about" && <AboutTab user={user} />}
					</Suspense>
				</div>
			</div>
		</div>
	);
}

// Metric Card Component
function MetricCard({
	icon,
	label,
	value,
	iconBgColor,
	iconColor,
	description,
	isPrivate = false,
}: {
	icon: React.ReactNode;
	label: string;
	value: number;
	iconBgColor: string;
	iconColor: string;
	description: string;
	isPrivate?: boolean;
}) {
	return (
		<div className="group relative overflow-hidden rounded-xl bg-white p-4 shadow-sm transition-all hover:shadow-md">
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<div className="mb-3 flex items-center gap-2">
						<div className={`rounded-lg p-2 ${iconBgColor} ${iconColor}`}>
							{icon}
						</div>
					</div>
					<div className="mb-1 font-bold text-3xl text-gray-900">{value}</div>
					<div className="font-medium text-gray-900 text-sm">{label}</div>
					<div className="text-gray-500 text-xs">{description}</div>
				</div>
			</div>
			{isPrivate && (
				<div className="absolute top-2 right-2">
					<span className="rounded-md bg-indigo-100 px-2 py-1 font-medium text-indigo-700 text-xs">
						Private
					</span>
				</div>
			)}
		</div>
	);
}

// Tab Link Component
function TabLink({
	href,
	active,
	icon,
	children,
}: {
	href: string;
	active: boolean;
	icon: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<Link
			href={href}
			className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 font-medium text-sm transition-all ${
				active
					? "bg-purple-600 text-white shadow-sm"
					: "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
			}`}
		>
			{icon}
			{children}
		</Link>
	);
}

// Portfolio Tab Component
function PortfolioTab({
	posts,
	isOwnProfile,
	professionalRoles,
	currentFilter,
	userId,
	currentUserId,
}: {
	posts: PostWithRelations[];
	isOwnProfile: boolean;
	professionalRoles: Array<{
		professionalRole: {
			id: string;
			key: string;
			name: string;
			icon: string | null;
		};
	}>;
	currentFilter?: string;
	userId: string;
	currentUserId?: string | null;
}) {
	return (
		<div className="space-y-6">
			{/* Filter Options */}
			{professionalRoles.length > 0 && (
				<div className="flex flex-wrap gap-2">
					<Link
						href={`/user/${userId}?tab=portfolio&filter=all`}
						className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 font-medium text-sm transition-all ${
							!currentFilter || currentFilter === "all"
								? "bg-purple-600 text-white shadow-sm"
								: "border border-gray-200 bg-white text-gray-700 hover:border-purple-200 hover:bg-purple-50"
						}`}
					>
						<Layers className="h-4 w-4" />
						All
					</Link>
					{professionalRoles.map(({ professionalRole }) => (
						<Link
							key={professionalRole.id}
							href={`/user/${userId}?tab=portfolio&filter=${professionalRole.key}`}
							className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 font-medium text-sm transition-all ${
								currentFilter === professionalRole.key
									? "bg-purple-600 text-white shadow-sm"
									: "border border-gray-200 bg-white text-gray-700 hover:border-purple-200 hover:bg-purple-50"
							}`}
						>
							{professionalRole.icon && (
								<span className="text-base">{professionalRole.icon}</span>
							)}
							<span>{professionalRole.name}</span>
						</Link>
					))}
				</div>
			)}

			{/* Posts */}
			{posts.length > 0 ? (
				<div className="space-y-4">
					{posts.map((post) => (
						<PostCard
							key={post.id}
							post={post}
							isLoggedIn={!!currentUserId}
							currentUserId={currentUserId}
						/>
					))}
				</div>
			) : (
				<div className="flex min-h-[300px] items-center justify-center rounded-xl border border-gray-200 border-dashed bg-gray-50">
					<div className="max-w-md py-12 text-center">
						<div className="mb-4 inline-flex rounded-full bg-purple-100 p-4">
							<Layers className="h-8 w-8 text-purple-600" />
						</div>
						<h3 className="mb-2 font-semibold text-gray-900 text-lg">
							No portfolio posts yet
						</h3>
						<p className="mb-4 text-gray-600 text-sm">
							{isOwnProfile
								? "Showcase your best work by creating portfolio posts"
								: "This user hasn't shared any portfolio posts yet"}
						</p>
						{isOwnProfile && (
							<Link
								href="/post/create?type=portfolio"
								className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 font-medium text-sm text-white transition-all hover:bg-purple-700 hover:shadow-md"
							>
								<Layers className="h-4 w-4" />
								Create Portfolio Post
							</Link>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

// All Posts Tab Component
function AllPostsTab({
	posts,
	isOwnProfile,
	currentUserId,
}: {
	posts: PostWithRelations[];
	isOwnProfile: boolean;
	currentUserId?: string | null;
}) {
	return (
		<div className="space-y-4">
			{posts.length > 0 ? (
				posts.map((post) => (
					<PostCard
						key={post.id}
						post={post}
						isLoggedIn={!!currentUserId}
						currentUserId={currentUserId}
					/>
				))
			) : (
				<div className="flex min-h-[300px] items-center justify-center rounded-xl border border-gray-200 border-dashed bg-gray-50">
					<div className="max-w-md py-12 text-center">
						<div className="mb-4 inline-flex rounded-full bg-blue-100 p-4">
							<FileText className="h-8 w-8 text-blue-600" />
						</div>
						<h3 className="mb-2 font-semibold text-gray-900 text-lg">
							No posts yet
						</h3>
						<p className="mb-4 text-gray-600 text-sm">
							{isOwnProfile
								? "Start sharing your thoughts and work with the community"
								: "This user hasn't posted anything yet"}
						</p>
						{isOwnProfile && (
							<Link
								href="/post/create?type=casual"
								className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 font-medium text-sm text-white transition-all hover:bg-purple-700 hover:shadow-md"
							>
								<FileText className="h-4 w-4" />
								Create Your First Post
							</Link>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

// Collections Tab Component
function CollectionsTab({
	collections,
	isOwnProfile,
}: {
	collections: Array<{
		id: string;
		name: string;
		description: string | null;
		_count: { posts: number };
	}>;
	isOwnProfile: boolean;
}) {
	return (
		<div className="space-y-4">
			{collections.length > 0 ? (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{collections.map((collection) => (
						<Link
							key={collection.id}
							href={`/collection/${collection.id}`}
							className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-purple-300 hover:shadow-md"
						>
							<div className="mb-3 flex items-start justify-between">
								<div className="flex items-center gap-2">
									<div className="rounded-lg bg-purple-100 p-2">
										<FolderOpen className="h-5 w-5 text-purple-600" />
									</div>
								</div>
								<span className="rounded-full bg-gray-100 px-2.5 py-1 font-medium text-gray-700 text-xs">
									{collection._count.posts}{" "}
									{collection._count.posts === 1 ? "post" : "posts"}
								</span>
							</div>
							<h3 className="mb-2 font-semibold text-gray-900 group-hover:text-purple-600">
								{collection.name}
							</h3>
							{collection.description && (
								<p className="line-clamp-2 text-gray-600 text-sm">
									{collection.description}
								</p>
							)}
						</Link>
					))}
				</div>
			) : (
				<div className="flex min-h-[300px] items-center justify-center rounded-xl border border-gray-200 border-dashed bg-gray-50">
					<div className="max-w-md py-12 text-center">
						<div className="mb-4 inline-flex rounded-full bg-amber-100 p-4">
							<FolderOpen className="h-8 w-8 text-amber-600" />
						</div>
						<h3 className="mb-2 font-semibold text-gray-900 text-lg">
							No collections yet
						</h3>
						<p className="text-gray-600 text-sm">
							{isOwnProfile
								? "Organize your portfolio posts into collections to showcase different projects or themes"
								: "This user hasn't created any collections yet"}
						</p>
					</div>
				</div>
			)}
		</div>
	);
}

// About Tab Component
function AboutTab({
	user,
}: {
	user: {
		name: string | null;
		username: string;
		bio: string | null;
		location: string | null;
		createdAt: Date;
		professionalRoles: Array<{
			isPrimary: boolean;
			status: string;
			yearsExperience: number | null;
			reputationPoints: number;
			professionalRole: {
				id: string;
				name: string;
				key: string;
				icon: string | null;
			};
		}>;
	};
}) {
	return (
		<div className="space-y-8">
			{/* Bio Section */}
			{user.bio && (
				<div>
					<h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900 text-lg">
						<FileText className="h-5 w-5 text-purple-600" />
						About
					</h3>
					<p className="text-gray-700 leading-relaxed">{user.bio}</p>
				</div>
			)}

			{/* Professional Roles Section */}
			{user.professionalRoles.length > 0 && (
				<div>
					<h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 text-lg">
						<Briefcase className="h-5 w-5 text-purple-600" />
						Professional Roles
					</h3>
					<div className="grid gap-4 md:grid-cols-2">
						{user.professionalRoles.map(
							({ professionalRole, isPrimary, status, yearsExperience }) => (
								<div
									key={professionalRole.id}
									className={`group relative overflow-hidden rounded-xl border p-4 transition-all ${
										isPrimary
											? "border-purple-300 bg-purple-50"
											: "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
									}`}
								>
									<div className="flex items-start justify-between">
										<div className="flex items-start gap-3">
											{professionalRole.icon && (
												<div
													className={`rounded-lg p-2.5 text-2xl ${
														isPrimary
															? "bg-purple-600 text-white"
															: "bg-gray-100"
													}`}
												>
													{professionalRole.icon}
												</div>
											)}
											<div>
												<div className="mb-1 flex flex-wrap items-center gap-2">
													<h4 className="font-semibold text-gray-900">
														{professionalRole.name}
													</h4>
													{isPrimary && (
														<span className="inline-flex items-center gap-1 rounded-md bg-purple-600 px-2 py-0.5 font-medium text-white text-xs">
															<Award className="h-3 w-3" />
															Primary
														</span>
													)}
												</div>
												<div className="flex flex-wrap items-center gap-2 text-gray-600 text-sm">
													<span
														className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-medium text-xs ${
															status === "LEARNING"
																? "bg-blue-100 text-blue-700"
																: "bg-green-100 text-green-700"
														}`}
													>
														{status === "LEARNING" ? "Learning" : "Active"}
													</span>
													{yearsExperience !== null && (
														<span className="text-xs">
															{yearsExperience}{" "}
															{yearsExperience === 1 ? "year" : "years"}
														</span>
													)}
												</div>
											</div>
										</div>
									</div>
								</div>
							),
						)}
					</div>
				</div>
			)}

			{/* Member Since */}
			<div>
				<h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900 text-lg">
					<Calendar className="h-5 w-5 text-purple-600" />
					Member Since
				</h3>
				<p className="text-gray-700">
					{new Date(user.createdAt).toLocaleDateString("en-US", {
						month: "long",
						day: "numeric",
						year: "numeric",
					})}
				</p>
			</div>
		</div>
	);
}
