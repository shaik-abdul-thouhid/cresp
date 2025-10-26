"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSignup } from "~/hooks/use-auth-mutations";

export function SignupForm() {
	const router = useRouter();
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const [needsVerification, setNeedsVerification] = useState(false);
	const [verificationMessage, setVerificationMessage] = useState("");
	const [verificationToken, setVerificationToken] = useState("");

	const signupMutation = useSignup();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess(false);
		setNeedsVerification(false);
		setVerificationMessage("");
		setVerificationToken("");

		// Client-side validation
		if (password !== confirmPassword) {
			setError("Passwords don't match");
			return;
		}

		if (password.length < 8) {
			setError("Password must be at least 8 characters long");
			return;
		}

		if (username.length < 8) {
			setError("Username must be at least 8 characters long");
			return;
		}

		if (!/^[a-zA-Z]/.test(username)) {
			setError("Username must start with a letter");
			return;
		}

		if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
			setError(
				"Username can only contain letters, numbers, hyphens, and underscores",
			);
			return;
		}

		signupMutation.mutate(
			{ username, email, password },
			{
				onSuccess: (data) => {
					if (data.needsVerification) {
						setNeedsVerification(true);
						setVerificationMessage(data.message || "");
						setVerificationToken(data.verificationToken || "");
					} else {
						setSuccess(true);
						setVerificationToken(data.verificationToken || "");
					}
				},
				onError: (error: {
					error?: string;
					needsVerification?: boolean;
					message?: string;
					verificationToken?: string;
				}) => {
					if (error.needsVerification) {
						setNeedsVerification(true);
						setVerificationMessage(error.message || "");
						setVerificationToken(error.verificationToken || "");
					} else {
						setError(error.error || "Signup failed");
					}
				},
			},
		);
	};

	if (needsVerification) {
		const verificationUrl = `${window.location.origin}/verify-email?token=${verificationToken}`;

		return (
			<div className="space-y-4 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-6 text-center">
				<div className="mb-4 text-4xl">📧</div>
				<h3 className="mb-2 font-semibold text-lg text-yellow-200">
					Verification Required
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

				<button
					type="button"
					onClick={() => router.push(verificationUrl)}
					className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 font-semibold text-white transition-all hover:from-purple-700 hover:to-indigo-700"
				>
					Verify Email Now
				</button>
			</div>
		);
	}

	if (success) {
		const verificationUrl = `${window.location.origin}/verify-email?token=${verificationToken}`;

		return (
			<div className="space-y-4 rounded-lg border border-green-500/50 bg-green-500/10 p-6 text-center">
				<div className="mb-4 text-4xl">✅</div>
				<h3 className="mb-2 font-semibold text-green-200 text-lg">
					Account Created!
				</h3>
				<p className="mb-4 text-green-300 text-sm">
					Account created for <strong>{email}</strong>
				</p>

				{/* PROTOTYPE: Show verification link */}
				<div className="rounded-lg border border-green-500/30 bg-black/20 p-4">
					<p className="mb-2 text-green-200 text-xs">
						🔗 Verification Link (Prototype Mode):
					</p>
					<a
						href={verificationUrl}
						className="block break-all text-purple-300 text-xs underline hover:text-purple-200"
					>
						{verificationUrl}
					</a>
				</div>

				<button
					type="button"
					onClick={() => router.push(verificationUrl)}
					className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 font-semibold text-white transition-all hover:from-purple-700 hover:to-indigo-700"
				>
					Verify Email Now
				</button>

				<p className="text-green-300/80 text-xs">
					After verification, you can log in to your account.
				</p>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			{error && (
				<div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3">
					<p className="text-red-200 text-sm">{error}</p>
				</div>
			)}

			<div>
				<label
					htmlFor="username"
					className="mb-2 block font-medium text-gray-200 text-sm"
				>
					Username
				</label>
				<input
					type="text"
					id="username"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					required
					minLength={8}
					maxLength={30}
					className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
					placeholder="coolcreator"
				/>
				<p className="mt-1 text-gray-400 text-xs">
					Min 8 characters, letters and numbers only (- and _ allowed)
				</p>
			</div>

			<div>
				<label
					htmlFor="email"
					className="mb-2 block font-medium text-gray-200 text-sm"
				>
					Email
				</label>
				<input
					type="email"
					id="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
					className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
					placeholder="you@example.com"
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
					minLength={8}
					className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
					placeholder="••••••••"
				/>
				<p className="mt-1 text-gray-400 text-xs">
					Min 8 characters, must include uppercase, lowercase, and number
				</p>
			</div>

			<div>
				<label
					htmlFor="confirmPassword"
					className="mb-2 block font-medium text-gray-200 text-sm"
				>
					Confirm Password
				</label>
				<input
					type="password"
					id="confirmPassword"
					value={confirmPassword}
					onChange={(e) => setConfirmPassword(e.target.value)}
					required
					minLength={8}
					className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
					placeholder="••••••••"
				/>
			</div>

			<button
				type="submit"
				disabled={signupMutation.isPending}
				className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 font-semibold text-white transition-all hover:from-purple-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{signupMutation.isPending ? "Creating account..." : "Create Account"}
			</button>
		</form>
	);
}
