"use client";

import {
	Check,
	Copy,
	Facebook,
	Linkedin,
	Mail,
	MessageCircle,
	Share2,
	Twitter,
	X,
} from "lucide-react";
import { useState } from "react";

interface ReferralData {
	code: string;
	link: string;
	stats: {
		clicks: number;
		signups: number;
		conversions: number;
	};
}

export function FloatingReferralButton() {
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [referralData, setReferralData] = useState<ReferralData | null>(null);
	const [copied, setCopied] = useState(false);

	const handleOpen = async () => {
		setIsOpen(true);

		if (!referralData) {
			setIsLoading(true);
			try {
				const response = await fetch("/api/referral/code");
				const data = await response.json();
				setReferralData(data);
			} catch (error) {
				console.error("Error fetching referral code:", error);
			} finally {
				setIsLoading(false);
			}
		}
	};

	const handleClose = () => {
		setIsOpen(false);
		setCopied(false);
	};

	const handleCopy = async () => {
		if (!referralData) return;

		try {
			await navigator.clipboard.writeText(referralData.link);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (error) {
			console.error("Error copying to clipboard:", error);
		}
	};

	const handleShare = async (platform: string) => {
		if (!referralData) return;

		const text =
			"Join me on Cresp, the creative collaboration platform! 🎨🎬🎵";
		const url = referralData.link;

		const shareUrls: Record<string, string> = {
			twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
			facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
			linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
			whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
			email: `mailto:?subject=${encodeURIComponent("Join me on Cresp")}&body=${encodeURIComponent(`${text}\n\n${url}`)}`,
		};

		if (shareUrls[platform]) {
			window.open(shareUrls[platform], "_blank", "width=600,height=400");
		}
	};

	return (
		<>
			{/* Floating Button */}
			<button
				type="button"
				onClick={handleOpen}
				className="group fixed right-4 bottom-24 z-40 flex h-14 items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-4 text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl sm:right-6 sm:bottom-6"
				aria-label="Share and Invite"
			>
				<Share2 className="h-5 w-5" />
				<span className="max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 group-hover:max-w-xs">
					Invite Friends
				</span>
			</button>

			{/* Modal */}
			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
					<div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">
						{/* Header */}
						<div className="flex items-center justify-between border-gray-200 border-b p-6">
							<div>
								<h2 className="font-bold text-gray-900 text-xl">
									Invite Friends
								</h2>
								<p className="text-gray-600 text-sm">
									Share Cresp with your creative network
								</p>
							</div>
							<button
								type="button"
								onClick={handleClose}
								className="text-gray-400 transition-colors hover:text-gray-600"
								aria-label="Close"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						{/* Content */}
						<div className="p-6">
							{isLoading ? (
								<div className="flex items-center justify-center py-8">
									<div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
								</div>
							) : (
								<>
									{/* Referral Link */}
									<div className="mb-6">
										<label
											htmlFor="referral-link"
											className="mb-2 block font-medium text-gray-700 text-sm"
										>
											Your Referral Link
										</label>
										<div className="flex gap-2">
											<input
												id="referral-link"
												type="text"
												value={referralData?.link || ""}
												readOnly
												className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 font-mono text-gray-900 text-sm"
											/>
											<button
												type="button"
												onClick={handleCopy}
												className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
											>
												{copied ? (
													<>
														<Check className="h-4 w-4" />
														<span className="text-sm">Copied!</span>
													</>
												) : (
													<>
														<Copy className="h-4 w-4" />
														<span className="text-sm">Copy</span>
													</>
												)}
											</button>
										</div>
									</div>

									{/* Stats */}
									<div className="mb-6 grid grid-cols-3 gap-4">
										<div className="rounded-lg bg-purple-50 p-3 text-center">
											<div className="font-bold text-2xl text-purple-600">
												{referralData?.stats.clicks || 0}
											</div>
											<div className="text-gray-600 text-xs">Clicks</div>
										</div>
										<div className="rounded-lg bg-indigo-50 p-3 text-center">
											<div className="font-bold text-2xl text-indigo-600">
												{referralData?.stats.signups || 0}
											</div>
											<div className="text-gray-600 text-xs">Signups</div>
										</div>
										<div className="rounded-lg bg-pink-50 p-3 text-center">
											<div className="font-bold text-2xl text-pink-600">
												{referralData?.stats.conversions || 0}
											</div>
											<div className="text-gray-600 text-xs">Active</div>
										</div>
									</div>

									{/* Share Options */}
									<div>
										<div className="mb-3 block font-medium text-gray-700 text-sm">
											Share via
										</div>
										<div className="grid grid-cols-5 gap-3">
											<button
												type="button"
												onClick={() => handleShare("twitter")}
												className="flex flex-col items-center gap-1 rounded-lg border border-gray-200 p-3 transition-all hover:border-purple-600 hover:bg-purple-50"
												title="Share on Twitter"
											>
												<Twitter className="h-6 w-6 text-sky-500" />
												<span className="text-gray-600 text-xs">Twitter</span>
											</button>
											<button
												type="button"
												onClick={() => handleShare("facebook")}
												className="flex flex-col items-center gap-1 rounded-lg border border-gray-200 p-3 transition-all hover:border-purple-600 hover:bg-purple-50"
												title="Share on Facebook"
											>
												<Facebook className="h-6 w-6 text-blue-600" />
												<span className="text-gray-600 text-xs">Facebook</span>
											</button>
											<button
												type="button"
												onClick={() => handleShare("linkedin")}
												className="flex flex-col items-center gap-1 rounded-lg border border-gray-200 p-3 transition-all hover:border-purple-600 hover:bg-purple-50"
												title="Share on LinkedIn"
											>
												<Linkedin className="h-6 w-6 text-blue-700" />
												<span className="text-gray-600 text-xs">LinkedIn</span>
											</button>
											<button
												type="button"
												onClick={() => handleShare("whatsapp")}
												className="flex flex-col items-center gap-1 rounded-lg border border-gray-200 p-3 transition-all hover:border-purple-600 hover:bg-purple-50"
												title="Share on WhatsApp"
											>
												<MessageCircle className="h-6 w-6 text-green-500" />
												<span className="text-gray-600 text-xs">WhatsApp</span>
											</button>
											<button
												type="button"
												onClick={() => handleShare("email")}
												className="flex flex-col items-center gap-1 rounded-lg border border-gray-200 p-3 transition-all hover:border-purple-600 hover:bg-purple-50"
												title="Share via Email"
											>
												<Mail className="h-6 w-6 text-gray-600" />
												<span className="text-gray-600 text-xs">Email</span>
											</button>
										</div>
									</div>
								</>
							)}
						</div>
					</div>
				</div>
			)}
		</>
	);
}
