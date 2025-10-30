"use client";

import {
	Briefcase,
	Calendar,
	ExternalLink,
	Flag,
	MoreVertical,
	Sparkles,
	Trash2,
	Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ImageModal } from "~/app/(public)/feed/_image_modal";
import { PostMediaRenderer } from "~/app/(public)/feed/_post_media_renderer";
import type { PostWithRelations } from "~/app/(public)/feed/page";
import { ReportPostModal } from "~/components/posts/report-post-modal";
import { ErrorToast, SuccessToast } from "~/components/ui/custom-toasts";
import { deletePost } from "~/server/actions/posts";

interface PostCardProps {
	post: PostWithRelations;
	isLoggedIn: boolean;
	currentUserId?: string | null;
	isHighlighted?: boolean;
	onDelete?: (postId: string) => void;
}

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
				rootMargin: "50px",
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

export function PostCard({
	post,
	isLoggedIn,
	currentUserId,
	isHighlighted = false,
	onDelete,
}: PostCardProps) {
	const authorName = post.user.name ?? post.user.username;
	const primaryRole = post.professionalRoles[0]?.professionalRole;
	const timeAgo = getTimeAgo(post.createdAt);
	const { ref: mediaRef, isVisible: isMediaVisible } = useLazyLoad();
	const { ref: avatarRef, isVisible: isAvatarVisible } = useLazyLoad();
	const carouselRef = useRef<HTMLDivElement>(null);
	const [showMenu, setShowMenu] = useState(false);
	const [showReportModal, setShowReportModal] = useState(false);
	const [showImageModal, setShowImageModal] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);
	const [isDeleting, setIsDeleting] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	const isOwnPost = currentUserId && post.userId === currentUserId;
	const isPortfolio = post.postType === "PORTFOLIO";
	const portfolio = post.portfolioDetails;

	// Get only images from media for the modal
	const images = post.media
		.filter((m) => m.mediaType === "IMAGE")
		.map((m) => ({ id: m.id, url: m.url }));

	const handleImageClick = (index: number) => {
		setSelectedImageIndex(index);
		setShowImageModal(true);
	};

	// Close menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setShowMenu(false);
			}
		};

		if (showMenu) {
			document.addEventListener("mousedown", handleClickOutside);
			return () =>
				document.removeEventListener("mousedown", handleClickOutside);
		}
	}, [showMenu]);

	// Check if post was created within the last 60 seconds
	const isRecentlyPosted = () => {
		const now = new Date().getTime();
		const postTime = new Date(post.createdAt).getTime();
		const diffInSeconds = (now - postTime) / 1000;
		return diffInSeconds < 60; // 60 seconds
	};

	const handleDeletePost = async () => {
		setIsDeleting(true);
		try {
			const result = await deletePost(post.id);

			if (result.success) {
				toast.custom(() => (
					<SuccessToast
						title="Post Deleted"
						message="Your post has been deleted successfully"
					/>
				));
				setShowDeleteConfirm(false);
				setShowMenu(false);
				onDelete?.(post.id);
			} else {
				toast.custom(() => (
					<ErrorToast
						title="Failed to Delete"
						message={result.error || "Could not delete the post"}
					/>
				));
			}
		} catch (error) {
			console.error("Error deleting post:", error);
			toast.custom(() => (
				<ErrorToast title="Error" message="An unexpected error occurred" />
			));
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<article
			className={`rounded-xl border bg-white shadow-sm transition-all duration-500 ${
				isHighlighted
					? "border-purple-400 shadow-lg ring-4 ring-purple-100"
					: "border-gray-200"
			}`}
		>
			{/* "Just Posted" Badge - Only show if highlighted AND recently posted */}
			{isHighlighted && isRecentlyPosted() && (
				<div className="animate-fade-in border-purple-100 border-b bg-gradient-to-r from-purple-50 to-indigo-50 px-4 py-2">
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

					{/* View Button */}
					<Link
						href={`/post/${post.id}`}
						className="rounded-lg bg-purple-600 px-3 py-1.5 font-medium text-white text-xs transition-colors hover:bg-purple-700 sm:px-4 sm:text-sm"
					>
						View
					</Link>

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
							<div className="absolute top-full right-0 z-20 mt-1 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
								{isOwnPost ? (
									<button
										type="button"
										onClick={() => {
											setShowMenu(false);
											setShowDeleteConfirm(true);
										}}
										className="flex w-full items-center gap-3 px-4 py-3 text-left text-gray-700 text-sm transition-colors hover:bg-gray-50"
									>
										<Trash2 className="h-4 w-4 text-red-600" />
										<span>Delete Post</span>
									</button>
								) : (
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
								)}
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

			{/* Delete Confirmation Modal */}
			{showDeleteConfirm && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
						<h3 className="mb-4 font-bold text-gray-900 text-lg">
							Delete Post?
						</h3>
						<p className="mb-6 text-gray-600 text-sm">
							Are you sure you want to delete this post? This action cannot be
							undone.
						</p>
						<div className="flex justify-end gap-3">
							<button
								type="button"
								onClick={() => setShowDeleteConfirm(false)}
								disabled={isDeleting}
								className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={handleDeletePost}
								disabled={isDeleting}
								className="rounded-lg bg-red-600 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
							>
								{isDeleting ? "Deleting..." : "Delete"}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Portfolio Information - Shown only for portfolio posts */}
			{isPortfolio && portfolio && (
				<div className="border-purple-100 border-t bg-gradient-to-b from-purple-50/50 to-transparent px-3 py-4 sm:px-4">
					{/* Work Title */}
					<h3 className="mb-3 font-bold text-gray-900 text-lg sm:text-xl">
						{portfolio.projectTitle}
					</h3>

					{/* Key Details Grid */}
					<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
						{/* Work Type */}
						{portfolio.projectType && (
							<div className="flex items-start gap-2">
								<Briefcase className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600" />
								<div className="min-w-0">
									<p className="text-gray-600 text-xs">Type</p>
									<p className="truncate font-medium text-gray-900 text-sm">
										{portfolio.projectType}
									</p>
								</div>
							</div>
						)}

						{/* Role */}
						<div className="flex items-start gap-2">
							<Users className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600" />
							<div className="min-w-0">
								<p className="text-gray-600 text-xs">Role</p>
								<p className="truncate font-medium text-gray-900 text-sm">
									{portfolio.userRole}
								</p>
							</div>
						</div>

						{/* Duration */}
						{(portfolio.duration ||
							(portfolio.startDate && portfolio.endDate)) && (
							<div className="flex items-start gap-2">
								<Calendar className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600" />
								<div className="min-w-0">
									<p className="text-gray-600 text-xs">Duration</p>
									<p className="font-medium text-gray-900 text-sm">
										{portfolio.duration ||
											`${
												// biome-ignore lint/style/noNonNullAssertion: <explanation>
												new Date(portfolio.startDate!).toLocaleDateString(
													"en-US",
													{ month: "short", year: "numeric" },
												)
											} - ${
												// biome-ignore lint/style/noNonNullAssertion: <explanation>
												new Date(portfolio.endDate!).toLocaleDateString(
													"en-US",
													{ month: "short", year: "numeric" },
												)
											}`}
									</p>
								</div>
							</div>
						)}

						{/* Team Collaboration */}
						{portfolio.isTeamProject && portfolio.teamSize && (
							<div className="flex items-start gap-2">
								<Users className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600" />
								<div className="min-w-0">
									<p className="text-gray-600 text-xs">Team</p>
									<p className="font-medium text-gray-900 text-sm">
										{portfolio.teamSize}{" "}
										{portfolio.teamSize > 1 ? "people" : "person"}
									</p>
								</div>
							</div>
						)}
					</div>

					{/* Software/Tools - Top 3 only for card view */}
					{portfolio.technologies && portfolio.technologies.length > 0 && (
						<div className="mt-3 flex flex-wrap gap-1.5">
							{portfolio.technologies.slice(0, 3).map((tech) => (
								<span
									key={tech}
									className="rounded-full bg-purple-100 px-2.5 py-1 font-medium text-purple-700 text-xs"
								>
									{tech}
								</span>
							))}
							{portfolio.technologies.length > 3 && (
								<span className="rounded-full bg-purple-100 px-2.5 py-1 font-medium text-purple-700 text-xs">
									+{portfolio.technologies.length - 3}
								</span>
							)}
						</div>
					)}

					{/* View Links */}
					{(portfolio.liveUrl || portfolio.repositoryUrl) && (
						<div className="mt-3 flex flex-wrap gap-2">
							{portfolio.liveUrl && (
								<a
									href={portfolio.liveUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 font-medium text-sm text-white transition-colors hover:bg-purple-700"
								>
									<ExternalLink className="h-3.5 w-3.5" />
									View Work
								</a>
							)}
							{portfolio.repositoryUrl && (
								<a
									href={portfolio.repositoryUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-white px-3 py-1.5 font-medium text-purple-700 text-sm transition-colors hover:bg-purple-50"
								>
									<ExternalLink className="h-3.5 w-3.5" />
									More Info
								</a>
							)}
						</div>
					)}
				</div>
			)}

			{/* Post Content */}
			{post.content && (
				<div className="px-3 pb-3 sm:px-4">
					<p className="whitespace-pre-wrap text-gray-800">{post.content}</p>
				</div>
			)}

			{/* Post Media (Images, Videos, etc.) */}
			{post.media.length > 0 && (
				<div ref={mediaRef} className="relative">
					<PostMediaRenderer
						media={post.media}
						isVisible={isMediaVisible}
						carouselRef={carouselRef}
						onImageClick={handleImageClick}
					/>
				</div>
			)}

			{/* Image Modal */}
			<ImageModal
				images={images}
				initialIndex={selectedImageIndex}
				isOpen={showImageModal}
				onClose={() => setShowImageModal(false)}
			/>

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
			<div className="border-gray-200 border-t border-b px-3 py-2 sm:px-4">
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
				<span className="xs:inline hidden">{label}</span>
			</Link>
		);
	}

	return (
		<button
			type="button"
			className="flex flex-1 items-center justify-center gap-1 rounded-lg px-2 py-2 font-medium text-gray-600 text-xs transition-colors hover:bg-gray-50 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
		>
			{icon}
			<span className="xs:inline hidden">{label}</span>
		</button>
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
