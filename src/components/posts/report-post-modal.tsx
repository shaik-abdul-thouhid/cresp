"use client";

import { AlertTriangle, Flag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ModerationCategory {
	key: string;
	name: string;
	description: string | null;
	icon: string | null;
	color: string | null;
	severity: number;
	requiresProof: boolean;
}

interface ReportPostModalProps {
	postId: string;
	isOpen: boolean;
	onClose: () => void;
}

export function ReportPostModal({
	postId,
	isOpen,
	onClose,
}: ReportPostModalProps) {
	const [categories, setCategories] = useState<ModerationCategory[]>([]);
	const [selectedCategory, setSelectedCategory] = useState<string>("");
	const [details, setDetails] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Fetch categories when modal opens
	useEffect(() => {
		if (isOpen) {
			setIsLoading(true);
			fetch("/api/posts/report-categories")
				.then((res) => res.json())
				.then((data) => {
					setCategories(data);
					setIsLoading(false);
				})
				.catch((error) => {
					console.error("Error fetching categories:", error);
					toast.error("Failed to load report categories");
					setIsLoading(false);
				});
		}
	}, [isOpen]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!selectedCategory) {
			toast.error("Please select a reason for reporting");
			return;
		}

		const selectedCat = categories.find((c) => c.key === selectedCategory);
		if (selectedCat?.requiresProof && !details.trim()) {
			toast.error("Please provide details for this type of report");
			return;
		}

		setIsSubmitting(true);

		try {
			const response = await fetch("/api/posts/report", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					postId,
					categoryKey: selectedCategory,
					details: details.trim() || undefined,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				toast.error(data.error || "Failed to submit report");
				return;
			}

			toast.success("Report submitted successfully. Thank you for helping keep our community safe!");
			onClose();
			// Reset form
			setSelectedCategory("");
			setDetails("");
		} catch (error) {
			console.error("Error submitting report:", error);
			toast.error("An error occurred while submitting your report");
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl">
				{/* Header */}
				<div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-4">
					<div className="flex items-center gap-2">
						<Flag className="h-5 w-5 text-red-600" />
						<h2 className="font-bold text-gray-900 text-lg">Report Post</h2>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
						aria-label="Close"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				{/* Content */}
				<form onSubmit={handleSubmit} className="p-6">
					<div className="mb-6 rounded-lg bg-amber-50 p-4">
						<div className="flex gap-3">
							<AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600" />
							<div className="text-sm">
								<p className="font-medium text-amber-900">
									Help us understand the issue
								</p>
								<p className="mt-1 text-amber-700">
									Your report will be reviewed by our moderation team. False reports
									may affect your account standing.
								</p>
							</div>
						</div>
					</div>

					{/* Categories */}
					<div className="space-y-3">
						<label className="block font-semibold text-gray-900 text-sm">
							Why are you reporting this post?
						</label>

						{isLoading ? (
							<div className="space-y-2">
								{[1, 2, 3, 4].map((i) => (
									<div
										key={i}
										className="h-16 animate-pulse rounded-lg bg-gray-100"
									/>
								))}
							</div>
						) : (
							<div className="space-y-2">
								{categories.map((category) => (
									<label
										key={category.key}
										className={`block cursor-pointer rounded-lg border-2 p-4 transition-all ${
											selectedCategory === category.key
												? "border-red-500 bg-red-50"
												: "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
										}`}
									>
										<div className="flex items-start gap-3">
											<input
												type="radio"
												name="category"
												value={category.key}
												checked={selectedCategory === category.key}
												onChange={(e) => setSelectedCategory(e.target.value)}
												className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500"
											/>
											<div className="flex-1">
												<div className="flex items-center gap-2">
													{category.icon && (
														<span className="text-lg">{category.icon}</span>
													)}
													<span className="font-semibold text-gray-900">
														{category.name}
													</span>
													{category.severity >= 4 && (
														<span className="rounded bg-red-100 px-2 py-0.5 font-medium text-red-700 text-xs">
															High Priority
														</span>
													)}
												</div>
												{category.description && (
													<p className="mt-1 text-gray-600 text-sm">
														{category.description}
													</p>
												)}
												{category.requiresProof && (
													<p className="mt-1 text-amber-700 text-xs">
														⚠️ Details required for this type of report
													</p>
												)}
											</div>
										</div>
									</label>
								))}
							</div>
						)}
					</div>

					{/* Details */}
					{selectedCategory && (
						<div className="mt-6 space-y-2">
							<label className="block font-semibold text-gray-900 text-sm">
								Additional Details
								{categories.find((c) => c.key === selectedCategory)
									?.requiresProof && (
									<span className="ml-1 text-red-600">*</span>
								)}
							</label>
							<textarea
								value={details}
								onChange={(e) => setDetails(e.target.value)}
								placeholder="Please provide any additional context or evidence..."
								rows={4}
								className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
							/>
						</div>
					)}

					{/* Actions */}
					<div className="mt-6 flex gap-3">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50"
							disabled={isSubmitting}
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={!selectedCategory || isSubmitting}
							className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{isSubmitting ? "Submitting..." : "Submit Report"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

