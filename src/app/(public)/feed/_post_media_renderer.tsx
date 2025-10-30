import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

interface MediaItem {
	id: string;
	mediaType: string;
	url: string;
	videoProvider?: string | null;
	videoId?: string | null;
	fileName?: string | null;
	mimeType?: string | null;
	thumbnailUrl?: string | null;
}

interface PostMediaRendererProps {
	media: MediaItem[];
	isVisible: boolean;
	carouselRef: React.RefObject<HTMLDivElement | null>;
	onImageClick?: (index: number) => void;
}

export function PostMediaRenderer({
	media,
	isVisible,
	carouselRef,
	onImageClick,
}: PostMediaRendererProps) {
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(false);

	// Check scroll position to show/hide navigation buttons
	const checkScroll = useCallback(() => {
		if (carouselRef.current) {
			const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
			setCanScrollLeft(scrollLeft > 0);
			setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
		}
	}, [carouselRef]);

	useEffect(() => {
		checkScroll();
		const carousel = carouselRef.current;
		if (carousel) {
			carousel.addEventListener("scroll", checkScroll);
			return () => carousel.removeEventListener("scroll", checkScroll);
		}
	}, [carouselRef, checkScroll]);

	const scroll = (direction: "left" | "right") => {
		if (carouselRef.current) {
			const firstImage = carouselRef.current.querySelector(
				'div[class*="aspect-square"]',
			);
			const scrollAmount = firstImage ? firstImage.clientWidth + 12 : 336;

			const newPosition =
				direction === "left"
					? carouselRef.current.scrollLeft - scrollAmount
					: carouselRef.current.scrollLeft + scrollAmount;

			carouselRef.current.scrollTo({
				left: newPosition,
				behavior: "smooth",
			});
		}
	};

	if (!isVisible) {
		// Placeholder to maintain layout while loading
		return (
			<div className="pb-3">
				<div className="scrollbar-hide flex gap-2 overflow-x-auto px-2 sm:gap-3 sm:px-4">
					{media.slice(0, 3).map((item) => (
						<div
							key={item.id}
							className="relative flex aspect-square w-[85vw] max-w-md flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-100 shadow-sm md:w-80"
						>
							<div className="animate-pulse">
								<ImageIcon className="h-12 w-12 text-gray-300" />
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	// Check if we have videos or audio - these should be full width
	const hasFullWidthMedia = media.some(
		(item) =>
			item.mediaType === "VIDEO_LINK" || item.mediaType === "AUDIO_LINK",
	);

	if (hasFullWidthMedia) {
		// Full width layout for videos/audio (no padding)
		return (
			<div className="space-y-3">
				{media.map((item, index) => (
					<MediaItemRenderer
						key={item.id}
						media={item}
						fullWidth
						index={index}
						onImageClick={onImageClick}
					/>
				))}
			</div>
		);
	}

	// Carousel layout for images with navigation
	return (
		<div className="pb-3">
			<div className="relative">
				{/* Navigation Buttons */}
				{media.length > 1 && (
					<>
						{canScrollLeft && (
							<button
								type="button"
								onClick={() => scroll("left")}
								className="-translate-y-1/2 absolute top-1/2 left-2 z-10 hidden rounded-full bg-white/90 p-2 shadow-lg backdrop-blur-sm transition-all hover:scale-110 hover:bg-white md:block"
								aria-label="Previous image"
							>
								<ChevronLeft className="h-6 w-6 text-gray-800" />
							</button>
						)}
						{canScrollRight && (
							<button
								type="button"
								onClick={() => scroll("right")}
								className="-translate-y-1/2 absolute top-1/2 right-2 z-10 hidden rounded-full bg-white/90 p-2 shadow-lg backdrop-blur-sm transition-all hover:scale-110 hover:bg-white md:block"
								aria-label="Next image"
							>
								<ChevronRight className="h-6 w-6 text-gray-800" />
							</button>
						)}
					</>
				)}

				<div
					ref={carouselRef}
					className="scrollbar-hide flex snap-x snap-mandatory gap-2 overflow-x-auto px-2 sm:gap-3 sm:px-4"
				>
					{media.map((item, index) => (
						<MediaItemRenderer
							key={item.id}
							media={item}
							fullWidth={false}
							index={index}
							onImageClick={onImageClick}
						/>
					))}
				</div>
			</div>
			{media.length > 1 && (
				<p className="mt-2 px-4 text-center text-gray-500 text-xs md:hidden">
					← Swipe to see {media.length} images →
				</p>
			)}
		</div>
	);
}

function MediaItemRenderer({
	media,
	fullWidth = false,
	index = 0,
	onImageClick,
}: {
	media: MediaItem;
	fullWidth?: boolean;
	index?: number;
	onImageClick?: (index: number) => void;
}) {
	// Images
	if (media.mediaType === "IMAGE") {
		return (
			<button
				type="button"
				onClick={() => onImageClick?.(index)}
				className="relative aspect-square w-[85vw] max-w-md flex-shrink-0 snap-center overflow-hidden rounded-lg border-2 border-gray-200 shadow-sm transition-transform hover:scale-[1.02] md:w-80"
			>
				<Image
					src={media.url}
					alt="Post media"
					fill
					className="object-cover"
					loading="lazy"
					sizes="(max-width: 768px) 85vw, 320px"
				/>
				{/* Click indicator overlay */}
				<div className="absolute inset-0 bg-black/0 transition-colors hover:bg-black/5" />
			</button>
		);
	}

	// Video Links
	if (
		media.mediaType === "VIDEO_LINK" &&
		media.videoProvider &&
		media.videoId
	) {
		return (
			<VideoRenderer
				provider={media.videoProvider}
				videoId={media.videoId}
				fullWidth={fullWidth}
			/>
		);
	}

	// Audio Links
	if (media.mediaType === "AUDIO_LINK" && media.videoProvider) {
		return (
			<AudioRenderer
				provider={media.videoProvider}
				audioId={media.videoId || ""}
				url={media.url}
				fullWidth={fullWidth}
			/>
		);
	}

	return null;
}

function VideoRenderer({
	provider,
	videoId,
	fullWidth = false,
}: {
	provider: string;
	videoId: string;
	fullWidth?: boolean;
}) {
	let embedUrl = "";

	switch (provider) {
		case "youtube":
			embedUrl = `https://www.youtube.com/embed/${videoId}`;
			break;
		case "vimeo":
			embedUrl = `https://player.vimeo.com/video/${videoId}`;
			break;
		case "tiktok":
			// TikTok uses the full URL as videoId
			embedUrl = videoId;
			break;
		case "dailymotion":
			embedUrl = `https://www.dailymotion.com/embed/video/${videoId}`;
			break;
	}

	if (!embedUrl) return null;

	const containerClass = fullWidth
		? "relative aspect-video w-full overflow-hidden"
		: "relative aspect-video w-[85vw] max-w-md flex-shrink-0 snap-center overflow-hidden rounded-lg border-2 border-gray-200 shadow-sm md:w-96";

	return (
		<div className={containerClass}>
			<iframe
				src={embedUrl}
				title={`${provider} video`}
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowFullScreen
				className="h-full w-full"
				loading="lazy"
			/>
		</div>
	);
}

function AudioRenderer({
	provider,
	audioId,
	url,
	fullWidth = false,
}: {
	provider: string;
	audioId: string;
	url: string;
	fullWidth?: boolean;
}) {
	let embedContent = null;

	switch (provider) {
		case "spotify":
			embedContent = (
				<iframe
					src={`https://open.spotify.com/embed/track/${audioId}`}
					title="Spotify track"
					allow="autoplay; clipboard-write; encrypted-media"
					className="h-full w-full"
					loading="lazy"
				/>
			);
			break;
		case "soundcloud":
			// SoundCloud uses the full URL
			embedContent = (
				<iframe
					src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(audioId)}&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`}
					title="SoundCloud track"
					allow="autoplay"
					className="h-full w-full"
					loading="lazy"
				/>
			);
			break;
		case "bandcamp":
		case "apple-music":
			// These might need special handling or just show a link
			embedContent = (
				<div className="flex h-full w-full items-center justify-center bg-gray-100">
					<div className="text-center">
						<svg
							className="mx-auto h-12 w-12 text-gray-400"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}
						>
							<title>Audio icon</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
							/>
						</svg>
						<p className="mt-2 text-gray-600 text-sm capitalize">
							{provider} Track
						</p>
						<a
							href={url}
							target="_blank"
							rel="noopener noreferrer"
							className="mt-2 inline-block text-purple-600 text-xs hover:underline"
						>
							Listen on {provider}
						</a>
					</div>
				</div>
			);
			break;
	}

	if (!embedContent) return null;

	const containerClass = fullWidth
		? "relative h-32 w-full overflow-hidden"
		: "relative h-32 w-[85vw] max-w-md flex-shrink-0 snap-center overflow-hidden rounded-lg border-2 border-gray-200 shadow-sm md:w-96";

	return <div className={containerClass}>{embedContent}</div>;
}
