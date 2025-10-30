"use client";

import { AlertTriangle, X } from "lucide-react";
import { useEffect, useState } from "react";

interface ConfirmationModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	isDestructive?: boolean;
	isLoading?: boolean;
}

export function ConfirmationModal({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	confirmText = "Confirm",
	cancelText = "Cancel",
	isDestructive = false,
	isLoading = false,
}: ConfirmationModalProps) {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		if (isOpen) {
			setIsVisible(true);
		}
	}, [isOpen]);

	const handleClose = () => {
		if (isLoading) return; // Prevent closing while loading
		setIsVisible(false);
		setTimeout(() => {
			onClose();
		}, 300);
	};

	const handleConfirm = () => {
		onConfirm();
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
				disabled={isLoading}
				aria-label="Close modal"
			/>

			{/* Modal */}
			<div
				className={`relative w-full max-w-md transform transition-all duration-300 ${
					isVisible
						? "translate-y-0 scale-100 opacity-100"
						: "translate-y-4 scale-95 opacity-0"
				}`}
			>
				<div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
					{/* Close Button */}
					<button
						type="button"
						onClick={handleClose}
						disabled={isLoading}
						className="absolute top-4 right-4 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
						aria-label="Close"
					>
						<X className="h-5 w-5" />
					</button>

					{/* Content */}
					<div className="p-6">
						{/* Icon */}
						<div className="mb-4 flex justify-center">
							<div
								className={`flex h-14 w-14 items-center justify-center rounded-full ${
									isDestructive ? "bg-red-100" : "bg-amber-100"
								}`}
							>
								<AlertTriangle
									className={`h-7 w-7 ${
										isDestructive ? "text-red-600" : "text-amber-600"
									}`}
								/>
							</div>
						</div>

						{/* Title */}
						<h2 className="mb-3 text-center font-bold text-gray-900 text-xl">
							{title}
						</h2>

						{/* Message */}
						<p className="mb-6 text-center text-gray-600 text-sm leading-relaxed">
							{message}
						</p>

						{/* Action Buttons */}
						<div className="flex gap-3">
							<button
								type="button"
								onClick={handleClose}
								disabled={isLoading}
								className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
							>
								{cancelText}
							</button>
							<button
								type="button"
								onClick={handleConfirm}
								disabled={isLoading}
								className={`flex-1 rounded-lg px-4 py-2.5 font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
									isDestructive
										? "bg-red-600 hover:bg-red-700"
										: "bg-purple-600 hover:bg-purple-700"
								}`}
							>
								{isLoading ? "Processing..." : confirmText}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
