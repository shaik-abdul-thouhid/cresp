import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostDetailCard } from "~/components/posts/post-detail-card";
import { getCurrentUser } from "~/lib/auth/get-user";
import { db } from "~/server/db";

export default async function PostPage({
	params,
}: {
	params: Promise<{ postId: string }>;
}) {
	const { postId } = await params;
	const currentUser = await getCurrentUser();

	const post = await db.post.findUnique({
		where: {
			id: postId,
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
	});

	if (!post) {
		notFound();
	}

	return (
		<div className="mx-auto min-h-screen max-w-4xl px-4 py-6">
			{/* Back Button */}
			<Link
				href="/feed"
				className="mb-6 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-purple-600"
			>
				<ArrowLeft className="h-4 w-4" />
				<span className="font-medium text-sm">Back to Feed</span>
			</Link>

			{/* Post Detail */}
			<PostDetailCard
				post={post}
				isLoggedIn={!!currentUser}
				currentUserId={currentUser?.userId}
			/>

			{/* Comments Section - Placeholder for now */}
			<div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
				<h3 className="mb-4 font-bold text-gray-900 text-lg">
					Comments ({post._count.comments})
				</h3>
				<p className="text-center text-gray-500 text-sm">
					Comments section coming soon...
				</p>
			</div>
		</div>
	);
}
