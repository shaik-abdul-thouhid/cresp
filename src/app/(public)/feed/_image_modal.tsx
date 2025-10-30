"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface ImageModalProps {
	images: Array<{ id: string; url: string }>;
	initialIndex: number;
	isOpen: boolean;
	onClose: () => void;
}

export function ImageModal({
	images,
	initialIndex,
	isOpen,
	onClose,
}: ImageModalProps) {
	const [currentIndex, setCurrentIndex] = useState(initialIndex);

	useEffect(() => {
		setCurrentIndex(initialIndex);
	}, [initialIndex]);

	useEffect(() => {
		if (isOpen) {
			// Prevent body scroll when modal is open
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}

		// Cleanup on unmount
		return () => {
			document.body.style.overflow = "unset";
		};
	}, [isOpen]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!isOpen) return;

			if (e.key === "Escape") {
				onClose();
			} else if (e.key === "ArrowLeft") {
				goToPrevious();
			} else if (e.key === "ArrowRight") {
				goToNext();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, currentIndex]);

	if (!isOpen) return null;

	const goToPrevious = () => {
		setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
	};

	const goToNext = () => {
		setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
			onClick={onClose}
		>
			{/* Close Button */}
			<button
				type="button"
				onClick={onClose}
				className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition-all hover:bg-white/20"
				aria-label="Close"
			>
				<X className="h-6 w-6" />
			</button>

			{/* Image Counter */}
			<div className="absolute top-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-sm text-white backdrop-blur-sm">
				{currentIndex + 1} / {images.length}
			</div>

			{/* Previous Button */}
			{images.length > 1 && (
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						goToPrevious();
					}}
					className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/20"
					aria-label="Previous image"
				>
					<ChevronLeft className="h-8 w-8" />
				</button>
			)}

			{/* Next Button */}
			{images.length > 1 && (
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						goToNext();
					}}
					className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/20"
					aria-label="Next image"
				>
					<ChevronRight className="h-8 w-8" />
				</button>
			)}

			{/* Main Image */}
			<div
				className="relative h-[90vh] w-[90vw] md:h-[85vh] md:w-[85vw]"
				onClick={(e) => e.stopPropagation()}
			>
				<Image
					src={images[currentIndex]?.url || ""}
					alt={`Image ${currentIndex + 1}`}
					fill
					className="object-contain"
					quality={100}
					priority
				/>
			</div>

			{/* Thumbnail Navigation (Bottom) */}
			{images.length > 1 && (
				<div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2 rounded-lg bg-black/50 p-2 backdrop-blur-sm">
					{images.map((img, idx) => (
						<button
							key={img.id}
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								setCurrentIndex(idx);
							}}
							className={`relative h-16 w-16 overflow-hidden rounded border-2 transition-all ${
								idx === currentIndex
									? "scale-110 border-white"
									: "border-transparent opacity-60 hover:opacity-100"
							}`}
						>
							<Image
								src={img.url}
								alt={`Thumbnail ${idx + 1}`}
								fill
								className="object-cover"
								sizes="64px"
							/>
						</button>
					))}
				</div>
			)}
		</div>
	);
}

