import Link from "next/link";
import { ResetPasswordForm } from "~/components/auth/reset-password-form";

export default function ResetPasswordPage() {
	return (
		<>
			{/* Page title */}
			<h2 className="mb-3 text-center font-bold text-3xl text-white">
				Reset Your Password
			</h2>
			<p className="mb-8 text-center text-gray-300">
				Enter your new password below
			</p>

			{/* Form card */}
			<div className="rounded-2xl bg-white/10 p-8 shadow-2xl backdrop-blur-md">
				<ResetPasswordForm />

				<div className="mt-6 text-center">
					<Link
						href="/login"
						className="text-purple-300 text-sm hover:text-purple-200"
					>
						← Back to login
					</Link>
				</div>
			</div>
		</>
	);
}
