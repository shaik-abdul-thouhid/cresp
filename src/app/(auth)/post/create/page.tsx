"use client";

import type { User } from "@prisma/client";
import {
	AlertCircle,
	ArrowLeft,
	Briefcase,
	Eye,
	FileText,
	FileUp,
	Hash,
	Image as ImageIcon,
	Loader2,
	Plus,
	Sparkles,
	Video,
	X,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ErrorToast, SuccessToast } from "~/components/ui/custom-toasts";
import { useFeedbackPrompt } from "~/hooks/use-feedback-prompt";
import {
	EssentialInfoSection,
	ProjectLinksSection,
	ProjectStorySection,
	TeamCollaborationSection,
	TechnicalDetailsSection,
	TimelineSection,
} from "./_form_sections";

export default function CreatePostPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { checkAndShowFeedback, FeedbackPrompt } = useFeedbackPrompt();
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Initialize postType based on 'tab' or 'type' query parameter
	const initialPostType = (() => {
		const tabParam = searchParams.get("tab");
		const typeParam = searchParams.get("type");

		// Support both 'tab' and 'type' query parameters
		const param = tabParam || typeParam;

		if (param?.toLowerCase() === "portfolio") {
			return "PORTFOLIO";
		}
		return "CASUAL";
	})();

	const [postType, setPostType] = useState<"CASUAL" | "PORTFOLIO">(
		initialPostType,
	);
	const [content, setContent] = useState("");
	const [isAiGenerated, setIsAiGenerated] = useState(false);
	const [visibility, setVisibility] = useState<
		"PUBLIC" | "CONNECTIONS_ONLY" | "PRIVATE"
	>("PUBLIC");
	const [hashtags, setHashtags] = useState<string[]>([]);
	const [hashtagInput, setHashtagInput] = useState("");
	const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
	const [images, setImages] = useState<
		Array<{ id: string; file: File; preview: string }>
	>([]);
	const [documents, setDocuments] = useState<
		Array<{
			id: string;
			file: File;
			name: string;
			type: string;
			preview?: string;
		}>
	>([]);
	const [videos, setVideos] = useState<
		Array<{
			id: string;
			provider: string;
			url: string;
			name: string;
			videoId: string;
			thumbnail?: string;
			embedUrl?: string;
			duration?: number;
		}>
	>([]);
	const [videoUrl, setVideoUrl] = useState("");
	const [showVideoInput, setShowVideoInput] = useState(false);

	const [currentUser, setCurrentUser] = useState<User | null>(null);

	const [audios, setAudios] = useState<
		Array<{
			id: string;
			provider: string;
			url: string;
			name: string;
			audioId: string;
			thumbnail?: string;
			embedUrl?: string;
			duration?: number;
		}>
	>([]);
	const [audioUrl, setAudioUrl] = useState("");
	const [showAudioInput, setShowAudioInput] = useState(false);

	// User's professional roles
	const [userRoles, setUserRoles] = useState<
		Array<{
			id: string;
			name: string;
			icon: string | null;
			key: string;
			isPrimary: boolean;
		}>
	>([]);
	const [isLoadingRoles, setIsLoadingRoles] = useState(true);

	// Portfolio-specific fields
	const [projectTitle, setProjectTitle] = useState("");
	const [projectType, setProjectType] = useState("");
	const [userRole, setUserRole] = useState("");
	const [projectStatus, setProjectStatus] = useState<
		"COMPLETED" | "ONGOING" | "CONCEPT"
	>("COMPLETED");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [duration, setDuration] = useState("");
	const [isTeamProject, setIsTeamProject] = useState(false);
	const [teamSize, setTeamSize] = useState("");
	const [responsibilities, setResponsibilities] = useState<string[]>([]);
	const [keyContributions, setKeyContributions] = useState("");
	const [technologies, setTechnologies] = useState<string[]>([]);
	const [tools, setTools] = useState<string[]>([]);
	const [skills, setSkills] = useState<string[]>([]);
	const [liveUrl, setLiveUrl] = useState("");
	const [repositoryUrl, setRepositoryUrl] = useState("");
	const [caseStudyUrl, setCaseStudyUrl] = useState("");
	const [problemStatement, setProblemStatement] = useState("");
	const [solution, setSolution] = useState("");
	const [impact, setImpact] = useState("");
	const [challenges, setChallenges] = useState("");
	const [lessonsLearned, setLessonsLearned] = useState("");

	// Fetch user's professional roles and user data
	useEffect(() => {
		async function fetchRoles() {
			try {
				setIsLoadingRoles(true);
				const response = await fetch("/api/user/professional-roles");
				const data = await response.json();

				if (response.ok && data.roles) {
					setUserRoles(data.roles);
				} else {
					console.error("Failed to fetch roles:", data.error);
				}
			} catch (error) {
				console.error("Error fetching roles:", error);
			} finally {
				setIsLoadingRoles(false);
			}
		}

		async function fetchUser() {
			try {
				const response = await fetch("/api/user/me");
				const data = await response.json();

				if (response.ok) {
					setCurrentUser(data);
				} else {
					console.error("Failed to fetch user:", data.error);
				}
			} catch (error) {
				console.error("Error fetching user:", error);
			}
		}

		fetchRoles();
		fetchUser();
	}, []);

	const handleHashtagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" || e.key === ",") {
			e.preventDefault();
			const tag = hashtagInput.trim().replace(/^#/, "");
			if (tag && !hashtags.includes(tag)) {
				setHashtags([...hashtags, tag]);
				setHashtagInput("");
			}
		}
	};

	const handleHashtagRemove = (tag: string) => {
		setHashtags(hashtags.filter((t) => t !== tag));
	};

	const handleRoleToggle = (roleId: string) => {
		setSelectedRoles((prev) =>
			prev.includes(roleId)
				? prev.filter((id) => id !== roleId)
				: [...prev, roleId],
		);
	};

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files) return;

		const newImages = Array.from(files).map((file) => ({
			id: `${Date.now()}-${Math.random()}`,
			file,
			preview: URL.createObjectURL(file),
		}));

		setImages([...images, ...newImages]);
		e.target.value = ""; // Reset input
	};

	const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files) return;

		const newDocs = Array.from(files).map((file) => {
			const doc: {
				id: string;
				file: File;
				name: string;
				type: string;
				preview?: string;
			} = {
				id: `${Date.now()}-${Math.random()}`,
				file,
				name: file.name,
				type: file.type,
			};

			// Generate preview for text files
			if (file.type === "text/plain") {
				const reader = new FileReader();
				reader.onload = (event) => {
					const text = event.target?.result as string;
					setDocuments((prev) =>
						prev.map((d) =>
							d.id === doc.id ? { ...d, preview: text.substring(0, 500) } : d,
						),
					);
				};
				reader.readAsText(file);
			}

			return doc;
		});

		setDocuments([...documents, ...newDocs]);
		e.target.value = ""; // Reset input
	};

	const handleRemoveImage = (id: string) => {
		const image = images.find((img) => img.id === id);
		if (image) {
			URL.revokeObjectURL(image.preview); // Clean up memory
		}
		setImages(images.filter((img) => img.id !== id));
	};

	const handleRemoveDocument = (id: string) => {
		setDocuments(documents.filter((doc) => doc.id !== id));
	};

	const handleRemoveVideo = (id: string) => {
		setVideos(videos.filter((vid) => vid.id !== id));
	};

	const handleRemoveAudio = (id: string) => {
		setAudios(audios.filter((aud) => aud.id !== id));
	};

	const handleVideoUrlAdd = async () => {
		if (!videoUrl.trim()) return;

		// Extract video info from URL
		const videoInfo = await parseVideoUrl(videoUrl);
		if (videoInfo) {
			setVideos([
				...videos,
				{
					id: Date.now().toString(),
					provider: videoInfo.provider,
					url: videoUrl,
					name: videoInfo.name,
					videoId: videoInfo.videoId,
					thumbnail: videoInfo.thumbnail,
					embedUrl: videoInfo.embedUrl,
				},
			]);
			setVideoUrl("");
			setShowVideoInput(false);
		} else {
			toast.custom(
				() => (
					<ErrorToast
						title="Invalid Video URL"
						message="Please enter a valid URL from YouTube, Vimeo, TikTok, or Dailymotion"
					/>
				),
				{ duration: 5000 },
			);
		}
	};

	// Parse video URL to extract provider, ID, and get thumbnail
	const parseVideoUrl = async (
		url: string,
	): Promise<{
		provider: string;
		videoId: string;
		name: string;
		thumbnail?: string;
		embedUrl?: string;
	} | null> => {
		try {
			// YouTube
			const youtubeRegex =
				/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
			const youtubeMatch = url.match(youtubeRegex);
			if (youtubeMatch?.[1]) {
				const videoId = youtubeMatch[1];
				return {
					provider: "youtube",
					videoId,
					name: "YouTube Video",
					thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
					embedUrl: `https://www.youtube.com/embed/${videoId}`,
				};
			}

			// Vimeo
			const vimeoRegex = /vimeo\.com\/(?:video\/)?(\d+)/;
			const vimeoMatch = url.match(vimeoRegex);
			if (vimeoMatch?.[1]) {
				const videoId = vimeoMatch[1];
				// Fetch thumbnail from Vimeo API
				try {
					const response = await fetch(
						`https://vimeo.com/api/v2/video/${videoId}.json`,
					);
					const data = await response.json();
					return {
						provider: "vimeo",
						videoId,
						name: "Vimeo Video",
						thumbnail: data[0]?.thumbnail_large,
						embedUrl: `https://player.vimeo.com/video/${videoId}`,
					};
				} catch {
					return {
						provider: "vimeo",
						videoId,
						name: "Vimeo Video",
						embedUrl: `https://player.vimeo.com/video/${videoId}`,
					};
				}
			}

			// TikTok
			const tiktokRegex = /tiktok\.com\/@[\w.-]+\/video\/(\d+)/;
			const tiktokMatch = url.match(tiktokRegex);
			if (tiktokMatch?.[1]) {
				const videoId = tiktokMatch[1];
				// Try to fetch oEmbed data for thumbnail
				try {
					const response = await fetch(
						`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
					);
					const data = await response.json();
					return {
						provider: "tiktok",
						videoId,
						name: "TikTok Video",
						thumbnail: data.thumbnail_url,
						embedUrl: url,
					};
				} catch {
					return {
						provider: "tiktok",
						videoId,
						name: "TikTok Video",
						embedUrl: url,
					};
				}
			}

			// Dailymotion
			const dailymotionRegex = /dailymotion\.com\/video\/([a-zA-Z0-9]+)/;
			const dailymotionMatch = url.match(dailymotionRegex);
			if (dailymotionMatch?.[1]) {
				const videoId = dailymotionMatch[1];
				return {
					provider: "dailymotion",
					videoId,
					name: "Dailymotion Video",
					thumbnail: `https://www.dailymotion.com/thumbnail/video/${videoId}`,
					embedUrl: `https://www.dailymotion.com/embed/video/${videoId}`,
				};
			}

			return null;
		} catch (error) {
			console.error("Error parsing video URL:", error);
			return null;
		}
	};

	const handleAudioUrlAdd = async () => {
		if (!audioUrl.trim()) return;

		// Extract audio info from URL
		const audioInfo = await parseAudioUrl(audioUrl);
		if (audioInfo) {
			setAudios([
				...audios,
				{
					id: Date.now().toString(),
					provider: audioInfo.provider,
					url: audioUrl,
					name: audioInfo.name,
					audioId: audioInfo.audioId,
					thumbnail: audioInfo.thumbnail,
					embedUrl: audioInfo.embedUrl,
					duration: audioInfo.duration,
				},
			]);
			setAudioUrl("");
			setShowAudioInput(false);
		} else {
			toast.custom(
				() => (
					<ErrorToast
						title="Invalid Audio URL"
						message="Please enter a valid URL from SoundCloud, Spotify, Bandcamp, or Apple Music"
					/>
				),
				{ duration: 5000 },
			);
		}
	};

	// Parse audio URL to extract provider, ID, and get metadata
	const parseAudioUrl = async (
		url: string,
	): Promise<{
		provider: string;
		audioId: string;
		name: string;
		thumbnail?: string;
		embedUrl?: string;
		duration?: number;
	} | null> => {
		try {
			// SoundCloud
			const soundcloudRegex = /soundcloud\.com\/([\w-]+)\/([\w-]+)/;
			const soundcloudMatch = url.match(soundcloudRegex);
			if (soundcloudMatch) {
				try {
					const response = await fetch(
						`https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(url)}`,
					);
					const data = await response.json();
					return {
						provider: "soundcloud",
						audioId: url,
						name: data.title || "SoundCloud Track",
						thumbnail: data.thumbnail_url,
						embedUrl: url,
						duration: data.duration
							? Math.floor(data.duration / 1000)
							: undefined,
					};
				} catch {
					return {
						provider: "soundcloud",
						audioId: url,
						name: "SoundCloud Track",
						embedUrl: url,
					};
				}
			}

			// Spotify
			const spotifyRegex = /spotify\.com\/track\/([a-zA-Z0-9]+)/;
			const spotifyMatch = url.match(spotifyRegex);
			if (spotifyMatch?.[1]) {
				const audioId = spotifyMatch[1];
				return {
					provider: "spotify",
					audioId,
					name: "Spotify Track",
					embedUrl: `https://open.spotify.com/embed/track/${audioId}`,
				};
			}

			// Bandcamp
			const bandcampRegex = /bandcamp\.com\/track\/([\w-]+)/;
			const bandcampMatch = url.match(bandcampRegex);
			if (bandcampMatch?.[1]) {
				const audioId = bandcampMatch[1];
				return {
					provider: "bandcamp",
					audioId,
					name: "Bandcamp Track",
					embedUrl: url,
				};
			}

			// Apple Music
			const appleMusicRegex =
				/music\.apple\.com\/[a-z]{2}\/album\/.+\/(\d+)\?i=(\d+)/;
			const appleMusicMatch = url.match(appleMusicRegex);
			if (appleMusicMatch?.[2]) {
				const audioId = appleMusicMatch[2];
				return {
					provider: "apple-music",
					audioId,
					name: "Apple Music Track",
					embedUrl: url,
				};
			}

			return null;
		} catch (error) {
			console.error("Error parsing audio URL:", error);
			return null;
		}
	};

	// Helper function to upload a single file (local storage)
	const uploadFile = async (file: File, mediaType: "image" | "document") => {
		const formData = new FormData();
		formData.append("file", file);
		formData.append("mediaType", mediaType);

		const response = await fetch("/api/media/upload-local", {
			method: "POST",
			credentials: "include", // Ensure cookies are sent
			body: formData,
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || "Upload failed");
		}

		const data = await response.json();
		return data.file;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (isSubmitting) return;

		// Validate content
		const hasContent = content.trim().length > 0;
		const hasMedia =
			images.length > 0 ||
			videos.length > 0 ||
			audios.length > 0 ||
			documents.length > 0;

		if (!hasContent && !hasMedia) {
			toast.custom(
				() => (
					<ErrorToast
						title="Empty Post"
						message="Please add some content or media to your post"
					/>
				),
				{ duration: 5000 },
			);
			return;
		}

		// Validate portfolio requirements
		if (postType === "PORTFOLIO") {
			if (selectedRoles.length === 0) {
				toast.custom(
					() => (
						<ErrorToast
							title="Roles Required"
							message="Please select at least one professional role for portfolio posts"
						/>
					),
					{ duration: 5000 },
				);
				return;
			}
			if (!projectTitle.trim()) {
				toast.custom(
					() => (
						<ErrorToast
							title="Work Title Required"
							message="Please enter a title for your work"
						/>
					),
					{ duration: 5000 },
				);
				return;
			}
			if (!userRole.trim()) {
				toast.custom(
					() => (
						<ErrorToast
							title="Your Role Required"
							message="Please specify your role in creating this work"
						/>
					),
					{ duration: 5000 },
				);
				return;
			}
		}

		setIsSubmitting(true);

		try {
			// Step 1: Upload all files first
			const uploadedImages = [];
			const uploadedDocuments = [];

			// Upload images
			for (const img of images) {
				try {
					const uploaded = await uploadFile(img.file, "image");
					uploadedImages.push(uploaded);
				} catch (error) {
					console.error("Error uploading image:", error);
					throw new Error(`Failed to upload image: ${img.file.name}`);
				}
			}

			// Upload documents
			for (const doc of documents) {
				try {
					const uploaded = await uploadFile(doc.file, "document");
					uploadedDocuments.push(uploaded);
				} catch (error) {
					console.error("Error uploading document:", error);
					throw new Error(`Failed to upload document: ${doc.file.name}`);
				}
			}

			// Step 2: Create post with all metadata
			const postData = {
				postType,
				content: content.trim() || undefined,
				isAiGenerated,
				professionalRoleIds:
					postType === "PORTFOLIO" ? selectedRoles : undefined,
				hashtags: hashtags.length > 0 ? hashtags : undefined,
				images: uploadedImages.length > 0 ? uploadedImages : undefined,
				documents: uploadedDocuments.length > 0 ? uploadedDocuments : undefined,
				videos: videos.length > 0 ? videos : undefined,
				audios: audios.length > 0 ? audios : undefined,
				// Portfolio-specific data
				...(postType === "PORTFOLIO" && {
					portfolio: {
						projectTitle: projectTitle.trim(),
						projectType: projectType.trim() || undefined,
						projectStatus,
						userRole: userRole.trim(),
						startDate: startDate
							? new Date(startDate).toISOString()
							: undefined,
						endDate: endDate ? new Date(endDate).toISOString() : undefined,
						duration: duration.trim() || undefined,
						isTeamProject,
						teamSize:
							isTeamProject && teamSize ? Number.parseInt(teamSize) : undefined,
						responsibilities:
							responsibilities.length > 0 ? responsibilities : undefined,
						keyContributions: keyContributions.trim() || undefined,
						technologies: technologies.length > 0 ? technologies : undefined,
						tools: tools.length > 0 ? tools : undefined,
						skills: skills.length > 0 ? skills : undefined,
						liveUrl: liveUrl.trim() || undefined,
						repositoryUrl: repositoryUrl.trim() || undefined,
						caseStudyUrl: caseStudyUrl.trim() || undefined,
						problemStatement: problemStatement.trim() || undefined,
						solution: solution.trim() || undefined,
						impact: impact.trim() || undefined,
						challenges: challenges.trim() || undefined,
						lessonsLearned: lessonsLearned.trim() || undefined,
					},
				}),
			};

			const response = await fetch("/api/posts/create", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include", // Ensure cookies are sent
				body: JSON.stringify(postData),
			});

			const data = await response.json();

			if (!response.ok) {
				// Handle 401 specifically
				if (response.status === 401) {
					toast.custom(
						() => (
							<ErrorToast
								title="Session Expired"
								message="Please log in again to continue"
							/>
						),
						{ duration: 5000 },
					);
					// Redirect to login after a short delay
					setTimeout(() => {
						window.location.href = `/login?returnUrl=${encodeURIComponent(window.location.pathname)}`;
					}, 1500);
					return;
				}

				throw new Error(data.error || "Failed to create post");
			}

			// Success!
			toast.custom(() => (
				<SuccessToast
					title="Post Created"
					message="Your post has been published successfully"
				/>
			));

			// Check if we should show feedback prompt (async, doesn't block redirect)
			const isFirstPost =
				postType === "PORTFOLIO"
					? data.isFirstPortfolioPost
					: data.isFirstCasualPost;

			if (isFirstPost) {
				// Show feedback after a short delay
				setTimeout(() => {
					checkAndShowFeedback({
						trigger:
							postType === "PORTFOLIO"
								? "first_portfolio_post"
								: "first_casual_post",
						feedbackType: "first_post",
						title: `🎉 ${postType === "PORTFOLIO" ? "Portfolio" : "First"} Post Created!`,
						question: "How was your posting experience?",
					});
				}, 2000); // 2 seconds after success toast
			}

			// Redirect to feed with highlight
			setTimeout(() => {
				router.push(`/feed?highlight=${data.postId}`);
			}, 1500);
		} catch (error) {
			console.error("Error creating post:", error);
			toast.custom(
				() => (
					<ErrorToast
						title="Failed to Create Post"
						message={
							error instanceof Error ? error.message : "Please try again"
						}
					/>
				),
				{ duration: 5000 },
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const contentLength = content.length;

	return (
		<div className="mx-auto max-w-3xl px-4 py-6">
			{/* Header */}
			<div className="mb-6 flex items-center gap-4">
				<Link
					href="/feed"
					className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
				>
					<ArrowLeft className="h-5 w-5 text-gray-600" />
				</Link>
				<h1 className="font-bold text-2xl text-gray-900">Create Post</h1>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Post Type Selector */}
				<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
					<div className="mb-3 block font-medium text-gray-700 text-sm">
						Post Type
					</div>
					<div className="grid grid-cols-2 gap-3">
						<button
							type="button"
							onClick={() => setPostType("CASUAL")}
							className={`flex items-center gap-3 rounded-lg border-2 p-4 transition-all ${
								postType === "CASUAL"
									? "border-purple-500 bg-purple-50"
									: "border-gray-200 hover:border-gray-300"
							}`}
						>
							<FileText
								className={`h-5 w-5 ${
									postType === "CASUAL" ? "text-purple-600" : "text-gray-400"
								}`}
							/>
							<div className="text-left">
								<div
									className={`font-medium ${
										postType === "CASUAL" ? "text-purple-900" : "text-gray-900"
									}`}
								>
									Casual
								</div>
								<div className="text-gray-500 text-xs">
									Quick updates, thoughts
								</div>
							</div>
						</button>

						<button
							type="button"
							onClick={() => setPostType("PORTFOLIO")}
							className={`flex items-center gap-3 rounded-lg border-2 p-4 transition-all ${
								postType === "PORTFOLIO"
									? "border-purple-500 bg-purple-50"
									: "border-gray-200 hover:border-gray-300"
							}`}
						>
							<Briefcase
								className={`h-5 w-5 ${
									postType === "PORTFOLIO" ? "text-purple-600" : "text-gray-400"
								}`}
							/>
							<div className="text-left">
								<div
									className={`font-medium ${
										postType === "PORTFOLIO"
											? "text-purple-900"
											: "text-gray-900"
									}`}
								>
									Portfolio
								</div>
								<div className="text-gray-500 text-xs">Showcase your work</div>
							</div>
						</button>
					</div>
				</div>

				{/* Professional Roles (Portfolio only) - MOVED ABOVE CONTENT */}
				{postType === "PORTFOLIO" && (
					<>
						<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
							<div className="mb-2 block font-medium text-gray-700 text-sm">
								Tag Professional Roles
								<span className="ml-1 text-red-500">*</span>
							</div>
							<p className="mb-3 text-gray-500 text-xs">
								Select which professional roles this work represents
							</p>

							{isLoadingRoles ? (
								<div className="flex items-center justify-center py-4">
									<Loader2 className="h-5 w-5 animate-spin text-gray-400" />
									<span className="ml-2 text-gray-500 text-sm">
										Loading roles...
									</span>
								</div>
							) : userRoles.length === 0 ? (
								<div className="rounded-lg border border-red-200 bg-red-50 p-4">
									<div className="flex items-start gap-3">
										<AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
										<div className="flex-1">
											<p className="font-medium text-red-800 text-sm">
												No Professional Roles Selected
											</p>
											<p className="mt-1 text-red-700 text-xs">
												You need at least one professional role to create a
												portfolio post. Please add your roles first.
											</p>
											<Link
												href={`/user/${currentUser?.id}/profession`}
												className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-red-700"
											>
												<Plus className="h-4 w-4" />
												<span>Add Professional Role</span>
											</Link>
										</div>
									</div>
								</div>
							) : (
								<div className="space-y-3">
									<div className="flex flex-wrap gap-2">
										{userRoles.map((role) => (
											<button
												key={role.id}
												type="button"
												onClick={() => handleRoleToggle(role.id)}
												className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-all ${
													selectedRoles.includes(role.id)
														? "bg-purple-100 text-purple-700 ring-2 ring-purple-500"
														: "bg-gray-100 text-gray-700 hover:bg-gray-200"
												}`}
											>
												{role.icon && <span>{role.icon}</span>}
												<span>{role.name}</span>
											</button>
										))}

										{userRoles.length < 3 && (
											<Link
												href={`/user/${currentUser?.id}/profession`}
												className="inline-flex items-center gap-1.5 rounded-full border-2 border-purple-300 border-dashed bg-white px-3 py-1.5 text-purple-600 text-sm transition-colors hover:border-purple-400 hover:bg-purple-50"
											>
												<Plus className="h-3.5 w-3.5" />
												<span>Add Role</span>
											</Link>
										)}
									</div>
								</div>
							)}
						</div>

						{/* Portfolio Form Sections */}
						<div className="space-y-6">
							<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
								<EssentialInfoSection
									projectTitle={projectTitle}
									setProjectTitle={setProjectTitle}
									projectType={projectType}
									setProjectType={setProjectType}
									userRole={userRole}
									setUserRole={setUserRole}
									projectStatus={projectStatus}
									setProjectStatus={setProjectStatus}
								/>
							</div>

							<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
								<TimelineSection
									startDate={startDate}
									setStartDate={setStartDate}
									endDate={endDate}
									setEndDate={setEndDate}
									duration={duration}
									setDuration={setDuration}
								/>
							</div>

							<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
								<TeamCollaborationSection
									isTeamProject={isTeamProject}
									setIsTeamProject={setIsTeamProject}
									teamSize={teamSize}
									setTeamSize={setTeamSize}
									responsibilities={responsibilities}
									setResponsibilities={setResponsibilities}
									keyContributions={keyContributions}
									setKeyContributions={setKeyContributions}
								/>
							</div>

							<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
								<TechnicalDetailsSection
									technologies={technologies}
									setTechnologies={setTechnologies}
									tools={tools}
									setTools={setTools}
									skills={skills}
									setSkills={setSkills}
								/>
							</div>

							<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
								<ProjectLinksSection
									liveUrl={liveUrl}
									setLiveUrl={setLiveUrl}
									repositoryUrl={repositoryUrl}
									setRepositoryUrl={setRepositoryUrl}
									caseStudyUrl={caseStudyUrl}
									setCaseStudyUrl={setCaseStudyUrl}
								/>
							</div>

							<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
								<ProjectStorySection
									problemStatement={problemStatement}
									setProblemStatement={setProblemStatement}
									solution={solution}
									setSolution={setSolution}
									impact={impact}
									setImpact={setImpact}
									challenges={challenges}
									setChallenges={setChallenges}
									lessonsLearned={lessonsLearned}
									setLessonsLearned={setLessonsLearned}
								/>
							</div>
						</div>
					</>
				)}

				{/* Content */}
				<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
					<label
						htmlFor="content"
						className="mb-2 block font-medium text-gray-700 text-sm"
					>
						Content
					</label>
					<textarea
						id="content"
						value={content}
						onChange={(e) => setContent(e.target.value)}
						placeholder="What do you want to share?"
						className="w-full resize-none rounded-lg border border-gray-300 p-3 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
						rows={6}
					/>
					<div className="mt-2 flex items-center justify-between">
						<span className="text-gray-500 text-xs">
							{contentLength.toLocaleString()} characters
						</span>
						{postType === "PORTFOLIO" && (
							<span className="text-purple-600 text-xs">
								Portfolio posts earn 5x reputation
							</span>
						)}
					</div>
				</div>

				{/* Media Upload */}
				<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
					<div className="mb-3 block font-medium text-gray-700 text-sm">
						Add Media (Optional)
					</div>

					<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
						<label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-gray-300 border-dashed p-4 transition-colors hover:border-purple-400 hover:bg-purple-50">
							<ImageIcon className="h-6 w-6 text-gray-400" />
							<span className="text-gray-600 text-xs">
								Images ({images.length}/10)
							</span>
							<input
								type="file"
								accept="image/jpeg,image/png,image/webp,image/gif"
								multiple
								onChange={handleImageUpload}
								className="hidden"
								disabled={images.length >= 10}
							/>
						</label>

						<button
							type="button"
							onClick={() => setShowVideoInput(!showVideoInput)}
							className={`flex flex-col items-center gap-2 rounded-lg border-2 border-gray-300 border-dashed p-4 transition-colors ${
								videos.length >= 1
									? "cursor-not-allowed opacity-50"
									: "hover:border-purple-400 hover:bg-purple-50"
							}`}
							disabled={videos.length >= 1}
						>
							<Video className="h-6 w-6 text-gray-400" />
							<span className="text-gray-600 text-xs">
								Video ({videos.length}/1)
							</span>
						</button>

						<button
							type="button"
							onClick={() => setShowAudioInput(!showAudioInput)}
							className={`flex flex-col items-center gap-2 rounded-lg border-2 border-gray-300 border-dashed p-4 transition-colors ${
								audios.length >= 1
									? "cursor-not-allowed opacity-50"
									: "hover:border-purple-400 hover:bg-purple-50"
							}`}
							disabled={audios.length >= 1}
						>
							<svg
								className="h-6 w-6 text-gray-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={2}
							>
								<title>Music note icon</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
								/>
							</svg>
							<span className="text-gray-600 text-xs">
								Audio ({audios.length}/1)
							</span>
						</button>

						<label
							className={`flex flex-col items-center gap-2 rounded-lg border-2 border-gray-300 border-dashed p-4 transition-colors ${
								documents.length >= 1
									? "cursor-not-allowed opacity-50"
									: "cursor-pointer hover:border-purple-400 hover:bg-purple-50"
							}`}
						>
							<FileUp className="h-6 w-6 text-gray-400" />
							<span className="text-gray-600 text-xs">
								Docs ({documents.length}/1)
							</span>
							<input
								type="file"
								accept=".pdf,.docx,.txt"
								onChange={handleDocumentUpload}
								className="hidden"
								disabled={documents.length >= 1}
							/>
						</label>
					</div>

					{/* Video URL Input */}
					{showVideoInput && (
						<div className="mt-4 rounded-lg border border-purple-200 bg-purple-50 p-4">
							<label
								htmlFor="videoUrl"
								className="mb-2 block font-medium text-gray-700 text-sm"
							>
								Paste Video URL
							</label>
							<p className="mb-3 text-gray-600 text-xs">
								Supported: YouTube, Vimeo, TikTok, Dailymotion
							</p>
							<div className="flex gap-2">
								<input
									id="videoUrl"
									type="url"
									value={videoUrl}
									onChange={(e) => setVideoUrl(e.target.value)}
									placeholder="https://www.youtube.com/watch?v=..."
									className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
								/>
								<button
									type="button"
									onClick={handleVideoUrlAdd}
									className="rounded-lg bg-purple-600 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-purple-700"
								>
									Add
								</button>
							</div>
						</div>
					)}

					{/* Audio URL Input */}
					{showAudioInput && (
						<div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
							<label
								htmlFor="audioUrl"
								className="mb-2 block font-medium text-gray-700 text-sm"
							>
								Paste Audio/Music URL
							</label>
							<p className="mb-3 text-gray-600 text-xs">
								Supported: SoundCloud, Spotify, Bandcamp, Apple Music
							</p>
							<div className="flex gap-2">
								<input
									id="audioUrl"
									type="url"
									value={audioUrl}
									onChange={(e) => setAudioUrl(e.target.value)}
									placeholder="https://soundcloud.com/artist/track..."
									className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
								/>
								<button
									type="button"
									onClick={handleAudioUrlAdd}
									className="rounded-lg bg-green-600 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-green-700"
								>
									Add
								</button>
							</div>
						</div>
					)}

					{/* Image Previews */}
					{images.length > 0 && (
						<div className="mt-4">
							<div className="mb-3 flex items-center justify-between">
								<span className="font-medium text-gray-700 text-sm">
									Images ({images.length})
								</span>
								<span className="text-gray-500 text-xs">Hover to remove</span>
							</div>
							<div className="grid grid-cols-4 gap-3">
								{images.map((image) => (
									<div
										key={image.id}
										className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
									>
										<img
											src={image.preview}
											alt={image.file.name}
											className="h-full w-full object-contain transition-transform group-hover:scale-105"
										/>
										<button
											type="button"
											onClick={() => handleRemoveImage(image.id)}
											className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-lg transition-all hover:bg-red-600 group-hover:opacity-100"
											title="Remove image"
										>
											<X className="h-4 w-4" />
										</button>
										{/* Optional: Show file name on hover */}
										<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-2 opacity-0 transition-opacity group-hover:opacity-100">
											<p className="truncate text-white text-xs">
												{image.file.name}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Audio Previews */}
					{audios.length > 0 && (
						<div className="mt-4 space-y-4">
							<span className="block font-medium text-gray-700 text-sm">
								Audio Tracks ({audios.length})
							</span>
							{audios.map((audio) => (
								<div
									key={audio.id}
									className="overflow-hidden rounded-lg border border-gray-200"
								>
									{/* Audio Info Header */}
									<div className="flex items-center justify-between bg-gray-50 p-3">
										<div className="flex items-center gap-2">
											<svg
												className="h-4 w-4 text-green-600"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
												strokeWidth={2}
											>
												<title>Music icon</title>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
												/>
											</svg>
											<span className="text-gray-700 text-sm">
												{audio.name}
											</span>
											<span className="rounded bg-green-100 px-2 py-0.5 text-green-700 text-xs">
												{audio.provider}
											</span>
											{audio.duration && (
												<span className="text-gray-500 text-xs">
													{Math.floor(audio.duration / 60)}:
													{(audio.duration % 60).toString().padStart(2, "0")}
												</span>
											)}
											<a
												href={audio.url}
												target="_blank"
												rel="noopener noreferrer"
												className="text-green-600 text-xs hover:underline"
											>
												Open
											</a>
										</div>
										<button
											type="button"
											onClick={() => handleRemoveAudio(audio.id)}
											className="text-gray-400 hover:text-red-500"
										>
											<X className="h-4 w-4" />
										</button>
									</div>

									{/* Audio Preview */}
									<div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4">
										{audio.thumbnail ? (
											// Show album art with play overlay
											<div className="flex items-center gap-4">
												<div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded border border-gray-200">
													<img
														src={audio.thumbnail}
														alt={audio.name}
														className="h-full w-full object-cover"
													/>
													<div className="absolute inset-0 flex items-center justify-center bg-black/20">
														<div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg">
															<svg
																className="h-5 w-5 text-green-600"
																fill="currentColor"
																viewBox="0 0 24 24"
															>
																<title>Play button</title>
																<path d="M8 5v14l11-7z" />
															</svg>
														</div>
													</div>
												</div>
												<div className="flex-1">
													<p className="font-medium text-gray-900">
														{audio.name}
													</p>
													<p className="text-gray-600 text-sm capitalize">
														{audio.provider}
													</p>
													{audio.duration && (
														<p className="mt-1 text-gray-500 text-xs">
															Duration: {Math.floor(audio.duration / 60)}:
															{(audio.duration % 60)
																.toString()
																.padStart(2, "0")}
														</p>
													)}
												</div>
											</div>
										) : audio.embedUrl ? (
											// Show embed player
											<div className="overflow-hidden rounded border border-gray-200">
												<iframe
													src={audio.embedUrl}
													className="h-32 w-full"
													title={audio.name}
													allow="autoplay; clipboard-write; encrypted-media"
													loading="lazy"
												/>
											</div>
										) : (
											// Fallback - just show icon
											<div className="flex items-center justify-center rounded border border-gray-200 bg-gray-100 py-8">
												<div className="text-center">
													<svg
														className="mx-auto h-12 w-12 text-gray-400"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
														strokeWidth={2}
													>
														<title>Audio file icon</title>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
														/>
													</svg>
													<p className="mt-2 text-gray-500 text-sm">
														Audio preview not available
													</p>
												</div>
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					)}

					{/* Video Previews */}
					{videos.length > 0 && (
						<div className="mt-4 space-y-4">
							<span className="block font-medium text-gray-700 text-sm">
								Videos ({videos.length})
							</span>
							{videos.map((video) => (
								<div
									key={video.id}
									className="overflow-hidden rounded-lg border border-gray-200"
								>
									{/* Video Info Header */}
									<div className="flex items-center justify-between bg-gray-50 p-3">
										<div className="flex items-center gap-2">
											<Video className="h-4 w-4 text-purple-600" />
											<span className="text-gray-700 text-sm">
												{video.name}
											</span>
											<span className="rounded bg-purple-100 px-2 py-0.5 text-purple-700 text-xs">
												{video.provider}
											</span>
											<a
												href={video.url}
												target="_blank"
												rel="noopener noreferrer"
												className="text-purple-600 text-xs hover:underline"
											>
												Open
											</a>
										</div>
										<button
											type="button"
											onClick={() => handleRemoveVideo(video.id)}
											className="text-gray-400 hover:text-red-500"
										>
											<X className="h-4 w-4" />
										</button>
									</div>

									{/* Video Preview/Thumbnail */}
									<div className="bg-gray-50 p-4">
										{video.thumbnail ? (
											// Show thumbnail if available
											<div className="relative aspect-video overflow-hidden rounded border border-gray-200">
												<img
													src={video.thumbnail}
													alt={video.name}
													className="h-full w-full object-cover"
												/>
												<div className="absolute inset-0 flex items-center justify-center bg-black/20">
													<div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg">
														<Video className="h-8 w-8 text-purple-600" />
													</div>
												</div>
											</div>
										) : video.embedUrl ? (
											// Show embed preview if no thumbnail
											<div className="aspect-video overflow-hidden rounded border border-gray-200">
												<iframe
													src={video.embedUrl}
													className="h-full w-full"
													title={video.name}
													allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
													allowFullScreen
												/>
											</div>
										) : (
											// Fallback - just show icon
											<div className="flex aspect-video items-center justify-center rounded border border-gray-200 bg-gray-100">
												<div className="text-center">
													<Video className="mx-auto h-12 w-12 text-gray-400" />
													<p className="mt-2 text-gray-500 text-sm">
														Video preview not available
													</p>
												</div>
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					)}

					{/* Document Previews */}
					{documents.length > 0 && (
						<div className="mt-4 space-y-3">
							<span className="block font-medium text-gray-700 text-sm">
								Documents ({documents.length})
							</span>
							{documents.map((doc) => (
								<div key={doc.id} className="rounded-lg border border-gray-200">
									<div className="flex items-center justify-between bg-gray-50 p-3">
										<div className="flex items-center gap-2">
											<FileUp className="h-4 w-4 text-gray-600" />
											<span className="text-gray-700 text-sm">{doc.name}</span>
											<span className="rounded bg-gray-200 px-2 py-0.5 text-gray-600 text-xs">
												{doc.file.size > 1024 * 1024
													? `${(doc.file.size / (1024 * 1024)).toFixed(1)} MB`
													: `${(doc.file.size / 1024).toFixed(0)} KB`}
											</span>
										</div>
										<button
											type="button"
											onClick={() => handleRemoveDocument(doc.id)}
											className="text-gray-400 hover:text-red-500"
										>
											<X className="h-4 w-4" />
										</button>
									</div>

									{/* PDF Preview - Centered */}
									{doc.type === "application/pdf" && (
										<div className="flex items-center justify-center border-gray-200 border-t bg-gray-50 p-6">
											<div className="w-full max-w-2xl md:w-[70%]">
												<iframe
													src={URL.createObjectURL(doc.file)}
													className="h-[600px] w-full rounded border border-gray-300 shadow-sm"
													title={doc.name}
												/>
												<p className="mt-3 text-center text-gray-500 text-sm">
													Use browser controls to navigate pages
												</p>
											</div>
										</div>
									)}

									{/* Text Preview */}
									{doc.type === "text/plain" && doc.preview && (
										<div className="border-gray-200 border-t bg-gray-50 p-4">
											<pre className="line-clamp-4 overflow-hidden font-mono text-gray-700 text-xs">
												{doc.preview}
											</pre>
											{doc.preview.length >= 500 && (
												<span className="mt-2 block text-gray-500 text-xs">
													... (preview truncated)
												</span>
											)}
										</div>
									)}

									{/* DOCX - No preview available */}
									{doc.type ===
										"application/vnd.openxmlformats-officedocument.wordprocessingml.document" && (
										<div className="border-gray-200 border-t bg-gray-50 p-4 text-center text-gray-500 text-sm">
											Preview not available for DOCX files
										</div>
									)}
								</div>
							))}
						</div>
					)}
				</div>

				{/* Hashtags */}
				<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
					<label
						htmlFor="hashtags"
						className="mb-2 block font-medium text-gray-700 text-sm"
					>
						Hashtags (Optional)
					</label>
					<div className="relative">
						<Hash className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-gray-400" />
						<input
							id="hashtags"
							type="text"
							value={hashtagInput}
							onChange={(e) => setHashtagInput(e.target.value)}
							onKeyDown={handleHashtagAdd}
							placeholder="Add hashtags (press Enter or comma)"
							className="w-full rounded-lg border border-gray-300 py-2 pr-3 pl-10 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
						/>
					</div>
					{hashtags.length > 0 && (
						<div className="mt-3 flex flex-wrap gap-2">
							{hashtags.map((tag) => (
								<span
									key={tag}
									className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-purple-700 text-sm"
								>
									#{tag}
									<button
										type="button"
										onClick={() => handleHashtagRemove(tag)}
										className="hover:text-purple-900"
									>
										<X className="h-3 w-3" />
									</button>
								</span>
							))}
						</div>
					)}
				</div>

				{/* Visibility */}
				<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
					<div className="mb-3 block font-medium text-gray-700 text-sm">
						<Eye className="mr-2 inline h-4 w-4" />
						Visibility
					</div>
					<select
						value={visibility}
						onChange={(e) =>
							setVisibility(
								e.target.value as "PUBLIC" | "CONNECTIONS_ONLY" | "PRIVATE",
							)
						}
						className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
					>
						<option value="PUBLIC">Public - Anyone can see this post</option>
						<option value="CONNECTIONS_ONLY">
							Connections Only - Only your connections can see
						</option>
						<option value="PRIVATE">Private - Only you can see</option>
					</select>
				</div>

				{/* AI Content Disclosure */}
				<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
					<label className="flex cursor-pointer items-start gap-3">
						<input
							type="checkbox"
							checked={isAiGenerated}
							onChange={(e) => setIsAiGenerated(e.target.checked)}
							className="mt-1 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-2 focus:ring-purple-500"
						/>
						<div className="flex-1">
							<div className="flex items-center gap-2">
								<Sparkles className="h-4 w-4 text-purple-600" />
								<span className="font-medium text-gray-900">
									This content is AI-generated
								</span>
							</div>
							<p className="mt-1 text-gray-500 text-xs">
								Being transparent builds trust. Undisclosed AI content may be
								flagged by the community.
							</p>
						</div>
					</label>
				</div>

				{/* Submit Buttons */}
				<div className="flex gap-3">
					<Link
						href="/feed"
						className="flex-1 rounded-lg border border-gray-300 px-6 py-3 text-center font-medium text-gray-700 transition-colors hover:bg-gray-50"
					>
						Cancel
					</Link>
					<button
						type="submit"
						className="flex-1 rounded-lg bg-purple-600 px-6 py-3 font-medium text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
						disabled={isSubmitting}
					>
						{isSubmitting ? (
							<span className="flex items-center justify-center gap-2">
								<Loader2 className="h-5 w-5 animate-spin" />
								<span>Posting...</span>
							</span>
						) : (
							<span>
								{postType === "PORTFOLIO" ? "Add to Portfolio" : "Post"}
							</span>
						)}
					</button>
				</div>
			</form>

			{/* Feedback Prompt Modal */}
			{FeedbackPrompt}
		</div>
	);
}
