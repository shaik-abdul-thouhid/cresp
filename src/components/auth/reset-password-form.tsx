"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useResetPassword } from "~/hooks/use-auth-mutations";

export function ResetPasswordForm() {
	const searchParams = useSearchParams();
	const token = searchParams.get("token");

	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);

	const resetPasswordMutation = useResetPassword();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!token) {
			setError("Invalid reset link");
			return;
		}

		if (password !== confirmPassword) {
			setError("Passwords don't match");
			return;
		}

		if (password.length < 8) {
			setError("Password must be at least 8 characters long");
			return;
		}

		resetPasswordMutation.mutate(
			{ token, password },
			{
				onSuccess: () => {
					setSuccess(true);
				},
			},
		);
	};

	if (!token) {
		return (
			<div className="rounded-lg border border-red-500/50 bg-red-500/10 p-6 text-center">
				<p className="text-red-200">Invalid or missing reset token</p>
			</div>
		);
	}

	if (success) {
		return (
			<div className="rounded-lg border border-green-500/50 bg-green-500/10 p-6 text-center">
				<div className="mb-4 text-4xl">✅</div>
				<h3 className="mb-2 font-semibold text-green-200 text-lg">
					Password Reset!
				</h3>
				<p className="text-green-300 text-sm">
					Your password has been successfully reset. Redirecting to login...
				</p>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			{(error || resetPasswordMutation.isError) && (
				<div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3">
					<p className="text-red-200 text-sm">
						{error ||
							(resetPasswordMutation.error as { error?: string })?.error ||
							"Failed to reset password"}
					</p>
				</div>
			)}

			<div>
				<label
					htmlFor="password"
					className="mb-2 block font-medium text-gray-200 text-sm"
				>
					New Password
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
					Confirm New Password
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
				disabled={resetPasswordMutation.isPending}
				className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 font-semibold text-white transition-all hover:from-purple-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
			</button>
		</form>
	);
}
