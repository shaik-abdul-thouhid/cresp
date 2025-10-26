"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SuccessToast, ErrorToast } from "~/components/ui/custom-toasts";

interface FeedbackModalProps {
	trigger: string;
	feedbackType: string;
	title: string;
	question: string;
	onClose: () => void;
}

const EMOJI_RATINGS = [
	{ value: 1, emoji: "😞", label: "Very Poor" },
	{ value: 2, emoji: "🙁", label: "Poor" },
	{ value: 3, emoji: "😐", label: "Okay" },
	{ value: 4, emoji: "😊", label: "Good" },
	{ value: 5, emoji: "😄", label: "Excellent" },
];

export function FeedbackModal({
	trigger,
	feedbackType,
	title,
	question,
	onClose,
}: FeedbackModalProps) {
	const [rating, setRating] = useState<number | null>(null);
	const [comment, setComment] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showCommentBox, setShowCommentBox] = useState(false);

	const handleDismiss = async () => {
		try {
			await fetch("/api/feedback/dismiss", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ trigger }),
			});
		} catch (error) {
			console.error("Error dismissing feedback:", error);
		}
		onClose();
	};

	const handleSubmit = async () => {
		if (!rating) {
			toast.custom(() => (
				<ErrorToast
					title="Rating Required"
					message="Please select a rating before submitting"
				/>
			));
			return;
		}

		setIsSubmitting(true);

		try {
			const response = await fetch("/api/feedback/submit", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					trigger,
					feedbackType,
					rating,
					comment: comment.trim() || null,
					url: window.location.pathname,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to submit feedback");
			}

			toast.custom(() => (
				<SuccessToast
					title="Thank You!"
					message="Your feedback helps us improve"
				/>
			));

			onClose();
		} catch (error) {
			console.error("Error submitting feedback:", error);
			toast.custom(() => (
				<ErrorToast
					title="Submission Failed"
					message="Please try again"
				/>
			));
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<div className="w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-xl">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-gray-200 p-4">
					<h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
					<button
						onClick={handleDismiss}
						className="text-gray-400 transition-colors hover:text-gray-600"
						aria-label="Close feedback modal"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				{/* Content */}
				<div className="p-6">
					<p className="mb-6 text-center text-gray-700">{question}</p>

					{/* Emoji Rating */}
					<div className="mb-6 flex justify-center gap-3">
						{EMOJI_RATINGS.map((item) => (
							<button
								key={item.value}
								onClick={() => {
									setRating(item.value);
									if (!showCommentBox) setShowCommentBox(true);
								}}
								className={`flex h-14 w-14 flex-col items-center justify-center rounded-lg border-2 transition-all ${
									rating === item.value
										? "scale-110 border-purple-500 bg-purple-50"
										: "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
								}`}
								title={item.label}
							>
								<span className="text-2xl">{item.emoji}</span>
							</button>
						))}
					</div>

					{/* Comment Box (shown after rating selected) */}
					{showCommentBox && (
						<div className="mb-4 animate-in fade-in-50 duration-300">
							<label
								htmlFor="feedback-comment"
								className="mb-2 block text-gray-700 text-sm font-medium"
							>
								Tell us more (optional)
							</label>
							<textarea
								id="feedback-comment"
								value={comment}
								onChange={(e) => setComment(e.target.value)}
								placeholder="Your detailed feedback helps us improve..."
								className="w-full resize-none rounded-lg border border-gray-300 p-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
								rows={3}
								maxLength={500}
							/>
							<p className="mt-1 text-right text-gray-400 text-xs">
								{comment.length}/500
							</p>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="flex gap-3 border-t border-gray-200 bg-gray-50 p-4">
					<button
						onClick={handleDismiss}
						className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 text-sm transition-colors hover:bg-gray-100"
						disabled={isSubmitting}
					>
						Skip
					</button>
					<button
						onClick={handleSubmit}
						disabled={!rating || isSubmitting}
						className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{isSubmitting ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								<span>Submitting...</span>
							</>
						) : (
							<span>Submit Feedback</span>
						)}
					</button>
				</div>
			</div>
		</div>
	);
}

