"use server";

import { getCurrentUser } from "~/lib/auth/get-user";
import { ActivityActions, logActivity } from "~/lib/logging";
import { db } from "~/server/db";

export async function deletePost(postId: string) {
	const currentUser = await getCurrentUser();
	try {
		if (!currentUser) {
			await logActivity({
				action: ActivityActions.POST_DELETE,
				resourceType: "Post",
				resourceId: postId,
				status: "failure",
				errorMessage: "Unauthorized: User not logged in",
			});

			return {
				success: false,
				error: "You must be logged in to delete a post",
			};
		}

		// Check if the post belongs to the user
		const post = await db.post.findUnique({
			where: { id: postId },
			select: {
				userId: true,
				deletedAt: true,
				postType: true,
				content: true,
			},
		});

		if (!post) {
			await logActivity({
				userId: currentUser.userId,
				action: ActivityActions.POST_DELETE,
				resourceType: "Post",
				resourceId: postId,
				status: "failure",
				errorMessage: "Post not found",
			});

			return {
				success: false,
				error: "Post not found",
			};
		}

		if (post.userId !== currentUser.userId) {
			await logActivity({
				userId: currentUser.userId,
				action: ActivityActions.POST_DELETE,
				resourceType: "Post",
				resourceId: postId,
				status: "failure",
				errorMessage: "Unauthorized: User can only delete own posts",
			});

			return {
				success: false,
				error: "You can only delete your own posts",
			};
		}

		if (post.deletedAt) {
			await logActivity({
				userId: currentUser.userId,
				action: ActivityActions.POST_DELETE,
				resourceType: "Post",
				resourceId: postId,
				status: "failure",
				errorMessage: "Post already deleted",
			});

			return {
				success: false,
				error: "Post is already deleted",
			};
		}

		// Soft delete the post
		await db.post.update({
			where: { id: postId },
			data: {
				deletedAt: new Date(),
			},
		});

		// Log successful deletion
		await logActivity({
			userId: currentUser.userId,
			action: ActivityActions.POST_DELETE,
			resourceType: "Post",
			resourceId: postId,
			status: "success",
			metadata: {
				postType: post.postType,
				contentLength: post.content?.length || 0,
			},
		});

		return { success: true };
	} catch (error) {
		console.error("Error deleting post:", error);

		// Log error
		await logActivity({
			userId: currentUser?.userId,
			action: ActivityActions.POST_DELETE,
			resourceType: "Post",
			resourceId: postId,
			status: "failure",
			errorMessage:
				error instanceof Error
					? error.message
					: "Unknown error occurred",
		});

		return {
			success: false,
			error: "Failed to delete post. Please try again.",
		};
	}
}
