"use client";

import { Flag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ErrorToast, SuccessToast } from "~/components/ui/custom-toasts";

interface ReportUserModalProps {
	userId: string;
	username: string;
	isOpen: boolean;
	onClose: () => void;
}

interface ModerationCategory {
	key: string;
	name: string;
	description?: string;
	requiresProof: boolean;
}

export function ReportUserModal({
	userId,
	username,
	isOpen,
	onClose,
}: ReportUserModalProps) {
	const [categories, setCategories] = useState<ModerationCategory[]>([]);
	const [selectedCategory, setSelectedCategory] = useState<string>("");
	const [reason, setReason] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingCategories, setIsLoadingCategories] = useState(false);

	useEffect(() => {
		if (isOpen) {
			setIsLoadingCategories(true);
			fetch("/api/posts/report-categories")
				.then((res) => res.json())
				.then((data: { categories: ModerationCategory[] }) => {
					setCategories(data.categories);
				})
				.catch((error) => {
					console.error("Failed to load report categories:", error);
					toast.custom(() => (
						<ErrorToast
							title="Error"
							message="Failed to load report categories"
						/>
					));
				})
				.finally(() => {
					setIsLoadingCategories(false);
				});
		}
	}, [isOpen]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!selectedCategory) {
			toast.custom(() => (
				<ErrorToast
					title="Missing Information"
					message="Please select a category"
				/>
			));
			return;
		}

		const selectedCat = categories.find((c) => c.key === selectedCategory);
		if (selectedCat?.requiresProof && !reason.trim()) {
			toast.custom(() => (
				<ErrorToast
					title="More Details Needed"
					message="Please provide more details for this type of report"
				/>
			));
			return;
		}

		setIsLoading(true);

		try {
			const response = await fetch("/api/user/report", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					userId,
					categoryKey: selectedCategory,
					reason: reason.trim() || undefined,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to submit report");
			}

			toast.custom(() => (
				<SuccessToast
					title="Report Submitted"
					message="Thank you for helping keep our community safe"
				/>
			));

			onClose();
			setSelectedCategory("");
			setReason("");
		} catch (error) {
			console.error("Error submitting report:", error);
			toast.custom(() => (
				<ErrorToast
					title="Failed to Submit"
					message={
						error instanceof Error ? error.message : "Please try again later"
					}
				/>
			));
		} finally {
			setIsLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<div className="w-full max-w-md rounded-xl bg-white shadow-xl">
				{/* Header */}
				<div className="flex items-center justify-between border-gray-200 border-b p-4">
					<div className="flex items-center gap-2">
						<Flag className="h-5 w-5 text-red-600" />
						<h3 className="font-semibold text-gray-900 text-lg">
							Report @{username}
						</h3>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				{/* Content */}
				<form onSubmit={handleSubmit} className="p-4">
					<p className="mb-4 text-gray-600 text-sm">
						Help us understand what's wrong with this profile. Your report will
						be reviewed by our moderation team.
					</p>

					{/* Category Selection */}
					<div className="mb-4">
						<label
							htmlFor="category"
							className="mb-2 block font-medium text-gray-700 text-sm"
						>
							Reason for reporting *
						</label>
						{isLoadingCategories ? (
							<div className="h-10 animate-pulse rounded-lg bg-gray-200" />
						) : (
							<select
								id="category"
								value={selectedCategory}
								onChange={(e) => setSelectedCategory(e.target.value)}
								className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
								required
							>
								<option value="">Select a reason...</option>
								{categories.map((category) => (
									<option key={category.key} value={category.key}>
										{category.name}
									</option>
								))}
							</select>
						)}
						{selectedCategory && (
							<p className="mt-1 text-gray-500 text-xs">
								{
									categories.find((c) => c.key === selectedCategory)
										?.description
								}
							</p>
						)}
					</div>

					{/* Additional Details */}
					<div className="mb-6">
						<label
							htmlFor="reason"
							className="mb-2 block font-medium text-gray-700 text-sm"
						>
							Additional details
							{categories.find((c) => c.key === selectedCategory)
								?.requiresProof && " *"}
						</label>
						<textarea
							id="reason"
							value={reason}
							onChange={(e) => setReason(e.target.value)}
							placeholder="Provide more context about this report..."
							rows={4}
							className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
							required={
								categories.find((c) => c.key === selectedCategory)
									?.requiresProof
							}
						/>
						<p className="mt-1 text-gray-500 text-xs">
							{reason.length}/500 characters
						</p>
					</div>

					{/* Actions */}
					<div className="flex justify-end gap-3">
						<button
							type="button"
							onClick={onClose}
							disabled={isLoading}
							className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isLoading || !selectedCategory}
							className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{isLoading ? (
								<>
									<div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
									Submitting...
								</>
							) : (
								<>
									<Flag className="h-4 w-4" />
									Submit Report
								</>
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
