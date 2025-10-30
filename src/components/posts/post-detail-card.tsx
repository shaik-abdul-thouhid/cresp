"use client";

import { ExternalLink, Flag, Globe, MoreVertical, Trash2 } from "lucide-react";
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

interface PostDetailCardProps {
	post: PostWithRelations;
	isLoggedIn: boolean;
	currentUserId?: string | null;
	onDelete?: (postId: string) => void;
}

function useLazyLoad() {
	const [isVisible, setIsVisible] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) {
					setIsVisible(true);
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

export function PostDetailCard({
	post,
	isLoggedIn,
	currentUserId,
	onDelete,
}: PostDetailCardProps) {
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

	const images = post.media
		.filter((m) => m.mediaType === "IMAGE")
		.map((m) => ({ id: m.id, url: m.url }));

	const handleImageClick = (index: number) => {
		setSelectedImageIndex(index);
		setShowImageModal(true);
	};

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
		<article className="rounded-xl border border-gray-200 bg-white shadow-sm">
			{/* Post Header */}
			<div className="flex items-start gap-3 p-4 sm:p-6">
				<Link href={`/user/${post.user.id}`} className="flex-shrink-0">
					<div ref={avatarRef} className="h-14 w-14">
						{isAvatarVisible ? (
							post.user.image ? (
								<div className="relative h-14 w-14 overflow-hidden rounded-full">
									<Image
										src={post.user.image}
										alt={authorName}
										fill
										className="object-cover"
										loading="lazy"
										sizes="56px"
									/>
								</div>
							) : (
								<div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-indigo-600">
									<span className="font-bold text-white text-xl">
										{authorName.charAt(0).toUpperCase()}
									</span>
								</div>
							)
						) : (
							<div className="h-14 w-14 animate-pulse rounded-full bg-gray-200" />
						)}
					</div>
				</Link>

				<div className="min-w-0 flex-1">
					<Link
						href={`/user/${post.user.id}`}
						className="font-semibold text-gray-900 text-lg hover:text-purple-600"
					>
						{authorName}
					</Link>
					{primaryRole && (
						<p className="text-gray-600 text-sm">
							{primaryRole.icon} {primaryRole.name}
						</p>
					)}
					<p className="text-gray-500 text-sm">{timeAgo}</p>
				</div>

				<div className="flex items-center gap-2">
					{isPortfolio && (
						<span className="rounded-full bg-purple-100 px-3 py-1.5 font-medium text-purple-700 text-sm">
							Portfolio
						</span>
					)}

					<div className="relative" ref={menuRef}>
						<button
							type="button"
							onClick={() => setShowMenu(!showMenu)}
							className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
							aria-label="Post options"
						>
							<MoreVertical className="h-5 w-5" />
						</button>

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

			<ReportPostModal
				postId={post.id}
				isOpen={showReportModal}
				onClose={() => setShowReportModal(false)}
			/>

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

			{/* Portfolio Details - Full View */}
			{isPortfolio && portfolio && (
				<div className="border-t px-4 py-8 sm:px-8">
					{/* Hero Section */}
					<div className="mb-8">
						<div className="mb-3 flex items-center gap-3">
							<span
								className={`font-medium text-xs uppercase tracking-wide ${
									portfolio.projectStatus === "COMPLETED"
										? "text-green-600"
										: portfolio.projectStatus === "ONGOING"
											? "text-blue-600"
											: "text-orange-600"
								}`}
							>
								{portfolio.projectStatus === "COMPLETED"
									? "Completed"
									: portfolio.projectStatus === "ONGOING"
										? "Work in Progress"
										: "Concept"}
							</span>
							{portfolio.projectType && (
								<>
									<span className="text-gray-300">•</span>
									<span className="text-gray-600 text-xs uppercase tracking-wide">
										{portfolio.projectType}
									</span>
								</>
							)}
						</div>
						<h2 className="font-bold text-3xl text-gray-900 leading-tight sm:text-4xl">
							{portfolio.projectTitle}
						</h2>
					</div>

					{/* Metadata Bar */}
					<div className="mb-8 flex flex-wrap gap-x-6 gap-y-3 border-gray-200 border-b pb-6 text-sm">
						<div>
							<span className="text-gray-500">Role</span>
							<p className="font-medium text-gray-900">{portfolio.userRole}</p>
						</div>

						{(portfolio.duration ||
							(portfolio.startDate && portfolio.endDate)) && (
							<div>
								<span className="text-gray-500">Timeline</span>
								<p className="font-medium text-gray-900">
									{portfolio.duration ||
										(portfolio.startDate && portfolio.endDate
											? `${new Date(portfolio.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })} - ${new Date(portfolio.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`
											: "N/A")}
								</p>
							</div>
						)}

						{portfolio.isTeamProject && portfolio.teamSize && (
							<div>
								<span className="text-gray-500">Team</span>
								<p className="font-medium text-gray-900">
									{portfolio.teamSize}{" "}
									{portfolio.teamSize > 1 ? "people" : "person"}
								</p>
							</div>
						)}
					</div>

					{/* Production Credits Section */}
					{((portfolio.technologies && portfolio.technologies.length > 0) ||
						(portfolio.tools && portfolio.tools.length > 0) ||
						(portfolio.skills && portfolio.skills.length > 0) ||
						(portfolio.responsibilities &&
							portfolio.responsibilities.length > 0)) && (
						<div className="mb-8 grid gap-6 border-gray-200 border-b pb-8 sm:grid-cols-2">
							{portfolio.technologies && portfolio.technologies.length > 0 && (
								<div>
									<h4 className="mb-2 font-semibold text-gray-900 text-sm uppercase tracking-wide">
										Software
									</h4>
									<p className="text-gray-600 leading-relaxed">
										{portfolio.technologies.join(", ")}
									</p>
								</div>
							)}

							{portfolio.tools && portfolio.tools.length > 0 && (
								<div>
									<h4 className="mb-2 font-semibold text-gray-900 text-sm uppercase tracking-wide">
										Equipment
									</h4>
									<p className="text-gray-600 leading-relaxed">
										{portfolio.tools.join(", ")}
									</p>
								</div>
							)}

							{portfolio.skills && portfolio.skills.length > 0 && (
								<div>
									<h4 className="mb-2 font-semibold text-gray-900 text-sm uppercase tracking-wide">
										Skills
									</h4>
									<p className="text-gray-600 leading-relaxed">
										{portfolio.skills.join(", ")}
									</p>
								</div>
							)}

							{portfolio.responsibilities &&
								portfolio.responsibilities.length > 0 && (
									<div>
										<h4 className="mb-2 font-semibold text-gray-900 text-sm uppercase tracking-wide">
											Responsibilities
										</h4>
										<p className="text-gray-600 leading-relaxed">
											{portfolio.responsibilities.join(", ")}
										</p>
									</div>
								)}
						</div>
					)}

					{/* Story Sections - Magazine Style */}
					{(portfolio.problemStatement ||
						portfolio.solution ||
						portfolio.impact ||
						portfolio.challenges ||
						portfolio.lessonsLearned) && (
						<div className="mb-8 space-y-6">
							{portfolio.problemStatement && (
								<div>
									<h4 className="mb-3 font-bold text-gray-900 text-lg">
										Concept & Inspiration
									</h4>
									<p className="text-base text-gray-700 leading-relaxed">
										{portfolio.problemStatement}
									</p>
								</div>
							)}

							{portfolio.solution && (
								<div>
									<h4 className="mb-3 font-bold text-gray-900 text-lg">
										Creative Process
									</h4>
									<p className="text-base text-gray-700 leading-relaxed">
										{portfolio.solution}
									</p>
								</div>
							)}

							{portfolio.keyContributions && (
								<div className="my-6 border-gray-200 border-l-4 border-l-purple-600 bg-gray-50 py-4 pr-4 pl-6">
									<p className="text-base text-gray-700 italic leading-relaxed">
										{portfolio.keyContributions}
									</p>
								</div>
							)}

							{portfolio.impact && (
								<div>
									<h4 className="mb-3 font-bold text-gray-900 text-lg">
										Reception & Impact
									</h4>
									<p className="text-base text-gray-700 leading-relaxed">
										{portfolio.impact}
									</p>
								</div>
							)}

							{portfolio.challenges && (
								<div>
									<h4 className="mb-3 font-bold text-gray-900 text-lg">
										Creative Challenges
									</h4>
									<p className="text-base text-gray-700 leading-relaxed">
										{portfolio.challenges}
									</p>
								</div>
							)}

							{portfolio.lessonsLearned && (
								<div>
									<h4 className="mb-3 font-bold text-gray-900 text-lg">
										Key Learnings
									</h4>
									<p className="text-base text-gray-700 leading-relaxed">
										{portfolio.lessonsLearned}
									</p>
								</div>
							)}
						</div>
					)}

					{/* Action Links */}
					{(portfolio.liveUrl ||
						portfolio.repositoryUrl ||
						portfolio.caseStudyUrl) && (
						<div className="border-gray-200 border-t pt-6">
							<div className="flex flex-wrap gap-3">
								{portfolio.liveUrl && (
									<a
										href={portfolio.liveUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-2 rounded-lg bg-black px-6 py-3 font-medium text-white transition-colors hover:bg-gray-800"
									>
										<Globe className="h-4 w-4" />
										View Work
									</a>
								)}
								{portfolio.repositoryUrl && (
									<a
										href={portfolio.repositoryUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50"
									>
										<ExternalLink className="h-4 w-4" />
										More Info
									</a>
								)}
								{portfolio.caseStudyUrl && (
									<a
										href={portfolio.caseStudyUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50"
									>
										<ExternalLink className="h-4 w-4" />
										Behind the Scenes
									</a>
								)}
							</div>
						</div>
					)}
				</div>
			)}

			{/* Post Content */}
			{post.content && (
				<div className="px-4 pb-4 sm:px-6">
					<p className="whitespace-pre-wrap text-base text-gray-800 leading-relaxed">
						{post.content}
					</p>
				</div>
			)}

			{/* Post Media */}
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

			<ImageModal
				images={images}
				initialIndex={selectedImageIndex}
				isOpen={showImageModal}
				onClose={() => setShowImageModal(false)}
			/>

			{/* Hashtags */}
			{post.hashtags.length > 0 && (
				<div className="flex flex-wrap gap-2 px-4 pb-4 sm:px-6">
					{post.hashtags.map((ph) => (
						<Link
							key={ph.hashtag.id}
							href={`/hashtag/${ph.hashtag.name}`}
							className="text-purple-600 text-sm hover:underline"
						>
							#{ph.hashtag.name}
						</Link>
					))}
				</div>
			)}

			{/* Engagement Stats */}
			<div className="border-gray-200 border-t border-b px-4 py-3 sm:px-6">
				<div className="flex items-center justify-between text-gray-600 text-sm">
					<span>{post._count.likes} likes</span>
					<div className="flex gap-4">
						<span>{post._count.comments} comments</span>
						<span>{post.shareCount} shares</span>
					</div>
				</div>
			</div>

			{/* Action Buttons */}
			<div className="flex items-center justify-around p-2">
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
								className="h-5 w-5"
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
				className="flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium text-gray-600 transition-colors hover:bg-gray-50"
			>
				{icon}
				<span>{label}</span>
			</Link>
		);
	}

	return (
		<button
			type="button"
			className="flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium text-gray-600 transition-colors hover:bg-gray-50"
		>
			{icon}
			<span>{label}</span>
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
