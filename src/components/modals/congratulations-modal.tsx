"use client";

import { CheckCircle, Sparkles, Star } from "lucide-react";
import { useEffect, useState } from "react";

interface CongratulationsModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	message?: string;
	autoCloseMs?: number;
}

export function CongratulationsModal({
	isOpen,
	onClose,
	title = "Success!",
	message = "Your changes have been saved successfully",
	autoCloseMs,
}: CongratulationsModalProps) {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		if (isOpen) {
			setIsVisible(true);

			if (autoCloseMs) {
				const timer = setTimeout(() => {
					handleClose();
				}, autoCloseMs);

				return () => clearTimeout(timer);
			}
		}
	}, [isOpen, autoCloseMs]);

	const handleClose = () => {
		setIsVisible(false);
		setTimeout(() => {
			onClose();
		}, 300);
	};

	if (!isOpen) return null;

	return (
		<div
			className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
				isVisible ? "opacity-100" : "opacity-0"
			}`}
		>
			{/* Backdrop */}
			<button
				type="button"
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={handleClose}
				aria-label="Close modal"
			/>

			{/* Modal */}
			<div
				className={`relative w-full max-w-md transform transition-all duration-500 ${
					isVisible
						? "translate-y-0 scale-100 opacity-100"
						: "translate-y-4 scale-95 opacity-0"
				}`}
			>
				<div className="relative overflow-hidden rounded-2xl border border-purple-200 bg-white p-8 shadow-2xl">
					{/* Animated Background Pattern */}
					<div className="absolute inset-0 opacity-10">
						<div className="-right-20 -top-20 absolute h-40 w-40 animate-pulse rounded-full bg-gradient-to-br from-purple-400 to-pink-400" />
						<div className="animation-delay-1000 -bottom-20 -left-20 absolute h-40 w-40 animate-pulse rounded-full bg-gradient-to-br from-indigo-400 to-purple-400" />
					</div>

					{/* Floating Icons */}
					<div className="absolute inset-0 overflow-hidden">
						<Sparkles className="absolute top-8 left-8 h-4 w-4 animate-bounce text-yellow-400" />
						<Star className="animation-delay-300 absolute top-12 right-12 h-5 w-5 animate-bounce text-purple-400" />
						<Sparkles className="animation-delay-700 absolute bottom-12 left-12 h-3 w-3 animate-bounce text-pink-400" />
						<Star className="animation-delay-500 absolute right-8 bottom-8 h-4 w-4 animate-bounce text-indigo-400" />
					</div>

					{/* Content */}
					<div className="relative z-10 text-center">
						{/* Success Icon */}
						<div className="mb-6 flex justify-center">
							<div className="relative animate-scale-in">
								<div className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-75" />
								<div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg">
									<CheckCircle
										className="h-10 w-10 text-white"
										strokeWidth={3}
									/>
								</div>
							</div>
						</div>

						{/* Title */}
						<h2 className="mb-3 animate-fade-in-up bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text font-bold text-3xl text-transparent">
							{title}
						</h2>

						{/* Message */}
						<p className="animation-delay-200 mb-6 animate-fade-in-up text-gray-600 leading-relaxed">
							{message}
						</p>

						{/* Decorative Line */}
						<div className="mx-auto mb-6 h-1 w-24 rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400" />

						{/* Close Button */}
						<button
							type="button"
							onClick={handleClose}
							className="animation-delay-400 animate-fade-in-up rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
						>
							Continue
						</button>
					</div>
				</div>
			</div>

			<style jsx>{`
				@keyframes scale-in {
					0% {
						transform: scale(0);
						opacity: 0;
					}
					50% {
						transform: scale(1.1);
					}
					100% {
						transform: scale(1);
						opacity: 1;
					}
				}

				@keyframes fade-in-up {
					0% {
						opacity: 0;
						transform: translateY(10px);
					}
					100% {
						opacity: 1;
						transform: translateY(0);
					}
				}

				.animate-scale-in {
					animation: scale-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
				}

				.animate-fade-in-up {
					animation: fade-in-up 0.6s ease-out forwards;
					opacity: 0;
				}

				.animation-delay-200 {
					animation-delay: 0.2s;
				}

				.animation-delay-300 {
					animation-delay: 0.3s;
				}

				.animation-delay-400 {
					animation-delay: 0.4s;
				}

				.animation-delay-500 {
					animation-delay: 0.5s;
				}

				.animation-delay-700 {
					animation-delay: 0.7s;
				}

				.animation-delay-1000 {
					animation-delay: 1s;
				}
			`}</style>
		</div>
	);
}
