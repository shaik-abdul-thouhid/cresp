import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "~/lib/auth/get-user";
import { db } from "~/server/db";

// OPTIMIZATION: Cache user profile data for 5 minutes
// Reduces database load for frequently viewed profiles
export const revalidate = 300; // 5 minutes

interface PublicUserProfilePageProps {
	params: Promise<{ userId: string }>;
}

export default async function PublicUserProfilePage({
	params,
}: PublicUserProfilePageProps) {
	const { userId } = await params;

	// Check if current user is logged in (optional - for conditional features)
	const currentUser = await getCurrentUser();
	const isOwnProfile = currentUser?.userId === userId;

	// Fetch user data with error handling
	// biome-ignore lint/suspicious/noImplicitAnyLet: Type will be inferred from try-catch assignment
	let user;
	try {
		user = await db.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				username: true,
				name: true,
				image: true,
				bio: true,
				location: true,
				createdAt: true,
				professionalRoles: {
					select: {
						professionalRole: {
							select: {
								id: true,
								name: true,
								key: true,
								icon: true,
							},
						},
					},
				},
			},
		});
	} catch (error) {
		console.error("Failed to fetch user profile:", error);
		throw new Error("Unable to load user profile. Please try again later.");
	}

	if (!user) {
		notFound();
	}

	return (
		<div className="space-y-6">
			{/* Profile Header */}
			<div className="rounded-xl bg-white p-8 shadow-sm">
				<div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
					{/* Profile Image */}
					<div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-full border border-gray-200">
						{user.image ? (
							<Image
								src={user.image}
								alt={user.name ?? user.username}
								fill
								className="object-cover"
							/>
						) : (
							<div className="flex h-full w-full items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600">
								<span className="font-bold text-4xl text-white">
									{(user.name ?? user.username).charAt(0).toUpperCase()}
								</span>
							</div>
						)}
					</div>

					{/* Profile Info */}
					<div className="flex-1">
						<h1 className="mb-1 font-bold text-3xl text-gray-900">
							{user.name ?? user.username}
						</h1>
						<p className="mb-3 text-gray-600">@{user.username}</p>

						{/* Professional Roles */}
						{user.professionalRoles.length > 0 && (
							<div className="mb-4 flex flex-wrap gap-2">
								{user.professionalRoles.map(({ professionalRole }) => (
									<span
										key={professionalRole.id}
										className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-purple-700 text-sm"
									>
										{professionalRole.icon && (
											<span>{professionalRole.icon}</span>
										)}
										<span>{professionalRole.name}</span>
									</span>
								))}
							</div>
						)}

						{/* Bio */}
						{user.bio && <p className="mb-4 text-gray-700">{user.bio}</p>}

						{/* Location */}
						{user.location && (
							<p className="mb-4 flex items-center gap-2 text-gray-600 text-sm">
								<svg
									className="h-4 w-4"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									strokeWidth={2}
									aria-hidden="true"
								>
									<title>Location icon</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
									/>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
									/>
								</svg>
								{user.location}
							</p>
						)}

						{/* Join Date */}
						<p className="text-gray-500 text-sm">
							Joined{" "}
							{new Date(user.createdAt).toLocaleDateString("en-US", {
								month: "long",
								year: "numeric",
							})}
						</p>
					</div>

					{/* Action Buttons */}
					<div className="flex gap-3">
						{currentUser ? (
							<>
								{isOwnProfile ? (
									<Link
										href="/settings"
										className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 text-sm transition-colors hover:bg-gray-50"
									>
										Edit Profile
									</Link>
								) : (
									<>
										<button
											type="button"
											className="rounded-lg bg-purple-600 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-purple-700"
										>
											Message
										</button>
										<button
											type="button"
											className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 text-sm transition-colors hover:bg-gray-50"
										>
											Collaborate
										</button>
									</>
								)}
							</>
						) : (
							<Link
								href="/login"
								className="rounded-lg bg-purple-600 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-purple-700"
							>
								Sign in to connect
							</Link>
						)}
					</div>
				</div>
			</div>

			{/* Portfolio/Work Section */}
			<div className="rounded-xl bg-white p-6 shadow-sm">
				<h2 className="mb-4 font-bold text-gray-900 text-xl">Portfolio</h2>
				<div className="py-12 text-center text-gray-500">
					<p className="mb-4">No posts yet</p>
					{isOwnProfile && (
						<Link
							href="/feed"
							className="text-purple-600 hover:text-purple-700"
						>
							Create your first post →
						</Link>
					)}
				</div>
			</div>
		</div>
	);
}
