"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLogin } from "~/hooks/use-auth-mutations";

interface LoginFormProps {
	returnUrl?: string;
}

export function LoginForm({ returnUrl }: LoginFormProps) {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [needsVerification, setNeedsVerification] = useState(false);
	const [verificationMessage, setVerificationMessage] = useState("");
	const [verificationToken, setVerificationToken] = useState("");

	const loginMutation = useLogin(returnUrl);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setNeedsVerification(false);
		setVerificationMessage("");
		setVerificationToken("");

		loginMutation.mutate(
			{ email, password },
			{
				onError: (error: {
					error?: string;
					needsVerification?: boolean;
					message?: string;
					verificationToken?: string;
				}) => {
					if (error.needsVerification) {
						setNeedsVerification(true);
						setVerificationMessage(error.message || "Please verify your email");
						setVerificationToken(error.verificationToken || "");
					}
				},
			},
		);
	};

	if (needsVerification) {
		const verificationUrl = `${window.location.origin}/verify-email?token=${verificationToken}`;

		return (
			<div className="space-y-4">
				<div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-6 text-center">
					<div className="mb-4 text-4xl">📧</div>
					<h3 className="mb-2 font-semibold text-lg text-yellow-200">
						Email Verification Required
					</h3>
					<p className="mb-4 text-sm text-yellow-300">{verificationMessage}</p>
					<p className="mb-4 text-xs text-yellow-300/80">
						Email: <strong>{email}</strong>
					</p>

					{/* PROTOTYPE: Show verification link */}
					<div className="rounded-lg border border-yellow-500/30 bg-black/20 p-4">
						<p className="mb-2 text-xs text-yellow-200">
							🔗 Verification Link (Prototype Mode):
						</p>
						<a
							href={verificationUrl}
							className="block break-all text-purple-300 text-xs underline hover:text-purple-200"
						>
							{verificationUrl}
						</a>
					</div>

					<div className="flex gap-3">
						<button
							type="button"
							onClick={() => {
								setNeedsVerification(false);
								setVerificationMessage("");
								setVerificationToken("");
								setPassword("");
							}}
							className="flex-1 rounded-lg border border-white/20 px-6 py-3 font-semibold text-white transition-all hover:bg-white/10"
						>
							Back
						</button>
						<button
							type="button"
							onClick={() => router.push(verificationUrl)}
							className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 font-semibold text-white transition-all hover:from-purple-700 hover:to-indigo-700"
						>
							Verify Now
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			{loginMutation.isError && !needsVerification && (
				<div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3">
					<p className="text-red-200 text-sm">
						{(loginMutation.error as { error?: string })?.error ||
							"Something went wrong. Please try again."}
					</p>
				</div>
			)}

			<div>
				<label
					htmlFor="email"
					className="mb-2 block font-medium text-gray-200 text-sm"
				>
					Email or Username
				</label>
				<input
					type="text"
					id="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
					className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
					placeholder="you@example.com or username"
				/>
			</div>

			<div>
				<label
					htmlFor="password"
					className="mb-2 block font-medium text-gray-200 text-sm"
				>
					Password
				</label>
				<input
					type="password"
					id="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
					className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
					placeholder="••••••••"
				/>
			</div>

			<div className="flex justify-end">
				<Link
					href="/forgot-password"
					className="text-purple-300 text-sm hover:text-purple-200"
				>
					Forgot password?
				</Link>
			</div>

			<button
				type="submit"
				disabled={loginMutation.isPending}
				className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 font-semibold text-white transition-all hover:from-purple-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{loginMutation.isPending ? "Signing in..." : "Sign In"}
			</button>
		</form>
	);
}
