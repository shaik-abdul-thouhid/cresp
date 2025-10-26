"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

/**
 * /join?ref=CODE
 * Landing page for referral links
 * - Tracks the click
 * - Stores referral code in cookie
 * - Redirects to signup
 */
export default function JoinPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const referralCode = searchParams.get("ref");

	useEffect(() => {
		const handleReferralClick = async () => {
			if (referralCode) {
				// Track the click
				try {
					await fetch("/api/referral/track-click", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ code: referralCode }),
					});
				} catch (error) {
					console.error("Error tracking referral click:", error);
				}

				// Store in cookie for signup
				document.cookie = `referral_code=${referralCode}; path=/; max-age=${30 * 24 * 60 * 60}`; // 30 days
			}

			// Redirect to signup page
			router.push("/signup");
		};

		void handleReferralClick();
	}, [referralCode, router]);

	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-black">
			<div className="text-center">
				<div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
				<p className="text-lg text-white">Redirecting...</p>
			</div>
		</div>
	);
}
