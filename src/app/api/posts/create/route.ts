import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "~/lib/auth/get-user";
import { ActivityActions, logActivity } from "~/lib/logging";
import { db } from "~/server/db";

// Type definitions for parsed media
interface VideoData {
	provider: string;
	videoId: string;
	url: string;
	thumbnail?: string;
	embedUrl?: string;
	duration?: number;
}

interface AudioData {
	provider: string;
	audioId: string;
	url: string;
	thumbnail?: string;
	embedUrl?: string;
	duration?: number;
}

// Type definition for uploaded file metadata
interface UploadedFileData {
	key: string;
	url: string;
	size: number;
	mimeType: string;
	fileName: string;
	width?: number;
	height?: number;
}

export async function POST(req: NextRequest) {
	try {
		// Get current user
		const user = await getCurrentUser();
		if (!user) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Parse JSON body (not FormData - files are already uploaded)
		const body = await req.json();

		// Extract basic fields
		const postType = body.postType as "CASUAL" | "PORTFOLIO";
		const content = body.content as string | null;
		const isAiGenerated = body.isAiGenerated === true;

		// Extract arrays
		const professionalRoleIds: string[] = body.professionalRoleIds ?? [];
		const hashtags: string[] = body.hashtags ?? [];
		const videos: VideoData[] = body.videos ?? [];
		const audios: AudioData[] = body.audios ?? [];

		// Extract already-uploaded file metadata
		const images: UploadedFileData[] = body.images ?? [];
		const documents: UploadedFileData[] = body.documents ?? [];

		// Validate portfolio post requirements
		if (postType === "PORTFOLIO") {
			if (!professionalRoleIds || professionalRoleIds.length === 0) {
				return NextResponse.json(
					{
						error: "Professional roles are required for portfolio posts",
					},
					{ status: 400 }
				);
			}

			// Verify user has these professional roles
			const userRoles = await db.userProfessionalRole.findMany({
				where: {
					userId: user.userId,
					professionalRoleId: {
						in: professionalRoleIds,
					},
				},
			});

			if (userRoles.length !== professionalRoleIds.length) {
				return NextResponse.json(
					{ error: "One or more professional roles are invalid" },
					{ status: 400 }
				);
			}
		}

		// Validate that there's some content
		const hasContent = content && content.trim().length > 0;
		const hasMedia =
			images.length > 0 ||
			videos.length > 0 ||
			audios.length > 0 ||
			documents.length > 0;

		if (!hasContent && !hasMedia) {
			return NextResponse.json(
				{ error: "Post must have either content or media" },
				{ status: 400 }
			);
		}

		// Extract portfolio details if this is a portfolio post
		const portfolioData = body.portfolio;

		// Create post with all relations in a transaction
		const post = await db.$transaction(async (tx) => {
			// 1. Create the post
			const newPost = await tx.post.create({
				data: {
					userId: user.userId,
					postType,
					content: content || undefined,
					isAiGenerated,
					status: "PUBLISHED",
					publishedAt: new Date(),
				},
			});

			// 2. Create post privacy settings
			await tx.postPrivacy.create({
				data: {
					postId: newPost.id,
					canComment: "EVERYONE",
					canShare: "EVERYONE",
					canDownload: "CONNECTIONS",
				},
			});

			// 2.5. Create portfolio details if this is a portfolio post
			if (postType === "PORTFOLIO" && portfolioData) {
				await tx.portfolioPost.create({
					data: {
						postId: newPost.id,
						projectTitle: portfolioData.projectTitle,
						projectType: portfolioData.projectType || null,
						projectStatus:
							portfolioData.projectStatus || "COMPLETED",
						userRole: portfolioData.userRole,
						startDate: portfolioData.startDate
							? new Date(portfolioData.startDate)
							: null,
						endDate: portfolioData.endDate
							? new Date(portfolioData.endDate)
							: null,
						duration: portfolioData.duration || null,
						isTeamProject: portfolioData.isTeamProject || false,
						teamSize: portfolioData.teamSize || null,
						responsibilities: portfolioData.responsibilities || [],
						keyContributions:
							portfolioData.keyContributions || null,
						technologies: portfolioData.technologies || [],
						tools: portfolioData.tools || [],
						skills: portfolioData.skills || [],
						liveUrl: portfolioData.liveUrl || null,
						repositoryUrl: portfolioData.repositoryUrl || null,
						caseStudyUrl: portfolioData.caseStudyUrl || null,
						problemStatement:
							portfolioData.problemStatement || null,
						solution: portfolioData.solution || null,
						impact: portfolioData.impact || null,
						challenges: portfolioData.challenges || null,
						lessonsLearned: portfolioData.lessonsLearned || null,
					},
				});
			}

			// 3. Add professional roles (for portfolio posts)
			if (professionalRoleIds && professionalRoleIds.length > 0) {
				await tx.postProfessionalRole.createMany({
					data: professionalRoleIds.map((roleId: string) => ({
						postId: newPost.id,
						userId: user.userId,
						professionalRoleId: roleId,
						reputationEarned: 0,
					})),
				});
			}

			// 4. Add hashtags
			if (hashtags && hashtags.length > 0) {
				for (const hashtagName of hashtags) {
					// Find or create hashtag
					const hashtag = await tx.hashtag.upsert({
						where: { name: hashtagName.toLowerCase() },
						create: {
							name: hashtagName.toLowerCase(),
							useCount: 1,
							lastUsedAt: new Date(),
						},
						update: {
							useCount: { increment: 1 },
							lastUsedAt: new Date(),
						},
					});

					// Link to post
					await tx.postHashtag.create({
						data: {
							postId: newPost.id,
							hashtagId: hashtag.id,
						},
					});
				}
			}

			// 5. Add media
			let displayOrder = 0;

			// Images (already uploaded to storage)
			if (images.length > 0) {
				await tx.postMedia.createMany({
					data: images.map((img) => ({
						postId: newPost.id,
						mediaType: "IMAGE",
						url: img.url,
						fileName: img.fileName,
						fileSize: img.size,
						mimeType: img.mimeType,
						width: img.width,
						height: img.height,
						displayOrder: displayOrder++,
					})),
				});
			}

			// Videos
			if (videos && videos.length > 0) {
				await tx.postMedia.createMany({
					data: videos.map((video) => ({
						postId: newPost.id,
						mediaType: "VIDEO_LINK",
						url: video.url,
						videoProvider: video.provider,
						videoId: video.videoId,
						thumbnailUrl: video.thumbnail,
						duration: video.duration,
						displayOrder: displayOrder++,
					})),
				});
			}

			// Audios
			if (audios && audios.length > 0) {
				await tx.postMedia.createMany({
					data: audios.map((audio) => ({
						postId: newPost.id,
						mediaType: "AUDIO_LINK",
						url: audio.url,
						videoProvider: audio.provider, // Reuse videoProvider field
						videoId: audio.audioId, // Reuse videoId field
						thumbnailUrl: audio.thumbnail,
						duration: audio.duration,
						displayOrder: displayOrder++,
					})),
				});
			}

			// Documents (already uploaded to storage)
			if (documents.length > 0) {
				await tx.postMedia.createMany({
					data: documents.map((doc) => ({
						postId: newPost.id,
						mediaType: "DOCUMENT",
						url: doc.url,
						fileName: doc.fileName,
						fileSize: doc.size,
						mimeType: doc.mimeType,
						displayOrder: displayOrder++,
					})),
				});
			}

			// 6. Initialize post analytics
			await tx.postAnalytics.create({
				data: {
					postId: newPost.id,
				},
			});

			// 7. Update user post counts
			if (postType === "PORTFOLIO") {
				await tx.user.update({
					where: { id: user.userId },
					data: { portfolioPostCount: { increment: 1 } },
				});
			} else {
				await tx.user.update({
					where: { id: user.userId },
					data: { casualPostCount: { increment: 1 } },
				});
			}

			return newPost;
		});

		// Check if this is user's first post
		const postCounts = await db.user.findUnique({
			where: { id: user.userId },
			select: {
				portfolioPostCount: true,
				casualPostCount: true,
			},
		});

		const isFirstPortfolioPost =
			postType === "PORTFOLIO" && postCounts?.portfolioPostCount === 1;
		const isFirstCasualPost =
			postType === "CASUAL" && postCounts?.casualPostCount === 1;

		// Log activity
		await logActivity({
			userId: user.userId,
			action: ActivityActions.POST_CREATE,
			metadata: {
				postId: post.id,
				postType,
				hasMedia,
				isFirstPost: isFirstPortfolioPost || isFirstCasualPost,
			},
		});

		// Return created post
		return NextResponse.json(
			{
				success: true,
				message: "Post created successfully",
				postId: post.id,
				isFirstPortfolioPost,
				isFirstCasualPost,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error creating post:", error);

		return NextResponse.json(
			{ error: "Failed to create post" },
			{ status: 500 }
		);
	}
}
