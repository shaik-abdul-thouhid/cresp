"use client";

import { useState } from "react";
import { useForgotPassword } from "~/hooks/use-auth-mutations";

export function ForgotPasswordForm() {
	const [email, setEmail] = useState("");
	const [success, setSuccess] = useState(false);

	const forgotPasswordMutation = useForgotPassword();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSuccess(false);

		forgotPasswordMutation.mutate(
			{ email },
			{
				onSuccess: () => {
					setSuccess(true);
				},
			},
		);
	};

	if (success) {
		return (
			<div className="rounded-lg border border-green-500/50 bg-green-500/10 p-6 text-center">
				<div className="mb-4 text-4xl">✉️</div>
				<h3 className="mb-2 font-semibold text-green-200 text-lg">
					Check Your Email
				</h3>
				<p className="text-green-300 text-sm">
					If an account exists with <strong>{email}</strong>, you will receive a
					password reset link shortly.
				</p>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			{forgotPasswordMutation.isError && (
				<div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3">
					<p className="text-red-200 text-sm">
						{(forgotPasswordMutation.error as { error?: string })?.error ||
							"Failed to send reset email"}
					</p>
				</div>
			)}

			<div>
				<label
					htmlFor="email"
					className="mb-2 block font-medium text-gray-200 text-sm"
				>
					Email Address
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

			<button
				type="submit"
				disabled={forgotPasswordMutation.isPending}
				className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 font-semibold text-white transition-all hover:from-purple-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{forgotPasswordMutation.isPending ? "Sending..." : "Send Reset Link"}
			</button>
		</form>
	);
}
