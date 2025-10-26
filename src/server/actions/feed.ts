"use server";

import type { Prisma } from "@prisma/client";
import { db } from "~/server/db";

const POSTS_PER_PAGE = 20;

export async function loadMorePosts(cursor: string, sortBy: string = "latest") {
	try {
		// Determine sort order
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

		// Fetch posts with cursor-based pagination
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
			take: POSTS_PER_PAGE + 1,
			skip: 1, // Skip the cursor
			cursor: {
				id: cursor,
			},
		});

		// Check if there are more posts
		const hasMore = posts.length > POSTS_PER_PAGE;
		const displayPosts = hasMore ? posts.slice(0, POSTS_PER_PAGE) : posts;

		return {
			posts: displayPosts,
			hasMore,
		};
	} catch (error) {
		console.error("Error loading more posts:", error);
		return {
			posts: [],
			hasMore: false,
		};
	}
}
