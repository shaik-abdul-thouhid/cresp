"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function VerifyEmailContent() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const token = searchParams.get("token");

	const [status, setStatus] = useState<"loading" | "success" | "error">(
		"loading",
	);
	const [message, setMessage] = useState("");

	useEffect(() => {
		if (!token) {
			setStatus("error");
			setMessage("Invalid verification link");
			return;
		}

		const verifyEmail = async () => {
			try {
				const response = await fetch("/api/auth/verify-email", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ token }),
				});

				const data = await response.json();

				if (response.ok) {
					setStatus("success");
					setMessage(data.message);
					// Redirect to login after 3 seconds
					setTimeout(() => {
						router.push("/login");
					}, 3000);
				} else {
					setStatus("error");
					setMessage(data.error || "Verification failed");
				}
			} catch (error) {
				console.error("Email verification error:", error);
				setStatus("error");
				setMessage("Something went wrong. Please try again.");
			}
		};

		verifyEmail();
	}, [token, router]);

	return (
		<div className="rounded-2xl bg-white/10 p-8 text-center shadow-2xl backdrop-blur-md">
			{status === "loading" && (
				<>
					<div className="mb-6 inline-block h-16 w-16 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
					<h2 className="mb-4 font-semibold text-2xl text-white">
						Verifying Your Email...
					</h2>
					<p className="text-gray-300">Please wait a moment</p>
				</>
			)}

			{status === "success" && (
				<>
					<div className="mb-6 text-6xl">✅</div>
					<h2 className="mb-4 font-semibold text-2xl text-white">
						Email Verified!
					</h2>
					<p className="mb-6 text-gray-300">{message}</p>
					<p className="text-gray-400 text-sm">Redirecting to login page...</p>
				</>
			)}

			{status === "error" && (
				<>
					<div className="mb-6 text-6xl">❌</div>
					<h2 className="mb-4 font-semibold text-2xl text-white">
						Verification Failed
					</h2>
					<p className="mb-6 text-gray-300">{message}</p>
					<Link
						href="/login"
						className="inline-block rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 font-semibold text-white transition-all hover:from-purple-700 hover:to-indigo-700"
					>
						Go to Login
					</Link>
				</>
			)}
		</div>
	);
}

export default function VerifyEmailPage() {
	return (
		<Suspense
			fallback={
				<div className="rounded-2xl bg-white/10 p-8 text-center shadow-2xl backdrop-blur-md">
					<div className="mb-6 inline-block h-16 w-16 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
					<h2 className="mb-4 font-semibold text-2xl text-white">Loading...</h2>
				</div>
			}
		>
			<VerifyEmailContent />
		</Suspense>
	);
}
